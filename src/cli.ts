import { loadConfig, saveConfig } from './config.js';
import { providerDoctor } from './providers.js';
import { Orchestrator } from './supervisor.js';
import { startServer } from './server.js';
import { status, isGitRepo } from './git.js';
import { renderBanner } from './banner.js';

const args = process.argv.slice(2);
const cmd = args[0];
const cwd = process.cwd();

async function main() {
  // Help and agent-list commands must work without loading configuration or contacting providers.
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    console.log(renderBanner());
    console.log(`
Usage:
  office "Build authentication"
  office agents  (or: office agent)
  office doctor
  office status
  office web
  office config
  office config set supervisor <provider-id>

Help and the agent list do not require provider authentication.
Provider API keys are only needed when the selected provider requires them.
`);
    return;
  }

  if (cmd === 'agents' || cmd === 'agent') {
    console.log(renderBanner());
    console.log('\nAgents:');
    console.log('  michael  Supervisor / planner');
    console.log('  dwight   Backend / systems');
    console.log('  pam      Frontend / UX');
    console.log('  jim      Testing / review');
    return;
  }

  const cfg = await loadConfig(cwd);

  if (cmd === 'doctor') {
    console.log(renderBanner());
    console.log('\nOffice Office doctor\n');
    console.log(`Node: ${process.version}`);
    console.log(`Git repo: ${(await isGitRepo(cwd)) ? 'yes' : 'no'}`);
    for (const p of cfg.providers) {
      const d = await providerDoctor(p);
      console.log(`${p.id.padEnd(8)} ${d.installed ? '✓ installed' : '✗ missing'}  ${d.apiKey ? 'API key detected' : 'API key not detected'}`);
    }
    console.log('\nAPI keys are never written to the project or Hive.');
    return;
  }

  if (cmd === 'status') {
    console.log(renderBanner());
    console.log('\n' + ((await status(cwd)).stdout || 'Working tree clean.'));
    return;
  }

  if (cmd === 'web') {
    console.log(renderBanner());
    const server = await startServer(cwd, cfg.webPort);
    console.log(`\nOffice Office UI: http://127.0.0.1:${cfg.webPort}`);
    console.log('Local dashboard only. Press Ctrl+C to stop.\n');
    await new Promise<void>(resolve => process.on('SIGINT', () => {
      server.close().then(() => resolve());
    }));
    return;
  }

  if (cmd === 'config') {
    if (args[1] === 'set' && args[2] && args[3]) {
      if (args[2] === 'supervisor') {
        const provider = cfg.providers.find(p => p.id === args[3]);
        if (!provider) {
          console.error(`Unknown provider "${args[3]}". Run office config to inspect provider IDs.`);
          process.exitCode = 1;
          return;
        }
        cfg.supervisor = args[3];
        await saveConfig(cfg);
        console.log(`Supervisor set to ${args[3]}`);
        return;
      }
      console.error('Supported: office config set supervisor <provider-id>');
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify({ ...cfg, providers: cfg.providers.map(p => ({ ...p, env: undefined })) }, null, 2));
    return;
  }

  const prompt = args.join(' ');
  if (!prompt.trim()) {
    console.error('Unknown command or empty task. Run `office --help` for available commands.');
    process.exitCode = 1;
    return;
  }

  console.log(renderBanner());
  const orchestrator = new Orchestrator(cfg, cwd, output => {
    process.stdout.write(output.endsWith('\n') ? output : output + '\n');
  });
  await orchestrator.run(prompt);
}

main().catch(error => {
  console.error(`\n✗ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});