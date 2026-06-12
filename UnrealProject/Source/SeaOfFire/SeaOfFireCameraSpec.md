# Sea of fire camera implementation spec

The client camera must support the project reference in `Docs/PROJECT_REFERENCE.md`.

## Required behavior

- 3D top-down view with a light isometric tilt.
- Player remains centered.
- Mobile camera is stable and does not require combat-time control.
- PC mouse wheel can apply a small zoom within safe clamps.
- HP bars, names, target indicators, destination indicator, projectiles, obstacles, NPCs, nearby players, and loot remain readable.

## Suggested UE setup

- Attach a `USpringArmComponent` to the player pawn.
- Use a fixed rotation around `Pitch=-58`, `Yaw=0`, `Roll=0`.
- Use `TargetArmLength` clamped between:
  - mobile: `1450` to `1750`;
  - PC: `1250` to `1950`.
- Use low or no camera lag on mobile.
- Use a stable FOV around `45` to `55`.
- Keep UI world widgets in screen space or distance-clamped world space.
- Never let camera input consume combat, movement, shop, inventory, or chat UI events.

## First prototype classes

- `ASeaOfFirePlayerController`
- `ASeaOfFirePawn`
- `USeaOfFireMovementComponent`
- `USeaOfFireCombatComponent`
- `USeaOfFireHealthComponent`
- `USeaOfFireNetworkClient`
- `WBP_MobileHUD`
- `WBP_TargetPanel`
- `WBP_DebugNetworkPanel`

