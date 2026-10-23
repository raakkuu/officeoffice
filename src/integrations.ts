import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {IntegrationConfig, IntegrationId} from './types.js';

const execFileAsync=promisify(execFile);

export interface IntegrationStatus { id:IntegrationId; enabled:boolean; available:boolean; description:string; command:string }
export interface IntegrationContext { source:string; text:string }

const descriptions:Record<IntegrationId,string>={
  github:'Repository, issue, pull request and CI context through the GitHub CLI.',
  playwright:'Browser verification through the Playwright MCP server.',
  context7:'Current library and API documentation through Context7.',
};

async function commandAvailable(command:string,cwd:string){
  try {
    await execFileAsync(process.platform==='win32'?'where':'which',[command],{cwd,windowsHide:true});
    return true;
  } catch { return false; }
}

export async function integrationStatuses(configs:IntegrationConfig[],cwd:string):Promise<IntegrationStatus[]> {
  return Promise.all(configs.map(async cfg=>({
    id:cfg.id,
    enabled:cfg.enabled,
    available:await commandAvailable(cfg.command,cwd),
    description:descriptions[cfg.id],
    command:cfg.command,
  })));
}

export async function githubContext(cfg:IntegrationConfig,cwd:string,query:string):Promise<IntegrationContext[]> {
  if(!cfg.enabled || cfg.id!=='github' || !(await commandAvailable(cfg.command,cwd))) return [];
  try {
    const run=async(args:string[])=>execFileAsync(cfg.command,args,{cwd,maxBuffer:1024*1024*2,windowsHide:true});
    const [repo,issues,prs,runs]=await Promise.all([
      run(['repo','view','--json','nameWithOwner,description,defaultBranchRef']),
      run(['issue','list','--limit','8','--search',query]),
      run(['pr','list','--limit','8','--search',query]),
      run(['run','list','--limit','5']),
    ]);
    const text=[
      `Repository:\n${repo.stdout.trim()}`,
      `Relevant issues:\n${issues.stdout.trim()||'none'}`,
      `Relevant pull requests:\n${prs.stdout.trim()||'none'}`,
      `Recent workflow runs:\n${runs.stdout.trim()||'none'}`,
    ].join('\n\n');
    return [{source:'github:gh',text}];
  } catch { return []; }
}

export function mcpManifest(configs:IntegrationConfig[]) {
  const servers:Record<string,{command:string,args:string[],env?:Record<string,string>}>={};
  for(const cfg of configs.filter(x=>x.enabled && x.mcp)) servers[cfg.id]={command:cfg.mcp!.command,args:cfg.mcp!.args,env:cfg.mcp!.env};
  return {mcpServers:servers};
}
