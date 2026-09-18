// 永久回歸檢查：正式故事資料、10 區地圖、101 篇劇情與 100 Boss 對應。
const fs=require('fs');
const vm=require('vm');

const files=[
 'data.js',
 'worldmaps-earth.js','worldmaps-solar.js','worldmaps-nearstar.js','worldmaps-frontier.js','worldmaps-orion.js','worldmaps-galactic-frontier.js','worldmaps-galactic-mid.js','worldmaps-core-outer.js','worldmaps-core-war.js','worldmaps-galactic-unification.js',
 'storydata-earth.js','storydata-solar.js','storydata-nearstar.js','storydata-frontier.js','storydata-orion.js','storydata-galactic-frontier.js','storydata-galactic-mid.js','storydata-core-outer.js','storydata-core-war.js','storydata-galactic-unification.js',
 'storyintegrity.js'
];

const context={
 console,
 setTimeout,
 clearTimeout,
 Date,
 Math,
 JSON,
 Object,
 Array,
 Set,
 Map,
 String,
 Number,
 Boolean,
 RegExp,
 Error,
 Buffer,
 atob:s=>Buffer.from(String(s),'base64').toString('binary'),
 btoa:s=>Buffer.from(String(s),'binary').toString('base64')
};
context.window=context;
vm.createContext(context);

try{
 for(const file of files){
  const source=fs.readFileSync(file,'utf8');
  vm.runInContext(source,context,{filename:file});
 }
 const report=context.STORY_INTEGRITY_REPORT;
 if(!report){
  console.error('STORY_INTEGRITY_REPORT 不存在');
  process.exit(2);
 }
 if(Number(report.version)<8){
  console.error(`STORY_INTEGRITY_VERSION 過舊：${report.version}`);
  process.exit(4);
 }
 console.log(`storyRegions=${report.storyRegions} totalStories=${report.totalStories} bossStoriesChecked=${report.bossStoriesChecked}`);
 const warningAllowlist=new Set([]);
 const warnings=Array.isArray(report.warnings)?report.warnings:[];
 const unexpectedWarnings=warnings.filter(item=>!warningAllowlist.has(item?.code));
 if(warnings.length)console.log(`warnings=${warnings.length}`);
 if(unexpectedWarnings.length){
  console.error(`STORY INTEGRITY UNEXPECTED WARNINGS: ${unexpectedWarnings.length}`);
  unexpectedWarnings.forEach((warning,index)=>{
   console.error(`${index+1}. [${warning?.code||'UNKNOWN'}] ${warning?.message||''}`);
   if(warning?.data!==null&&warning?.data!==undefined)console.error(`   data=${JSON.stringify(warning.data)}`);
  });
  process.exit(5);
 }
 if(report.passed){
  console.log('STORY INTEGRITY PASSED');
  process.exit(0);
 }
 console.error(`STORY INTEGRITY FAILED: ${report.errors.length} error(s)`);
 report.errors.forEach((error,index)=>{
  console.error(`${index+1}. [${error.code}] ${error.message}`);
  if(error.data!==null&&error.data!==undefined)console.error(`   data=${JSON.stringify(error.data)}`);
 });
 process.exit(1);
}catch(error){
 console.error('STORY INTEGRITY CI EXECUTION FAILED');
 console.error(error&&error.stack?error.stack:error);
 process.exit(3);
}
