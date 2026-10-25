import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { AgentDef } from './types.js';
import { loadConfig } from './config.js';

export type RoomKind = 'meeting' | 'cafeteria';
export type RoomStatus = 'open' | 'closed';
export interface AgentProfile extends AgentDef {
  skills: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Skill {
  id: string;
  name: string;
  description: string;
  instructions: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Room {
  id: string;
  name: string;
  kind: RoomKind;
  topic: string;
  participants: string[];
  status: RoomStatus;
  turnLimit: number;
  createdAt: string;
  updatedAt: string;
}
export interface RoomMessage {
  id: string;
  roomId: string;
  from: string;
  body: string;
  createdAt: string;
}
export interface Artifact {
  id: string;
  title: string;
  kind: string;
  summary: string;
  content: string;
  createdBy: string;
  visibility: 'project';
  createdAt: string;
}
const now = () => new Date().toISOString();
const id = (prefix: string) => prefix + '-' + crypto.randomUUID();
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const safeId = (value: string) => /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(value);
const readArray = async <T>(file: string): Promise<T[]> => {
  try {
    const parsed: unknown = JSON.parse(await fs.readFile(file, 'utf8'));
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
};
export class CollaborationStore {
  private root: string;
  constructor(workspace: string) { this.root = path.join(workspace, '.hive', 'collaboration'); }
  async init() { await fs.mkdir(this.root, { recursive: true }); }
  private file(name: string) { return path.join(this.root, name + '.json'); }
  private async list<T>(name: string) { await this.init(); return readArray<T>(this.file(name)); }
  private async save<T>(name: string, values: T[]) {
    await this.init();
    const temp = this.file(name + '.tmp');
    await fs.writeFile(temp, JSON.stringify(values, null, 2) + '\n', { mode: 0o600 });
    await fs.rename(temp, this.file(name));
  }
  async agents(): Promise<AgentProfile[]> {
    const current = await this.list<AgentProfile>('agents');
    if (current.length) {
      const workspace = path.dirname(path.dirname(this.root));
      const cfg = await loadConfig(workspace);
      return current.map(agent => ({
        ...agent,
        provider: agent.id === 'michael'
          ? cfg.supervisor || agent.provider
          : cfg.workers[agent.id] || agent.provider
      }));
    }
    const stamp = now();
    const initial: AgentProfile[] = [
      { id:'michael', name:'Michael', role:'Supervisor', specialty:'Planning, delegation and review', provider:'claude', systemPrompt:'Plan work, coordinate specialists and verify outcomes.', skills:['planning','review'], enabled:true, createdAt:stamp, updatedAt:stamp },
      { id:'dwight', name:'Dwight', role:'Backend engineer', specialty:'Backend and systems', provider:'codex', systemPrompt:'Implement reliable backend and systems changes.', skills:['engineering'], enabled:true, createdAt:stamp, updatedAt:stamp },
      { id:'pam', name:'Pam', role:'Designer', specialty:'Frontend and UX', provider:'claude', systemPrompt:'Build accessible, polished user experiences.', skills:['design','engineering'], enabled:true, createdAt:stamp, updatedAt:stamp },
      { id:'jim', name:'Jim', role:'QA engineer', specialty:'Testing and quality', provider:'codex', systemPrompt:'Find edge cases and verify changes with tests.', skills:['testing'], enabled:true, createdAt:stamp, updatedAt:stamp }
    ];
    await this.save('agents', initial);
    const cfg = await loadConfig(path.dirname(path.dirname(this.root)));
    return initial.map(agent => ({
      ...agent,
      provider: agent.id === 'michael' ? cfg.supervisor || agent.provider : cfg.workers[agent.id] || agent.provider
    }));
  }
  async createAgent(input: Partial<AgentProfile>) {
    const agents = await this.agents();
    const name = clean(input.name, 80);
    const role = clean(input.role, 100);
    const specialty = clean(input.specialty, 240);
    const provider = clean(input.provider, 64);
    const systemPrompt = clean(input.systemPrompt, 4000);
    if (!name || !role || !specialty || !provider || !systemPrompt) throw new Error('Name, role, specialty, provider and instructions are required.');
    if (agents.length >= 50) throw new Error('Agent limit reached (50 profiles).');
    const stamp = now();
    const agent: AgentProfile = { id: id('agent'), name, role, specialty, provider, systemPrompt, skills: Array.isArray(input.skills) ? input.skills.filter(x => typeof x === 'string').slice(0, 20) : [], enabled: input.enabled !== false, createdAt: stamp, updatedAt: stamp };
    agents.push(agent); await this.save('agents', agents); return agent;
  }
  async updateAgent(agentId: string, input: Partial<AgentProfile>) {
    const agents = await this.agents(); const index = agents.findIndex(a => a.id === agentId);
    if (index < 0) throw new Error('Agent not found.');
    const old = agents[index]!;
    const next = { ...old, name: input.name === undefined ? old.name : clean(input.name,80), role: input.role === undefined ? old.role : clean(input.role,100), specialty: input.specialty === undefined ? old.specialty : clean(input.specialty,240), provider: input.provider === undefined ? old.provider : clean(input.provider,64), systemPrompt: input.systemPrompt === undefined ? old.systemPrompt : clean(input.systemPrompt,4000), skills: input.skills === undefined ? old.skills : (Array.isArray(input.skills) ? input.skills.filter(x=>typeof x==='string').slice(0,20) : old.skills), enabled: input.enabled === undefined ? old.enabled : Boolean(input.enabled), updatedAt: now() };
    if (!next.name || !next.role || !next.specialty || !next.provider || !next.systemPrompt) throw new Error('Agent fields cannot be empty.');
    agents[index] = next; await this.save('agents', agents); return next;
  }
  async skills(): Promise<Skill[]> { return this.list<Skill>('skills'); }
  async createSkill(input: Partial<Skill>) {
    const skills = await this.skills(); const name = clean(input.name,100), description = clean(input.description,300), instructions = clean(input.instructions,5000);
    if (!name || !description || !instructions) throw new Error('Skill name, description and instructions are required.');
    if (skills.length >= 100) throw new Error('Skill limit reached (100 skills).');
    const stamp=now(); const skill:Skill={id:id('skill'),name,description,instructions,enabled:input.enabled!==false,createdAt:stamp,updatedAt:stamp};
    skills.push(skill); await this.save('skills',skills); return skill;
  }
  async rooms(): Promise<Room[]> { return (await this.list<Room>('rooms')).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)); }
  async createRoom(input: Partial<Room>) {
    const rooms=await this.rooms(); const name=clean(input.name,80), topic=clean(input.topic,500);
    const kind:RoomKind=input.kind==='cafeteria'?'cafeteria':'meeting';
    if(!name || !topic) throw new Error('Room name and topic are required.');
    if(rooms.filter(r=>r.status==='open').length>=10) throw new Error('At most 10 rooms can be open at once.');
    const agents=await this.agents(); const requested=Array.isArray(input.participants)?input.participants.filter((x):x is string=>typeof x==='string').slice(0,20):['michael'];
    const participants=[...new Set(requested)].filter(a=>agents.some(p=>p.id===a&&p.enabled));
    if(!participants.includes('michael') && agents.some(a=>a.id==='michael'&&a.enabled)) participants.unshift('michael');
    const stamp=now(); const room:Room={id:id('room'),name,kind,topic,participants,status:'open',turnLimit:Math.max(1,Math.min(20,Number(input.turnLimit)||8)),createdAt:stamp,updatedAt:stamp};
    rooms.push(room); await this.save('rooms',rooms); return room;
  }
  async closeRoom(roomId:string) {
    const rooms=await this.rooms(), index=rooms.findIndex(r=>r.id===roomId);
    if(index<0) throw new Error('Room not found.');
    rooms[index]={...rooms[index]!,status:'closed',updatedAt:now()}; await this.save('rooms',rooms); return rooms[index];
  }
  async roomMessages(roomId:string):Promise<RoomMessage[]> { return (await this.list<RoomMessage>('messages')).filter(m=>m.roomId===roomId).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)); }
  async postRoomMessage(roomId:string, input:{from?:unknown;body?:unknown}) {
    const room=(await this.rooms()).find(r=>r.id===roomId);
    if(!room) throw new Error('Room not found.');
    if(room.status!=='open') throw new Error('This room is closed.');
    const from=clean(input.from,64), body=clean(input.body,3000);
    if(!body) throw new Error('Message cannot be empty.');
    if(!room.participants.includes(from) && from!=='you') throw new Error('Sender must be a room participant.');
    const existing=await this.roomMessages(roomId);
    if(existing.length>=500) throw new Error('Room message limit reached.');
    const message:RoomMessage={id:id('message'),roomId,from:from||'you',body,createdAt:now()};
    const all=await this.list<RoomMessage>('messages'); all.push(message); await this.save('messages',all);
    const rooms=await this.rooms(); const idx=rooms.findIndex(r=>r.id===roomId); if(idx>=0){rooms[idx]={...rooms[idx]!,updatedAt:now()};await this.save('rooms',rooms);}
    return message;
  }
  async artifacts():Promise<Artifact[]> { return (await this.list<Artifact>('artifacts')).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)); }
  async createArtifact(input:Partial<Artifact>) {
    const artifacts=await this.artifacts(); if(artifacts.length>=1000) throw new Error('Artifact limit reached.');
    const title=clean(input.title,160),kind=clean(input.kind,60)||'finding',summary=clean(input.summary,1000),content=clean(input.content,20000),createdBy=clean(input.createdBy,80)||'user';
    if(!title||(!summary&&!content)) throw new Error('Artifact title and a summary or content are required.');
    const artifact:Artifact={id:id('artifact'),title,kind,summary,content,createdBy,visibility:'project',createdAt:now()};
    artifacts.push(artifact);await this.save('artifacts',artifacts);return artifact;
  }
}
export { safeId };
