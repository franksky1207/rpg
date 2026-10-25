'use strict';
// Resolve only suites actually invoked by the workflow, so historical coverage
// guards continue checking executable commands after extracting their manifest.
const fs = require('node:fs');
const suites = require('./ci-suites.json');
module.exports = function workflowSource(path) {
  const source = fs.readFileSync(path, 'utf8');
  const keys = [...source.matchAll(/node scripts\/ci-run-suite\.cjs ([A-Za-z0-9-]+)/g)].map(m => m[1]);
  return source + '\n' + keys.flatMap(k => {
    if (!Object.hasOwn(suites, k) || !suites[k].length) throw Error(`Missing invoked suite: ${k}`);
    return suites[k];
  }).join('\n');
};
