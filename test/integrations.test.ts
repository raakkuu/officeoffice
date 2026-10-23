import test from 'node:test';
import assert from 'node:assert/strict';
import {integrationStatuses,mcpManifest} from '../src/integrations.js';
import type {IntegrationConfig} from '../src/types.js';

const configs:IntegrationConfig[]=[
  {id:'github',enabled:false,command:'gh',description:'GitHub',mcp:{command:'docker',args:['run','github-mcp-server']}},
  {id:'playwright',enabled:true,command:'npx',description:'Playwright',mcp:{command:'npx',args:['-y','@playwright/mcp@latest']}},
  {id:'context7',enabled:false,command:'ctx7',description:'Context7',mcp:{command:'npx',args:['-y','@upstash/context7-mcp@latest']}}
];

test('disabled integrations are omitted from MCP manifest',()=>{
  const manifest=mcpManifest(configs);
  assert.deepEqual(Object.keys(manifest.mcpServers),['playwright']);
});

test('integration status never exposes environment secrets',async()=>{
  const statuses=await integrationStatuses(configs,process.cwd());
  assert.equal(statuses.length,3);
  assert.ok(statuses.every(status=>!('env' in status)));
});
