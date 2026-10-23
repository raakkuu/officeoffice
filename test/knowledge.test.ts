import test from 'node:test';
import assert from 'node:assert/strict';
import {createKnowledgeProvider,NoopKnowledgeProvider} from '../src/knowledge.js';

test('knowledge provider is disabled by default', async () => {
  const provider=createKnowledgeProvider({provider:'none',enabled:false,command:'xerj',prefix:'office-office',maxChars:1000},process.cwd());
  assert.equal(provider.id,'none');
  assert.deepEqual(await provider.search('anything'),[]);
});

test('noop provider is safe when XERJ is unavailable', async () => {
  const provider=new NoopKnowledgeProvider();
  assert.equal(await provider.available(),true);
  assert.deepEqual(await provider.search('anything'),[]);
});
