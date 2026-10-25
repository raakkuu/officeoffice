import {changedFiles,currentBranch,diff,diffStat,isGitRepo,status} from './git.js';

export async function reviewWorkspace(cwd:string,includeDiff=false):Promise<string>{
  if(!(await isGitRepo(cwd))) throw new Error('Git review requires a Git repository.');
  const [branch,working,files,stat]=await Promise.all([currentBranch(cwd),status(cwd),changedFiles(cwd),diffStat(cwd)]);
  if([branch,working,files,stat].some(result=>result.code!==0)) throw new Error('Could not inspect the Git working tree safely.');
  const lines=['Office Office Git review','-----------------------',`Branch: ${branch.stdout.trim()||'(detached HEAD)'}`,`Working tree: ${working.stdout.trim()?'changes present':'clean'}`,'','Changed files:',files.stdout.trim()||'  No tracked changes compared with HEAD.','','Diff stat:',stat.stdout.trim()||'  No tracked changes compared with HEAD.'];
  if(includeDiff){const full=await diff(cwd);if(full.code!==0)throw new Error(full.stderr||'Could not read diff.');lines.push('','Full diff:',full.stdout||'No tracked diff.');}
  lines.push('','Recommended verification before commit/push/merge:','  npm run check','  npm test','  npm run build','','This command is read-only: it does not commit, push, merge, or modify Git history.');
  return lines.join('\n');
}
