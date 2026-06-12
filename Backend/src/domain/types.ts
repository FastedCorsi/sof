export type EntityKind = "player" | "npc";
export type NpcType = "Raider" | "Hunter" | "BountyHunter" | "Admiral" | "Escort" | "Boss";
export type ResourceKey = "common" | "offensive" | "defensive" | "navy" | "rare" | "veryRare" | "upgrade";
export type FragmentKey = "Raider" | "Hunter" | "BountyHunter" | "Admiral" | "Escort" | "Boss";

export interface Vec2 {
  x: number;
  y: number;
}

export interface Stats {
  hpMax: number;
  cannonDamage: number;
  cannonRange: number;
  cannonReloadMs: number;
  speed: number;
  defense: number;
  critChance: number;
  goldBonus: number;
  fragmentBonus: number;
}

export interface Inventory {
  ammo: number;
  cannons: Record<string, number>;
  crew: Record<string, number>;
  resources: Record<ResourceKey, number>;
  fragments: Record<FragmentKey, number>;
  materials: Record<string, number>;
  skins: string[];
  reservedItems: Record<string, number>;
}

export interface Loadout {
  cannonId: string;
  crewIds: string[];
  ammoId: string;
}

export interface Entity {
  id: string;
  kind: EntityKind;
  name: string;
  position: Vec2;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  range: number;
  reloadMs: number;
  lastFireAt: number;
  alive: boolean;
  targetable: boolean;
  stoppedUntil: number;
}

export interface Player extends Entity {
  kind: "player";
  level: number;
  xp: number;
  skillPoints: number;
  pe: number;
  gold: number;
  reputation: number;
  activeSkinId: string;
  ownedSkinIds: string[];
  stats: Stats;
  inventory: Inventory;
  loadout: Loadout;
  guildId?: string;
  recentChatAt: number[];
}

export interface Npc extends Entity {
  kind: "npc";
  npcType: NpcType;
  home: Vec2;
  aggroTargetId?: string;
  lastKnownTarget?: Vec2;
  damageByPlayer: Record<string, number>;
}

export interface Reward {
  xp: number;
  gold: number;
  pe: number;
  resources: Partial<Record<ResourceKey, number>>;
  fragments: Partial<Record<FragmentKey, number>>;
  contribution?: number;
}

export interface FireResult {
  ok: boolean;
  reason?: string;
  damage?: number;
  targetHp?: number;
  killed?: boolean;
  reward?: Reward;
}

export interface MoveResult {
  ok: boolean;
  reason?: "speed_too_high" | "teleport" | "out_of_map" | "dead";
  position: Vec2;
}

export interface SkinDefinition {
  skinId: string;
  name: string;
  assetPath: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  condition: string;
  bonus?: Partial<Stats>;
  serverSignature: string;
}

export interface ShopItem {
  itemId: string;
  category: "ammo" | "cannon" | "crew" | "resource" | "cosmetic";
  name: string;
  priceGold: number;
  quantity: number;
}

export interface Auction {
  auctionId: string;
  sellerId: string;
  itemId: string;
  quantity: number;
  currentBid: number;
  buyoutPrice?: number;
  bidderId?: string;
  status: "open" | "sold" | "cancelled";
  history: Array<{ playerId: string; bid: number; at: number }>;
}

export interface Guild {
  guildId: string;
  name: string;
  tag: string;
  ownerId: string;
  members: string[];
  level: number;
  contributions: Record<string, number>;
}

