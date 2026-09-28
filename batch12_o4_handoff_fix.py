from pathlib import Path
p=Path('PROJECT_HANDOFF.md')
s=p.read_text(encoding='utf-8')
old='''Settlement `eventSequence` 可產生：

```text
aggregate-progress
boss-defeated
stage-crossed
five-point-front
```

十王全滅目前只產生：

```text
completionReady = true
```

**目前不會自行寫 `thirdWorld.completed=true`。** 正式 completion owner 留給第 12／13 批。'''
new='''Settlement `eventSequence` 可產生：

```text
aggregate-progress
boss-defeated
stage-crossed
five-point-front
completion-ready
```

十王全滅會形成：

```text
completionReady = true
final eligibility = true
```

但**十王全滅本身不直接完成第三紀元**。只有正式 Final Story 在「十王全滅＋stage10」條件下真正完成後，shared Story completion owner 才原子寫入 `story.finalSeen=true` 與 `thirdWorld.completed=true`。目前 Final 正文仍是 placeholder，因此不會提前完成。'''
if s.count(old)!=1: raise SystemExit(f'handoff completion anchor mismatch: {s.count(old)}')
p.write_text(s.replace(old,new,1),encoding='utf-8')
