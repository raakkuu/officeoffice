#!/usr/bin/env node
import('../dist/cli.js').catch(err=>{console.error(err?.stack||err);process.exit(1)})
