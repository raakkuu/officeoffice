import { describe, expect, it } from 'vitest';
import { allDone, hasFailure, runnable } from '../src/scheduler.js';
import { Task } from '../src/types.js';

const task = (id: string, status: Task['status'], dependsOn: string[] = []): Task => ({
  id,
  title: id,
  role: 'worker',
  status,
  dependsOn,
});

describe('scheduler failure and recovery paths', () => {
  it('does not release a dependent task while its dependency is failed', () => {
    const tasks = [task('build', 'failed'), task('test', 'queued', ['build'])];
    expect(runnable(tasks, 2)).toEqual([]);
    expect(hasFailure(tasks)).toBe(true);
    expect(allDone(tasks)).toBe(false);
  });

  it('releases a dependent task after the failed dependency is recovered', () => {
    const tasks = [task('build', 'done'), task('test', 'queued', ['build'])];
    expect(runnable(tasks, 2).map(t => t.id)).toEqual(['test']);
    expect(hasFailure(tasks)).toBe(false);
  });

  it('keeps unrelated queued work runnable after another task fails', () => {
    const tasks = [task('broken', 'failed'), task('docs', 'queued')];
    expect(runnable(tasks, 2).map(t => t.id)).toEqual(['docs']);
    expect(hasFailure(tasks)).toBe(true);
  });

  it('requires every task to finish before declaring the mission done', () => {
    const tasks = [task('one', 'done'), task('two', 'failed')];
    expect(allDone(tasks)).toBe(false);
  });
});
