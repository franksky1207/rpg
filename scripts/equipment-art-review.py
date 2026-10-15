"""Verify historical two-stage and new Codex-only concept evidence."""
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

def verify_legacy(root, row, images, record):
    label=row['id']
    directory=root/row['directory']
    require(record.get('schema')==2 and record.get('reviewer')=='chatgpt-codex-autonomous', f'{label}: invalid autonomous review schema/reviewer')
    require(re.fullmatch(r'\d{4}-\d{2}-\d{2}',record.get('reviewedAt','')), f'{label}: review date missing')
    authority=root/AUTHORITY
    archive=root/'docs/evidence/equipment-policy/sop-v2-2026-10-15.md'
    historical='f7e281bb156f65ccc14e2544fb5bf853dc106446d1422ab4a92c00fce584a123'
    authority_valid=(authority.is_file() and record.get('authorizationSha256')==digest(authority.read_bytes())) or (record.get('authorizationSha256')==historical and archive.is_file() and digest(archive.read_bytes())==historical)
    require(record.get('authorizationFile')==AUTHORITY and authority_valid, f'{label}: autonomous authorization changed/missing')
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

# Stable machine policy is deliberately separate from editorial SOP prose.
POLICY = 'equipment-2.5d-v3.0'
POLICY_FILE = 'scripts/equipment-review-policy-v3.json'
POLICY_SHA = '61f2d5f50718931672f22bfad29101dd234dde5c6ca2725b7dfd2bcd11fea6bb'
LEGACY_AUTHORITY = 'docs/evidence/equipment-policy/sop-v2-2026-10-15.md'
BLOCKERS = ('officialIdentity','imageIntegrity','contentIdentity','characterReadability','provenanceLicense')
IDENTITY_FIELDS = ('id','epoch','sourceKey','directory','regionOrBoss','equipmentNames')
EXCEPTIONS = {
    'g024': ('accepted-g024-knee-boot', 'kneeBootBoundary', 'a4e2fa69aa573ad92f5a25702bbe0334fa76faf5440f1bfee4f2cb0266a56de3'),
    'g030': ('accepted-g030-back-mount', 'backMountDetail', G030_ORIGINAL_PARTS),
}
ACCEPTANCE = 'docs/evidence/equipment-phase2/user-acceptance.json'

def canonical(value):
    return json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()

def fingerprint(record):
    return digest(canonical({k:v for k,v in record.items() if k!='evidenceFingerprint'}))

def bound_source(root, source):
    require(isinstance(source,dict), 'review source required')
    path=source.get('path','')
    require(isinstance(path,str) and not Path(path).is_absolute() and '..' not in Path(path).parts
            and path.startswith(('docs/','development/')) and not (root/path).is_symlink(), 'invalid review source path')
    file=root/path
    require(file.is_file() and source.get('sha256')==digest(file.read_bytes()), 'review source missing/hash mismatch')
    return file.read_text(encoding='utf-8')

def verify_v3(root,row,images,record):
    # Schema 3 is immutable historical dual review; schema 4 uses one Codex stage.
    # Both retain the original signed blocker policy and SHA-bound evidence.
    label=row['id'];directory=root/row['directory']
    require(record.get('schema') in (3,4) and record.get('policyVersion')==POLICY, f'{label}: unsupported review policy/schema')
    policy=root/POLICY_FILE
    require(policy.is_file() and digest(policy.read_bytes())==POLICY_SHA and record.get('policySha256')==POLICY_SHA, f'{label}: review policy changed/missing')
    require(record.get('formalIdentity')=={k:row[k] for k in IDENTITY_FIELDS}, f'{label}: formal identity mismatch')
    actual={i['file']:i['sha256'] for i in images}
    require(len(images)==2 and set(actual)==set(IMAGES) and len(set(actual.values()))==2 and record.get('imageSha256')==actual, f'{label}: image evidence stale/missing')
    require(all((directory/name).is_file() and digest((directory/name).read_bytes())==h for name,h in actual.items()), f'{label}: image bytes SHA changed/missing')
    require(re.fullmatch(r'\d{4}-\d{2}-\d{2}',record.get('reviewedAt','')), f'{label}: review date required')
    require(record.get('evidenceFingerprint')==fingerprint(record), f'{label}: evidence fingerprint mismatch')
    proof=local_file(directory,record.get('evidenceFile'));body=proof.read_text(encoding='utf-8')
    require(record.get('evidenceSha256')==digest(proof.read_bytes()) and label in body and row['sourceKey'] in body and all(h in body for h in actual.values()), f'{label}: review evidence missing/hash mismatch')
    for name in ('blockers','advisories','explicitlyAcceptedExceptions'):
        require(isinstance(record.get(name),list), f'{label}: {name} required')
    stages=record.get('stages')
    codex_only=record['schema']==4
    reviewers=('Codex',) if codex_only else ('ChatGPT','Codex')
    require(isinstance(stages,list) and len(stages)==len(reviewers), f'{label}: '+('single Codex review stage required' if codex_only else 'two review stages required'))
    failed=set()
    for stage,reviewer in zip(stages,reviewers):
        require(stage.get('reviewer')==reviewer and re.fullmatch(r'\d{4}-\d{2}-\d{2}',stage.get('reviewedAt','')), f'{label}: stage reviewer/order/date mismatch')
        require(stage.get('imageSha256')==actual, f'{label}: stage image evidence stale')
        source_body=bound_source(root,stage.get('source'))
        if reviewer=='ChatGPT':
            historical=stage.get('historicalSource')
            historical_body=bound_source(root,historical)
            require(historical in record.get('sources',[]) and (label in historical_body or historical.get('path','').startswith(row['directory']+'/')) and all(h in historical_body for h in actual.values()), f'{label}: historical initial review does not bind current images')
        require(label in source_body and all(h in source_body for h in actual.values()), f'{label}: stage source does not bind images')
        checks=stage.get('checks',{})
        require(set(checks)==set(BLOCKERS), f'{label}: complete blocker criteria required')
        for key,check in checks.items():
            require(isinstance(check,dict) and check.get('result') in ('pass','fail','unverified'), f'{label}: invalid blocker check')
            observation=check.get('observation','')
            require(isinstance(observation,str) and len(observation.strip())>=20 and observation in body and observation in source_body, f'{label}: sourced observations required')
            if check['result']!='pass': failed.add(key)
        passed=all(c['result']=='pass' for c in checks.values())
        require(stage.get('passed') is passed, f'{label}: stage pass contradicts checks')
    recorded=set()
    for blocker in record['blockers']:
        require(isinstance(blocker,dict) and blocker.get('criterion') in BLOCKERS and blocker.get('observation') in body, f'{label}: invalid blocker evidence')
        recorded.add(blocker['criterion'])
    require(recorded==failed, f'{label}: blockers contradict checks')
    for advisory in record['advisories']:
        require(isinstance(advisory,dict) and advisory.get('code') in json.loads(policy.read_text())['advisories']
                and len(advisory.get('observation',''))>=20 and advisory['observation'] in body, f'{label}: invalid advisory evidence')
    expected=EXCEPTIONS.get(label)
    if record['explicitlyAcceptedExceptions']:
        require(expected is not None and len(record['explicitlyAcceptedExceptions'])==1, f'{label}: accepted exception belongs to another set')
        item=record['explicitlyAcceptedExceptions'][0]
        require(digest((root/ACCEPTANCE).read_bytes())=='06c16708fc533c4dc925029da5297ac844d826adb8f8e0df52edbc51a7810dc9', 'accepted exception authorization changed')
        authority=json.loads((root/ACCEPTANCE).read_text())
        entry=authority['sets'].get(label)
        require(item==entry and item['exceptionId']==expected[0] and item['advisoryCode']==expected[1]
                and item['formalIdentity']==record['formalIdentity'] and item['imageSha256']==actual
                and actual[IMAGES[1]]==expected[2] and item['scope']=='concept-review-only'
                and item['acceptedBy']=='user' and item['source']=='user-explicit-instruction-2026-10-15', f'{label}: accepted exception identity/image/scope mismatch')
        require(any(a['code']==expected[1] for a in record['advisories']), f'{label}: accepted exception advisory missing')
        # The current review must fingerprint the acceptance text, not an editable SOP.
        require(any(s.get('path')==ACCEPTANCE for s in record.get('sources',[])), f'{label}: accepted exception source missing')
    elif expected and actual[IMAGES[1]]==expected[2]:
        require(False, f'{label}: original image requires explicit accepted exception')
    require(bool(record.get('sources')), f'{label}: review sources required')
    for source in record['sources']: bound_source(root,source)
    provenance=record.get('provenance',{})
    require(provenance.get('basis') in ('project-generated','user-supplied-generation-declaration') and provenance.get('use')=='development-concept-only', f'{label}: invalid provenance/license basis')
    bound_source(root,provenance.get('source'))
    approved=not failed
    outcome='blocked' if not approved else 'pass-with-advisory' if record['advisories'] else 'pass'
    require(record.get('conceptApproved') is approved and record.get('outcome')==outcome, f'{label}: approval contradicts verified evidence')
    return approved,(Path(row['directory'])/proof.name).as_posix(),outcome

def verify(root,row,images,record):
    if record.get('schema') in (3,4): return verify_v3(root,row,images,record)
    return verify_legacy(root,row,images,record)
