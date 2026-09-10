(function(){
 // VIP16：Boss 勝利後 15% 額外再跑一次完整 Boss 掉落流程。
 const baseFightOnceForVipRewards=fightOnce;
 fightOnce=function(mapIdx,eIdx,encounter=null){
  const r=baseFightOnceForVipRewards(mapIdx,eIdx,encounter);
  if(!r?.ok||!r.win)return r;

  const existing=[];
  if(Array.isArray(r.items))existing.push(...r.items);
  else if(r.item)existing.push({item:r.item,sold:r.sold||0});

  r.vip16Triggered=false;
  if(r.e?.kind==="boss"&&(state.vipLevel||0)>=16&&Math.random()<.15){
   r.vip16Triggered=true;
   const extra=dropItem(r.e,mapIdx);
   if(extra){
    const ir=addItem(extra);
    const row={item:extra,sold:ir.sold||0,vip16Extra:true};
    existing.push(row);
    if(Array.isArray(r.logs))r.logs.push(`${row.sold?`自動出售 ${itemHtmlPlain(extra)}，金幣 +${row.sold}`:`獲得裝備 ${itemHtmlPlain(extra)}`}`);
   }
  }

  r.items=existing;
  if(existing.length){r.item=existing[0].item;r.sold=existing[0].sold||0;}
  save(false);
  return r;
 };
 window.fightOnce=fightOnce;

 // VIP20：死亡照常、EXP 懲罰照常；只阻止原本 30% 的裝備遺失。
 applyDeathPenalty=function(logs=[]){
  let loss=state.level>=MAX_LEVEL?0:ceil(expNeed(state.level)*.10),actual=Math.min(state.exp,loss);
  state.exp=Math.max(0,state.exp-loss);
  let dropped=null,protectedByVip20=false;
  const worn=EQUIPMENT_TYPES.map(slot=>[slot,state.equipment[slot]]).filter(([,it])=>!!it);
  const lossRoll=worn.length&&Math.random()<.30;

  if(lossRoll){
   if((state.vipLevel||0)>=20){
    protectedByVip20=true;
   }else{
    const [slot,it]=worn[Math.floor(Math.random()*worn.length)];
    state.equipment[slot]=null;
    dropped=it;
    state.lostGear.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2),item:it,cost:ceil(it.buy*2),lostAt:Date.now()});
   }
  }

  state.hp=playerCombatStats().hp;
  logs.push(`死亡懲罰：EXP -${actual}${loss>actual?`（目前 EXP 已扣至 0）`:""}。`);
  if(dropped)logs.push(`裝備遺失：${itemHtmlPlain(dropped)}。可前往商店贖回。`);
  else logs.push(`本次沒有遺失裝備。`);
  return {expLost:actual,dropped,protectedByVip20};
 };
 window.applyDeathPenalty=applyDeathPenalty;
})();
