'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {check, GROUP, CANCEL} = require('../../scripts/check-workflow-concurrency.cjs');
const good = 'name: Test\non:\n  pull_request:\n  push:\n    branches: [main]\n  workflow_dispatch:\nconcurrency:\n  group: '+GROUP+'\n  cancel-in-progress: '+CANCEL+'\njobs:\n  test:\n    runs-on: ubuntu-latest\n';
test('PR workflow accepted with push and manual isolation', () => assert.equal(check(good), true));
for (const [name, source] of [
 ['missing group', good.replace(/^concurrency:\n[\s\S]*?(?=jobs:)/m, '')],
 ['no workflow identity', good.replace('${{ github.workflow }}-', '')],
 ['no event identity', good.replace('${{ github.event_name }}-', '')],
 ['no PR identity', good.replace('github.event.pull_request.number || ', '')],
 ['main or manual cancellation', good.replace(CANCEL, 'true')],
 ['duplicate concurrency', good + 'concurrency:\n  group: duplicate\n'],
 ['PR writer', good + 'permissions:\n  contents: write\n'],
 ['job cancellation', good + '    concurrency:\n      group: shared\n'],
 ['inline event bypass', good.replace(/on:\n[\s\S]*?concurrency:/, 'on: [pull_request]\nconcurrency:')],
]) test('reject '+name, () => assert.throws(() => check(source)));
test('main-only workflows do not acquire PR cancellation', () => {
 assert.equal(check('name: Publish\non:\n  push:\n    branches: [main]\nconcurrency:\n  group: publish\n  cancel-in-progress: false\njobs:\n'), false);
 assert.throws(() => check('name: Publish\non:\n  push:\nconcurrency:\n  cancel-in-progress: true\njobs:\n'));
});
test('groups separate workflows, PRs and event types while reusing a PR group across SHAs', () => {
 const group = (workflow, event, pr, ref) => workflow+'-'+event+'-'+(pr || ref);
 const first = group('Runtime', 'pull_request', 89, 'refs/pull/89/merge');
 assert.equal(first, group('Runtime', 'pull_request', 89, 'refs/pull/89/merge'));
 assert.notEqual(first, group('Functional', 'pull_request', 89, 'refs/pull/89/merge'));
 assert.notEqual(first, group('Runtime', 'pull_request', 90, 'refs/pull/90/merge'));
 assert.notEqual(group('Runtime','push',null,'refs/heads/main'), group('Runtime','workflow_dispatch',null,'refs/heads/main'));
});
