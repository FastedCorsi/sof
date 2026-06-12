import type { NpcType, Reward, ShopItem, SkinDefinition, Stats } from "./types.js";

export const MAP_LIMIT = 10000;
export const INTEREST_RADIUS = 1600;
export const BASE_RELOAD_MS = 3500;
export const BOUNTY_REPUTATION_THRESHOLD = 120;

export const BASE_STATS: Stats = {
  hpMax: 100,
  cannonDamage: 18,
  cannonRange: 850,
  cannonReloadMs: BASE_RELOAD_MS,
  speed: 360,
  defense: 0,
  critChance: 0,
  goldBonus: 0,
  fragmentBonus: 0
};

export const SKINS: SkinDefinition[] = [
  {
    skinId: "starter_corsair",
    name: "Starter Corsair",
    assetPath: "/Game/SeaOfFire/Ships/StarterCorsair",
    rarity: "common",
    condition: "default",
    serverSignature: "sof:signed:starter_corsair:v1"
  },
  {
    skinId: "raider_bonewake",
    name: "Raider Bonewake",
    assetPath: "/Game/SeaOfFire/Ships/RaiderBonewake",
    rarity: "rare",
    condition: "unlock_with_raider_fragments",
    bonus: { cannonDamage: 2 },
    serverSignature: "sof:signed:raider_bonewake:v1"
  },
  {
    skinId: "hunter_redsail",
    name: "Hunter Redsail",
    assetPath: "/Game/SeaOfFire/Ships/HunterRedsail",
    rarity: "rare",
    condition: "unlock_with_hunter_fragments",
    bonus: { cannonRange: 50 },
    serverSignature: "sof:signed:hunter_redsail:v1"
  }
];

export const SHOP_ITEMS: ShopItem[] = [
  { itemId: "ammo_basic", category: "ammo", name: "Basic Cannonballs", priceGold: 10, quantity: 20 },
  { itemId: "cannon_basic", category: "cannon", name: "Basic Cannon", priceGold: 80, quantity: 1 },
  { itemId: "crew_deckhand", category: "crew", name: "Deckhand", priceGold: 120, quantity: 1 },
  { itemId: "resource_common", category: "resource", name: "Common Planks", priceGold: 25, quantity: 5 }
];

export const NPC_REWARDS: Record<NpcType, Reward> = {
  Raider: {
    xp: 25,
    gold: 18,
    pe: 0,
    resources: { common: 2 },
    fragments: { Raider: 1 }
  },
  Hunter: {
    xp: 0,
    gold: 10,
    pe: 15,
    resources: { offensive: 2 },
    fragments: { Hunter: 1 }
  },
  BountyHunter: {
    xp: 0,
    gold: 80,
    pe: 30,
    resources: { rare: 1 },
    fragments: { BountyHunter: 1 }
  },
  Admiral: {
    xp: 0,
    gold: 220,
    pe: 120,
    resources: { navy: 4, upgrade: 1 },
    fragments: { Admiral: 1 }
  },
  Escort: {
    xp: 0,
    gold: 45,
    pe: 25,
    resources: { defensive: 2, navy: 1 },
    fragments: { Escort: 1 }
  },
  Boss: {
    xp: 0,
    gold: 500,
    pe: 250,
    resources: { veryRare: 3 },
    fragments: { Boss: 1 },
    contribution: 1
  }
};

