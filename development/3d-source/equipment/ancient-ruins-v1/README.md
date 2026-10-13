> **2026-10-14整合精修版**：原53骨／9掛點與人物資產不變；鞋屬完整高脛殼、甲屬大腿／膝片／空背座、固定立體菱形鑰印已完成，15GLB三LOD同步。使用者授權ChatGPT代理美術審查，版本綁定concepts/galaxy/g007-ancient-tech-ruins/model-review.json；工程實測與真機待驗分別見docs/BATCH28_CONSOLIDATED_ACCEPTANCE_2026-10-14.md。下文28-C是原技術歷史。

當前版本重匯出：`blender -b --python-exit-code 1 --python development/3d-source/equipment/ancient-ruins-v1/export_refined.py`，再執行validate_source、registry與來源版本驗證。`refine_equipment.py`只從原source局部增補一次，有重跑guard；要重現精修，先在隔離副本解開history/before-refinement-2026-10-14.tar.gz的原source。不要對精修版再次執行下方歷史build_equipment.py而誤還原造型。舊15GLB／source／registry／review封存與原SHA可追溯，history舊GLB及inert source.txt為Fixture重現，非正式備用裝備或預載。

# 古代科技遺址：第一套正式五槽（28-C）

Original CC0-1.0 design and tooling. No third-party model, texture, font or CDN.
`ancient-ruins.blend` is editable: player reference, accepted 53-bone rig and nine
sockets, five separately authored equipment meshes/materials and preserved idle.
The reference comes from the unchanged accepted player source; never overwrite it.

Run from repository root using Blender 4.3.2:

```sh
blender -b --python-exit-code 1 --python development/3d-source/equipment/ancient-ruins-v1/build_equipment.py
blender -b development/3d-source/equipment/ancient-ruins-v1/ancient-ruins.blend --python-exit-code 1 --python development/3d-source/equipment/ancient-ruins-v1/validate_source.py
blender -b development/3d-source/equipment/ancient-ruins-v1/ancient-ruins.blend --python-exit-code 1 --python development/3d-source/equipment/ancient-ruins-v1/render_review.py
node scripts/update-equipment-registry.cjs
python scripts/generate-resource-manifest.py > resource-manifest.json
node tests/runtime/3d-equipment-contract.cjs
node tests/runtime/3d-glb-validation.cjs
node scripts/build-publish-dry-run.cjs
```

GLBs are output to `assets/3d/equipment/ancient-ruins-v1/`: 5 slots × 3 LODs.
Rigid weapon/key vertices are baked socket-local; `display_rotation` restores the
world orientation in the equipment cabinet only. Helmet, articulated armor and
paired boots share the exact 53 joint order, inverse binds and normalized weights.
No equipment animation or image atlas is duplicated. Source retains the original
idle; runtime adds a reversible right-finger grasp when a real weapon is mounted.
Blender studio captures show original idle, browser captures show the grasp overlay.

`rig-contract.json` locks all original matrices and source digest. Coverage data is
reproducibly derived from original GLB triangles in the registry: only conservative
covered face/chest/foot/back patches; vertices/weights remain immutable. Babylon
uses per-scene index buffers, restoring exact original arrays on unequip/failure.
It does not erase an entire head, torso or foot mesh. No original player GLB changes.

`review/` contains actual Cycles and Babylon pictures, never concept images.
Source and reviews are excluded from Pages. Visual acceptance and real iPhone
validation remain with the user; exhaustive attack/cloth collision is later work.
