#!/usr/bin/env node
'use strict';
// Read-only audit: report CI suite/command map drift without altering any CI gate.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const suites = JSON.parse(fs.readFileSync(path.join(root, 'scripts/ci-suites.json'), 'utf8'));
const rows = JSON.parse(fs.readFileSync(path.join(root, 'scripts/ci-command-map.json'), 'utf8'));
const key = (suite, command) => JSON.stringify([suite, command]);
const expected = new Map();
for (const [suite, commands] of Object.entries(suites)) {
  assert(Array.isArray(commands) && commands.length > 0, 'Empty suite: ' + suite);
  for (const command of commands) {
    const id = key(suite, command);
    expected.set(id, (expected.get(id) || 0) + 1);
  }
}
const actual = new Map();
for (const row of rows) {
  assert(typeof row.source === 'string' && row.source && typeof row.command === 'string', 'Invalid map row');
  const id = key(row.suite, row.command);
  actual.set(id, (actual.get(id) || 0) + 1);
}
const missing = [], extra = [];
for (const [id, count] of expected) {
  if ((actual.get(id) || 0) !== count) missing.push({entry: JSON.parse(id), expected: count, actual: actual.get(id) || 0});
}
for (const [id, count] of actual) {
  if (!expected.has(id)) extra.push({entry: JSON.parse(id), count});
}
const report = {suiteCount: Object.keys(suites).length, suiteCommands: [...expected.values()].reduce((a,b)=>a+b,0), mapRows: rows.length, missing, extra};
console.log(JSON.stringify(report, null, 2));
if (missing.length || extra.length) process.exitCode = 1;
