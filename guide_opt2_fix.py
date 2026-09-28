from pathlib import Path

p=Path('tests/runtime/js-integrity.js')
s=p.read_text(encoding='utf-8')
anchor='const pos=name=>index.indexOf(\'src="\'+name+\'?v=\');'
if anchor not in s: raise SystemExit('js-integrity insertion anchor missing')
insert='''const guideExtensionBehavior=spawnSync(process.execPath,["tests/runtime/gameguide-extension-integrity.js"],{encoding:"utf8"});
assert(guideExtensionBehavior.status===0,"Guide shared extension behavior regression failed:\\n"+String(guideExtensionBehavior.stderr||guideExtensionBehavior.stdout||"unknown error").trim());
'''
s=s.replace(anchor,insert+anchor,1)
p.write_text(s,encoding='utf-8')
print('guide optimization batch2 permission fix applied')
