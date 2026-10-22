import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { CollaborationStore } from '../src/collaboration.js';

test('collaboration store persists agents, rooms, messages, skills and artifacts', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'office-office-collab-'));
  try {
    const store = new CollaborationStore(workspace);
    assert.equal((await store.agents()).length, 4);
    const agent = await store.createAgent({ name:'Researcher', role:'Research', specialty:'Evidence gathering', provider:'claude', systemPrompt:'Cite sources and separate facts from hypotheses.' });
    assert.equal((await store.agents()).some(a => a.id === agent.id), true);
    assert.equal((await store.updateAgent(agent.id, { enabled:false })).enabled, false);
    const skill = await store.createSkill({ name:'Source checks', description:'Verify claims', instructions:'Prefer primary sources.' });
    assert.equal((await store.skills())[0]?.id, skill.id);
    const room = await store.createRoom({ name:'Planning', kind:'meeting', topic:'Decide next steps', participants:['michael','jim'], turnLimit:8 });
    const message = await store.postRoomMessage(room.id, { from:'you', body:'Please review the failing tests.' });
    assert.equal((await store.roomMessages(room.id))[0]?.id, message.id);
    assert.equal((await store.closeRoom(room.id)).status, 'closed');
    await assert.rejects(() => store.postRoomMessage(room.id, { from:'you', body:'Should not post' }), /closed/);
    const artifact = await store.createArtifact({ title:'Test findings', summary:'Two edge cases need coverage', createdBy:'jim' });
    assert.equal((await store.artifacts())[0]?.id, artifact.id);
    const reloaded = new CollaborationStore(workspace);
    assert.equal((await reloaded.agents()).length, 5);
    assert.equal((await reloaded.rooms())[0]?.status, 'closed');
  } finally { await fs.rm(workspace, { recursive:true, force:true }); }
});

test('collaboration store rejects incomplete profiles, unauthorized senders and empty artifacts', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'office-office-collab-'));
  try {
    const store = new CollaborationStore(workspace);
    await assert.rejects(() => store.createAgent({ name:'', role:'Research' }), /required/);
    const room = await store.createRoom({ name:'Room', topic:'A topic' });
    await assert.rejects(() => store.postRoomMessage(room.id, { from:'stranger', body:'hello' }), /participant/);
    await assert.rejects(() => store.createArtifact({ title:'Empty' }), /required/);
  } finally { await fs.rm(workspace, { recursive:true, force:true }); }
});
