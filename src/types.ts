export type ProviderKind='claude'|'codex'|'gemini'|'ollama'|'custom';
export type TaskStatus='queued'|'running'|'done'|'failed'|'blocked';
export interface ProviderConfig { id:string; kind:ProviderKind; command:string; args:string[]; model?:string; env?:Record<string,string>; enabled?:boolean }
export interface OfficeConfig { version:1; supervisor:string; workers:Record<string,string>; maxParallel:number; workspace:string; autoCommit:boolean; webPort:number; providers:ProviderConfig[] }
export interface AgentDef { id:string; name:string; role:string; specialty:string; provider:string; systemPrompt:string }
export interface Task { id:string; title:string; description:string; agent:string; dependsOn:string[]; status:TaskStatus; attempts:number; branch?:string; result?:string; error?:string; createdAt:string; updatedAt:string }
export interface Plan { summary:string; tasks:Array<{id:string;title:string;description:string;agent:string;dependsOn?:string[]}> }
export interface RunState { id:string; prompt:string; status:'planning'|'running'|'reviewing'|'done'|'failed'; createdAt:string; updatedAt:string; summary?:string; tasks:Task[] }
