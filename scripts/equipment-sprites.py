#!/usr/bin/env python3
"""Validate, import and deterministically export development whole-suit characters."""
import argparse,contextlib,importlib.util,io,json,shutil,sys
from pathlib import Path
from PIL import Image
import equipment_sprite_assets as assets
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('concepts',ROOT/'scripts/equipment-concepts.py');catalog=importlib.util.module_from_spec(spec);spec.loader.exec_module(catalog)
def rows(root):
    with contextlib.redirect_stdout(io.StringIO()):return catalog.run(root)
def validate(root):
    formal=rows(root);registry=assets.load(root/assets.REGISTRY);known={r['id'] for r in formal}
    assets.require(all(e['id'] in known for e in registry['entries']),'unknown sprite formal ID')
    result=[];hashes=[]
    for row in formal:
        entry=assets.verified_entry(root,row,row['assetProductionEligible'])
        if entry:
            result.append({'id':row['id'],'status':entry['status'],'gm':'not-tested','release':False})
            if entry.get('asset'):hashes.append(entry['asset']['sha256'])
    assets.require(len(set(hashes))==len(hashes),'different sets cannot reuse the same sprite image')
    return {'schema':'cw.equipment.sprite.validation.v1','entries':result,'complete':sum(e['status']=='complete' for e in result),'publish':False}
def import_image(root,identity,source_file,prompt):
    assets.require(len(prompt.strip())>=80,'actual generation prompt required')
    formal=next((r for r in rows(root) if r['id']==identity),None)
    assets.require(formal is not None and formal['assetProductionEligible'],'verified formal production eligibility required')
    registry=assets.load(root/assets.REGISTRY);entry=next((e for e in registry['entries'] if e['id']==identity),None)
    assets.require(entry is not None and entry['status']=='not-started','explicit planned entry and new version required; never overwrite')
    original=root/assets.BASE/'sources'/identity/'generated.png';target=root/assets.BASE/'characters'/identity/'v1'/'character.webp'
    assets.require(not original.exists() and not target.exists(),'sprite version already exists')
    # Technical export of an already generated SINGLE character, never concept-board extraction.
    with Image.open(source_file) as image:
        image.load();rgba=image.convert('RGBA');alpha=rgba.getchannel('A');box=alpha.getbbox()
        assets.require(image.format=='PNG' and box is not None and alpha.getextrema()[0]==0 and alpha.getextrema()[1]>=250,'generated source must be true transparent PNG')
        l,t,r,b=box;scale=min(400/(r-l),400/(b-t));size=(max(1,round(image.width*scale)),max(1,round(image.height*scale)))
        resized=rgba.resize(size,Image.Resampling.LANCZOS);box=resized.getchannel('A').getbbox();canvas=Image.new('RGBA',(512,512))
        x=round(256-(box[0]+box[2])/2);y=round(461-box[3])
        assets.require(x>=0 and y>=0 and x+resized.width<=512 and y+resized.height<=512,'generated canvas has excessive padding; request aligned single character')
        canvas.alpha_composite(resized,(x,y))
        import tempfile
        with tempfile.TemporaryDirectory() as tmp:
            temp=Path(tmp)/'character.webp';canvas.save(temp,'WEBP',lossless=True,method=6);info=assets.image_info(temp)
            original.parent.mkdir(parents=True,exist_ok=True);target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(source_file,original);shutil.copyfile(temp,target)
    entry.update(status='awaiting-art-review',asset={'path':str(target.relative_to(root)),**info},source={'kind':'image-generation','tool':'image_gen','licenseBasis':'user-authorized-development-generation','path':str(original.relative_to(root)),'sha256':assets.sha(original.read_bytes()),'conceptSha256':entry['conceptSha256'],'prompt':prompt},review=None)
    (root/assets.REGISTRY).write_text(catalog.dumps(registry))
def plan(root,identity,reason):
    assets.require(isinstance(reason,str) and len(reason.strip())>=12,'individual silhouette selection reason required')
    formal=next((r for r in rows(root) if r['id']==identity),None)
    assets.require(formal is not None and formal['assetProductionEligible'],'verified concept required for planning')
    registry=assets.load(root/assets.REGISTRY)
    assets.require(not any(e['id']==identity for e in registry['entries']),'sprite identity already planned')
    registry['entries'].append({'id':identity,'formalIdentity':assets.identity(formal),'conceptSha256':{i['file']:i['sha256'] for i in formal['images']},'version':'1.0.0','facing':'right-3/4','pivot':[.5,.9],'selectionReason':reason,'status':'not-started','asset':None,'review':None,'gmTestStatus':'not-tested','formalReleaseAllowed':False})
    registry['entries'].sort(key=lambda e:e['id'])
    (root/assets.REGISTRY).write_text(catalog.dumps(registry))

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('command',choices=('validate','plan','import'));p.add_argument('--set');p.add_argument('--source');p.add_argument('--prompt-file');p.add_argument('--reason');a=p.parse_args()
    try:
        if a.command=='plan':plan(ROOT,(a.set or '').lower(),a.reason)
        if a.command=='import':
            assets.require(a.set and a.source and a.prompt_file,'import requires --set --source --prompt-file')
            import_image(ROOT,a.set.lower(),Path(a.source),Path(a.prompt_file).read_text())
            with contextlib.redirect_stdout(io.StringIO()):catalog.run(ROOT,True)
        print(json.dumps(validate(ROOT),ensure_ascii=False,indent=2))
    except (ValueError,OSError,KeyError,TypeError) as e:p.exit(1,f'Sprite pipeline blocked: {e}\n')
if __name__=='__main__':main()
