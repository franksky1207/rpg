# Battle animation centering and stop control correction

Use functional data-combat-action=stop-continuous on existing stop buttons. Bounty, arena and mainline stop controls are authored before the animation, retaining handlers and original style. Calamity remains above battle. Do not move controls at runtime. Center only a ready stage, reserve space while hidden, do not auto-scroll during load or manual scrolling. Three-era and mobile Safari real-device verification pending.

## PR #48 continuation — engineering acceptance in progress

Baseline main: `39620ae6599096b3648688508bd80d567fe58e6e`; inherited PR head: `276408d1dacb1437c2dfdd87566786c049014e3b`. This is the same PR and branch, with no new combat system.

Reproduced all seven failing PR checks. Batch12/GM terminology rejected authorized UI relocation against the old byte baseline; Batch5/7 rejected the new viewport cache URL against the historical exact HTML; Formal/GM/Batch6 still assumed zero startup Sprite requests. These were not all stale tests: two calamity start buttons were wrongly tagged as stops, both real calamity stops and galaxy main/void exit were missing functional tags, async retirement removed reserved geometry, old entry reset still scrolled during loading, old RAF callbacks could center retired stages, repeated stages could steal focus, and unrelated DOM changes aborted/cleared warmup.

The historical protection now checks exact reviewed edits against immutable main before returning the original bytes to the old guards. `pr48-stop-contract.cjs` separately proves all nine original stop button attributes/labels/events and all other UI/gameplay bytes remain unchanged (apart from the explicit animated mobile entry-scroll guard). No original test/assertion was deleted. Startup tests now require exactly the two current-appearance SHA-addressed images, 2 MiB decoded, zero live leases/canvases/GPU engines; disabled animation still requires zero requests.

Warmup uses the real `release` export, current-world owner and reincarnation appearance resolver, shared pool and HTTP/SW caching. It loads fallback and attack atlas sequentially at idle, aborts on hidden/clear/logout, recovers from failures, and does not instantiate actors, canvases, clocks or GPU engines. The existing six-image cache and art assets are preserved.

Validation evidence and final SHA/Actions/Pages results will be appended only after actual completion. Physical iPhone Safari portrait/landscape visual center and toolbar transitions, temperature, battery drain and sustained frame smoothness remain real-device acceptance items. Chromium/WebKit automation is not a physical iPhone test.
