(function(){
 const retired=["startGalaxyReviewBattle","openGalaxyReviewMap","enterGalaxyReviewMap","startSecondWorldBossReview","startThirdWorldBossReviewFromPlayerUi","startGalaxyCalamityReview","startUniverseCalamityReview","setAdventureReviewBattleActive","isAdventureReviewBattleActive","getAdventureReviewBattleSource"];
 const errors=retired.filter(name=>typeof window[name]!=="undefined").map(name=>({code:"RETIRED_REVIEW_API_PRESENT",name}));
 window.REVIEW_RETIREMENT_VERSION=1;
 window.getReviewRetirementReport=()=>({version:1,passed:errors.length===0,errors:errors.slice()});
 window.REVIEW_RETIREMENT_INTEGRITY=window.getReviewRetirementReport();
 if(errors.length)console.error("Review retirement integrity",errors);
})();
