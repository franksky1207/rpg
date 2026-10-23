# Functional GitHub Actions — Issue #86

The permanent CI is organized by functionality, not by development batch number. Batch-numbered test filenames are historical test identifiers and remain valid; no persistent batch-specific workflows should be added.

`.github/workflows/functional-ci.yml` runs on PRs, main pushes and explicit dispatch. A fast classifier routes changes to combat, monster, GM, equipment, background/save and resource checks. The stable `functional-ci-gate` is present even for documentation-only pull requests. Unknown paths and workflow edits fail open **toward more testing**.

The existing `runtime-integrity.yml`, `story-integrity.yml`, `asset-version-manifest.yml` and `publish-optimized-pages.yml` remain in place for now. The write-enabled vendoring/localization utilities also remain, pending a separate audit of their historical use. Release workflow de-duplication and final SLA verification belong to Issue #86's 86-3 acceptance, not a blind deployment rewrite.

## Historical contract caution
Tests `batch16-dungeon-contract.cjs`, `batch17-boss-contract.cjs`, `batch18-alternate-contract.cjs` and `batch19-absolute-sizing-contract.cjs` contain exact-byte comparisons with prior fixed Git commits. They are historical freeze evidence, not general-purpose functional guards and must not be run on unrelated future gameplay changes. Live identity/cache/asset and browser tests replace their ongoing CI purpose. Historical tests are **not deleted**.

## Impact routing checks
`node scripts/ci-impact.cjs --self-test`
`node scripts/ci-impact.cjs <base-sha> <head-sha>`

Protected-branch required-check settings are not readable by the current GitHub integration (403). Before modifying required checks in Settings, validate the new stable gate and retire any required contexts referring to removed workflows.
