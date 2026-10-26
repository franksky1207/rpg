'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const suites = require('../scripts/ci-suites.json');
const inventory = require('../scripts/ci-command-map.json');
test('all inventoried commands have exactly one suite and unchanged shell semantics', () => {
  const expected = inventory.map(x => `${x.suite}\0${x.command}`).sort();
  const actual = Object.entries(suites).flatMap(([k, v]) => v.map(c => `${k}\0${c}`)).sort();
  assert.deepEqual(actual, expected);
  assert.equal(new Set(actual).size, actual.length);
  for (const c of actual) assert.equal(require('node:child_process').spawnSync('bash', ['-n', '-c', c.split('\0')[1]]).status, 0);
});
test('historical runtime coverage guards resolve invoked suites only', () => {
  const source = require('../scripts/ci-workflow-source.cjs')('.github/workflows/runtime-integrity.yml');
  for (const k of ['R1', 'R2-container', 'R2-crash', 'R3', 'R4', 'runtime-node-regression']) {
    assert.ok(source.includes(`node scripts/ci-run-suite.cjs ${k}`));
    for (const c of suites[k]) assert.ok(source.includes(c));
  }
});

// Post-112 maintenance contracts share this already-executed CI suite entry.
require('./ci-suite-report.test.cjs');
require('./runtime/resource-preload-closure.test.cjs');
