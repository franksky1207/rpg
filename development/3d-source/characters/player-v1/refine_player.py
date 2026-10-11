"""Batch27 final local art pass on existing editable surface, no retopology.
Called by build_player.py, or on the previous saved .blend with --python.
Keeps rest rig, all 9 socket matrices, topology and every skin weight unchanged.
CC0-1.0 original geometry and procedural atlases; user approves visual seal.
"""
import bpy, math, pathlib, sys, struct
from mathutils import Vector, Quaternion

def pack_face_without_exif(face,source):
    # Reloaded Blender images retain differing DPI EXIF fractions. They do not
    # affect pixels, but must not change reproducible GLB SHA between entrypoints.
    file=source/'face-atlas.png';raw=file.read_bytes();result=bytearray(raw[:8]);offset=8
    assert raw[:8]==b'\x89PNG\r\n\x1a\n'
    while offset<len(raw):
        length=struct.unpack_from('>I',raw,offset)[0];end=offset+length+12
        if raw[offset+4:offset+8]!=b'eXIf':result.extend(raw[offset:end])
        offset=end
    file.write_bytes(result);face.pack(data=bytes(result),data_len=len(result))

def apply_refinement(source,rig,body):
    if body.get('art_pass')=='b27-fast-r3':return
    # Enlarge the head downwards from the existing crown, compress the long neck.
    # Existing UV and weight assignments follow vertices, not new topology.
    for vertex in body.data.vertices:
        p=vertex.co;z=p.z
        if z>=1.674:
            p.z=1.9-(1.9-z)*1.20;p.x*=1.12;p.y=-.002+(p.y+.002)*1.10
            front=max(0,min(1,(-p.y-.025)/.05))
            p.y-=front*(.005*math.exp(-((z-1.765)/.022)**2)*math.exp(-(p.x/.028)**2)+.003*math.exp(-((z-1.705)/.014)**2))
        elif z>1.56:
            t=(z-1.56)/.114;p.z=1.56+(z-1.56)*.604
            p.x*=1+.09*math.sin(math.pi*t);p.y*=1+.09*math.sin(math.pi*t)
        # Small palm taper and toe/sole definition, without extra parts.
        if .922<z<1.022 and abs(p.x)>.515:
            sign=1 if p.x>0 else -1;p.x=sign*(.562+(abs(p.x)-.562)*.94)
        if z<.07 and p.y<-.10:
            p.x=(.14 if p.x>0 else -.14)+(p.x-(.14 if p.x>0 else -.14))*.95
            p.y-=.003*math.exp(-((z-.042)/.02)**2)
    body.data.update()
    # Distinguish a low collar, exposed short neck and skin of the enlarged jaw.
    for poly in body.data.polygons:
        z=poly.center.z
        if z>1.605 and abs(poly.center.x)<.11:poly.material_index=3
        elif 1.578<z<1.605 and abs(poly.center.x)<.09:poly.material_index=4
    # Continuous tailoring fields soften old raster-like panel boundaries.
    def smooth(a,b,x):
        t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
    attr=body.data.color_attributes['CW_Tailoring_Color']
    for vertex in body.data.vertices:
        x,y,z=vertex.co;ax=abs(x);front=y<0
        base=(.053,.067,.090);panel=(.112,.150,.180);flex=(.023,.030,.041)
        if z>1.60:color=(.48,.31,.215)
        else:
            torso=smooth(.90,1.02,z)*(1-smooth(1.48,1.56,z))*(1-smooth(.19,.24,ax))
            edge=.074+(1.49-z)*.14
            chest=torso*smooth(edge-.012,edge+.012,ax)*(1-smooth(.175,.20,ax))*smooth(.065,.11,abs(y))
            limbs=smooth(.24,.30,ax)*smooth(1.07,1.14,z)*(1-smooth(1.46,1.51,z))
            legs=(1-smooth(.88,.95,z))*smooth(.16,.20,z)*smooth(.12,.16,ax)
            amount=max(chest,limbs*.65,legs*.7)
            color=tuple(base[k]*(1-amount)+panel[k]*amount for k in range(3))
            joint=max(math.exp(-((z-1.283)/.030)**2) if ax>.34 else 0,math.exp(-((z-.582)/.040)**2) if z<.85 else 0)
            if z<.035:joint=1
            if 1.58<z<1.607:joint=.9
            color=tuple(color[k]*(1-joint*.8)+flex[k]*joint*.8 for k in range(3))
            # Narrow, flush seams. Restrained cyan follows chest/back tailoring.
            line=math.exp(-((ax-edge)/.0035)**2)*torso if front else math.exp(-(ax/.0045)**2)*torso
            if z<.9:line=max(line,math.exp(-((ax-.185)/.003)**2)*smooth(.25,.4,z)*(1-smooth(.82,.90,z))*(1-smooth(.015,.04,abs(y))))
            cyan=(.030,.245,.275);color=tuple(color[k]*(1-line*.7)+cyan[k]*line*.7 for k in range(3))
            # Slim ribs/waist and heel seams, no extra geometry or texture size.
            seam=(math.exp(-((z-1.15)/.004)**2)+math.exp(-((z-1.22)/.004)**2))*(1-smooth(.18,.23,ax))*smooth(.055,.09,abs(y))
            color=tuple(c*(1-.22*seam) for c in color)
        attr.data[vertex.index].color=(*color,1)
    for index,rough in enumerate([.67,.49,.46,.57,.81]):
        p=body.data.materials[index].node_tree.nodes.get('Principled BSDF');p.inputs['Roughness'].default_value=rough
        if index==2:p.inputs['Emission Strength'].default_value=.07;p.inputs['Metallic'].default_value=.24
    # Same 1024 atlas: broaden eye/eyebrow shapes, defined lips and warm skin.
    face=bpy.data.images['CW_Original_Face_1024'];pixels=[]
    for iy in range(1024):
        v=iy/1023
        for ix in range(1024):
            u=ix/1023;grain=.002*math.sin(ix*1.73+iy*.93)*math.cos(iy*.77)
            cheek=.025*math.exp(-((v-.40)/.17)**2);c=[.48+cheek+grain,.31+cheek*.5+grain*.6,.215+grain*.4]
            hairline=.733+.017*math.cos((u-.5)*math.pi*8)
            if v>hairline or (abs(u-.5)>.170 and v>.54):c=[.023,.027,.030]
            for center in [.434,.566]:
                dx=(u-center)/.032;dy=(v-.530)/.019;oval=dx*dx+dy*dy
                if oval<1.5:c=[.205,.114,.080]
                if oval<1:c=[.77,.74,.67]
                if ((u-center)/.009)**2+((v-.531)/.019)**2<1:c=[.048,.096,.090]
                if ((u-center)/.0045)**2+((v-.531)/.014)**2<1:c=[.009,.012,.012]
                if ((u-center+.0025)/.0018)**2+((v-.538)/.0035)**2<1:c=[.90,.90,.84]
                if abs(dx)<1.04 and abs(v-(.582+.006*(1-dx*dx)))<.006:c=[.043,.027,.020]
            lx=(u-.5)/.044;ly=(v-.287)/.016
            if lx*lx+ly*ly<1:c=[.37,.170,.135]
            if abs(lx)<.90 and abs(v-(.287-.002*math.cos(lx*math.pi)))<.0025:c=[.145,.064,.045]
            if any(((u-n)/.006)**2+((v-.370)/.007)**2<1 for n in [.487,.513]):c=[.22,.105,.065]
            pixels.extend((*c,1))
    face.pixels.foreach_set(pixels);face.resolution=(72,72);face.filepath_raw=str(source/'face-atlas.png');face.file_format='PNG';face.save();pack_face_without_exif(face,source)
    uv=body.data.uv_layers.active
    for poly in body.data.polygons:
        if poly.material_index==3:
            for li in poly.loop_indices:
                p=body.data.vertices[body.data.loops[li].vertex_index].co
                # Invert the geometry proportion change; same coherent face atlas.
                oldz=1.9-(1.9-p.z)/1.20
                uv.data[li].uv=(.5+math.atan2(p.x/1.12,-(p.y+.002)/1.10+.002)/(2*math.pi),max(.02,(oldz-1.66)/.25))
    # Replace keys within the SAME idle clip; never alter rest/bind rig.
    action=rig.animation_data.action
    for curve in list(action.fcurves):action.fcurves.remove(curve)
    for frame,breathe in [(1,0),(16,.008),(31,0),(46,-.008),(61,0)]:
        for p in rig.pose.bones:p.rotation_mode='XYZ';p.rotation_euler=(0,0,0)
        rig.pose.bones['spine_02'].rotation_euler.x=breathe
        rig.pose.bones['spine_02'].keyframe_insert('rotation_euler',frame=frame)
        for sign,side in [(1,'L'),(-1,'R')]:
            for name,degrees in [('upper_arm',17),('forearm',3),('hand',-3)]:
                p=rig.pose.bones[name+'.'+side]
                axis=p.bone.matrix_local.to_3x3().inverted()@Vector((0,1,0))
                p.rotation_euler=Quaternion(axis,math.radians(sign*degrees)).to_euler('XYZ')
                p.keyframe_insert('rotation_euler',frame=frame)
            for finger in ['thumb','index','middle','ring','little']:
                for j in range(1,4):
                    p=rig.pose.bones[f'{finger}_{j:02}.{side}'];p.rotation_euler.x=math.radians(5 if finger=='thumb' else [0,5,9,7][j]);p.keyframe_insert('rotation_euler',frame=frame)
    body['art_pass']='b27-fast-r3';body['art_status']='human-sci-fi-final-polish-awaiting-user-acceptance'
    bpy.context.scene.frame_set(1);bpy.context.view_layer.update()

if __name__=='__main__':
    source=pathlib.Path(__file__).resolve().parent
    rig=bpy.data.objects['CW_Humanoid_Rig_v1'];body=bpy.data.objects['CW_Player_Foundation']
    apply_refinement(source,rig,body)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(source/'player-foundation.blend'))
    sys.path.insert(0,str(source));from export_lods import export_lods
    slots={'weapon':'socket.weapon.R','helmet':'socket.helmet','armor':'socket.armor','shoes':'socket.shoes.L','accessory':'socket.accessory.back'}
    export_lods(source,source.parents[3]/'assets/3d/characters/player-v1',rig,body,slots)
