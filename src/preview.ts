import {spawn, ChildProcess} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface PreviewState {
  status: 'stopped' | 'starting' | 'running' | 'failed';
  workspace: string;
  script: string | null;
  command: string | null;
  url: string | null;
  port: number | null;
  output: string;
  error: string | null;
}

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function findUrl(text: string): string | null {
  const match = text.match(/https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/[^\s]*)?/i);
  return match?.[0] ?? null;
}

function terminateProcessTree(child: ChildProcess): void {
  if (!child.pid) {
    child.kill('SIGTERM');
    return;
  }
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore', windowsHide: true });
    killer.once('error', () => child.kill('SIGTERM'));
    return;
  }
  child.kill('SIGTERM');
}

export class PreviewManager {
  private child: ChildProcess | null = null;
  private state: PreviewState;

  constructor(private cwd: string) {
    this.state = { status: 'stopped', workspace: cwd, script: null, command: null, url: null, port: null, output: '', error: null };
  }

  private async scripts(): Promise<Record<string, unknown>> {
    try {
      const pkg = JSON.parse(await fs.readFile(path.join(this.cwd, 'package.json'), 'utf8')) as { scripts?: Record<string, unknown> };
      return pkg.scripts ?? {};
    } catch {
      return {};
    }
  }

  async start(script?: string): Promise<PreviewState> {
    // A child may have received a kill signal but not emitted close yet.
    if (this.child) return this.snapshot();
    const scripts = await this.scripts();
    const selected = script && typeof scripts[script] === 'string' ? script : ['dev', 'start', 'serve'].find(name => typeof scripts[name] === 'string');
    if (!selected) throw new Error('No preview script found. Add a package.json script named dev, start, or serve.');

    this.state = { ...this.state, status: 'starting', script: selected, command: `npm run ${selected}`, url: null, port: null, output: '', error: null };
    const child = spawn(npmCommand(), ['run', selected], { cwd: this.cwd, env: { ...process.env, BROWSER: 'none' }, shell: false, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    this.child = child;
    const consume = (chunk: Buffer) => {
      const text = chunk.toString();
      this.state.output = (this.state.output + text).slice(-12000);
      const url = findUrl(this.state.output);
      if (url) {
        this.state.url = url;
        try { this.state.port = Number(new URL(url).port || 80); } catch {}
        this.state.status = 'running';
      }
    };
    child.stdout?.on('data', consume);
    child.stderr?.on('data', consume);
    child.once('error', error => {
      this.state.status = 'failed';
      this.state.error = error.message;
      if (this.child === child) this.child = null;
    });
    child.once('close', code => {
      if (this.child === child) this.child = null;
      if (code !== 0 && this.state.status !== 'stopped') {
        this.state.status = 'failed';
        this.state.error = `Preview process exited with code ${code}.`;
      } else if (this.state.status !== 'stopped') {
        this.state.status = 'stopped';
      }
    });
    return this.snapshot();
  }

  async stop(): Promise<PreviewState> {
    const child = this.child;
    this.state.status = 'stopped';
    if (child && !child.killed) terminateProcessTree(child);
    return this.snapshot();
  }

  snapshot(): PreviewState {
    return { ...this.state };
  }
}
