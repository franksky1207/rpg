"""Verified two-stage art evidence. This validates attestations, not visual taste."""
import hashlib
import json
import re
from pathlib import Path

AUTHORITY = 'docs/BATCH28_EQUIPMENT_CONCEPT_TWO_STAGE_SOP_2026-10-15.md'
CRITERIA = ('officialIdentity', 'independentImages', 'threeViewConsistency',
            'fiveSlotOwnership', 'fullFaceCover', 'pairedShoes', 'weaponGrip',
            'accessoryDetachability', 'regionalDesign', 'imageQuality')
G030_ORIGINAL_PARTS = '0db944610b79e610aea57470d8f8f08341ffc1a6482648c16a09a29a7bdbf128'
IMAGES = ('overview-front-side-back.webp', 'equipment-five-slots.webp')

def digest(data): return hashlib.sha256(data).hexdigest()
def require(ok, message):
    if not ok: raise ValueError(message)
def local_file(directory, name):
    require(isinstance(name,str) and re.fullmatch(r'[a-zA-Z0-9_-]+\.md', name), 'review evidence must be local Markdown')
    file=directory/name
    require(file.is_file(), 'review evidence missing')
    return file

def verify(root, row, images, record):
    label=row['id']
    directory=root/row['directory']
    require(record.get('schema')==2 and record.get('reviewer')=='chatgpt-codex-autonomous', f'{label}: invalid autonomous review schema/reviewer')
    require(re.fullmatch(r'\d{4}-\d{2}-\d{2}',record.get('reviewedAt','')), f'{label}: review date missing')
    authority=root/AUTHORITY
    require(record.get('authorizationFile')==AUTHORITY and authority.is_file() and record.get('authorizationSha256')==digest(authority.read_bytes()), f'{label}: autonomous authorization changed/missing')
    formal=json.dumps({k:row[k] for k in ('id','sourceKey','regionOrBoss','equipmentNames')},ensure_ascii=False,indent=2)+'\n'
    require(record.get('formalSha256')==digest(formal.encode()), f'{label}: autonomous formal identity mismatch')
    require(record.get('imageSha256')=={i['file']:i['sha256'] for i in images}, f'{label}: autonomous image evidence stale')
    proof=local_file(directory,record.get('evidenceFile'))
    body=proof.read_text()
    require(record.get('evidenceSha256')==digest(proof.read_bytes()) and label in body and row['sourceKey'] in body and len(body)>300, f'{label}: autonomous evidence missing/hash mismatch')
    stages=record.get('stages',[])
    require(isinstance(stages,list) and len(stages)==2, f'{label}: two review stages required')
    source_name='docs/evidence/batch28-autonomous-review/generation-stage1-review.md'
    source=root/source_name
    if record.get('generationEvidenceFile'):
        require(record.get('generationEvidenceFile')==source_name and source.is_file() and record.get('generationEvidenceSha256')==digest(source.read_bytes()), f'{label}: initial review source evidence stale')
    all_pass=True
    for stage, reviewer in zip(stages,('ChatGPT','Codex')):
        require(stage.get('reviewer')==reviewer, f'{label}: stage reviewer/order mismatch')
        require(stage.get('imageSha256')==record['imageSha256'], f'{label}: stage image evidence stale')
        checks=stage.get('checks',{})
        require(set(checks)==set(CRITERIA), f'{label}: complete art criteria required')
        for criterion, check in checks.items():
            require(isinstance(check,dict) and check.get('result') in ('pass','fail','unverified'), f'{label}: invalid art check')
            observation=check.get('observation','')
            require(isinstance(observation,str) and len(observation.strip())>=20 and observation in body, f'{label}: image-specific observations required in evidence')
        passed=all(c['result']=='pass' for c in checks.values())
        require(stage.get('passed') is passed, f'{label}: stage pass contradicts checks')
        all_pass=all_pass and passed
    defects=record.get('outstandingDefects')
    require(isinstance(defects,list) and all(isinstance(d,str) and len(d.strip())>=10 and d in body for d in defects), f'{label}: defects must be explicit evidence')
    passed=all_pass and not defects and len(images)==2
    outcome=record.get('outcome')
    require(outcome in ('pass','needs-local-correction','needs-art-evidence','rejected'), f'{label}: invalid review outcome')
    require((outcome=='pass') is passed and record.get('conceptApproved') is passed, f'{label}: autonomous pass contradicts evidence')
    # Version-bound, known ownership defect cannot be laundered by a new attestation.
    if label=='g024' and passed:
        verify_g024_repair(root,row,record)
    if label=='g030' and passed:
        known_hash=G030_ORIGINAL_PARTS
        require(record['imageSha256'].get(IMAGES[1])!=known_hash, 'g030: missing armor-back visual evidence unresolved')
    return passed, (Path(row['directory'])/proof.name).as_posix(), outcome

def verify_g024_repair(root,row,record):
    directory=root/row['directory']
    original=directory/'history/2026-10-15/equipment-five-slots.webp'
    baseline='a4e2fa69aa573ad92f5a25702bbe0334fa76faf5440f1bfee4f2cb0266a56de3'
    current=directory/IMAGES[1]
    require(original.is_file() and digest(original.read_bytes())==baseline and digest(current.read_bytes())!=baseline, 'g024: unresolved original knee-disc defect')
    repair=record.get('localRepair',{})
    require(repair.get('originalSha256')==baseline and repair.get('imageSha256')==digest(current.read_bytes()), 'g024: repair proof stale')
    # Bounds are deliberately fixed to the two known upper boot knee assemblies.
    allowed=((995,395,1095,535),(1130,465,1200,580))
    boxes=repair.get('targetBoxes')
    require(boxes==[list(b) for b in allowed], 'g024: repair target exceeds authorized knee areas')
    try:
        from PIL import Image
    except ImportError as e:
        raise ValueError('g024: Pillow required for strict local repair validation') from e
    with Image.open(original) as a, Image.open(current) as b:
        a=a.convert('RGB');b=b.convert('RGB')
        require(a.size==b.size==(1491,1055), 'g024: repair dimensions changed')
        pixels_a=a.load();pixels_b=b.load();outside=0;inside=[0,0]
        for y in range(a.height):
            for x in range(a.width):
                if pixels_a[x,y]==pixels_b[x,y]: continue
                target=next((i for i,(l,t,r,d) in enumerate(allowed) if l<=x<r and t<=y<d),None)
                if target is None: outside+=1
                else: inside[target]+=1
        require(outside==0 and all(v>100 for v in inside), 'g024: non-target pixels changed or knee repair absent')
        require(repair.get('outsideChangedPixels')==outside and repair.get('insideChangedPixels')==inside, 'g024: measured repair evidence mismatch')
