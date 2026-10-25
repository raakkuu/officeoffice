import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PreviewManager } from '../src/preview.js';

test('preview reports a useful error when no web script exists', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'office-preview-'));
  try {
    const manager = new PreviewManager(dir);
    await assert.rejects(() => manager.start(), /No preview script found/);
    assert.equal(manager.snapshot().status, 'stopped');
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('preview starts in a stopped state for a project folder', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'office-preview-'));
  try {
    const manager = new PreviewManager(dir);
    const state = manager.snapshot();
    assert.equal(state.status, 'stopped');
    assert.equal(state.workspace, dir);
    assert.equal(state.url, null);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
