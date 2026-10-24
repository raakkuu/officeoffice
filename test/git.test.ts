import test from 'node:test';
import assert from 'node:assert/strict';
import { currentBranch, diffStat, changedFiles, isGitRepo } from '../src/git.js';

test('git helpers recognize the repository and expose review metadata', async () => {
  const cwd = process.cwd();
  assert.equal(await isGitRepo(cwd), true);
  const branch = await currentBranch(cwd);
  assert.equal(branch.code, 0);
  const stat = await diffStat(cwd);
  assert.equal(stat.code, 0);
  const files = await changedFiles(cwd);
  assert.equal(files.code, 0);
});
