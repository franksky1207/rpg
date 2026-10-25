const fs=require("fs");
const path=require("path");

function assert(condition,message){if(!condition)throw new Error(message);}
function walkFiles(root){
 const out=[];
 for(const entry of fs.readdirSync(root,{withFileTypes:true})){
  const full=path.join(root,entry.name);
  if(entry.isDirectory())out.push(...walkFiles(full));
  else if(entry.isFile())out.push(full);
 }
 return out;
}
function bytes(files){return files.reduce((sum,file)=>sum+fs.statSync(file).size,0);}
function formatBytes(value){
 const units=["B","KB","MB","GB"];let n=value,i=0;
 while(n>=1024&&i<units.length-1){n/=1024;i++;}
 return `${n.toFixed(i?2:0)} ${units[i]}`;
}

const sourceRoot=path.join("assets","backgrounds-source");
const runtimeRoot=path.join("assets","backgrounds");
const policyFile=path.join("assets","README.md");
assert(!fs.existsSync(sourceRoot)||walkFiles(sourceRoot).length===0,"退役背景來源不得重新入庫。");
assert(fs.existsSync(runtimeRoot),"缺少 assets/backgrounds 正式背景目錄。");
assert(fs.existsSync(policyFile),"缺少 assets/README.md 素材管理規範。");


const runtimeFiles=walkFiles(runtimeRoot);

assert(runtimeFiles.length===32,"正式背景必須恰好 32 張 WebP。");

const runtimeNonWebp=runtimeFiles.filter(file=>path.extname(file).toLowerCase()!==".webp");
assert(runtimeNonWebp.length===0,"正式背景目錄只能部署 WebP："+runtimeNonWebp.join(", "));

const runtimeDirs=[...new Set(runtimeFiles.map(file=>path.dirname(file)))].sort();
for(const dir of runtimeDirs){
 const names=new Set(fs.readdirSync(dir));
 assert(names.has("desktop.webp")&&names.has("mobile.webp"),`正式背景場景必須同時具備 desktop.webp / mobile.webp：${dir}`);
}

const backgroundsCss=fs.readFileSync("backgrounds.css","utf8");
assert(!backgroundsCss.includes("assets/backgrounds-source/"),"backgrounds.css 不得引用原始 backgrounds-source。");
const cssRefs=[...backgroundsCss.matchAll(/url\(["']?(assets\/backgrounds\/[^"')?]+)(?:\?[^"')]+)?["']?\)/g)].map(match=>match[1]);
assert(cssRefs.length>0,"backgrounds.css 找不到正式背景引用。");
for(const ref of cssRefs){
 assert(ref.toLowerCase().endsWith(".webp"),"正式背景 CSS 引用必須是 WebP："+ref);
 assert(fs.existsSync(ref),"backgrounds.css 引用不存在的正式背景："+ref);
}

const textExtensions=new Set([".html",".css",".js",".mjs"]);
const repoText=walkFiles(".").filter(file=>{
 if(file.startsWith(".git"+path.sep)||file.startsWith("node_modules"+path.sep)||file.startsWith("tests"+path.sep))return false;
 return textExtensions.has(path.extname(file).toLowerCase());
});
const illegalSourceRefs=[];
for(const file of repoText){
 const text=fs.readFileSync(file,"utf8");
 if(text.includes("assets/backgrounds-source/"))illegalSourceRefs.push(file);
}
assert(illegalSourceRefs.length===0,"正式 HTML/CSS/JS 不得直接引用 source 素材："+illegalSourceRefs.join(", "));

const manifest=JSON.parse(fs.readFileSync("resource-manifest.json","utf8"));
const crypto=require("node:crypto");
assert(runtimeDirs.length===16,"正式背景必須為16組desktop/mobile配對。");
assert(new Set(cssRefs).size===32,"CSS必須完整引用32張正式背景。");
for(const file of runtimeFiles){
 const name=file.split(path.sep).join("/");
 assert(cssRefs.includes(name),"正式背景沒有CSS引用："+name);
 assert(manifest.files[name]===crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").slice(0,24),"背景Manifest SHA不符："+name);
}
assert(!Object.keys(manifest.files).some(p=>p.startsWith("assets/backgrounds-source/")),"Manifest不得引用退役來源。");
console.log(`Asset Integrity OK: 32 WebP / 16 pairs / ${formatBytes(bytes(runtimeFiles))} / CSS and SHA manifest complete`);
