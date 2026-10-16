"use strict";
const { chromium } = require("playwright"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [],
    missing = [];
  page.on("pageerror", (e) => {
    errors.push(String(e));
    console.error("Audio page error:", String(e));
  });
  page.on("response", (r) => {
    if (
      new URL(r.url()).origin ===
        new URL(
          process.env.RUNTIME_SMOKE_URL || "http://127.0.0.1:4173/index.html",
        ).origin &&
      r.status() >= 400
    )
      missing.push(r.url());
  });
  // Disposable browser storage; no real authentication or remote save writes.
  await context.route("**/*.supabase.co/**", (route) =>
    route.fulfill({
      status: 403,
      body: "Isolated audio acceptance: cloud access blocked",
    }),
  );
  await page.addInitScript(() => {
    window.__audioTrace = [];
    window.__audioElements = new Set();
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      window.__audioElements.add(this);
      window.__audioTrace.push({
        event: "play",
        id: this.dataset.trackId || "",
        src: this.currentSrc || this.src,
      });
      if (!this.__traced) {
        this.__traced = true;
        this.addEventListener("playing", () => {
          this.__nativePlaying = true;
          window.__audioTrace.push({
            event: "playing",
            id: this.dataset.trackId || "",
            src: this.currentSrc,
            snapshot: this.dataset.trackId ? {
              track: CivilizationAudio.currentMusicId(),
              formal: CivilizationAudio.runtimeStats().formalMusicVoices,
              voices: [...window.__audioElements].filter(a=>a.dataset.trackId&&!a.paused).map(a=>a.dataset.trackId),
              paused: this.paused,
              readyState: this.readyState,
            } : null,
          });
        });
      }
      return play.call(this);
    };
  });
  const results = [];
  function record(result) {
    results.push(result);
    console.log("PASS audio:", result.case);
  }
  async function playingSince(id,start) {
    const proof=await page.waitForFunction(({id,start})=>window.__audioTrace.slice(start).find(e=>e.event==='playing'&&e.id===id&&e.snapshot),{id,start},{timeout:15000});
    const snapshot=(await proof.jsonValue()).snapshot;
    await proof.dispose();
    assert.equal(snapshot.track,id);
    assert.equal(snapshot.formal,1);
    assert.deepEqual(snapshot.voices,[id]);
    assert.equal(snapshot.paused,false);
    assert.ok(snapshot.readyState>=2);
  }
  async function playing(id) {
    await page
      .waitForFunction(
        (id) =>
          [...window.__audioElements].some(
            (a) =>
              a.dataset.trackId === id &&
              !a.paused &&
              a.readyState >= 2 &&
              a.__nativePlaying,
          ),
        id,
        { timeout: 15000 },
      )
      .catch(async (e) => {
        console.error(
          await page.evaluate(() => ({
            scene: CivilizationAudioScenes.current(),
            stats: CivilizationAudio.runtimeStats(),
            trace: window.__audioTrace.slice(-12),
            text: document.getElementById("main")?.textContent.slice(0, 450),
          })),
        );
        throw e;
      });
    const snapshot = await page.evaluate(() => ({
      track: CivilizationAudio.currentMusicId(),
      scene: CivilizationAudioScenes.current(),
      formal: CivilizationAudio.runtimeStats().formalMusicVoices,
      voices: [...window.__audioElements]
        .filter((a) => a.dataset.trackId && !a.paused)
        .map((a) => a.dataset.trackId),
    }));
    assert.equal(snapshot.track, id);
    assert.equal(snapshot.formal, 1);
    assert.equal(snapshot.voices.length, 1, JSON.stringify(snapshot));
    assert.equal(snapshot.voices[0], id);
    return snapshot;
  }
  try {
    await page.goto(
      process.env.RUNTIME_SMOKE_URL || "http://127.0.0.1:4173/index.html",
      { waitUntil: "domcontentloaded" },
    );
    await page.waitForFunction(
      () =>
        !!window.CivilizationAudioScenes &&
        typeof runBattles === "function" &&
        !!window.FIRST_WORLD_TARGET_CONTEXT_BATCH4_WRAPPER_RETIREMENT_VERSION,
      null,
      { timeout: 45000 },
    );
    await page.waitForFunction(
      () => CivilizationStartupCoordinator.snapshot().status === "ready",
      null,
      { timeout: 45000 },
    );
    // Localhost auto-diagnostics probe/clear presentation; complete them before gameplay.
    await page.evaluate(() =>
      window.ensureCivilizationScriptGroup("integrity"),
    );
    if(process.env.FORMAL_SPRITE_ACCEPTANCE==='1')await page.evaluate(()=>{
      const original=newState,armor=s=>{const item=s.equipment.armor;item.name=CivilizationFormalPlayerSprites.sets.find(r=>r.id==='g007').equipmentNames.armor;item.world=1;return s;};
      newState=()=>armor(original());armor(state);CivilizationFormalBEntry.boot();window.__formalSpriteEvidence={};
      window.__formalSpriteTimer=setInterval(()=>{const c=document.querySelector('.formal-b-whole-suit');if(!c)return;const session=CivilizationCombatEvents.snapshot(),key=session.mode+':'+session.world,pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>16)n++;if(n>500)__formalSpriteEvidence[key]={suit:c.dataset.suit,pixels:n,clip:c.dataset.clip};},10);
    });
    if(process.env.COMBAT_EVENT_ACCEPTANCE==="1")await page.evaluate(()=>{
      const bridge=window.CivilizationCombatEvents;if(bridge?.version!==1)throw Error("T1-C Bridge missing");
      window.__combatEventEvidence={modes:{},types:{},invalid:0,settlements:[],maxQueue:0,queueCapacity:0};
      window.__combatEventDispose=[];
      window.__combatEventDispose.push(bridge.subscribe(event=>{
       const proof=window.__combatEventEvidence;
       if(!bridge.validateEvent(event))proof.invalid++;
       const key=event.mode+":"+event.world+":"+(event.data?.context?.variant||"");proof.modes[key]=(proof.modes[key]||0)+1;
       proof.types[event.type]=(proof.types[event.type]||0)+1;
       if(event.type==="settlement")proof.settlements.push(event.eventId);
       proof.maxQueue=Math.max(proof.maxQueue,bridge.diagnostics().queued);proof.queueCapacity=Math.max(proof.queueCapacity,bridge.limits.queue*bridge.diagnostics().subscribers);
      }));
      window.__combatEventDispose.push(bridge.subscribe(()=>{throw Error("injected renderer throw");}));
      window.__combatEventDispose.push(bridge.subscribe(()=>Promise.reject(Error("injected renderer rejection"))));
      window.__combatEventDispose.push(bridge.subscribe(()=>new Promise(()=>{})));
    });
    await page.evaluate(() => {
      document.getElementById("civilizationAuthGate")?.remove();
      document.getElementById("gameIntroModal")?.classList.remove("show");
      document.body.classList.remove("auth-gate-open", "background-preloading");
      CivilizationAudio.setLevel("enabled", true);
      CivilizationAudio.setLevel("musicEnabled", true);
    });
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await playing("era-galaxy-theme");
    // Actual production entry, target owner, combat core, reward owner and pipeline.
    // Hold only presentation so the native media decoder has time to emit playing.
    await page.evaluate(() => {
      window.__originalAnimateFight = animateFight;
      window.mainBattlePresentationSleep = () => Promise.resolve();
      animateFight = async function (...args) {
        const id = CivilizationAudioScenes.current().music;
        await new Promise((resolve, reject) => {
          const deadline = performance.now() + 15000;
          function check() {
            const el = [...window.__audioElements].find(
              (a) =>
                a.dataset.trackId === id &&
                !a.paused &&
                a.readyState >= 2 &&
                a.__nativePlaying,
            );
            if (el) return resolve();
            if (performance.now() > deadline)
              return reject(Error("actual battle music never played"));
            setTimeout(check, 10);
          }
          check();
        });
        await window.__originalAnimateFight(...args);
      };
    });
    for (const enemy of [0, 3, 4, 0, 4]) {
      const initialTraceIndex = await page.evaluate(
        () => window.__audioTrace.length,
      );
      await page.evaluate((enemy) => {
        closeBattleResultModal();
        state.unlockedMap = 1;
        state.mapProgress[0] = [10, 10, 10, 10];
        state.bossProgress[0] = 10;
        state.bossLocked[0] = false;
        state.level = 10;
        selectedMap = 0;
        selectedEnemy = enemy;
        selectedBattleCount = 1;
        view = "adventure";
        adventureScreen = "prepare";
        window.clearPreparedFirstWorldTargetContext?.();
        window.prepareFirstWorldTargetContextFromSelection({
          source: "audio-acceptance",
        });
        render();
        startBattles();
      }, enemy);
      await page.waitForFunction(
        () =>
          !battleBusy &&
          CivilizationAudioScenes.current()?.combatLocked === false,
        null,
        { timeout: 45000 },
      );
      await playing("era-galaxy-theme");
      const trace = await page.evaluate(() => window.__audioTrace);
      assert.ok(
        trace
          .slice(initialTraceIndex)
          .some(
            (x) =>
              x.event === "playing" &&
              x.id === `battle-${enemy === 4 ? "medium" : "normal"}-preview`,
          ),
        JSON.stringify({
          enemy,
          trace,
          state: await page.evaluate(() => ({
            busy: battleBusy,
            screen: adventureScreen,
            target: window.getPreparedFirstWorldTargetContext?.(),
            phase: currentWorldPhase(state),
          })),
        }),
      );
      record({
        case: `actual galaxy ${enemy === 4 ? "Boss" : enemy === 3 ? "elite" : "ordinary"}`,
        passed: true,
      });
    }
    // Actual continuous owner: two real rounds, one music source, explicit stop.
    const continuousBefore = await page.evaluate(
      () =>
        window.__audioTrace.filter(
          (x) => x.event === "play" && x.id === "battle-normal-preview",
        ).length,
    );
    await page.evaluate(() => {
      closeBattleResultModal();
      window.__continuousFailure = null;
      const owner = runBattles;
      runBattles = async (...args) => {
        try {
          return await owner(...args);
        } catch (error) {
          window.__continuousFailure = String(error.stack || error);
          throw error;
        }
      };
      state = newState();
      state.unlockedMap = 1;
      state.mapProgress[0] = [10, 10, 10, 10];
      window.__rounds = 0;
      const previous = animateFight;
      animateFight = async (...args) => {
        await previous(...args);
        if (++window.__rounds === 2) requestContinuousBattleStop();
      };
      state.level = 50;
      state.vipLevel = 20;
      selectedEnemy = 0;
      selectedBattleCount = CONTINUOUS_BATTLE_COUNT;
      window.clearPreparedFirstWorldTargetContext?.();
      window.prepareFirstWorldTargetContextFromSelection();
      startBattles();
    });
    await page
      .waitForFunction(() => !battleBusy && window.__rounds === 2, null, {
        timeout: 60000,
      })
      .catch(async (e) => {
        console.error(
          "Continuous owner diagnostics",
          await page.evaluate(() => ({
            rounds: window.__rounds,
            failure: window.__continuousFailure,
            busy: battleBusy,
            ctx: window.activeMainBattleContext,
            scene: CivilizationAudioScenes.current(),
            level: state.level,
            phase: currentWorldPhase(state),
            story: state.storyProgress,
            trace: window.__audioTrace.slice(-10),
          })),
        );
        throw e;
      });
    await playing("era-galaxy-theme");
    assert.equal(
      await page.evaluate(
        () =>
          window.__audioTrace.filter(
            (x) => x.event === "play" && x.id === "battle-normal-preview",
          ).length,
      ),
      continuousBefore + 1,
    );
    record({
      case: "actual galaxy continuous two rounds/manual stop",
      passed: true,
    });
    // Use the actual structured renderer and combat owners; accelerate visual waits only.
    await page.evaluate(() => {
      window.__structured = window.animateStructuredCombatPresentation;
      window.animateStructuredCombatPresentation = async (
        combat,
        options = {},
      ) => {
        const id = CivilizationAudioScenes.current()?.music;
        await new Promise((resolve, reject) => {
          const deadline = performance.now() + 15000;
          function check() {
            if (
              [...window.__audioElements].some(
                (a) =>
                  a.dataset.trackId === id && !a.paused && a.__nativePlaying,
              )
            )
              return resolve();
            if (performance.now() > deadline)
              return reject(Error("formal mode music never played: " + id));
            setTimeout(check, 10);
          }
          check();
        });
        await new Promise((r) => setTimeout(r, 100));
        return window.__structured(combat, {
          ...options,
          sleep: () => Promise.resolve(),
        });
      };
    });
    await page.evaluate(async () => {
      closeBattleResultModal();
      state = newState();
      state.level = 600;
      state.secondWorld.entered = true;
      state.secondWorld.civilizationLevel = 1;
      view = "adventure";
      window.setAdventureEraView("universe");
      render();
      window.__universeResult = await window.startSecondWorldBossBattle(0);
    });
    assert.equal(await page.evaluate(() => window.__universeResult), true);
    await playing("era-universe-theme");
    record({ case: "actual universe Boss single", passed: true });
    await page.evaluate(() => {
      state = newState();
      state.level = 1000;
      state.secondWorld.entered = true;
      state.secondWorld.civilizationLevel = 10;
      state.thirdWorld = createBlankThirdWorldState();
      state.thirdWorld.entered = true;
      state.thirdWorld.entryVersion = 2;
      state.thirdWorld.story.unlockedStage = 2;
      view = "adventure";
      window.setAdventureEraView("higher");
      render();
      window.__higherStart = window.startThirdWorldContinuousRun(0);
    });
    assert.equal(await page.evaluate(() => window.__higherStart.ok), true);
    await playing("battle-high-preview");
    await page.evaluate(() => {
      window.__higherBattle = window.runThirdWorldContinuousBattle({
        logs: false,
      });
      window.stopThirdWorldContinuousRun("manual");
    });
    await playing("era-higher-theme");
    record({
      case: "actual higher run/start/battle/manual stop",
      passed: true,
    });
    // A fresh first-life fixture returns through the same genuine galaxy owner.
    await page.evaluate(() => {
      state = newState();
      state.level = 50;
      state.unlockedMap = 1;
      state.mapProgress[0] = [10, 10, 10, 10];
      view = "home";
      CivilizationAudioScenes.notify("reincarnation");
      render();
    });
    await playing("era-galaxy-theme");
    for (const mode of ["bounty", "arena"]) {
      await page.evaluate((mode) => {
        closeBattleResultModal();
        if (mode === "bounty") {
          enterBountyDungeon();
          startBountyFight(false);
        } else {
          openArenaDungeon();
          startArenaDungeon("normal");
          startArenaStageFight(false);
        }
      }, mode);
      await page.waitForFunction(
        (mode) =>
          !battleBusy &&
          (mode === "bounty"
            ? getBountyTestSnapshot().phase
            : getArenaCoreState().phase) === "result",
        mode,
        { timeout: 60000 },
      );
      await playing("era-galaxy-theme");
      record({ case: "actual galaxy " + mode + " single", passed: true });
    }
    // Other genuine official owners, with disposable player fixtures and real cores.
    await page.evaluate(() => {
      window.combatOuterGapMs = () => 1;
      window.__mirrorPresenter =
        window.animateMirrorStructuredCombatPresentation;
      window.animateMirrorStructuredCombatPresentation = (r, o = {}) =>
        window.__mirrorPresenter(r, o); // Keep real owner pacing so sprite/HP evidence can be observed.
      view = "dungeon-mirror";
      render();
      window.__mirrorStarted = startMirrorCombatRun();
    });
    assert.equal(await page.evaluate(() => window.__mirrorStarted), true);
    await playing("battle-medium-preview");
    await page.waitForFunction(
      () => !battleBusy && view === "dungeon-mirror-result",
      null,
      { timeout: 90000 },
    );
    await playing("era-galaxy-theme");
    record({ case: "actual galaxy mirror 15 rounds/settlement", passed: true });
    await page.evaluate(() => {
      window.enterVoidMirageDungeon();
      window.startVoidMirageChallengeUI();
    });
    await playing("battle-medium-preview");
    await page.evaluate(() => window.requestVoidMirageExit());
    await page.waitForFunction(
      () => CivilizationAudioScenes.current()?.combatLocked === false,
      null,
      { timeout: 60000 },
    );
    await playing("era-galaxy-theme");
    record({ case: "actual galaxy void/manual exit", passed: true });
    const galaxyCalamityTraceStart = await page.evaluate(() => window.__audioTrace.length);
    await page.evaluate(() => {
      const def = window.getCivilizationCalamityDefinitions()[0];
      state.bossKilled[def.mapIndex] = true;
      state.level = def.unlockLevel;
      window.startCivilizationCalamityUI(def.id, "single");
    });
    await playingSince("battle-high-preview",galaxyCalamityTraceStart);
    await page.waitForFunction(
      () => CivilizationAudioScenes.current()?.combatLocked === false,
      null,
      { timeout: 60000 },
    );
    await playing("era-galaxy-theme");
    record({ case: "actual galaxy calamity/single", passed: true });
    const universeCalamityTraceStart = await page.evaluate(() => window.__audioTrace.length);
    await page.evaluate(() => {
      state = newState();
      state.level = 600;
      state.secondWorld.entered = true;
      state.secondWorld.civilizationLevel = 1;
      const d = window.getSecondWorldCalamityDefinitions()[0];
      state.secondWorld.mainline.bossKilled[d.bossIndex] = true;
      view = "calamity";
      window.startSecondWorldCalamityUI(d.id, "single");
    });
    // A one-hit calamity can settle before the next browser IPC call. Bind the
    // native playing event and its exact voice snapshot to this invocation.
    await playingSince("battle-high-preview",universeCalamityTraceStart);
    await page.waitForFunction(
      () => CivilizationAudioScenes.current()?.combatLocked === false,
      null,
      { timeout: 60000 },
    );
    await playing("era-universe-theme");
    record({ case: "actual universe calamity/single", passed: true });
    await page.evaluate(() => {
      state = newState();
      state.level = 1000;
      state.secondWorld.entered = true;
      state.thirdWorld = createBlankThirdWorldState();
      state.thirdWorld.entered = true;
      state.thirdWorld.entryVersion = 2;
      state.thirdWorld.story.unlockedStage = 2;
      view = "dungeon-arena";
      window.__higherArenaStarted = startThirdWorldArenaUi("fixed", 1);
    });
    assert.equal(await page.evaluate(() => window.__higherArenaStarted), true);
    await playing("battle-high-preview");
    await page.waitForFunction(
      () => CivilizationAudioScenes.current()?.combatLocked === false,
      null,
      { timeout: 60000 },
    );
    await playing("era-higher-theme");
    record({ case: "actual higher arena/single", passed: true });
    await page.evaluate(async () => {
      state.reincarnation.alternateUniverse.unlocked = true;
      state.thirdWorld.bosses.forEach((b) => (b.currentHp = 0));
      view = "alternateuniverse";
      window.__alternateResult = await challengeAlternateUniverseFormal();
    });
    assert.equal(await page.evaluate(() => window.__alternateResult), true);
    await playing("era-higher-theme");
    record({ case: "actual alternate universe/formal", passed: true });
    // Galaxy historical review retains its scene era, then navigation restores higher.
    await page.evaluate(async () => {
      view = "adventure";
      window.setAdventureEraView("galaxy-review");
      window.openGalaxyReviewMap(0);
      window.__reviewResult = await startGalaxyReviewBattle();
    });
    assert.equal(await page.evaluate(() => window.__reviewResult), true);
    await playing("era-galaxy-theme");
    await page.evaluate(() => {
      closeBattleResultModal();
      go("home");
    });
    await playing("era-higher-theme");
    record({
      case: "actual higher player galaxy review/return scene",
      passed: true,
    });
    // Historical universe/higher reviews use their actual combat source and scene.
    const beforeHigherReview = await page.evaluate(() => JSON.stringify(state));
    await page.evaluate(async () => {
      view = "adventure";
      window.setAdventureEraView("higher-dimensional");
      window.__higherReview = await startThirdWorldBossReviewFromPlayerUi(0);
    });
    assert.equal(await page.evaluate(() => window.__higherReview), true);
    await playing("era-higher-theme");
    assert.equal(
      await page.evaluate(() => JSON.stringify(state)),
      beforeHigherReview,
    );
    await page.evaluate(() => closeThirdWorldReviewResultModal());
    record({ case: "actual higher review/read-only", passed: true });
    await page.evaluate(() => {
      state.secondWorld.mainline.bossKilled[0] = true;
      view = "adventure";
      window.setAdventureEraView("universe-review");
    });
    const beforeUniverseReview = await page.evaluate(() =>
      JSON.stringify(state),
    );
    await page.evaluate(async () => {
      window.__universeReview = await startSecondWorldBossReview(0);
    });
    assert.equal(await page.evaluate(() => window.__universeReview), true);
    await playing("era-universe-theme");
    assert.equal(
      await page.evaluate(() => JSON.stringify(state)),
      beforeUniverseReview,
    );
    await page.evaluate(() => {
      closeBattleResultModal();
      go("home");
    });
    await playing("era-higher-theme");
    record({
      case: "actual higher player universe review/read-only return scene",
      passed: true,
    });
    await page.evaluate(async () => {
      view = "calamity";
      setCivilizationCalamityEraView("galaxy-review");
      window.__galaxyCalamityReview = await startGalaxyCalamityReview(
        getCivilizationCalamityDefinitions()[0].id,
      );
    });
    assert.equal(
      await page.evaluate(() => window.__galaxyCalamityReview),
      true,
    );
    await playing("era-galaxy-theme");
    record({
      case: "actual higher player galaxy calamity review/return scene",
      passed: true,
    });
    await page.evaluate(async () => {
      setCivilizationCalamityEraView("universe");
      window.__universeCalamityReview = await startUniverseCalamityReview(
        getSecondWorldCalamityDefinitions()[0].id,
      );
    });
    assert.equal(
      await page.evaluate(() => window.__universeCalamityReview),
      true,
    );
    await playing("era-universe-theme");
    await page.evaluate(() => go("home"));
    await playing("era-higher-theme");
    record({
      case: "actual higher player universe calamity review/return scene",
      passed: true,
    });
    // Universe uses the same mode owners with actual world-2 stat/reward dependencies.
    await page.evaluate(() => {
      state = newState();
      state.level = 600;
      state.vipLevel = 20;
      state.secondWorld.entered = true;
      state.secondWorld.civilizationLevel = 1;
      state.secondWorld.mainline.bossKilled[0] = true;
      view = "home";
      render();
    });
    for (const mode of ["bounty", "arena"]) {
      await page.evaluate((mode) => {
        closeBattleResultModal();
        if (mode === "bounty") {
          enterBountyDungeon();
          startBountyFight(false);
        } else {
          openArenaDungeon();
          startArenaDungeon("normal");
          startArenaStageFight(false);
        }
      }, mode);
      await page.waitForFunction(
        (mode) =>
          !battleBusy &&
          (mode === "bounty"
            ? getBountyTestSnapshot().phase
            : getArenaCoreState().phase) === "result",
        mode,
        { timeout: 60000 },
      );
      await playing("era-universe-theme");
      record({ case: "actual universe " + mode + " single", passed: true });
    }
    await page.evaluate(() => {
      view = "dungeon-mirror";
      render();
      window.__universeMirrorStarted = startMirrorCombatRun();
    });
    assert.equal(
      await page.evaluate(() => window.__universeMirrorStarted),
      true,
    );
    await playing("battle-medium-preview");
    await page.waitForFunction(
      () => !battleBusy && view === "dungeon-mirror-result",
      null,
      { timeout: 90000 },
    );
    await playing("era-universe-theme");
    record({
      case: "actual universe mirror 15 rounds/settlement",
      passed: true,
    });
    await page.evaluate(() => {
      enterVoidMirageDungeon();
      startVoidMirageChallengeUI();
    });
    await playing("battle-medium-preview");
    await page.evaluate(() => requestVoidMirageExit());
    await page.waitForFunction(
      () => CivilizationAudioScenes.current()?.combatLocked === false,
      null,
      { timeout: 60000 },
    );
    await playing("era-universe-theme");
    record({ case: "actual universe void/manual exit", passed: true });
    await page.evaluate(() => {
      state = newState();
      view = "home";
      CivilizationAudioScenes.syncView("home");
      render();
    });
    await playing("era-galaxy-theme");
    // Native audio matrix tests exercise the controller/core contract, not mode gameplay.
    for (const [era, mode, tier] of [
      ["galaxy", "normal", "normal"],
      ["galaxy", "elite", "normal"],
      ["galaxy", "boss", "medium"],
      ["universe", "boss", "medium"],
      ["higher", "higher-stage", "high"],
      ["galaxy", "bounty", "normal"],
      ["universe", "bounty", "normal"],
      ["galaxy", "arena", "medium"],
      ["universe", "arena", "medium"],
      ["higher", "arena-fixed", "high"],
      ["galaxy", "mirror", "medium"],
      ["universe", "mirror", "medium"],
      ["galaxy", "void", "medium"],
      ["universe", "void", "medium"],
      ["galaxy", "calamity", "high"],
      ["universe", "calamity", "high"],
      ["higher", "alternateBattle", "high"],
    ]) {
      const token = await page.evaluate(
        ({ era, mode }) => CivilizationAudioScenes.startRun({ era, mode }),
        { era, mode },
      );
      await playing(`battle-${tier}-preview`);
      await page.evaluate(
        (token) => CivilizationAudioScenes.endRun(token),
        token,
      );
      await playing("era-galaxy-theme");
      record({ case: `native controller ${era}/${mode}`, passed: true });
    }
    const token = await page.evaluate(() =>
      CivilizationAudioScenes.startRun({ era: "galaxy", mode: "normal" }),
    );
    await playing("battle-normal-preview");
    await page.evaluate(() =>
      CivilizationAudio.setLevel("musicEnabled", false),
    );
    assert.equal(
      await page.evaluate(
        () => CivilizationAudio.runtimeStats().formalMusicVoices,
      ),
      0,
    );
    await page.evaluate(() => CivilizationAudio.setLevel("musicEnabled", true));
    await playing("battle-normal-preview");
    await page.evaluate(
      (token) => CivilizationAudioScenes.endRun(token),
      token,
    );
    await playing("era-galaxy-theme");
    record({ case: "music toggle preserves run", passed: true }); // Real core handles preview/muting without changing the formal run token.
    const settingsToken = await page.evaluate(() =>
      CivilizationAudioScenes.startRun({ era: "galaxy", mode: "normal" }),
    );
    await playing("battle-normal-preview");
    await page.evaluate(() => {
      state.gm = true;
      CivilizationAudio.preview("era-higher-theme");
    });
    await page.waitForFunction(() =>
      [...window.__audioElements].some(
        (a) =>
          a.dataset.trackId === "era-higher-theme" &&
          !a.paused &&
          a.__nativePlaying,
      ),
    );
    assert.equal(
      await page.evaluate(
        () =>
          [...window.__audioElements].filter(
            (a) => a.dataset.trackId && !a.paused,
          ).length,
      ),
      1,
    );
    assert.equal(
      await page.evaluate(() => CivilizationAudioScenes.current().activeRunId),
      settingsToken,
    );
    await page.evaluate(() => {
      CivilizationAudio.stopPreview();
      CivilizationAudioScenes.restore();
      state.gm = false;
    });
    await playing("battle-normal-preview");
    record({ case: "native GM preview isolation/restoration", passed: true });
    // Visibility events are simulated, media playback/retirement remain native.
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    assert.equal(
      await page.evaluate(
        () => CivilizationAudio.runtimeStats().formalMusicVoices,
      ),
      0,
    );
    assert.equal(
      await page.evaluate(() => CivilizationAudioScenes.current().activeRunId),
      settingsToken,
    );
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: false,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await playing("battle-normal-preview");
    await page.evaluate(
      (token) => CivilizationAudioScenes.endRun(token),
      settingsToken,
    );
    await playing("era-galaxy-theme");
    record({ case: "simulated visibility/native stop-resume", passed: true });
    // A thrown presenter and absent result DOM cannot retain the music lock.
    await page.evaluate(async () => {
      state.level = 50;
      state.vipLevel = 20;
      selectedMap = 0;
      selectedEnemy = 0;
      window.clearPreparedFirstWorldTargetContext?.();
      const target = window.prepareFirstWorldTargetContextFromSelection();
      const presenter = animateFight;
      animateFight = async () => {
        throw Error("expected-audio-presentation-failure");
      };
      try {
        await runBattles(1, null, target);
      } catch (e) {
        window.__expectedAudioError = e.message;
      } finally {
        animateFight = presenter;
      }
    });
    assert.equal(
      await page.evaluate(() => window.__expectedAudioError),
      "expected-audio-presentation-failure",
    );
    await playing("era-galaxy-theme");
    record({
      case: "actual main presentation exception/cleanup",
      passed: true,
    });
    await page.evaluate(() => {
      window.__resultModal = document.getElementById("battleResultModal");
      window.__resultModal?.remove();
      selectedBattleCount = 1;
      window.clearPreparedFirstWorldTargetContext?.();
      window.prepareFirstWorldTargetContextFromSelection();
      startBattles();
    });
    await page.waitForFunction(
      () =>
        !battleBusy && CivilizationAudioScenes.current()?.lifecycle === "IDLE",
      null,
      { timeout: 45000 },
    );
    await playing("era-galaxy-theme");
    await page.evaluate(() => {
      if (window.__resultModal) document.body.appendChild(window.__resultModal);
    });
    record({ case: "actual main missing result modal/cleanup", passed: true });
    // Reload into a newly saved disposable character; first battle uses the genuine entry.
    let combatProofBeforeReload=null;
    if(process.env.COMBAT_EVENT_ACCEPTANCE==="1")combatProofBeforeReload=await page.evaluate(()=>window.__combatEventEvidence);
    if(process.env.FORMAL_SPRITE_ACCEPTANCE==='1'){
      const proof=await page.evaluate(()=>{clearInterval(__formalSpriteTimer);return __formalSpriteEvidence;});
      fs.writeFileSync('/tmp/equipment-formal-modes.json',JSON.stringify(proof,null,2));
      for(const mode of ['main:1','main:2','review:1','review:2','void:1','void:2','mirror:1','mirror:2','bounty:1','bounty:2','arena:1','arena:2','arena:3','calamity:1','calamity:2','alternate:3'])assert.ok(proof[mode],'actual sprite missing in '+mode);
    }
    const traceBeforeReload = await page.evaluate(() => window.__audioTrace);
    const reincarnation = await page.evaluate(() => {
      state = newState();
      state.level = 2000;
      state.secondWorld.entered = true;
      state.thirdWorld = createBlankThirdWorldState();
      state.thirdWorld.entered = true;
      state.thirdWorld.entryVersion = 2;
      state.thirdWorld.coreLevel = 10;
      state.thirdWorld.bosses.forEach((b) => (b.currentHp = 0));
      view = "home";
      return executeFormalReincarnation({ reload: false });
    });
    assert.equal(reincarnation.ok, true, JSON.stringify(reincarnation));
    assert.equal(reincarnation.saved, true);
    record({
      case: "actual higher-to-galaxy reincarnation/local backup transaction",
      passed: true,
    });
    if(combatProofBeforeReload)await page.addInitScript(proof=>{window.__savedCombatEventEvidence=proof;},combatProofBeforeReload);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () =>
        !!window.CivilizationAudioScenes &&
        CivilizationStartupCoordinator.snapshot().status === "ready",
      null,
      { timeout: 45000 },
    );
    // Localhost auto-diagnostics probe/clear presentation; complete them before gameplay.
    await page.evaluate(() =>
      window.ensureCivilizationScriptGroup("integrity"),
    );
    if(process.env.COMBAT_EVENT_ACCEPTANCE==="1")await page.evaluate(()=>{
      const bridge=window.CivilizationCombatEvents;if(bridge?.version!==1)throw Error("T1-C Bridge missing");
      window.__combatEventEvidence={modes:{},types:{},invalid:0,settlements:[],maxQueue:0,queueCapacity:0};
      window.__combatEventDispose=[];
      window.__combatEventDispose.push(bridge.subscribe(event=>{
       const proof=window.__combatEventEvidence;
       if(!bridge.validateEvent(event))proof.invalid++;
       const key=event.mode+":"+event.world+":"+(event.data?.context?.variant||"");proof.modes[key]=(proof.modes[key]||0)+1;
       proof.types[event.type]=(proof.types[event.type]||0)+1;
       if(event.type==="settlement")proof.settlements.push(event.eventId);
       proof.maxQueue=Math.max(proof.maxQueue,bridge.diagnostics().queued);proof.queueCapacity=Math.max(proof.queueCapacity,bridge.limits.queue*bridge.diagnostics().subscribers);
      }));
      window.__combatEventDispose.push(bridge.subscribe(()=>{throw Error("injected renderer throw");}));
      window.__combatEventDispose.push(bridge.subscribe(()=>Promise.reject(Error("injected renderer rejection"))));
      window.__combatEventDispose.push(bridge.subscribe(()=>new Promise(()=>{})));
    });
    await page.evaluate(() => {
      document.getElementById("civilizationAuthGate")?.remove();
      document.getElementById("gameIntroModal")?.classList.remove("show");
      document.body.classList.remove("auth-gate-open");
    });
    await page.locator("body").click({ position: { x: 5, y: 5 } });
    await playing("era-galaxy-theme");
    await page.evaluate(() => {
      view = "adventure";
      selectedMap = 0;
      selectedEnemy = 0;
      selectedBattleCount = 1;
      window.clearPreparedFirstWorldTargetContext?.();
      window.prepareFirstWorldTargetContextFromSelection();
      render();
      startBattles();
    });
    await page.waitForFunction(
      () =>
        !battleBusy && CivilizationAudioScenes.current()?.lifecycle === "IDLE",
      null,
      { timeout: 60000 },
    );
    await playing("era-galaxy-theme");
    assert.ok(
      await page.evaluate(() =>
        window.__audioTrace.some(
          (x) => x.event === "playing" && x.id === "battle-normal-preview",
        ),
      ),
    );
    record({
      case: "actual reload first galaxy battle/native gesture unlock",
      passed: true,
    });
    await page.evaluate(() => {
      closeBattleResultModal();
      state.level = 10;
      state.mapProgress[0] = [10, 10, 10, 10];
      state.bossProgress[0] = 10;
      state.bossLocked[0] = false;
      selectedEnemy = 4;
      window.clearPreparedFirstWorldTargetContext?.();
      window.prepareFirstWorldTargetContextFromSelection();
      startBattles();
    });
    await page.waitForFunction(
      () =>
        !battleBusy && CivilizationAudioScenes.current()?.lifecycle === "IDLE",
      null,
      { timeout: 60000 },
    );
    await playing("era-galaxy-theme");
    assert.ok(
      await page.evaluate(() =>
        window.__audioTrace.some(
          (x) => x.event === "playing" && x.id === "battle-medium-preview",
        ),
      ),
    );
    record({ case: "actual post-reincarnation galaxy Boss", passed: true });
    assert.deepEqual(errors, []);
    assert.deepEqual(missing, []);
    if(process.env.COMBAT_EVENT_ACCEPTANCE==="1"){
     // The old page's collection is saved before the real reload below; no delta replay.
     const proof=await page.evaluate(()=>window.__savedCombatEventEvidence||window.__combatEventEvidence);
     assert.ok(proof,"Combat proof missing");assert.equal(proof.invalid,0);
     for(const mode of ["main","bounty","arena","mirror","void","calamity","alternate","review"])assert.ok(Object.keys(proof.modes).some(key=>key.startsWith(mode+":")),"Missing actual owner mode "+mode);
     assert.equal(new Set(proof.settlements).size,proof.settlements.length,"Settlement event delivered twice");
     assert.ok(proof.queueCapacity<=32*5,"Only the four test consumers plus one shipped B consumer");assert.ok(proof.maxQueue<=proof.queueCapacity,"Every consumer retains the original 32-event queue bound");
     fs.writeFileSync("combat-events-browser-report.json",JSON.stringify({passed:true,actualAudioCases:results.length,proof},null,2)+"\n");
     console.log("PASS T1-C actual mode observations / hostile consumers / native audio",proof);
    }
    const trace = traceBeforeReload.concat(
      await page.evaluate(() => window.__audioTrace),
    );
    fs.writeFileSync(
      "audio-lifecycle-browser-report.json",
      JSON.stringify(
        {
          commit: process.env.GITHUB_SHA || null,
          url: page.url(),
          results,
          trace,
          errors,
          missing,
          sdk:
            process.env.RPG_OFFLINE_SDK === "1"
              ? "official SDK verified via system TLS (local fixture)"
              : "official CDN via browser TLS",
          account: "disposable local storage; Supabase cloud endpoints blocked",
        },
        null,
        2,
      ),
    );
    console.log(
      `Audio native browser PASS: ${results.length} cases; real galaxy entries; playing events; one voice; no cloud access`,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e.stack || e);
  process.exit(1);
});
