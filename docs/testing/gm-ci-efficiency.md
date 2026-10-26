# GM Functional CI coverage and timing

Baseline: `f239249a27e0c0b0a1106a3bfa540ee85bb2e7a8` (latest main at start).
Implementation scope: test orchestration, browser tests, CI only. No shipped sources,
source registrations, historical seals or release configuration will change.

## Coverage plan recorded before editing tests

| Existing acceptance / assertions | Before | Planned after |
| --- | --- | --- |
| GM terminology contract | GM entry 1 | unchanged |
| Readonly player snapshot | GM entry 2 | unchanged |
| Early GM runtime restoration | GM entry 3 | unchanged |
| batch19-2 wrapper | GM entry 4, maximized then bridge | same order, both retained |
| GM 3D center navigation, retired controls, unauthenticated access, battle disposal, maximize/Escape/scroll restore | GM entry 5 | unchanged |
| Live bridge: parent header, Escape/settings, gallery cancellation, state and localStorage byte equality | separate browser in entry 4 | unchanged, clean environment retained |
| Three modes: player, monster, duel; six specified actions; fit union, actual alpha bounds, no timers/HUD/legacy buttons | all 3 viewports | full in portrait; all modes and six actions retained in other viewports |
| Speed options and live 2×/1.5×/1× changes without reload | all viewports/modes | full in portrait |
| Attack repeats, defeat resets/repeats, ordered six-action loop, duel auto sequence | all viewports/modes | full real-time cycles in portrait, condition wait on observed transitions |
| Stop holds sequence, restart resumes; pixels and screenshots | all viewports/modes | stop/draw/replay in every viewport/mode; full 1300ms hold in all primary modes and display duel |
| Galaxy/universe/higher × existing main/calamity/bounty/arena/void/alternate samples; normal/elite/boss/special; ratios 1/1.5/1.75/2; ship-04/beast-03/core-03 | all viewports, six actions, five pixel scans/action | all original unique identity/era/source combinations and six actions in portrait; other viewports use union of kind/ratio/shape representatives, attack plus one characteristic action and actual alpha scans over full 700ms owner duration (all six actions also checked in each mode) |
| Human-readable identity/caption, no raw asset paths | every sample | every executed sample |
| Alternate: 20 cultures, 5 stages, final culture/universe/stage, effects screenshot | all viewports | all viewports |
| Formal mirror | all viewports | all viewports |
| Selection loads zero, enter readiness, release refs/canvases/RAF, cached reentry | all viewports | all viewports, add monster-ref release check |
| Rotate and restore viewport; actual pixels within stage | all viewports | all viewports, wait for measured layout |
| Sustained playback, increasing sequence, constant loads/refs, final pixels | 60s portrait, 3s others | unchanged durations |
| Missing assets and recovery | all viewports | all viewports |
| Revoke GM auth, status + stopped RAF/canvases | all viewports | all viewports, wait for actual disposal |
| Page errors | all viewports + bridge + center | unchanged |
| Evidence report / PNG paths | `GM_PREVIEW_EVIDENCE` or `/tmp/gm-preview-evidence`, report.json and width-mode / width-alternate-effects PNGs | same paths and existing report fields; additive coverage/timing metadata |

All three viewport pages keep isolated contexts. One Chromium process is already
shared inside maximized acceptance; cross-test context sharing is unnecessary and
would weaken authorization/storage isolation. No parallel browser workloads are
planned, avoiding contention and changes to test ordering.

## Dependency and gate audit

- Functional CI invokes five entries in the order above. `batch19-2` synchronously
  executes maximized preview then live bridge and propagates failure.
- `gm-3d-test-center-browser.js` also runs via Runtime Integrity's suite manifest
  and the existing standalone GM workflow. Keep its CLI contract intact.
- Repository search found no consumer parsing maximized `report.json`; preserve
  `passed`, `reports`, `viewport`, `samples`, `realIPhone` and `passed` in each row.
- Artifact name `gm-preview-${run_attempt}`, evidence directory and screenshots
  stay intact. Add timings to existing report/Artifact and Actions summary.
- `gm-preview-approved.cjs` projects six exact registered production sources and
  checks a seventh new layout source; it chains Issue106 seals. No registrations
  or sealed files need changing for this test-only work.
- Existing Functional CI classification/gate remains authoritative; workflow edits
  select all domains. Do not weaken routing or mandatory gate logic.
- Branch protection API returned HTTP 403 for the integration. Required-check
  configuration cannot be independently inspected; inspect actual PR checks and
  report that limitation. Never merge or deploy in this task.

## Wait audit and design

- Replace 220ms action readiness with requested state and a subsequent actual
  canvas draw; replace 1400ms repeat delay with sequence transition.
- Replace 56 × 165ms polling with in-frame requestAnimationFrame observation of
  the complete ordered loop; keep real time, no clock acceleration.
- Keep finite-duration pixel observations (at least 700ms at 1×), stop hold
  (1300ms), and long run (60000ms/3000ms). These measure elapsed-time behavior.
- Replace 50ms auto readiness and 300/100ms rotation delays with draw/layout
  conditions; replace 2300ms after revoked status with resource disposal condition.
- Keep browser fixture and clean contexts; measure entry/loading, pixel checks,
  release, sampling, modes and sustained playback without introducing retries.

## Timing evidence

Reference Actions run 40255227510, GM job 121355623801: 522s (8m42s).
User's original per-viewport measurements: 206s / 146s / 148s, approximately
500s maximized test. Local baseline and optimized measurements will be recorded
separately because hardware, Chromium version and cache differ from Actions.

Registry audit found that explicit `visibleRatio` 1 and 1.5 have no matching rows;
the original conditional sampler silently skipped both. Preserve every original
row and require existing 1.75/2 ratio representatives explicitly. The four kinds
and three named assets are also mandatory in the cross-viewport matrix. Each
cross-viewport sample initially used attack/dodge/defeat (the measured follow-up below consolidates this), while each viewport still checks
all six actions in all three modes. This avoids repeating the full Cartesian
matrix outside the portrait functional run.

Exact duplicate tuples are consolidated in the primary matrix: 19 original rows
represent 17 unique identity/era/source combinations (`galaxy-map-001` and
`galaxy-calamity-01` each occurred twice). Every unique case and its assertions
remain. Primary six-action mode checks now validate every speed for each action,
including constant player AND monster load counts, beyond the old attack-only
speed switch assertion.

Historical Actions logs independently confirm portrait/landscape/desktop completion
at 01:43:06.113Z / 01:45:32.417Z / 01:48:00.068Z, with bridge and center
passing at 01:48:04.768Z and 01:48:07.652Z. Run/job URLs:
https://github.com/franksky1207/rpg/actions/runs/40255227510/job/121355623801

The original maximized script uses one browser already. Keep it; each `newPage`
creates a fresh context. Browser reuse across independently executable tests was
rejected because the existing separation protects storage/auth contracts and
its few seconds cannot explain the eight-minute bottleneck.

### Draw readiness and instrumentation

Requested-action readiness checks both animation state and a new draw on every
actor canvas. A test-local wrapper observes each canvas context's `clearRect`
call; it delegates unchanged to the original method, changes no prototype and
expires with that actor/context. Capture counters after selection's synchronous
stop/idle redraw, so that redraw cannot be mistaken for the requested animation.
No virtual clock, reduced playback duration, production diagnostic API or retry
is introduced. Resource release remains checked after every sample.

Timing output adds one `timings.json` beside the existing `report.json`; existing
PNG names and Artifact configuration remain intact. Per-viewport details extend
`report.json`. Cost categories for load/decode, alpha scanning and release are
inclusive subsets, not additive phase totals. Actions summary labels suite time,
job elapsed through acceptance (checkout/setup included), and the exclusions for
artifact upload/post-job cleanup; full job time comes from Actions job metadata.

Local original-script baseline passed all three viewports in **509.243s**
(8m29.243s), Chromium 154.0.8037.57 / Playwright 1.55.0. A short concurrent
mode smoke and static checks ran during this baseline, so use the historical
Actions timings for the primary CI comparison; do not treat local seconds as a
hardware-controlled benchmark.

During development the first condition-only repeat assertion exposed the exact
state/draw race this work must prevent: sequence had advanced after a death clip,
while its canvas still held the previous transparent endpoint. The test failed
rather than skipping pixels. Repeat readiness now waits for a subsequent actual
canvas draw before asserting painted pixels. No retry or assertion removal was
used. Final complete runs below supersede these intermediate failures.

The stronger per-frame visibility assertion explicitly accounts for intended
700ms death fade: both actors must paint during entry and the early/middle
samples; at the monster's death endpoint, the player must still paint and all
remaining alpha bounds must stay inside the stage. Requiring a visible monster
at alpha zero would incorrectly reject the unchanged renderer. The old clipping
assertions remain at that endpoint too.

Additional local checks passed: GM terminology, readonly snapshot, early restore,
GM exact-source seal, Issue106 seals, Batch20 protected runtime, Batch12 safety,
cleanup 4-4 / 2-4 guards, preview retirement, JavaScript structural integrity,
resource manifest, CI impact self-test, CI suite inventory tests, HTML cache
version guard and workflow YAML parsing. No source-lock approval was needed
because no registered production bytes changed.

## Completed local validation (first full passing run)

| Metric | Seconds |
| --- | ---: |
| Original maximized script | 509.243 |
| Optimized maximized phases | 280.640 |
| Optimized five-entry suite | 295.617 |

| Viewport | Total s | Mode/six-action s | Monster/action sampling s | Stability s | Load/decode s | Pixel s | Release s |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 390×844 / full | 194.657 | 43.905 | 85.430 | 60.017 | 5.876 | 5.501 | 1.561 |
| 844×390 / display | 42.161 | 9.755 | 24.456 | 3.026 | 3.577 | 1.512 | 0.939 |
| 1365×900 / display | 43.761 | 10.573 | 24.596 | 3.021 | 3.592 | 1.784 | 1.102 |

All five entry tests passed. Evidence comparison against the original report
confirmed the same 17 unique original cases in the full matrix, all mandatory
representative categories in each display matrix, actual 60s/3s stability holds,
12 identical PNG filenames and preserved report fields. Sampling operations
reduce from 342 monster/action combinations to 156, each with five real alpha
scans. Only exact duplicates and repetition across viewports are consolidated.

A second local complete run and this PR’s Actions results are recorded in the PR
acceptance report after the tested commit is pushed, avoiding another CI run for
a report-only commit. Full job duration uses Actions start/completion metadata.


## Follow-up based on measured Actions timings

The first PR CI run passed the GM job in **332s (5m32s)**, above the desired
3–5 minute range. The five entries took 315.485s; viewport totals were
204.261 / 50.675 / 51.842s. This identified additional duplicate display work,
not a reason to shorten real-time checks or weaken the complete matrix.

The display selector now chooses shape-specific cases first and reuses their
elite/boss classifications, producing **7** representatives instead of 9 with
identical kind/shape/explicit-ratio requirements. All 17 primary cases still run
all six actions. Each display case runs attack plus its characteristic secondary
action: wide ship dodge, beast defeat, core hit, normal return, special defeat,
1.75 calamity dodge, 2 calamity defeat. Idle is checked in each viewport/mode. An explicit
set assertion requires all six actions across the combined mode and sample matrix, in addition
to all six actions on every viewport/mode. The resulting monster/action matrix
has 102 + 14 + 14 = **130** combinations, each retaining five alpha scans.

All modes on every viewport still stop, draw and replay. The 1300ms stopped hold
remains in all primary modes and once per display viewport (duel); other display
modes require a new stopped draw and unchanged sequence. Thus each mode retains
its complete time-based hold in the full matrix and each display viewport
retains that hold, without repeating the full functional check for every mode.
All replay cycles and 60s/3s long-run observations remain unchanged.

The earlier 9-sample measurements describe the first revision only. Final tested
SHA, second-revision timings and all Actions results are in the PR report.

Final display representatives (each also runs attack):

| Identity | Coverage reused | Second sampled action |
| --- | --- | --- |
| galaxy-map-444 | ship-04, elite, wide ship | dodge |
| universe-boss-021 | beast-03, boss, large creature | defeat |
| galaxy-map-050 | core-03, boss, core effects | hit |
| galaxy-map-001 | normal | return |
| special-gold_slime | special, energy effects | defeat |
| galaxy-calamity-01 | explicit ratio 1.75, calamity | dodge |
| universe-calamity-10 | explicit ratio 2, calamity | defeat |

No individual primary case/action or its assertion is removed by this refinement.
The first complete Functional CI run and its final functional-ci-gate passed
alongside Fast Development Preflight. The final test-only refinement is routed
by the existing classifier; no routing rules, skips or required gates changed.

Final refinement local full run passed all five entries in **266.867s**. Maximized
phases took **253.373s**; viewport totals were **194.108 / 29.031 / 30.185s**.
Evidence comparison again confirmed the original 17 unique primary cases,
all 7 mandatory display representatives, recorded action sets, 130 total sampled
combinations, original 12 screenshot names and 60s/3s observations.
