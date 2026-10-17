"""Development-only whole-suit sprite evidence. Never authorizes GM or publication."""
import hashlib,json,re
from pathlib import Path
from PIL import Image
BASE=Path('development/equipment-2_5d/v1')
REGISTRY=BASE/'registry.json'
FIELDS=('id','epoch','sourceKey','regionOrBoss','equipmentNames')
def sha(b):return hashlib.sha256(b).hexdigest()
def require(ok,message):
    if not ok:raise ValueError(message)
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def identity(row):return {k:row[k] for k in FIELDS}
def local(root,path):
    p=Path(path)
    require(not p.is_absolute() and '..' not in p.parts and p.as_posix().startswith(BASE.as_posix()+'/'),'sprite path escapes development')
    full=root/p
    require(full.resolve().is_relative_to((root/BASE).resolve()),'sprite symlink escapes development')
    require(full.is_file(),'sprite file missing: '+str(p))
    return full

def image_info(file):
    with Image.open(file) as image:
        image.load();require(image.format in ('WEBP','PNG'),'sprite format must be PNG/WebP')
        require(image.width==image.height and image.width in (256,512,1024),'sprite square grid must be 256/512/1024')
        rgba=image.convert('RGBA');a=rgba.getchannel('A');bounds=a.getbbox()
        require(bounds is not None and a.getextrema()[0]==0 and a.getextrema()[1]>=250,'sprite must contain opaque subject and real transparency')
        w,h=rgba.size;left,top,right,bottom=bounds
        require(left>=8 and top>=8 and right<=w-8 and bottom<=h-8,'sprite subject clipped or insufficient margin')
        require(.55*h<=bottom-top<=.90*h and .15*w<=right-left<=.90*w,'sprite subject scale unreasonable')
        require(abs(bottom/h-.90)<=.025,'sprite feet must align at 90% grid height')
        corners=(rgba.getpixel((0,0))[3],rgba.getpixel((w-1,0))[3],rgba.getpixel((0,h-1))[3],rgba.getpixel((w-1,h-1))[3])
        require(not any(corners),'sprite background corners must be transparent')
        # Technical silhouette coverage is not visual/art approval.
        coverage={}
        for size in (128,180,256):
            small=a.resize((size,size));coverage[str(size)]=sum(small.histogram()[33:])
            require(coverage[str(size)]>=size*size*.05,'sprite silhouette disappears at small size')
    data=file.read_bytes();require(0<len(data)<=800000,'sprite exceeds 800KB budget')
    return dict(width=w,height=h,bytes=len(data),sha256=sha(data),alphaBounds=list(bounds),coverage=coverage)

def verified_entry(root,row,approved):
    file=root/REGISTRY
    if not file.is_file():return None
    registry=load(file)
    require(registry.get('schema')=='cw.equipment.sprite.v1' and registry.get('publish') is False,'invalid sprite registry/publish isolation')
    entries=registry.get('entries',[])
    require(isinstance(entries,list) and len({e['id'] for e in entries})==len(entries),'duplicate sprite ID')
    found=[e for e in entries if e['id']==row['id']]
    if not found:return None
    entry=found[0]
    declared=entry.get('formalIdentity') or {}
    require({k:declared.get(k) for k in FIELDS}==identity(row),'sprite formal identity mismatch')
    require(entry.get('gmTestStatus')=='not-tested' and entry.get('formalReleaseAllowed') is False,'sprite cannot self-approve GM/release')
    require(entry.get('version')=='1.0.0' and entry.get('facing')=='right-3/4' and entry.get('pivot')==[.5,.9],'sprite version/facing/pivot mismatch')
    status=entry.get('status')
    require(status in ('not-started','awaiting-art-review','complete'),'invalid sprite completion status')
    if status=='not-started':
        require(entry.get('asset') is None and entry.get('review') is None,'unmade sprite cannot declare asset/review')
        return entry
    asset=entry.get('asset') or {};require(asset.get('path')==str(BASE/'characters'/row['id']/'v1'/'character.webp'),'sprite file belongs to another set')
    info=image_info(local(root,asset['path']))
    require(all(asset.get(k)==v for k,v in info.items()),'sprite SHA/bytes/dimensions/alpha metadata mismatch')
    source=entry.get('source') or {};require(source.get('kind')=='image-generation' and source.get('tool')=='image_gen' and source.get('licenseBasis')=='user-authorized-development-generation','sprite provenance/license required')
    origin=local(root,source.get('path',''));require(sha(origin.read_bytes())==source.get('sha256'),'sprite source SHA mismatch')
    require(source.get('path')==str(BASE/'sources'/row['id']/'generated.png'),'sprite source belongs to another set')
    require(len(source.get('prompt',''))>=80,'sprite generation prompt missing')
    parent=source.get('parentSource')
    if parent:
        require(parent.get('path')==str(BASE/'sources'/row['id']/'initial-generated.png') and sha(local(root,parent['path']).read_bytes())==parent.get('sha256'),'sprite parent generation source mismatch')
    if status=='complete':
        review=entry.get('review') or {};proof=local(root,review.get('path',''));text=proof.read_text()
        require(review.get('reviewer')=='Codex' and re.fullmatch(r'\d{4}-\d{2}-\d{2}',review.get('date','')) and review.get('sha256')==sha(proof.read_bytes()),'sprite review fingerprint missing')
        require(row['id'] in text and info['sha256'] in text and len(text)>250,'sprite review must bind actual asset')
        require(review.get('checks')=={'identity':True,'transparent':True,'silhouette':True,'smallSize':True,'orientation':True},'sprite visual checks missing')
    else:require(entry.get('review') is None,'unreviewed sprite cannot claim visual completion')
    return entry

def state(root,row,approved):
    entry=verified_entry(root,row,approved)
    return entry['status'] if entry else 'not-started'
