import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {KnowledgeConfig} from './types.js';

const execFileAsync=promisify(execFile);

export interface KnowledgeResult { source:string; text:string }

export interface KnowledgeProvider {
  readonly id:string;
  available():Promise<boolean>;
  index():Promise<void>;
  search(query:string):Promise<KnowledgeResult[]>;
}

export class NoopKnowledgeProvider implements KnowledgeProvider {
  readonly id='none';
  async available(){return true;}
  async index(){}
  async search(){return [] as KnowledgeResult[];}
}

export class XerjKnowledgeProvider implements KnowledgeProvider {
  readonly id='xerj';
  constructor(private readonly cfg:KnowledgeConfig,private readonly cwd:string){}

  private async run(args:string[]){
    return execFileAsync(this.cfg.command,args,{cwd:this.cwd,maxBuffer:1024*1024*4,windowsHide:true});
  }

  async available(){
    try { await this.run(['--help']); return true; }
    catch { return false; }
  }

  async index(){
    await this.run(['autoindex',this.cwd,'--prefix',this.cfg.prefix]);
  }

  async search(query:string){
    const {stdout}=await this.run(['search',query,'--prefix',this.cfg.prefix]);
    const text=stdout.trim();
    if(!text)return [];
    return [{source:`xerj:${this.cfg.prefix}`,text:text.slice(0,this.cfg.maxChars)}];
  }
}

export function createKnowledgeProvider(cfg:KnowledgeConfig|undefined,cwd:string):KnowledgeProvider {
  if(!cfg || cfg.provider==='none' || cfg.enabled===false)return new NoopKnowledgeProvider();
  if(cfg.provider==='xerj')return new XerjKnowledgeProvider(cfg,cwd);
  return new NoopKnowledgeProvider();
}

export async function retrieveKnowledge(provider:KnowledgeProvider,query:string,emit?:(message:string)=>void){
  if(!(await provider.available())){
    emit?.('Knowledge: configured provider is unavailable; continuing without retrieval.');
    return [] as KnowledgeResult[];
  }
  try {
    return await provider.search(query);
  } catch (error) {
    emit?.(`Knowledge: retrieval skipped (${error instanceof Error?error.message:String(error)}).`);
    return [] as KnowledgeResult[];
  }
}
