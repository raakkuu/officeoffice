import test from 'node:test';import assert from 'node:assert/strict';import {runnable,allDone} from '../src/scheduler.js';
const base=(id:string,status:any,dependsOn:string[]=[]):any=>({id,title:id,description:'',agent:'jim',dependsOn,status,attempts:0,createdAt:'',updatedAt:''});
test('scheduler respects dependencies and parallel limit',()=>{const ts=[base('a','done'),base('b','queued',['a']),base('c','queued',['a']),base('d','queued',['b'])];assert.deepEqual(runnable(ts,1).map(x=>x.id),['b'])});
test('allDone',()=>assert.equal(allDone([base('a','done'),base('b','done')]),true));
