# Architecture

## Runtime model

Sea of fire uses an authoritative backend. The Unreal client sends player intent; the server validates movement, combat, inventory, shop, rewards, skins, reputation, guilds, and chat.

## Realtime

- WebSocket endpoint: `/ws`.
- REST endpoint: account, inventory, shop, guild, launcher, and admin-style reads.
- One initial shard: `main`.
- Spatial interest around each player keeps nearby entities only.

## Persistence target

The current vertical-slice backend keeps state in memory for fast iteration. PostgreSQL is the production target and must persist:

- accounts;
- player profile;
- inventory;
- loadout;
- skins;
- rewards;
- skills;
- reputation history;
- guilds;
- shop listings;
- auctions;
- chat moderation events.

## Server authority

The client cannot decide:

- damage;
- reload readiness;
- range;
- death;
- rewards;
- skin bonus;
- auction ownership;
- inventory mutations;
- reputation;
- guild membership.

