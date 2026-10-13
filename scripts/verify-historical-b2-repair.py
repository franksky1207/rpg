"""Validate CURRENT wearables first, then the unchanged historical B2 assertions.

No current-asset check is replaced: the original equipment contract (including
450KB/tier, identities, skin/bind and opaque materials), all 19 Khronos checks,
and exact current/archive/baseline source chains are mandatory. The old B2 cost
table describes pre-refinement bytes, so its original validator also executes
unchanged in a temporary, read-only view of those exact historical cost files.
"""
import pathlib,json,tempfile,subprocess,sys,hashlib,re
ROOT=pathlib.Path(__file__).resolve().parents[1]
HERE=ROOT/'development/hybrid-comparison/t2b2-v1'
for test in ['tests/runtime/3d-equipment-contract.cjs','tests/runtime/3d-glb-validation.cjs']:
    subprocess.run(['node',test],cwd=ROOT,check=True)
costs=json.loads((HERE/'repair-r1/resource-cost-comparison.json').read_text())
files={f['path']:f for tiers in costs['tiers'].values() for cost in tiers.values() for f in cost['files']}
with tempfile.TemporaryDirectory(prefix='b28-historical-costs-') as folder:
    temp=pathlib.Path(folder)
    for name,row in files.items():
        path=pathlib.PurePosixPath(name)
        assert not path.is_absolute() and '..' not in path.parts
        source=ROOT/name
        if name.startswith('assets/3d/equipment/ancient-ruins-v1/'):
            assert re.fullmatch(r'(weapon|helmet|armor|shoes|accessory)-(low|medium|high)\.glb',path.name)
            subprocess.run(['node','-e',"require('./development/hybrid-comparison/t2b3-v1/source-version.cjs')(process.argv[1],process.argv[2])",name,row['sha256']],cwd=ROOT,check=True)
            source=ROOT/'development/3d-source/equipment/ancient-ruins-v1/history'/path.name
        assert hashlib.sha256(source.read_bytes()).hexdigest()==row['sha256']
        assert source.stat().st_size==row['bytes']
        target=temp/name;target.parent.mkdir(parents=True,exist_ok=True);target.symlink_to(source)
    subprocess.run([sys.executable,str(HERE/'tools/verify_repair.py')],cwd=temp,check=True)
print('PASS current wearables/Khronos/source chains AND unchanged historical B2 repair assertions/costs')
