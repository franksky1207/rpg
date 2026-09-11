(function(){
 if(typeof gmHtml!=="function")return;
 const baseGmHtml=gmHtml;
 gmHtml=function(){
  const html=baseGmHtml();
  const marker='<summary>副本管理</summary><div class="gm-hub-body">';
  const pos=html.indexOf(marker);
  if(pos<0)return html;
  const bodyStart=pos+marker.length;
  const bodyEnd=html.indexOf('</div></details>',bodyStart);
  if(bodyEnd<0)return html;
  const info=typeof getVoidMirageGmManageInfo==="function"?getVoidMirageGmManageInfo():{highestCleared:0,currentFloor:1};
  const current=Math.max(1,Math.floor(Number(info.currentFloor)||1));
  const highest=Math.max(0,Math.floor(Number(info.highestCleared)||0));
  const block=`
   <div class="item" style="margin-top:14px">
    <b>虛空幻境管理</b>
    <div class="muted" style="margin-top:6px">目前挑戰：第 ${current} 層　／　最高通過：第 ${highest} 層</div>
    <div class="controls" style="margin-top:10px;align-items:end">
     <button class="btn danger" onclick="gmResetVoidMirageFloor()">重置層數（回到第 1 層）</button>
    </div>
    <div class="controls" style="margin-top:10px;align-items:end">
     <label>移動到指定層數<br><input id="gmVoidMoveFloor" type="number" min="1" step="1" value="${current}" style="width:170px"></label>
     <button class="btn blue" onclick="gmMoveVoidMirageFloor()">移動層數</button>
     <span class="muted">不增加／扣除副本積分，可前後移動。</span>
    </div>
    <div class="controls" style="margin-top:10px;align-items:end">
     <label>從目前層數爬到<br><input id="gmVoidClimbFloor" type="number" min="${current}" step="1" value="${current}" style="width:170px"></label>
     <button class="btn gm-create" onclick="gmClimbVoidMirageToFloor()">推進並取得積分</button>
     <span class="muted">指定層數不可低於目前第 ${current} 層；會把目前層到指定層視為已通過並加入各層對應的 VIP 積分。</span>
    </div>
   </div>`;
  return html.slice(0,bodyEnd)+block+html.slice(bodyEnd);
 };
})();