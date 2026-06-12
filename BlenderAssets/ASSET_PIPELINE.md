# Blender asset pipeline

## Style

- Low-poly fantasy cartoon pirate.
- Strong silhouettes and readable colors.
- Clear shapes from the top-down/isometric camera.
- Simple materials optimized for mobile.

## Source folders

- `source/characters`
- `source/ships`
- `source/npc`
- `source/islands`
- `source/ports`
- `source/props`
- `source/vfx`
- `exports/fbx`
- `exports/gltf`

## Initial asset list

- Player fantasy pirate ship/entity.
- Player skin variants.
- Raider.
- Hunter.
- Bounty Hunter.
- Admiral.
- Escort.
- Boss.
- Cannons.
- Cannon projectiles.
- Islands.
- Rocks.
- Ports.
- Loot crates.
- Skin fragments.
- Simple smoke, fire, impact, and loot VFX meshes.

## Export rules

- Prefer FBX for Unreal skeletal/static meshes.
- glTF is acceptable for quick static mesh iteration.
- Use mobile LODs.
- Use simple collision meshes.
- Keep pivots consistent.
- Name assets with `SOF_` prefix.
- Verify readability from the top-down camera before final import.

