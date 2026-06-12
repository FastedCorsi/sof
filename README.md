# Sea of fire

Sea of fire is a mobile-first 3D multiplayer pirate fantasy game rebuild targeting Unreal Engine 5, Blender-authored low-poly assets, and an authoritative backend.

## Repository layout

- `UnrealProject/` - UE5 client project scaffold and gameplay architecture notes.
- `BlenderAssets/` - source asset plan, export conventions, and generated model outputs.
- `Backend/` - authoritative REST/WebSocket backend for the first vertical slice.
- `Launcher/` - launcher/update manifest client scaffold.
- `Docs/` - design, network, production, and release documentation.
- `Deploy/` - VPS deployment scripts and service templates.

## First vertical slice scope

- Player entity with stats, loadout, active skin, inventory, skills, reputation, and progression fields.
- Authoritative movement validation, cannon reload/range/damage validation, death state, and rewards.
- Initial Raider and Hunter NPC rules.
- Inventory loadout, direct shop purchase, base auction flow, chat anti-spam, and guild creation.
- GitHub Actions for backend CI, conditional Unreal build jobs, manifest generation, and VPS deploy.

## Local backend

```powershell
cd Backend
npm install
npm test
npm run dev
```

The backend listens on `http://localhost:8080` by default and exposes WebSocket realtime on `/ws`.

## Secrets

Never commit secrets. Production deploy expects these GitHub Secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_DEPLOY_PATH`
- `DATABASE_URL`
- `BACKEND_ENV`

