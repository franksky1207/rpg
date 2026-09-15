(function(){
 if(typeof window.migrateSave!=="function"||typeof window.normalizeEnhancementState!=="function")return;
 const baseMigrateSave=window.migrateSave;
 window.migrateSave=function(rawState,fromVersion=null,normalizer=null,sourceRaw=null){
  const migrated=baseMigrateSave(rawState,fromVersion,normalizer,sourceRaw);
  return window.normalizeEnhancementState(migrated);
 };
})();
