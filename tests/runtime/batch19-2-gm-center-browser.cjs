// Current GM center contract supersedes the retired six-button/HUD interface.
const {spawnSync}=require('node:child_process');
for(const file of ['gm-maximized-preview-browser.cjs','gm-preview-bridge-browser.cjs']){
 const started=Date.now();
 const result=spawnSync(process.execPath,[require('node:path').join(__dirname,file)],{stdio:'inherit',env:process.env});
 console.log('GM subtest '+file+': '+((Date.now()-started)/1000).toFixed(3)+'s');
 if(result.error)console.error(result.error);
 if(result.status!==0)process.exit(result.status||1);
}
