import {Task} from './types.js';
export function runnable(tasks:Task[],limit:number){const active=tasks.filter(t=>t.status==='running').length;return tasks.filter(t=>t.status==='queued'&&t.dependsOn.every(d=>tasks.find(x=>x.id===d)?.status==='done')).slice(0,Math.max(0,limit-active))}
export function allDone(tasks:Task[]){return tasks.length>0&&tasks.every(t=>t.status==='done')}
export function hasFailure(tasks:Task[]){return tasks.some(t=>t.status==='failed')}
