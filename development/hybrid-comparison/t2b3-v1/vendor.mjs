/* One document-local copy of the existing pinned vendor; no new renderer SDK. */
let task=null;
export async function ensureBabylon(manifest){
 if(globalThis.BABYLON?.SceneLoader?.IsPluginForExtensionAvailable('.glb'))return;
 // GM may still be loading the shared engine when this adapter opens.
 // Join that existing job instead of injecting a second copy of Babylon.
 if(globalThis.Civilization3DLoader?.ensure&&!globalThis.BABYLON?.Engine)await globalThis.Civilization3DLoader.ensure('engine');
 if(!task)task=(async()=>{for(const path of ['vendor/babylonjs/7.54.3/babylon.js','vendor/babylonjs/7.54.3/babylonjs.loaders.min.js']){if(path.endsWith('/babylon.js')&&globalThis.BABYLON?.Engine)continue;const row=manifest.vendor[path];if(!row)throw Error('Unpinned vendor');await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('../../../'+path,import.meta.url).href;script.integrity='sha256-'+btoa(String.fromCharCode(...row.sha256.match(/../g).map(h=>parseInt(h,16))));let timer;const fail=()=>{clearTimeout(timer);script.remove();reject(Error('Local Babylon vendor unavailable or timed out'));};script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=fail;timer=setTimeout(fail,30000);document.head.append(script);});}})().catch(error=>{task=null;throw error;});return task;
}
