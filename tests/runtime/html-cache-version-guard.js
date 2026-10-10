#!/usr/bin/env node
"use strict";
// Compares the exact before/after Git trees; no browser cache or save data is touched.
const cp = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
function git(...args) { return cp.execFileSync("git",args,{encoding:"utf8",maxBuffer:30*1024*1024}).trimEnd(); }
function at(ref,file) { try{return git("show",ref+":"+file);}catch{return null;} }
function files(ref){return git("ls-tree","-r","--name-only",ref).split("\n").filter(Boolean);}
function refs(html,htmlPath) {
  const found=new Map();
  const re=/(?:\bsrc|\bhref|\bdata-src)\s*=\s*["']([^"']+\.(?:js|css)(?:\?[^"'#]*)?)["']/gi;
  let m;
  while((m=re.exec(html))!==null){
    const raw=m[1].replace(/&amp;/g,"&");
    if(/^(?:https?:)?\/\//i.test(raw)||raw.startsWith("data:"))continue;
    const [pathname,query=""]=raw.split("?");
    const file=path.posix.normalize(path.posix.join(path.posix.dirname(htmlPath),pathname.replace(/^\//,"")));
    if(file.startsWith("../")||file.startsWith("/"))continue;
    const all=found.get(file)||[];
    all.push({url:raw,version:query});
    found.set(file,all);
  }
  return found;
}
function run(before,after) {
  const beforeFiles=files(before),afterFiles=files(after);
  const htmls=[...new Set([...beforeFiles,...afterFiles].filter(x=>x.endsWith(".html")))];
  const changed=git("diff","--name-only","--diff-filter=ACMR",before,after,"--","*.js","*.css","**/*.js","**/*.css").split("\n").filter(Boolean);
  const violations=[];
  for(const html of htmls){
    const oldHtml=at(before,html),newHtml=at(after,html);
    if(oldHtml===null||newHtml===null)continue;
    const oldRefs=refs(oldHtml,html),newRefs=refs(newHtml,html);
    for(const file of changed){
      const oldLinks=oldRefs.get(file)||[],newLinks=newRefs.get(file)||[];
      if(!oldLinks.length&&!newLinks.length)continue; // Not loaded by this HTML entrypoint
      if(!newLinks.length)continue; // Removed from entrypoint
      const oldVersions=oldLinks.map(x=>x.url).sort().join("\n");
      const newVersions=newLinks.map(x=>x.url).sort().join("\n");
      if(oldVersions===newVersions)violations.push(html+" -> "+file+"（JS/CSS 已修改，但 HTML 引用網址未變）");
      else if(newLinks.some(x=>!x.version))violations.push(html+" -> "+file+"（更新後仍缺少版本查詢參數）");
    }
  }
  if(violations.length){
    console.error("FAIL: 發現未同步更新的 HTML JS/CSS 快取版本：\n"+violations.map(x=>" - "+x).join("\n"));
    process.exitCode=1;
  }else console.log("PASS: 所有直接由 HTML 載入且本次變動的 JS/CSS 都已核對快取版本。已檢查 "+changed.length+" 個變動檔。");
}
if(process.argv.includes("--self-test")){
  const a=refs('<script src="ui.js?v=1"></script><script data-src="gm/core.js?v=1"></script><link href="style.css?v=1" rel="stylesheet">',"index.html");
  if(a.size!==3||a.get("ui.js")[0].version!=="v=1")throw Error("ref extraction");
  if(refs('<script src="ui.js?v=2"></script>',"index.html").get("ui.js")[0].url===a.get("ui.js")[0].url)throw Error("version comparison");
  console.log("PASS: HTML link extraction and version-change self-test");
}else{
  const before=process.argv[2],after=process.argv[3];
  if(!before||!after)throw Error("Usage: node tests/runtime/html-cache-version-guard.js <before-sha> <after-sha>");
  run(before,after);
}
