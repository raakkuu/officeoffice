import fs from 'node:fs/promises';
import path from 'node:path';

export interface LoadedSkill {
  id: string;
  name: string;
  description: string;
  instructions: string;
  source: 'repository' | 'workspace';
}

const MAX_SKILLS = 100;
const MAX_INSTRUCTIONS = 12000;

function clean(value: string, max: number) {
  return value.trim().slice(0, max);
}

function parseSkill(id: string, raw: string, source: LoadedSkill['source']): LoadedSkill | null {
  const text = raw.replace(/^\uFEFF/, '').trim();
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return null;
  const frontMatter = match[1] ?? '';
  const body = (match[2] ?? '').trim();
  const fields = new Map<string, string>();
  for (const line of frontMatter.split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key && value) fields.set(key, value);
  }
  const name = clean(fields.get('name') || id, 100);
  const description = clean(fields.get('description') || '', 300);
  const instructions = clean(body, MAX_INSTRUCTIONS);
  if (!name || !description || !instructions) return null;
  return { id, name, description, instructions, source };
}

async function readSkillDirectory(root: string, source: LoadedSkill['source']) {
  const skills: LoadedSkill[] = [];
  let entries;
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return skills;
    throw error;
  }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!entry.isDirectory() || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(entry.name)) continue;
    const file = path.join(root, entry.name, 'SKILL.md');
    try {
      const skill = parseSkill(entry.name, await fs.readFile(file, 'utf8'), source);
      if (skill) skills.push(skill);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    if (skills.length >= MAX_SKILLS) break;
  }
  return skills;
}

export async function loadSkills(workspace: string): Promise<LoadedSkill[]> {
  const repository = await readSkillDirectory(path.join(workspace, 'skills'), 'repository');
  const workspaceSkills = await readSkillDirectory(path.join(workspace, '.hive', 'skills'), 'workspace');
  const merged = new Map<string, LoadedSkill>();
  for (const skill of repository) merged.set(skill.id, skill);
  for (const skill of workspaceSkills) merged.set(skill.id, skill);
  return [...merged.values()].slice(0, MAX_SKILLS);
}

export function selectSkills(all: LoadedSkill[], ids: string[]) {
  const wanted = new Set(ids.filter(Boolean));
  return all.filter(skill => wanted.has(skill.id));
}

export function formatSkillInstructions(skills: LoadedSkill[]) {
  if (!skills.length) return 'No repository skills were assigned.';
  return skills.map(skill => `### ${skill.name} (${skill.id})\n${skill.description}\n${skill.instructions}`).join('\n\n');
}
