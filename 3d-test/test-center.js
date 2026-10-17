/* GM visual test center: session-only 2.5D previews. No save or combat-owner writes. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const categories=[['character','角色與動作'],['combat','戰場與對戰']];
const cases=[
 {id:'C-08-CHARACTER',cat:'character',title:'角色與動作',detail:'查看現有 2.5D 試作角色與待機、攻擊、受擊、閃避、死亡；銀河、宇宙、高維正式角色尚未製作。'},
 {id:'C-15-BATTLE',cat:'combat',title:'戰場與對戰',detail:'真正的 2.5D 沙盒：普通怪、菁英、Boss、生命／護盾、戰鬥動作及速度；不影響正式戰鬥。'}
];
const host=$('prototypeHost'),status=$('status'),fallback=$('fallback'),reason=$('fallbackReason');
const workspace=$('centerWorkspace'),buttons=$('categoryList'),casesHolder=$('caseList');
const toggle=$('toggle'),quality=$('quality'),maximizeButton=$('maximizePreview');
const embedded=new URLSearchParams(location.search).get('embedded')==='1';
let selected=cases[0],current=null,generation=0,disabled=false,maximized=false,maximumScroll=null;
const state=()=>({category:selected.cat,caseId:selected.id,maximized,disabled});
function categoryButtons(){
 buttons.replaceChildren();casesHolder.replaceChildren();
 for(const [id,label] of categories){
  const b=document.createElement('button');
  b.type='button';b.className='center-category'+(selected.cat===id?' active':'');
  b.setAttribute('aria-pressed',String(selected.cat===id));b.setAttribute('aria-label',label);
  const title=document.createElement('span');title.className='center-category-name';title.textContent=label;
  b.append(title);b.addEventListener('click',()=>select(id));buttons.append(b);
 }
 // Retain a semantic scene entry for regression probes, but never show a
 // second navigation tree or revive historical 3D scene categories.
 const caseButton=document.createElement('button');caseButton.type='button';
 caseButton.className='center-case active';caseButton.textContent=selected.title;
 caseButton.addEventListener('click',()=>open());casesHolder.append(caseButton);
 $('caseTitle').textContent=selected.title;
 $('caseDetail').textContent=selected.detail;
}
function setMaximized(value){
 if(maximized===!!value)return;
 if(value)maximumScroll={left:window.scrollX,top:window.scrollY};
 maximized=!!value;
 document.body.classList.toggle('gm-3d-maximized',maximized);
 workspace.classList.toggle('center-maximized',maximized);
 maximizeButton.setAttribute('aria-pressed',String(maximized));
 maximizeButton.setAttribute('aria-label',maximized?'還原預覽':'最大化預覽');
 maximizeButton.textContent=maximized?'⛶ 還原預覽':'⛶ 最大化預覽';
 current?.resize?.();
 requestAnimationFrame(()=>{
  if(!maximized&&maximumScroll){
   window.scrollTo({...maximumScroll,behavior:'instant'});maximumScroll=null;
  }
  current?.resize?.();
 });
}
function clear(){
 generation++;
 const previous=current;current=null;
 if(previous)previous.dispose();
 host.replaceChildren();
}
function failure(message){
 status.hidden=false;status.textContent='預覽目前無法使用，可重新載入。';
 fallback.hidden=false;host.hidden=true;reason.textContent=String(message);
}
async function open(){
 clear();
 const ticket=generation;
 fallback.hidden=true;host.hidden=false;status.hidden=false;
 if(disabled){failure('視覺預覽已停用，不影響正式遊戲。');return;}
 status.textContent=selected.cat==='character'?'角色展示不影響正式角色與存檔。':'戰鬥沙盒不影響正式戰鬥、存檔或音效。';
 const abort=new AbortController();let view=null;
 current={dispose:()=>{abort.abort();view?.dispose();},resize:()=>view?.resize(),setQuality:value=>view?.setQuality?.(value)};
 try{
  const module=selected.cat==='character'
   ?await import('./gm-whole-suit.mjs?v=20261015-thrust1')
   :await import('./gm-battle-simulation.js?v=20261015-thrust1');
  if(ticket!==generation||abort.signal.aborted)return;
  view=await module.mount({host,signal:abort.signal,quality:quality.value});
  if(ticket!==generation||abort.signal.aborted)view?.dispose();
 }catch(error){
  if(ticket===generation&&!abort.signal.aborted)failure('2.5D 預覽載入失敗：'+String(error?.message||error));
 }
}
function select(id){
 const found=cases.find(c=>c.cat===id);if(!found)return;
 selected=found;categoryButtons();open();
}
maximizeButton.addEventListener('click',()=>setMaximized(!maximized));
toggle.addEventListener('click',()=>{
 disabled=!disabled;toggle.textContent=disabled?'啟用預覽':'停用預覽';open();
});
$('restart').addEventListener('click',()=>{disabled=false;toggle.textContent='停用預覽';open();});
quality.addEventListener('change',()=>open());
window.addEventListener('pagehide',()=>{setMaximized(false);clear();});
window.addEventListener('keydown',event=>{
 if(event.key!=='Escape')return;
 if(maximized){event.preventDefault();event.stopImmediatePropagation();setMaximized(false);return;}
 if(embedded&&window.parent!==window){
  event.preventDefault();
  try{window.parent.postMessage({type:'civilization3d:close'},location.origin);}catch(_){}
 }
});
if(embedded)$('backToGame').hidden=true;
$('caseSearch').hidden=true;
$('fixturePanel').hidden=true;
window.Civilization3DTestCenter=Object.freeze({
 version:6,caseIds:cases.map(c=>c.id),categoryIds:categories.map(c=>c[0]),
 getCurrent:()=>selected.id,getFixture:()=>({...state()}),isMaximized:()=>maximized
});
categoryButtons();open();
})();
