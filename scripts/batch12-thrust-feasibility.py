#!/usr/bin/env python3
"""Kinematic candidate trial; no art edits, approval or production metadata writes.
Uses explicitly approximate source landmarks from the existing inspection tool.
"""
import importlib.util,json,math,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('review',root/'scripts/batch7-review-layers.py')
review=importlib.util.module_from_spec(spec);spec.loader.exec_module(review)
rows=[]
for era,p in review.LANDMARKS.items():
 dx=p['masterTip'][0]-p['masterGrip'][0];dy=p['masterTip'][1]-p['masterGrip'][1]
 angle=math.degrees(math.atan2(dy,dx))
 # Anchor the handle exactly to the candidate fist first. Even with a generous
 # 10 degree wrist adjustment the blade remains directed down across the legs.
 rows.append(dict(era=era,sourceLandmarksApproximate=True,
  gripAnchoredTrial=dict(handleSeparationPx=0,bladeDownAngleDegrees=round(angle,2),remainingDownAngleAfter10DegreeWrist=round(angle-10,2)),
  translationTrial=dict(weaponExtensionAt512Px=40,handSeparationAt180Px=round(40*180/512,2),armPoseMoves=False),
  verdict='needs-coordinated-arm-poses; translation detaches grip, wrist-only points down',
  minimumArt=['transparent matched windup body pose with closed gripping hand','transparent matched extended-thrust body pose with closed gripping hand'],
  reusable='existing independent weapon; supply matching grip anchors for both poses'))
manifest=json.loads((root/'development/combat-animation/batch7/layer-sources/manifest.json').read_text())
checks=[]
for f in manifest['files']:
 raw=(root/'development/combat-animation/batch7/layer-sources'/f['name']).read_bytes()
 assert hashlib.sha256(raw).hexdigest()==f['sha256'];assert len(raw)==f['bytes']
 checks.append(dict(path=f['name'],sha256=f['sha256'],bytes=len(raw)))
result=dict(schema='cw.batch12.thrust-feasibility.v1',baseline='9748c72cd17b2c3dd0e8aaf749a4fcd821a1f23a',
 productionThrustAccepted=False,trial='analytical anchored-handle / small-wrist / translation trials; no new artwork generated',
 limitations='Approximate manual landmarks, not runtime collision measurements or visual animation approval.',entries=rows,sourceChecks=checks)
print(json.dumps(result,ensure_ascii=False,indent=2))
