import {spawn} from 'node:child_process';
export async function git(cwd:string,args:string[]){return await new Promise<{code:number|null;stdout:string;stderr:string}>(r=>{const p=spawn('git',args,{cwd,stdio:['ignore','pipe','pipe']});let o='',e='';p.stdout.on('data',d=>o+=d);p.stderr.on('data',d=>e+=d);p.on('close',code=>r({code,stdout:o,stderr:e}));p.on('error',x=>r({code:null,stdout:o,stderr:String(x)}))})}
export async function isGitRepo(cwd:string){return (await git(cwd,['rev-parse','--is-inside-work-tree'])).code===0}
export async function status(cwd:string){return git(cwd,['status','--short'])}
