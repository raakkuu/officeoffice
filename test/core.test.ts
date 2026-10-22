import test from 'node:test';
import assert from 'node:assert/strict';
import { runnable, allDone, hasFailure } from '../src/scheduler.js';
import type { Task } from '../src/types.js';

const base = (id: string, status: Task['status'], dependsOn: string[] = []): Task => ({
  id,
  title: id,
  description: '',
  agent: 'jim',
  dependsOn,
  status,
  attempts: 0,
  createdAt: '',
  updatedAt: ''
});

test('scheduler respects dependencies and parallel limit', () => {
  const tasks = [
    base('a', 'done'),
    base('b', 'queued', ['a']),
    base('c', 'queued', ['a']),
    base('d', 'queued', ['b'])
  ];
  assert.deepEqual(runnable(tasks, 1).map(task => task.id), ['b']);
});

test('scheduler counts already-running tasks against parallel limit', () => {
  const tasks = [
    base('active', 'running'),
    base('queued-1', 'queued'),
    base('queued-2', 'queued')
  ];
  assert.deepEqual(runnable(tasks, 2).map(task => task.id), ['queued-1']);
});

test('scheduler does not release a task until every dependency is done', () => {
  const tasks = [
    base('first', 'done'),
    base('second', 'running'),
    base('third', 'queued', ['first', 'second'])
  ];
  assert.deepEqual(runnable(tasks, 3), []);
});

test('scheduler returns no tasks when parallel capacity is exhausted', () => {
  assert.deepEqual(runnable([base('active', 'running'), base('waiting', 'queued')], 1), []);
  assert.deepEqual(runnable([base('waiting', 'queued')], 0), []);
});

test('allDone is true only when a non-empty task list is entirely done', () => {
  assert.equal(allDone([base('a', 'done'), base('b', 'done')]), true);
  assert.equal(allDone([base('a', 'done'), base('b', 'queued')]), false);
  assert.equal(allDone([]), false);
});

test('hasFailure detects failed tasks', () => {
  assert.equal(hasFailure([base('a', 'done'), base('b', 'failed')]), true);
  assert.equal(hasFailure([base('a', 'done'), base('b', 'queued')]), false);
});
