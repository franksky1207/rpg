"use strict";
// Run original actual gameplay/audio acceptance with hostile read-only consumers.
process.env.COMBAT_EVENT_ACCEPTANCE="1";
require("./audio-lifecycle-browser.js");
