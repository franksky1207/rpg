(function(){
 const REGION_MAPS=[
  {chapter:"銀河統合戰爭",name:"銀河聯盟前線",min:451,max:455,gear:["聯盟星河刃","文明聯軍盔","銀河聯軍甲","星海聯軍靴","銀河聯盟權印"],enemies:[["銀河聯軍兵",451,"normal","attack"],["文明聯軍機",452,"normal","balanced"],["星海聯軍單元",453,"normal","tank"],["聯盟重裝艦",454,"elite","tank"],["銀河聯盟司令",455,"boss","balanced"]]},
  {chapter:"銀河統合戰爭",name:"文明聯軍戰區",min:456,max:460,gear:["文明聯軍刃","聯軍統帥盔","文明聯戰甲","聯軍突進靴","文明聯軍戰略節點"],enemies:[["聯軍星兵",456,"normal","balanced"],["文明突擊體",457,"normal","attack"],["聯軍戰機群",458,"normal","tank"],["聯軍破陣艦",459,"elite","attack"],["文明聯軍總指揮",460,"boss","tank"]]},
  {chapter:"銀河統合戰爭",name:"星海統御疆域",min:461,max:465,gear:["星海霸權刃","霸權主冠盔","星海領域甲","霸權相位靴","星海統御權柄"],enemies:[["星海統御兵",461,"normal","balanced"],["星海征戰體",462,"normal","tank"],["星海統御戰機",463,"normal","attack"],["統御戰爭母艦",464,"elite","tank"],["星海統御者",465,"boss","balanced"]]},
  {chapter:"銀河統合戰爭",name:"銀河統合要塞",min:466,max:470,gear:["統合斷星刃","銀河要塞盔","統合防衛甲","要塞機動靴","銀河要塞權限"],enemies:[["統合守衛兵",466,"normal","attack"],["要塞巡弋體",467,"normal","balanced"],["聯盟炮衛",468,"normal","attack"],["統合戰爭巨像",469,"elite","tank"],["統合要塞意識體",470,"boss","tank"]]},
  {chapter:"銀河統合戰爭",name:"銀河統合議政區",min:471,max:475,gear:["議會星河刃","統合議政冠","議會統御甲","議會相位靴","統合議會中樞"],enemies:[["議會禁衛兵",471,"normal","balanced"],["統合監察體",472,"normal","attack"],["議會戰鬥機",473,"normal","balanced"],["議會護衛巨艦",474,"elite","tank"],["銀河議會議長",475,"boss","attack"]]},
  {chapter:"銀河統合戰爭",name:"銀河主航道",min:476,max:480,gear:["航道破流刃","銀河導航盔","航道主戰甲","超域推進靴","銀河航道樞紐"],enemies:[["航道巡弋兵",476,"normal","attack"],["超域攔截機",477,"normal","balanced"],["銀河護航體",478,"normal","tank"],["主航道重艦",479,"elite","tank"],["銀河航道監督官",480,"boss","balanced"]]},
  {chapter:"銀河統合戰爭",name:"星海聯盟首都圈",min:481,max:485,gear:["星海王權刃","聯盟首都盔","首都統御甲","星海躍遷靴","聯盟首都權印"],enemies:[["星海御衛兵",481,"normal","balanced"],["聯盟精銳機",482,"normal","attack"],["星海王權體",483,"normal","tank"],["首都戰爭巨艦",484,"elite","attack"],["星海聯盟議政長",485,"boss","tank"]]},
  {chapter:"銀河統合戰爭",name:"銀河霸權核心",min:486,max:490,gear:["銀河權柄刃","霸權核心盔","銀河權柄甲","主宰相位靴","銀河霸權權核"],enemies:[["銀河霸權兵",486,"normal","balanced"],["主宰權衛體",487,"normal","tank"],["銀河禁衛機",488,"normal","attack"],["霸權戰爭巨像",489,"elite","tank"],["銀河霸權之主",490,"boss","balanced"]]},
  {chapter:"銀河統合戰爭",name:"星海終極戰線",min:491,max:495,gear:["星海決勝刃","終戰統帥盔","星海主戰甲","星海折躍靴","星海戰爭權柄"],enemies:[["終戰星海兵",491,"normal","attack"],["星海滅界兵器",492,"normal","balanced"],["星海殲滅機",493,"normal","attack"],["終極戰爭巨像",494,"elite","tank"],["星海終戰司令",495,"boss","tank"]]},
  {chapter:"銀河統合戰爭",name:"銀河統合決戰區",min:496,max:500,gear:["銀河終戰刃","文明統御盔","文明終戰甲","銀河躍遷靴","銀河主控核心"],enemies:[["銀河聯軍星兵",496,"normal","balanced"],["銀河統合戰體",497,"normal","attack"],["星海文明終結體",498,"normal","balanced"],["銀河最高統帥",499,"elite","tank"],["銀河征服中樞",500,"boss","attack"]]}
 ];
 registerRegionMaps("galactic-unification",REGION_MAPS);
})();