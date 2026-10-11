"""Export-only simplification mask: preserve actual garment material boundaries.
Soft importance prevents garment borders consuming the entire low-LOD budget.
Head and hands are prioritized, with no rig or save-contract change.
The transient group is not a bone and is added only after saving editable source.
"""
def configure_lod(body,ratio,name='CW_LOD_Anatomy'):
    group=body.vertex_groups.get('LOD_Collapse_Allowed')
    if group is None:
        group=body.vertex_groups.new(name='LOD_Collapse_Allowed')
        ids=[v.index for v in body.data.vertices];group.add(ids,1,'REPLACE')
        adjacent=[set() for v in body.data.vertices]
        for p in body.data.polygons:
            for vi in p.vertices:adjacent[vi].add(p.material_index)
        boundary=[i for i,materials in enumerate(adjacent) if len(materials)>1]
        if boundary:group.add(boundary,.18,'REPLACE')
        head=[v.index for v in body.data.vertices if v.co.z>1.66]
        hands=[v.index for v in body.data.vertices if abs(v.co.x)>.52 and v.co.z<1.08]
        if head:group.add(head,.08,'REPLACE')
        if hands:group.add(hands,.16,'REPLACE')
    lod=body.modifiers.new(name,'DECIMATE');lod.ratio=ratio;lod.use_collapse_triangulate=True
    lod.vertex_group=group.name;lod.vertex_group_factor=1
    return lod
