(function(){
 const VERSION=1;
 const MODE_IDS=new Set(["map","special","bounty","arena","void","mirror","calamity"]);
 const openModes=new Set();
 function toggle(id,open){const key=String(id||"");if(!MODE_IDS.has(key))return false;if(open)openModes.add(key);else openModes.delete(key);return true;}
 function decorate(html){
  return String(html||"").replace(/<details class="gm-ability-test-sub gmpb-mode-sub" data-gmpb-mode="([^"]+)"\s*>/g,(all,id)=>{
   const key=String(id||"");
   if(!MODE_IDS.has(key))return all;
   return `<details class="gm-ability-test-sub gmpb-mode-sub" data-gmpb-mode="${key}" ${openModes.has(key)?"open ":""}ontoggle="gmPowerBenchmarkModeToggle('${key}',this.open)">`;
  });
 }
 function install(){
  const base=window.gmPowerBenchmarkHtml;
  if(typeof base!=="function"||base.__modeStateOwner===VERSION)return false;
  const wrapped=function(){return decorate(base())};
  wrapped.__modeStateOwner=VERSION;
  window.gmPowerBenchmarkHtml=wrapped;
  if(typeof window.replaceGmHubSectionRenderer==="function")window.replaceGmHubSectionRenderer("test","power-benchmark-test",wrapped,"戰力基準測試");
  return true;
 }
 window.gmPowerBenchmarkModeToggle=toggle;
 window.gmPowerBenchmarkModeIsOpen=id=>openModes.has(String(id||""));
 window.gmPowerBenchmarkOpenModes=()=>Array.from(openModes);
 window.GM_POWER_BENCHMARK_MODE_STATE_VERSION=VERSION;
 install();
})();
