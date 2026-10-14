#!/usr/bin/env python3
"""Read-only verified concept gate for development 2.5D asset production (legacy modeling alias); never releases assets."""
import argparse
import contextlib
import importlib.util
import io
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('concepts',ROOT/'scripts/equipment-concepts.py')
catalog=importlib.util.module_from_spec(spec);spec.loader.exec_module(catalog)

def eligible(root, identity):
    with contextlib.redirect_stdout(io.StringIO()): rows=catalog.run(root)
    row=next((r for r in rows if r['id']==identity.lower()),None)
    if row is None: raise ValueError('Unknown formal equipment ID')
    if not row['conceptApproved'] or not row['assetProductionEligible']: raise ValueError(f"{row['id']}: verified art review required before 2.5D asset production")
    return {k:row[k] for k in ('id','sourceKey','directory','equipmentNames','conceptStatus','approvalEvidence','modelStatus','assetProductionEligible','asset2_5dStatus','gm2_5dTestStatus','formalReleaseAllowed')}

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--set',required=True)
    args=parser.parse_args()
    try: print(json.dumps(eligible(ROOT,args.set),ensure_ascii=False,indent=2))
    except (ValueError,OSError,KeyError) as e: parser.exit(1,f'Modeling blocked: {e}\n')
if __name__=='__main__':main()
