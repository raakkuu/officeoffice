import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { loadConfig } from './config.js';
import { status } from './git.js';
import { Orchestrator } from './supervisor.js';
import { CollaborationStore } from './collaboration.js';

export async function startServer(cwd = process.cwd(), port = 4311) {
  const app = Fastify({ logger: false });
  const root = path.dirname(fileURLToPath(import.meta.url));
  const web = path.join(root, '..', 'web');

  let runActive = false;
  let lastError: string | null = null;
  const collaboration = new CollaborationStore(cwd);

  await app.register(fastifyStatic, { root: web });

  app.get('/api/status', async () => {
    let git = '';
    try {
      git = (await status(cwd)).stdout;
    } catch (error) {
      git = error instanceof Error ? error.message : String(error);
    }
    return { workspace: cwd, git, runActive, lastError };
  });

  app.get('/api/config', async () => {
    const config = await loadConfig(cwd);
    return {
      ...config,
      providers: config.providers.map(provider => ({
        ...provider,
        env: undefined
      }))
    };
  });

  app.get('/api/runs', async () => {
    try {
      const directory = path.join(cwd, '.hive', 'runs');
      const files = (await fs.readdir(directory)).filter(file => file.endsWith('.json'));
      const results = await Promise.all(files.map(async file => {
        try {
          return JSON.parse(await fs.readFile(path.join(directory, file), 'utf8')) as {
            id?: string;
            [key: string]: unknown;
          };
        } catch {
          return null;
        }
      }));
      return results
        .filter((run): run is NonNullable<typeof run> => run !== null)
        .sort((a, b) => String(b.id ?? '').localeCompare(String(a.id ?? '')));
    } catch {
      return [];
    }
  });

  app.post('/api/runs', async (request, reply) => {
    const body = request.body as { prompt?: unknown } | undefined;
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';

    if (!prompt) {
      return reply.code(400).send({ error: 'Enter a task before starting a run.' });
    }
    if (prompt.length > 2000) {
      return reply.code(400).send({ error: 'Tasks must be 2,000 characters or fewer.' });
    }
    if (runActive) {
      return reply.code(409).send({ error: 'A run is already active. Wait for it to finish.' });
    }

    let config;
    try {
      config = await loadConfig(cwd);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      lastError = message;
      return reply.code(500).send({ error: message });
    }

    runActive = true;
    lastError = null;
    const orchestrator = new Orchestrator(config, cwd, () => undefined);

    // Return immediately; the dashboard polls persisted run state for progress.
    void orchestrator.run(prompt)
      .catch(error => {
        lastError = error instanceof Error ? error.message : String(error);
      })
      .finally(() => {
        runActive = false;
      });

    return reply.code(202).send({
      accepted: true,
      message: 'Run started. Progress will appear in the dashboard.'
    });
  });


  // Local-first collaboration APIs. Records are persisted in .hive/collaboration.
  app.get('/api/agents', async () => collaboration.agents());
  app.post('/api/agents', async (request, reply) => {
    try { return reply.code(201).send(await collaboration.createAgent((request.body ?? {}) as any)); }
    catch (error) { return reply.code(400).send({ error: error instanceof Error ? error.message : String(error) }); }
  });
  app.patch('/api/agents/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try { return await collaboration.updateAgent(id, (request.body ?? {}) as any); }
    catch (error) { return reply.code(400).send({ error: error instanceof Error ? error.message : String(error) }); }
  });
  app.get('/api/skills', async () => collaboration.skills());
  app.post('/api/skills', async (request, reply) => {
    try { return reply.code(201).send(await collaboration.createSkill((request.body ?? {}) as any)); }
    catch (error) { return reply.code(400).send({ error: error instanceof Error ? error.message : String(error) }); }
  });
  app.get('/api/rooms', async () => collaboration.rooms());
  app.post('/api/rooms', async (request, reply) => {
    try { return reply.code(201).send(await collaboration.createRoom((request.body ?? {}) as any)); }
    catch (error) { return reply.code(400).send({ error: error instanceof Error ? error.message : String(error) }); }
  });
  app.post('/api/rooms/:id/close', async (request, reply) => {
    const { id } = request.params as { id: string };
    try { return await collaboration.closeRoom(id); }
    catch (error) { return reply.code(400).send({ error: error instanceof Error ? error.message : String(error) }); }
  });
  app.get('/api/rooms/:id/messages', async (request) => {
    const { id } = request.params as { id: string };
    return collaboration.roomMessages(id);
  });
  app.post('/api/rooms/:id/messages', async (request, reply) => {
    const { id } = request.params as { id: string };
    try { return reply.code(201).send(await collaboration.postRoomMessage(id, (request.body ?? {}) as { from?: unknown; body?: unknown })); }
    catch (error) { return reply.code(400).send({ error: error instanceof Error ? error.message : String(error) }); }
  });
  app.get('/api/artifacts', async () => collaboration.artifacts());
  app.post('/api/artifacts', async (request, reply) => {
    try { return reply.code(201).send(await collaboration.createArtifact((request.body ?? {}) as any)); }
    catch (error) { return reply.code(400).send({ error: error instanceof Error ? error.message : String(error) }); }
  });

  await app.listen({ host: '127.0.0.1', port });
  return app;
}
