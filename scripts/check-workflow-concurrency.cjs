#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const GROUP = "${{ github.workflow }}-${{ github.event_name }}-${{ github.event.pull_request.number || github.ref }}";
const CANCEL = "${{ github.event_name == 'pull_request' }}";
function check(source, file = 'workflow') {
  const blocks = [...source.matchAll(/^([\w-]+):([^\n]*)(?:\n|$)([\s\S]*?)(?=^[\w-]+:|(?![\s\S]))/gm)];
  const top = key => blocks.filter(b => b[1] === key);
  const on = top('on');
  assert.equal(on.length, 1, file + ': exactly one on block required');
  assert.equal(on[0][2].trim(), '', file + ': use block event syntax for auditable triggers');
  const pr = /^  pull_request\s*:/m.test(on[0][3]);
  const concurrency = top('concurrency');
  assert.ok(concurrency.length <= 1, file + ': duplicate concurrency');
  if (!pr) {
    assert.ok(!/cancel-in-progress:\s*(?:true|.*github\.event_name.*pull_request)/.test(source), file + ': non-PR workflow must not use PR cancellation');
    return false;
  }
  assert.equal(concurrency.length, 1, file + ': PR concurrency required');
  assert.equal(concurrency[0][2].trim(), '', file + ': block concurrency required');
  const lines = concurrency[0][3].split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
  assert.deepEqual(lines, ['  group: ' + GROUP, '  cancel-in-progress: ' + CANCEL], file + ': workflow/event/PR isolation and PR-only cancellation required');
  assert.ok(!/^\s{4,}concurrency:/m.test(source), file + ': review nested cancellation separately');
  assert.ok(!/contents:\s*write|pages:\s*write|id-token:\s*write|git push|deploy-pages@/.test(source), file + ': side effects require explicit serialization review');
  return true;
}
function audit(root) {
  const dir = path.join(root, '.github/workflows');
  const files = fs.readdirSync(dir).filter(f => /\.ya?ml$/.test(f)).sort();
  const controlled = [];
  for (const file of files) {
    const source = fs.readFileSync(path.join(dir, file), 'utf8');
    if (check(source, file)) controlled.push(file);
    assert.ok(!/timeout-minutes\s*:|\btimeout\s+\d|git pull\s+--rebase/.test(source), file + ': manual deadline or unsafe rebase');
  }
  for (const [file, group] of [['asset-version-manifest.yml', 'asset-version-manifest'], ['publish-optimized-pages.yml', 'optimized-pages-publish']]) {
    const source = fs.readFileSync(path.join(dir, file), 'utf8');
    assert.ok(source.includes('  group: ' + group + '\n  cancel-in-progress: false'), file + ': preserve shared non-cancelling writer/deployment serialization');
  }
  console.log(JSON.stringify({workflows: files.length, prControlled: controlled}, null, 2));
}
module.exports = {check, GROUP, CANCEL};
if (require.main === module) audit(process.argv[2] || path.resolve(__dirname, '..'));
