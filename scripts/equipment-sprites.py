#!/usr/bin/env python3
"""Read-only verification of existing trial sprites against formal game equipment.
The abandoned 210-set concept-art planning/import workflow is not supported.
"""
import argparse,importlib.util,json
from pathlib import Path
import equipment_sprite_assets as assets

ROOT=Path(__file__).resolve().parents[1]

def rows(root):
    spec=importlib.util.spec_from_file_location('formal_equipment_identities',root/'scripts/formal-equipment-identities.py')
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.validate_formal(root)

def validate(root):
    formal=rows(root)
    registry=assets.load(root/assets.REGISTRY)
    known={r['id']:r for r in formal}
    assets.require(registry.get('schema')=='cw.equipment.sprite.v1' and registry.get('publish') is False,'sprite registry must remain development only')
    assets.require({e['id'] for e in registry['entries']} <= set(known),'unknown sprite formal ID')
    result=[];hashes=[]
    for entry in registry['entries']:
        checked=assets.verified_entry(root,known[entry['id']],True)
        result.append({'id':entry['id'],'status':checked['status'],'gm':'not-tested','release':False})
        if checked.get('asset'):hashes.append(checked['asset']['sha256'])
    assets.require(len(set(hashes))==len(hashes),'different sets cannot reuse the same sprite image')
    return {'schema':'cw.equipment.sprite.validation.v1','entries':result,'complete':sum(e['status']=='complete' for e in result),'publish':False}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=('validate',))
    args=parser.parse_args()
    try:
        print(json.dumps(validate(ROOT),ensure_ascii=False,indent=2))
    except (ValueError,OSError,KeyError,TypeError) as error:
        parser.exit(1,f'Sprite verification blocked: {error}\n')
if __name__=='__main__':main()
