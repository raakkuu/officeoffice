import fs from 'node:fs/promises'; import path from 'node:path'; import os from 'node:os'; import {ProviderConfig,OfficeConfig} from './types.js';
export const home=path.join(os.homedir(),'.office-office');
export const configPath=path.join(home,'config.json');
const defaults:OfficeConfig={version:1,supervisor:'claude',workers:{michael:'claude',dwight:'codex',pam:'claude',jim:'codex'},maxParallel:2,workspace:process.cwd(),autoCommit:false,webPort:4311,providers:[
{id:'claude',kind:'claude',command:'claude',args:['-p','{prompt}'],enabled:true},
{id:'codex',kind:'codex',command:'codex',args:['exec','{prompt}'],enabled:true},
{id:'gemini',kind:'gemini',command:'gemini',args:['-p','{prompt}'],enabled:true},
{id:'ollama',kind:'ollama',command:'ollama',args:['run','{model}','{prompt}'],model:'qwen2.5-coder:7b',enabled:true}
]};
export async function ensureHome(){await fs.mkdir(home,{recursive:true});await fs.mkdir(path.join(home,'runs'),{recursive:true})}
export async function loadConfig(cwd=process.cwd()):Promise<OfficeConfig>{await ensureHome();try{return {...defaults,...JSON.parse(await fs.readFile(configPath,'utf8'))}}catch{const cfg={...defaults,workspace:cwd};await saveConfig(cfg);return cfg}}
export async function saveConfig(cfg:OfficeConfig){await ensureHome();await fs.writeFile(configPath,JSON.stringify(cfg,null,2)+'\n',{mode:0o600});try{await fs.chmod(configPath,0o600)}catch{}}
export function envForProvider(p:ProviderConfig){const env={...process.env,...p.env}; if(p.kind==='claude'&&process.env.ANTHROPIC_API_KEY)env.ANTHROPIC_API_KEY=process.env.ANTHROPIC_API_KEY;if(p.kind==='codex'&&process.env.OPENAI_API_KEY)env.OPENAI_API_KEY=process.env.OPENAI_API_KEY;if(p.kind==='gemini'&&process.env.GEMINI_API_KEY)env.GEMINI_API_KEY=process.env.GEMINI_API_KEY;return env as NodeJS.ProcessEnv}
