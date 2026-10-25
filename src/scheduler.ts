import {Task} from './types.js';
export function runnable(tasks:Task[],limit:number){const active=tasks.filter(t=>t.status==='running').length;return tasks.filter(t=>t.status==='queued'&&t.dependsOn.every(d=>tasks.find(x=>x.id===d)?.status==='done')).slice(0,Math.max(0,limit-active))}
export function allDone(tasks:Task[]){return tasks.length>0&&tasks.every(t=>t.status==='done')}
export function hasFailure(tasks:Task[]){return tasks.some(t=>t.status==='failed')}
export function retryable(tasks:Task[],maxAttempts:number){return tasks.filter(t=>t.status==='failed'&&t.attempts<maxAttempts)}
export function blockDependents(tasks:Task[]){let changed=false;for(const t of tasks){if(t.status!=='queued')continue;const failedDependency=t.dependsOn.some(d=>{const dep=tasks.find(x=>x.id===d);return dep?.status==='failed'||dep?.status==='blocked'});if(failedDependency){t.status='blocked';t.error='Blocked because a prerequisite task failed or was blocked.';t.updatedAt=new Date().toISOString();changed=true}}return changed}
