import fs from 'node:fs/promises'; import path from 'node:path'; import os from 'node:os'; import {ProviderConfig,OfficeConfig,IntegrationConfig} from './types.js';
export const home=path.join(os.homedir(),'.office-office');
export const configPath=path.join(home,'config.json');
const defaultIntegrations:IntegrationConfig[]=[
{id:'github',enabled:false,command:'gh',description:'GitHub repository, issues, pull requests and CI context.',mcp:{command:'docker',args:['run','-i','--rm','ghcr.io/github/github-mcp-server','--read-only','--toolsets','context,repos,issues,pull_requests,actions']}},
{id:'playwright',enabled:false,command:'npx',description:'Browser verification through the official Playwright MCP server.',mcp:{command:'npx',args:['-y','@playwright/mcp@latest']}},
{id:'context7',enabled:false,command:'npx',description:'Current library and API documentation through Context7.',mcp:{command:'npx',args:['-y','@upstash/context7-mcp@latest']}}
];
const defaults:OfficeConfig={version:1,supervisor:'claude',workers:{michael:'claude',dwight:'codex',pam:'claude',jim:'codex'},maxParallel:2,workspace:process.cwd(),autoCommit:false,webPort:4311,knowledge:{provider:'none',enabled:false,command:'xerj',prefix:'office-office',maxChars:12000},integrations:defaultIntegrations,providers:[
{id:'claude',kind:'claude',command:'claude',args:['-p','{prompt}'],enabled:true},
{id:'codex',kind:'codex',command:'codex',args:['exec','{prompt}'],enabled:true},
{id:'gemini',kind:'gemini',command:'gemini',args:['-p','{prompt}'],enabled:true},
{id:'ollama',kind:'ollama',command:'ollama',args:['run','{model}','{prompt}'],model:'qwen2.5-coder:7b',enabled:true}
]};
export async function ensureHome(){await fs.mkdir(home,{recursive:true});await fs.mkdir(path.join(home,'runs'),{recursive:true})}
export async function loadConfig(cwd=process.cwd()):Promise<OfficeConfig>{await ensureHome();try{const saved=JSON.parse(await fs.readFile(configPath,'utf8'));return {...defaults,...saved,workers:{...defaults.workers,...saved.workers},knowledge:{...defaults.knowledge,...saved.knowledge},integrations:Array.isArray(saved.integrations)?saved.integrations:defaultIntegrations,providers:Array.isArray(saved.providers)?saved.providers:defaults.providers}}catch{const cfg={...defaults,workspace:cwd};await saveConfig(cfg);return cfg}}
export async function saveConfig(cfg:OfficeConfig){await ensureHome();await fs.writeFile(configPath,JSON.stringify(cfg,null,2)+'\n',{mode:0o600});try{await fs.chmod(configPath,0o600)}catch{}}
export function envForProvider(p:ProviderConfig){const env={...process.env,...p.env}; if(p.kind==='claude'&&process.env.ANTHROPIC_API_KEY)env.ANTHROPIC_API_KEY=process.env.ANTHROPIC_API_KEY;if(p.kind==='codex'&&process.env.OPENAI_API_KEY)env.OPENAI_API_KEY=process.env.OPENAI_API_KEY;if(p.kind==='gemini'&&process.env.GEMINI_API_KEY)env.GEMINI_API_KEY=process.env.GEMINI_API_KEY;return env as NodeJS.ProcessEnv}
