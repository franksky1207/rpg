"use strict";
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const ledger=JSON.parse(fs.readFileSync(path.join(root,'development/retired-formal-previews/20261013/source-evolution.json')));
module.exports=async function install(page){
 console.log('Historical preview source harness only; NOT current formal UI acceptance');
 for(const [original,row] of Object.entries(ledger.files)){
  await page.route(url=>url.pathname==='/' +original,route=>route.fulfill({status:200,contentType:original.endsWith('.html')?'text/html':original.endsWith('.css')?'text/css':'text/javascript',body:fs.readFileSync(path.join(root,row.archive))}));
 }
};
