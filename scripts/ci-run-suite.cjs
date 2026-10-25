#!/usr/bin/env node
'use strict';
// CI orchestration only: each original command keeps its arguments, environment and assertions.
const fs = require('node:fs');
const {spawnSync} = require('node:child_process');
const suites = require('./ci-suites.json');
const name = process.argv[2];
if (!Object.hasOwn(suites, name) || suites[name].length === 0) throw Error(`Unknown/empty CI suite: ${name}`);
const report = {suite: name, sha: process.env.GITHUB_SHA || null, passed: false, commands: []};
const file = `ci-suite-${name}.json`;
for (const command of suites[name]) {
  console.log(`::group::${name}: ${command.split('\n')[0]}`);
  const start = Date.now();
  const result = spawnSync('bash', ['-e', '-o', 'pipefail', '-c', command], {stdio: 'inherit'});
  const row = {command, seconds: (Date.now() - start) / 1000, exitCode: result.status, signal: result.signal};
  report.commands.push(row);
  fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n');
  console.log(`Duration: ${row.seconds}s; exit: ${row.exitCode}`);
  console.log('::endgroup::');
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
report.passed = true;
fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n');
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### ${name}\n\n| Command | Seconds |\n| --- | ---: |\n` + report.commands.map(r => `| \`${r.command.split('\n')[0].replaceAll('|', '\\|')}\` | ${r.seconds} |`).join('\n') + '\n');
}
