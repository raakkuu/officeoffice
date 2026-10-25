import test from 'node:test';
import assert from 'node:assert/strict';
import {blockDependents,retryable,runnable} from '../src/scheduler.js';
import {currentBranch,diffStat,changedFiles,isGitRepo} from '../src/git.js';
import type {Task} from '../src/types.js';

const task=(id:string,status:Task['status'],dependsOn:string[]=[],attempts=0):Task=>({id,title:id,description:'',agent:'jim',dependsOn,status,attempts,createdAt:'',updatedAt:''});

test('retryable returns failed tasks below the bounded attempt limit',()=>{
  const tasks=[task('retry','failed',[],1),task('exhausted','failed',[],2),task('done','done',[],1)];
  assert.deepEqual(retryable(tasks,2).map(t=>t.id),['retry']);
});

test('failed prerequisites block only their dependents',()=>{
  const tasks=[task('build','failed'),task('test','queued',['build']),task('docs','queued')];
  assert.equal(blockDependents(tasks),true);
  assert.equal(tasks.find(t=>t.id==='test')?.status,'blocked');
  assert.equal(tasks.find(t=>t.id==='docs')?.status,'queued');
  assert.deepEqual(runnable(tasks,2),[tasks[2]]);
});

test('git review helpers expose read-only repository metadata',async()=>{
  assert.equal(await isGitRepo(process.cwd()),true);
  assert.equal((await currentBranch(process.cwd())).code,0);
  assert.equal((await diffStat(process.cwd())).code,0);
  assert.equal((await changedFiles(process.cwd())).code,0);
});
