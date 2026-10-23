import { loadConfig, saveConfig } from './config.js';
import { providerDoctor } from './providers.js';
import { Orchestrator } from './supervisor.js';
import { startServer } from './server.js';
import { status, isGitRepo } from './git.js';
import { renderBanner } from './banner.js';
import { loadSkills } from './skills.js';
import { createKnowledgeProvider } from './knowledge.js';
import { integrationStatuses, mcpManifest } from './integrations.js';

const args = process.argv.slice(2);
const cmd = args[0];
const cwd = process.cwd();

function printBanner() { if (process.stdout.isTTY) console.log(renderBanner()); }

function printConfig(cfg: Awaited<ReturnType<typeof loadConfig>>) {
  if (args.includes('--json')) {
    console.log(JSON.stringify({...cfg,providers:cfg.providers.map(provider=>({...provider,env:undefined}))},null,2));
    return;
  }
  console.log('Office Office configuration\n---------------------------');
  console.log(`Supervisor:       ${cfg.supervisor}`);
  console.log(`Workspace:        ${cfg.workspace}`);
  console.log(`Max parallel:     ${cfg.maxParallel}`);
  console.log(`Auto commit:      ${cfg.autoCommit ? 'enabled' : 'disabled'}`);
  console.log(`Dashboard port:   ${cfg.webPort}`);
  console.log(`Knowledge:        ${cfg.knowledge.enabled ? cfg.knowledge.provider : 'disabled'}`);
  console.log('\nWorker assignments:');
  for (const [agent,provider] of Object.entries(cfg.workers)) console.log(`  ${agent.padEnd(12)} ${provider}`);
  console.log('\nIntegrations:');
  for (const integration of cfg.integrations) console.log(`  ${integration.id.padEnd(12)} ${integration.enabled?'enabled':'disabled'} · ${integration.description}`);
  console.log('\nProviders:');
  for (const provider of cfg.providers) console.log(`  ${provider.id.padEnd(12)} ${provider.kind.padEnd(8)} ${provider.enabled===false?'disabled':'enabled'} · command: ${provider.command}`);
  console.log('\nSecrets and provider environment values are not displayed.');
}

async function main() {
  if (!cmd || cmd==='help' || cmd==='--help' || cmd==='-h') {
    printBanner();
    console.log(`\nUsage:
  office "Build authentication"
  office setup
  office agents
  office skills
  office doctor
  office knowledge status
  office knowledge enable xerj
  office knowledge disable
  office integrations status
  office integrations enable <github|playwright|context7>
  office integrations disable <github|playwright|context7>
  office integrations mcp
  office status
  office web [--lan]
  office config
  office config --json
  office config set supervisor <provider-id>
`);
    return;
  }
  if (cmd==='agents'||cmd==='agent') { console.log('\nAgents:\n  michael  Supervisor / planner\n  dwight   Backend / systems\n  pam      Frontend / UX\n  jim      Testing / review\n\nThe default roster is configurable; dynamic agent creation is planned, not yet implemented.'); return; }
  if (cmd==='skills'||cmd==='skill') { const skills=await loadSkills(cwd);console.log(`\nSkills (${skills.length}):`);if(!skills.length)console.log('  No repository skills found.');for(const skill of skills)console.log(`  ${skill.id.padEnd(20)} ${skill.description} [${skill.source}]`);return; }

  const cfg = await loadConfig(cwd);
  if (cmd==='setup') {
    console.log('Office Office setup checklist\\n------------------------------');
    console.log(`Node.js: ${process.version} ${Number(process.versions.node.split('.')[0]) >= 20 ? '✓' : '✗ (Node.js 20+ recommended)'}`);
    console.log(`Git: ${(await isGitRepo(cwd)) ? '✓ repository detected' : '○ current folder is not a Git repository'}`);
    console.log(`Workspace: ${cwd}`);
    console.log(`Supervisor: ${cfg.supervisor}`);
    console.log(`Dashboard: http://127.0.0.1:${cfg.webPort}`);
    console.log('\\nProvider availability:');
    let available = 0;
    for (const p of cfg.providers.filter(p => p.enabled !== false)) {
      const d = await providerDoctor(p);
      if (d.installed) available++;
      console.log(`  ${d.installed ? '✓' : '○'} ${p.id.padEnd(10)} ${d.installed ? 'installed' : 'not detected'}`);
    }
    console.log(`\\nDetected providers: ${available}`);
    console.log('\\nNext steps:');
    console.log('  1. Install and authenticate one supported provider CLI.');
    console.log('  2. Run office doctor to check providers and optional integrations.');
    console.log('  3. Run office "Describe a small, safe change and add a test" from a Git repository.');
    console.log('  4. Run office web to open the local dashboard.');
    console.log('  5. Review the Git diff and test results before committing or merging.');
    console.log('\\nSafety: integrations are opt-in. Prompt-based guardrails are not a security sandbox.');
    return;
  }
  if (cmd==='knowledge') {
    const action=args[1]||'status'; const provider=createKnowledgeProvider(cfg.knowledge,cwd);
    if(action==='status'){console.log(`Knowledge provider: ${cfg.knowledge.enabled?cfg.knowledge.provider:'disabled'}`);console.log(`Command: ${cfg.knowledge.command}`);console.log(`Prefix: ${cfg.knowledge.prefix}`);console.log(`Available: ${await provider.available()?'yes':'no'}`);return;}
    if(action==='enable'&&args[2]==='xerj'){cfg.knowledge.provider='xerj';cfg.knowledge.enabled=true;await saveConfig(cfg);console.log('XERJ knowledge provider enabled. Install the `xerj` CLI before running a mission.');return;}
    if(action==='disable'){cfg.knowledge.enabled=false;await saveConfig(cfg);console.log('Knowledge retrieval disabled.');return;}
    console.error('Supported: office knowledge status | office knowledge enable xerj | office knowledge disable');process.exitCode=1;return;
  }
  if (cmd==='integrations') {
    const action=args[1]||'status';
    if(action==='status'){
      const states=await integrationStatuses(cfg.integrations,cwd);
      console.log('\nIntegrations:');
      for(const s of states) console.log(`  ${s.id.padEnd(12)} ${s.enabled?'enabled':'disabled'} · ${s.available?'available':'not detected'} · ${s.description}`);
      console.log('\nIntegrations are opt-in. Enable only the tools you trust.');
      return;
    }
    if(action==='enable'||action==='disable'){
      const target=cfg.integrations.find(x=>x.id===args[2]);
      if(!target){console.error(`Unknown integration "${args[2]||''}". Run office integrations status.`);process.exitCode=1;return;}
      target.enabled=action==='enable';await saveConfig(cfg);console.log(`${target.id} integration ${target.enabled?'enabled':'disabled'}.`);return;
    }
    if(action==='mcp'){console.log(JSON.stringify(mcpManifest(cfg.integrations),null,2));return;}
    console.error('Supported: office integrations status | office integrations enable <id> | office integrations disable <id> | office integrations mcp');process.exitCode=1;return;
  }
  if (cmd==='doctor') {
    console.log('Office Office doctor\n');console.log(`Node: ${process.version}`);console.log(`Git repo: ${(await isGitRepo(cwd))?'yes':'no'}`);
    for(const p of cfg.providers){const d=await providerDoctor(p);const auth=p.kind==='ollama'?'local provider':d.apiKey?'API key detected':'API key not detected';console.log(`${p.id.padEnd(8)} ${d.installed?'✓ installed':'✗ missing'}  ${auth}`);}
    const knowledge=createKnowledgeProvider(cfg.knowledge,cwd);console.log(`knowledge ${cfg.knowledge.enabled?'✓ enabled':'○ disabled'}  ${await knowledge.available()?'XERJ available':'XERJ not detected'}`);
    for(const s of await integrationStatuses(cfg.integrations,cwd)) console.log(`${s.id.padEnd(9)} ${s.enabled?'✓ enabled':'○ disabled'}  ${s.available?'available':'not detected'}`);
    console.log('\nThis checks executable/key presence; it does not prove authentication or a successful remote request.');console.log('API keys are never written to the project or Hive.');return;
  }
  if (cmd==='status') { console.log((await status(cwd)).stdout||'Working tree clean.'); return; }
  if (cmd==='web') { const lan=args.includes('--lan');const host=lan?'0.0.0.0':'127.0.0.1';const server=await startServer(cwd,cfg.webPort,host);console.log(`Office Office UI: http://${lan?'<laptop-ip>':'127.0.0.1'}:${cfg.webPort}`);console.log(lan?'LAN dashboard enabled. Only use this on a trusted private network; stop it with Ctrl+C when finished.':'Local dashboard only. Press Ctrl+C to stop.');console.log('');await new Promise<void>(resolve=>process.on('SIGINT',()=>{server.close().then(()=>resolve());}));return; }
  if (cmd==='config') {
    if(args[1]==='set'&&args[2]&&args[3]){if(args[2]==='supervisor'){const provider=cfg.providers.find(p=>p.id===args[3]);if(!provider){console.error(`Unknown provider "${args[3]}". Run office config to inspect provider IDs.`);process.exitCode=1;return;}cfg.supervisor=args[3];await saveConfig(cfg);console.log(`Supervisor set to ${args[3]}`);return;}console.error('Supported: office config set supervisor <provider-id>');process.exitCode=1;return;}
    printConfig(cfg);return;
  }
  const prompt=args.join(' ');if(!prompt.trim()){console.error('Unknown command or empty task. Run `office --help` for available commands.');process.exitCode=1;return;}
  const orchestrator=new Orchestrator(cfg,cwd,output=>process.stdout.write(output.endsWith('\n')?output:output+'\n'));await orchestrator.run(prompt);
}
main().catch(error=>{console.error(`\n✗ ${error instanceof Error?error.message:error}`);process.exit(1);});
