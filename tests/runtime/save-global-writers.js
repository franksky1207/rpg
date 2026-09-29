const fs=require("fs");
const path=require("path");
// Permanent regression: only the engine base function and Compatibility Save Hook owner may write the global save function.
function walk(dir){const out=[];for(const e of fs.readdirSync(dir,{withFileTypes:true})){if([".git","node_modules"].includes(e.name))continue;const p=path.join(dir,e.name);if(e.isDirectory())out.push(...walk(p));else if(e.isFile()&&e.name.endsWith(".js"))out.push(p.replace(/^\.\//,""));}return out;}
const allowed=new Set(["engine.js","compatibilityowners.js"]);
const patterns=[/\bwindow\.save\s*=/g,/\bglobalThis\.save\s*=/g,/\bfunction\s+save\s*\(/g,/\btry\s*\{\s*save\s*=/g,/\bsave\s*=\s*(?:function|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*)/g];
const hits=[];
for(const file of walk(".")){
 const src=fs.readFileSync(file,"utf8");
 const matched=patterns.some(re=>{re.lastIndex=0;return re.test(src);});
 if(matched&&!allowed.has(file))hits.push(file);
}
if(hits.length){console.error("Unexpected global save writers:",hits.join(", "));process.exit(1);}
console.log("Global save writer audit passed: only engine.js and compatibilityowners.js may own/replace save().");
