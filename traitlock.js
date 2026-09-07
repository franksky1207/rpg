function ensureMonsterTraitPreviewStore(){
 if(!state.monsterTraitPreview||typeof state.monsterTraitPreview!=="object"||Array.isArray(state.monsterTraitPreview)){
  state.monsterTraitPreview={};
 }
 return state.monsterTraitPreview;
}

function getPreviewEncounter(mapIdx,eIdx){
 let k=previewKey(mapIdx,eIdx);
 if(monsterPreviewCache[k])return monsterPreviewCache[k];
 let store=ensureMonsterTraitPreviewStore(),base=baseMonsterObj(mapIdx,eIdx),traits=store[k];
 if(!Array.isArray(traits)){
  traits=rollMonsterTraits(base.kind);
  store[k]=traits.slice();
  save(false);
 }
 monsterPreviewCache[k]=applyMonsterTraits(base,traits);
 return monsterPreviewCache[k];
}

function clearPreviewEncounter(mapIdx,eIdx){
 let k=previewKey(mapIdx,eIdx);
 delete monsterPreviewCache[k];
 let store=ensureMonsterTraitPreviewStore();
 if(k in store){delete store[k];save(false)}
}

ensureMonsterTraitPreviewStore();
save(false);
