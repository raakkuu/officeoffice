import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const testDirectory = path.join(root, 'test');
const files = (await readdir(testDirectory, { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith('.test.ts'))
  .map(entry => path.join('test', entry.name))
  .sort();

if (files.length === 0) {
  console.error('No *.test.ts files found in the test directory.');
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...files], {
  cwd: root,
  stdio: 'inherit'
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exitCode = result.status ?? 1;
