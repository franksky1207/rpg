/* Pure formal identity selection. Armor owns presentation; other slots own their stats. */
(function(global){
'use strict';
const worlds={galaxy:1,universe:2,higher:3};
function select(snapshot,sets){
 if(snapshot?.source!=='formal'||snapshot.version!==2||!Array.isArray(sets))return null;
 const armor=snapshot.equipment?.armor;
 if(armor?.present!==true||!Number.isInteger(armor.world)||!armor.name)return null;
 const rows=sets.filter(row=>worlds[row.epoch]===armor.world&&row.equipmentNames?.armor===armor.name);
 return rows.length===1?rows[0]:null;
}
global.CivilizationArmorSelection=Object.freeze({version:1,select,canCommit:false});
})(globalThis);
