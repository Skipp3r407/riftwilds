"""
Optional Blender CLI renderer for Riftwilds isometric library props.

Usage (when blender is on PATH):
  blender --background --python scripts/assets/blender/render_iso_prop.py -- \\
    --out public/assets/game/library/props/blender-crate.webp \\
    --kind crate

Original Riftwilds IP only — simple procedural meshes, warm earth materials.
"""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path


def parse_args(argv: list[str]) -> argparse.Namespace:
    if "--" in argv:
        argv = argv[argv.index("--") + 1 :]
    p = argparse.ArgumentParser()
    p.add_argument("--out", required=True, help="Output image path (.png or .webp)")
    p.add_argument("--kind", default="crate", choices=["crate", "barrel", "rock", "lantern"])
    p.add_argument("--size", type=int, default=256)
    return p.parse_args(argv)


def main() -> None:
    import bpy  # type: ignore

    args = parse_args(sys.argv)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = args.size
    scene.render.resolution_y = args.size
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(out.with_suffix(".png"))

    # Soft isometric camera
    bpy.ops.object.camera_add(location=(3.2, -3.2, 2.8))
    cam = bpy.context.object
    cam.rotation_euler = (math.radians(55), 0, math.radians(45))
    scene.camera = cam

    # Key light (warm amber) + fill
    bpy.ops.object.light_add(type="AREA", location=(2, -1, 4))
    key = bpy.context.object
    key.data.energy = 400
    key.data.color = (1.0, 0.9, 0.75)

    bpy.ops.object.light_add(type="AREA", location=(-2, 2, 3))
    fill = bpy.context.object
    fill.data.energy = 120
    fill.data.color = (0.6, 0.85, 0.9)

    mat = bpy.data.materials.new("RiftEarth")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.55, 0.4, 0.25, 1)
        bsdf.inputs["Roughness"].default_value = 0.7

    if args.kind == "crate":
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.5))
    elif args.kind == "barrel":
        bpy.ops.mesh.primitive_cylinder_add(radius=0.45, depth=1.0, location=(0, 0, 0.5))
    elif args.kind == "rock":
        bpy.ops.mesh.primitive_ico_sphere_add(radius=0.55, location=(0, 0, 0.4))
    else:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=1.4, location=(0, 0, 0.7))
        post = bpy.context.object
        post.data.materials.append(mat)
        bpy.ops.mesh.primitive_cube_add(size=0.35, location=(0, 0, 1.35))

    obj = bpy.context.object
    if obj and obj.data:
        if not obj.data.materials:
            obj.data.materials.append(mat)

    bpy.ops.render.render(write_still=True)
    print(f"Wrote {scene.render.filepath}")


if __name__ == "__main__":
    main()
