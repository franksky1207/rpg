/* Dual-mode preflight 3: presentation policy only. No save, auth or persisted preference. */
(function(global){
"use strict";
const MODE_IDS=Object.freeze(["text","3d"]);
const currentMode=()=>"text"; // Until B17, the existing complete text game stays authoritative.
const isFull3DAvailable=()=>false; // B40 must explicitly approve full release.
const canPreview3D=()=>true; // Existing B01-B15 opt-in previews remain available.
const shouldWarm3DAtStartup=()=>false; // Pure text startup must not eagerly fetch 3D assets.
global.CivilizationPresentationMode=Object.freeze({
 version:1,modeIds:MODE_IDS,currentMode,isFull3DAvailable,canPreview3D,shouldWarm3DAtStartup
});
})(window);
