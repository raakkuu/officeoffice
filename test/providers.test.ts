import test from 'node:test';
import assert from 'node:assert/strict';
import {runProvider} from '../src/providers.js';
import process from 'node:process';

test('runProvider bounds captured output', async () => {
  const provider = { id: 'test', kind: 'custom' as const, command: process.execPath, args: ['-e', 'process.stdout.write("x".repeat(250000))'], enabled: true };
  const result = await runProvider(provider, 'ignored', process.cwd());
  assert.equal(result.code, 0);
  assert.equal(result.stdout.length, 200000);
});

test('runProvider can abort a child process', async () => {
  const provider = { id: 'test', kind: 'custom' as const, command: process.execPath, args: ['-e', 'setTimeout(() => {}, 30000)'], enabled: true };
  const controller = new AbortController();
  const promise = runProvider(provider, 'ignored', process.cwd(), undefined, controller.signal);
  setTimeout(() => controller.abort(), 50).unref();
  const result = await promise;
  assert.notEqual(result.code, 0);
});
