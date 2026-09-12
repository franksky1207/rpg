(function(){
 function rankLabel(rank){
  const max=Math.max(1,Array.isArray(WORLD_REGIONS)?WORLD_REGIONS.length:1);
  const r=Math.max(1,Math.min(max,Math.floor(Number(rank)||1)));
  const region=Array.isArray(WORLD_REGIONS)?WORLD_REGIONS[r-1]:null;
  return `${region?.name||`第${r}區`}階`;
 }
 const baseAssessment=typeof window.getArenaAssessmentStatus==="function"?window.getArenaAssessmentStatus:null;
 const baseInfo=typeof window.getArenaRankInfo==="function"?window.getArenaRankInfo:null;
 const baseConfigs=typeof window.getArenaDifficultyConfigs==="function"?window.getArenaDifficultyConfigs:null;
 window.getArenaRankName=rankLabel;
 if(baseAssessment)window.getArenaAssessmentStatus=function(){const out=baseAssessment();return {...out,rankName:rankLabel(out.rank)};};
 if(baseInfo)window.getArenaRankInfo=function(rank=null){const out=baseInfo(rank);return {...out,name:rankLabel(out.rank)};};
 if(baseConfigs)window.getArenaDifficultyConfigs=function(rank=null){return baseConfigs(rank).map(cfg=>({...cfg,rankName:rankLabel(cfg.rank)}));};
 window.getArenaRankLabel=rankLabel;
})();
