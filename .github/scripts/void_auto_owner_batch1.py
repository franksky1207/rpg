from pathlib import Path

p=Path('dungeonvoidui.js')
text=p.read_text(encoding='utf-8')
old='''     await animateFloor(fr);\n     if(!fr.ended&&voidUi.exitAfterFloor&&typeof window.requestVoidMirageExit==="function")window.requestVoidMirageExit();\n     if(!fr.ended)await sleep(350);'''
new='''     await animateFloor(fr);\n     if(!fr.ended)await sleep(350);'''
if old not in text: raise SystemExit('void callback deferred-exit anchor not found')
text=text.replace(old,new,1)
old=''' window.requestVoidMirageExitUI=function(){\n  if(voidUi.phase==="result")return;voidUi.exitAfterFloor=true;\n  const btn=document.querySelector(".void-exit-btn");if(btn){btn.disabled=true;btn.textContent="本層結束後將退出";}\n  const msg=document.getElementById("voidCombatMessage");if(msg)msg.textContent="已要求退出：本層結束後離開虛空幻境。";\n };'''
new=''' window.requestVoidMirageExitUI=function(){\n  if(voidUi.phase==="result")return;\n  voidUi.exitAfterFloor=true;\n  if(typeof window.requestVoidMirageExit==="function")window.requestVoidMirageExit();\n  const btn=document.querySelector(".void-exit-btn");if(btn){btn.disabled=true;btn.textContent="本層結束後將退出";}\n  const msg=document.getElementById("voidCombatMessage");if(msg)msg.textContent="已要求退出：本層結束後離開虛空幻境。";\n };'''
if old not in text: raise SystemExit('void exit UI anchor not found')
text=text.replace(old,new,1)
p.write_text(text,encoding='utf-8')

p=Path('index.html')
text=p.read_text(encoding='utf-8')
old='dungeonvoidui.js?v=20260917-auto-owner1'
new='dungeonvoidui.js?v=20260917-auto-owner1b'
if old not in text: raise SystemExit('index cache anchor not found')
text=text.replace(old,new,1)
p.write_text(text,encoding='utf-8')
