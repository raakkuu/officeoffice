import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { formatSkillInstructions, loadSkills, selectSkills } from '../src/skills.js';

test('loads repository skills and workspace overrides', async () => {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'office-office-skills-'));
  try {
    await fs.mkdir(path.join(workspace, 'skills', 'testing'), { recursive: true });
    await fs.writeFile(path.join(workspace, 'skills', 'testing', 'SKILL.md'), '---\nname: testing\ndescription: Test things.\n---\n# Testing\nRun focused checks.\n');
    await fs.mkdir(path.join(workspace, '.hive', 'skills', 'testing'), { recursive: true });
    await fs.writeFile(path.join(workspace, '.hive', 'skills', 'testing', 'SKILL.md'), '---\nname: local testing\ndescription: Local policy.\n---\n# Local\nRun the project checks.\n');
    await fs.mkdir(path.join(workspace, 'skills', 'broken'), { recursive: true });
    await fs.writeFile(path.join(workspace, 'skills', 'broken', 'SKILL.md'), '# missing frontmatter\n');

    const skills = await loadSkills(workspace);
    assert.equal(skills.length, 1);
    assert.equal(skills[0]?.source, 'workspace');
    assert.deepEqual(selectSkills(skills, ['testing']).map(skill => skill.id), ['testing']);
    assert.match(formatSkillInstructions(skills), /Run the project checks/);
  } finally {
    await fs.rm(workspace, { recursive: true, force: true });
  }
});
