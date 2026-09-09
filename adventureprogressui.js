(function(){
 if(document.getElementById("adventure-progress-ui-styles"))return;
 const style=document.createElement("style");
 style.id="adventure-progress-ui-styles";
 style.textContent=`
  .enemy-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;min-width:0}
  .enemy-card-title{min-width:0;display:flex;align-items:center;gap:5px;flex-wrap:wrap}
  .enemy-card-progress{flex:0 0 auto;min-width:58px;text-align:right;font-weight:850;font-size:16px;color:#d8c49a;line-height:1.25}
  .enemy-card-progress.in-progress{color:#f0d494}.enemy-card-progress.complete{color:#7fd18c}
  .enemy-card-progress.boss-ready{font-size:13px;color:#f0cb84;max-width:150px;white-space:normal}
  .enemy-card-note{margin-top:8px;padding-top:7px;border-top:1px solid #343942;color:#c9c4b9;font-size:12px;line-height:1.45;text-align:left}
  .enemy-card-note.boss-note{color:#e7d7ad;border-top-color:#5b4a31}
  .enemy-card-note.level-note{color:#9fb9d8;border-top-color:#334459}
  @media(max-width:760px){
   .enemy-card-top{gap:7px}.enemy-card-progress{font-size:14px;min-width:52px}.enemy-card-progress.boss-ready{font-size:12px;max-width:128px}
   .enemy-card-note{font-size:11px;line-height:1.35;margin-top:6px;padding-top:6px}
  }
 `;
 document.head.appendChild(style);
})();