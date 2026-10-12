/* Session-local verified reads. No persistent cache, player downloader or storage. */
export const MANIFEST_SHA='c2bd45b96e3026929df5a3d85275910c732c476145f03734fbf9b329394cec1e';
const root=new URL('../../../',import.meta.url);
// Development-only SHA-verified, bounded warm cache. Never persisted or published.
const WARM_LIMIT=24*1024*1024;
const warm=new Map();
let warmBytes=0;
let verifiedManifest=null; // Verified immutable metadata; no persistent storage.
function remember(path,bytes){
 if(bytes.byteLength>WARM_LIMIT)return;
 const previous=warm.get(path);
 if(previous){warmBytes-=previous.byteLength;warm.delete(path);}
 warm.set(path,bytes);warmBytes+=bytes.byteLength;
 while(warmBytes>WARM_LIMIT){const first=warm.keys().next().value;warmBytes-=warm.get(first).byteLength;warm.delete(first);}
}
export function warmCacheStats(){return Object.freeze({entries:warm.size,bytes:warmBytes,limit:WARM_LIMIT});}
export const digest=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');
export class Assets{
 constructor(signal){this.signal=signal;this.pending=new Map();this.closed=false;this.manifest=null;}
 async init(){this.signal.throwIfAborted();if(this.closed)throw Error('Assets disposed');if(verifiedManifest){this.manifest=verifiedManifest;return this;}const response=await fetch(new URL('manifest.json',import.meta.url),{signal:this.signal,cache:'no-store'});if(!response.ok)throw Error('B3 manifest HTTP '+response.status);const bytes=await response.arrayBuffer();this.signal.throwIfAborted();if(await digest(bytes)!==MANIFEST_SHA)throw Error('B3 manifest SHA mismatch');const manifest=JSON.parse(new TextDecoder().decode(bytes));if(manifest.schema!=='cw.t2b3.assets'||manifest.publish!==false)throw Error('Invalid isolated manifest');this.signal.throwIfAborted();if(this.closed)throw Error('Assets disposed');verifiedManifest=manifest;this.manifest=manifest;return this;}
 async bytes(path){this.signal.throwIfAborted();if(this.closed)throw Error('Assets disposed');const row=this.manifest.files[path];if(!row||!/^development\/hybrid-comparison\/t2b2-v1\/|^assets\/3d\/equipment\/ancient-ruins-v1\/|^development\/hybrid-comparison\/t2b3-v1\/lighting\//.test(path)||path.includes('..'))throw Error('Unlisted B3 asset '+path);if(!this.pending.has(path))this.pending.set(path,(async()=>{const cached=warm.get(path);if(cached&&cached.byteLength===row.bytes){warm.delete(path);warm.set(path,cached);return cached;}const response=await fetch(new URL(path,root),{signal:this.signal,cache:'default'});if(!response.ok)throw Error('Asset HTTP '+response.status+' '+path);const bytes=await response.arrayBuffer();this.signal.throwIfAborted();if(bytes.byteLength!==row.bytes||await digest(bytes)!==row.sha256)throw Error('Asset bytes/SHA mismatch '+path);this.signal.throwIfAborted();if(!this.closed)remember(path,bytes);return bytes;})().catch(error=>{this.pending.delete(path);throw error;}));const bytes=await this.pending.get(path);this.signal.throwIfAborted();if(this.closed)throw Error('Assets disposed');return bytes;}
 async json(path){return JSON.parse(new TextDecoder().decode(await this.bytes(path)));}
 async bitmap(path){const image=await createImageBitmap(new Blob([await this.bytes(path)],{type:'image/png'}));if(this.signal.aborted||this.closed){image.close();this.signal.throwIfAborted();throw Error('Assets disposed');}return image;}
 dispose(){this.closed=true;this.pending.clear();}
}
export const ART='development/hybrid-comparison/t2b2-v1/';
export function atlasFolder(actor,tier){return ART+(tier==='high'?(actor==='player'?'player/atlases/':'enemies/'+actor+'/atlases/'):'repair-r1/tiers/'+tier+'/'+actor+'/');}
