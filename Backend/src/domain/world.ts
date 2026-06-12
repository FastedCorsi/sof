import {
  BASE_STATS,
  BOUNTY_REPUTATION_THRESHOLD,
  INTEREST_RADIUS,
  MAP_LIMIT,
  NPC_REWARDS,
  SHOP_ITEMS,
  SKINS
} from "./constants.js";
import type {
  Auction,
  Entity,
  FireResult,
  FragmentKey,
  Guild,
  Inventory,
  MoveResult,
  Npc,
  NpcType,
  Player,
  ResourceKey,
  Reward,
  ShopItem,
  SkinDefinition,
  Vec2
} from "./types.js";

type StateDump = ReturnType<GameWorld["snapshotAll"]>;

const RESOURCE_KEYS: ResourceKey[] = ["common", "offensive", "defensive", "navy", "rare", "veryRare", "upgrade"];
const FRAGMENT_KEYS: FragmentKey[] = ["Raider", "Hunter", "BountyHunter", "Admiral", "Escort", "Boss"];

function emptyInventory(): Inventory {
  return {
    ammo: 40,
    cannons: { cannon_basic: 1 },
    crew: {},
    resources: Object.fromEntries(RESOURCE_KEYS.map((key) => [key, 0])) as Record<ResourceKey, number>,
    fragments: Object.fromEntries(FRAGMENT_KEYS.map((key) => [key, 0])) as Record<FragmentKey, number>,
    materials: {},
    skins: ["starter_corsair"],
    reservedItems: {}
  };
}

function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function cloneReward(reward: Reward): Reward {
  return {
    xp: reward.xp,
    gold: reward.gold,
    pe: reward.pe,
    resources: { ...reward.resources },
    fragments: { ...reward.fragments },
    contribution: reward.contribution
  };
}

function insideMap(position: Vec2): boolean {
  return Math.abs(position.x) <= MAP_LIMIT && Math.abs(position.y) <= MAP_LIMIT;
}

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export class GameWorld {
  readonly shardId = "main";
  readonly players = new Map<string, Player>();
  readonly npcs = new Map<string, Npc>();
  readonly auctions = new Map<string, Auction>();
  readonly guilds = new Map<string, Guild>();
  readonly shopItems: ShopItem[] = SHOP_ITEMS;
  readonly skins: SkinDefinition[] = SKINS;
  raidersSunk = 0;

  createPlayer(name: string, id = makeId("player")): Player {
    const player: Player = {
      id,
      kind: "player",
      name,
      position: { x: 0, y: 0 },
      hp: BASE_STATS.hpMax,
      maxHp: BASE_STATS.hpMax,
      speed: BASE_STATS.speed,
      damage: BASE_STATS.cannonDamage,
      range: BASE_STATS.cannonRange,
      reloadMs: BASE_STATS.cannonReloadMs,
      lastFireAt: -BASE_STATS.cannonReloadMs,
      alive: true,
      targetable: true,
      stoppedUntil: 0,
      level: 1,
      xp: 0,
      skillPoints: 0,
      pe: 0,
      gold: 100,
      reputation: 0,
      activeSkinId: "starter_corsair",
      ownedSkinIds: ["starter_corsair"],
      stats: { ...BASE_STATS },
      inventory: emptyInventory(),
      loadout: { cannonId: "cannon_basic", crewIds: [], ammoId: "ammo_basic" },
      recentChatAt: []
    };
    this.players.set(player.id, player);
    return player;
  }

  spawnNpc(npcType: NpcType, position: Vec2, id = makeId(npcType.toLowerCase())): Npc {
    const hpByType: Record<NpcType, number> = {
      Raider: 60,
      Hunter: 70,
      BountyHunter: 120,
      Admiral: 450,
      Escort: 140,
      Boss: 1000
    };
    const npc: Npc = {
      id,
      kind: "npc",
      npcType,
      name: npcType,
      position: { ...position },
      home: { ...position },
      hp: hpByType[npcType],
      maxHp: hpByType[npcType],
      speed: npcType === "Hunter" ? 340 : 260,
      damage: npcType === "Boss" ? 36 : 14,
      range: npcType === "Boss" ? 1100 : 760,
      reloadMs: npcType === "Boss" ? 2800 : 3500,
      lastFireAt: -3500,
      alive: true,
      targetable: true,
      stoppedUntil: 0,
      damageByPlayer: {}
    };
    this.npcs.set(npc.id, npc);
    return npc;
  }

  spawnInitialSlice(): void {
    this.spawnNpc("Raider", { x: 550, y: 120 }, "npc_raider_01");
    this.spawnNpc("Hunter", { x: -650, y: -160 }, "npc_hunter_01");
  }

  movePlayer(playerId: string, target: Vec2, deltaSeconds: number): MoveResult {
    const player = this.players.get(playerId);
    if (!player) return { ok: false, reason: "dead", position: { x: 0, y: 0 } };
    if (!player.alive) return { ok: false, reason: "dead", position: player.position };
    if (!insideMap(target)) return { ok: false, reason: "out_of_map", position: player.position };

    const dist = distance(player.position, target);
    const allowed = player.speed * Math.max(deltaSeconds, 0) * 1.25 + 25;
    if (dist > 1800) return { ok: false, reason: "teleport", position: player.position };
    if (dist > allowed) return { ok: false, reason: "speed_too_high", position: player.position };

    player.position = { ...target };
    return { ok: true, position: player.position };
  }

  fireCannon(attackerId: string, targetId: string, nowMs: number): FireResult {
    const attacker = this.getEntity(attackerId);
    const target = this.getEntity(targetId);
    if (!attacker || !target) return { ok: false, reason: "target_invalid" };
    if (!attacker.alive) return { ok: false, reason: "attacker_dead" };
    if (!target.alive || !target.targetable) return { ok: false, reason: "target_dead" };
    if (nowMs - attacker.lastFireAt < attacker.reloadMs) return { ok: false, reason: "reload" };
    if (distance(attacker.position, target.position) > attacker.range) return { ok: false, reason: "out_of_range" };

    if (attacker.kind === "player") {
      if (attacker.inventory.ammo <= 0) return { ok: false, reason: "no_ammo" };
      attacker.inventory.ammo -= 1;
    }

    attacker.lastFireAt = nowMs;
    const rawDamage = attacker.damage;
    const mitigated = Math.max(1, rawDamage - (target.kind === "player" ? target.stats.defense : 0));
    target.hp = Math.max(0, target.hp - mitigated);

    if (target.kind === "npc" && attacker.kind === "player") {
      target.damageByPlayer[attacker.id] = (target.damageByPlayer[attacker.id] ?? 0) + mitigated;
      target.stoppedUntil = nowMs + (target.npcType === "Raider" ? 1000 : 2000);
    }

    if (target.hp > 0) {
      return { ok: true, damage: mitigated, targetHp: target.hp, killed: false };
    }

    target.alive = false;
    target.targetable = false;
    target.stoppedUntil = Number.POSITIVE_INFINITY;

    const reward = attacker.kind === "player" && target.kind === "npc" ? this.grantNpcReward(attacker, target) : undefined;
    if (attacker.kind === "player") {
      attacker.reputation += target.kind === "npc" ? this.reputationFor(target.npcType) : 40;
      this.spawnBountyIfNeeded(attacker);
    }

    return { ok: true, damage: mitigated, targetHp: 0, killed: true, reward };
  }

  equipSkin(playerId: string, skinId: string): { ok: boolean; reason?: string; skin?: SkinDefinition } {
    const player = this.players.get(playerId);
    const skin = this.skins.find((candidate) => candidate.skinId === skinId);
    if (!player || !skin) return { ok: false, reason: "skin_unknown" };
    if (!player.ownedSkinIds.includes(skinId)) return { ok: false, reason: "skin_not_owned" };
    if (!skin.serverSignature.startsWith(`sof:signed:${skinId}:`)) return { ok: false, reason: "skin_signature_invalid" };
    player.activeSkinId = skinId;
    return { ok: true, skin };
  }

  buyShopItem(playerId: string, itemId: string, quantity = 1): { ok: boolean; reason?: string; item?: ShopItem } {
    const player = this.players.get(playerId);
    const item = this.shopItems.find((candidate) => candidate.itemId === itemId);
    if (!player || !item) return { ok: false, reason: "item_unknown" };
    const total = item.priceGold * quantity;
    if (player.gold < total) return { ok: false, reason: "not_enough_gold" };
    player.gold -= total;
    this.addInventoryItem(player.inventory, item.itemId, item.quantity * quantity);
    return { ok: true, item };
  }

  createAuction(playerId: string, itemId: string, quantity: number, startBid: number, buyoutPrice?: number): { ok: boolean; reason?: string; auction?: Auction } {
    const player = this.players.get(playerId);
    if (!player) return { ok: false, reason: "player_unknown" };
    if (!this.removeInventoryItem(player.inventory, itemId, quantity)) return { ok: false, reason: "item_missing" };
    player.inventory.reservedItems[itemId] = (player.inventory.reservedItems[itemId] ?? 0) + quantity;
    const auction: Auction = {
      auctionId: makeId("auction"),
      sellerId: playerId,
      itemId,
      quantity,
      currentBid: startBid,
      buyoutPrice,
      status: "open",
      history: []
    };
    this.auctions.set(auction.auctionId, auction);
    return { ok: true, auction };
  }

  bidAuction(playerId: string, auctionId: string, bid: number, nowMs: number): { ok: boolean; reason?: string; auction?: Auction } {
    const player = this.players.get(playerId);
    const auction = this.auctions.get(auctionId);
    if (!player || !auction || auction.status !== "open") return { ok: false, reason: "auction_closed" };
    if (auction.sellerId === playerId) return { ok: false, reason: "seller_cannot_bid" };
    if (bid <= auction.currentBid) return { ok: false, reason: "bid_too_low" };
    if (player.gold < bid) return { ok: false, reason: "not_enough_gold" };

    if (auction.bidderId) {
      const previous = this.players.get(auction.bidderId);
      if (previous) previous.gold += auction.currentBid;
    }
    player.gold -= bid;
    auction.currentBid = bid;
    auction.bidderId = playerId;
    auction.history.push({ playerId, bid, at: nowMs });

    if (auction.buyoutPrice && bid >= auction.buyoutPrice) {
      auction.status = "sold";
      this.settleAuction(auction);
    }
    return { ok: true, auction };
  }

  createGuild(ownerId: string, name: string, tag: string): { ok: boolean; reason?: string; guild?: Guild } {
    const owner = this.players.get(ownerId);
    if (!owner) return { ok: false, reason: "player_unknown" };
    if (owner.guildId) return { ok: false, reason: "already_in_guild" };
    const guild: Guild = {
      guildId: makeId("guild"),
      name,
      tag: tag.toUpperCase().slice(0, 5),
      ownerId,
      members: [ownerId],
      level: 1,
      contributions: { [ownerId]: 0 }
    };
    owner.guildId = guild.guildId;
    this.guilds.set(guild.guildId, guild);
    return { ok: true, guild };
  }

  sendChat(playerId: string, channel: "global" | "guild", message: string, nowMs: number): { ok: boolean; reason?: string } {
    const player = this.players.get(playerId);
    if (!player) return { ok: false, reason: "player_unknown" };
    if (channel === "guild" && !player.guildId) return { ok: false, reason: "no_guild" };
    const recent = player.recentChatAt.filter((at) => nowMs - at < 10000);
    if (recent.length >= 5) {
      player.recentChatAt = recent;
      return { ok: false, reason: "chat_spam" };
    }
    recent.push(nowMs);
    player.recentChatAt = recent;
    return { ok: true };
  }

  snapshotFor(playerId: string) {
    const player = this.players.get(playerId);
    if (!player) return undefined;
    const entities = [...this.players.values(), ...this.npcs.values()]
      .filter((entity) => entity.id === playerId || distance(entity.position, player.position) <= INTEREST_RADIUS)
      .map((entity) => this.publicEntity(entity));
    return {
      shard: this.shardId,
      playerId,
      serverTime: Date.now(),
      debug: {
        nearbyPlayers: entities.filter((entity) => entity.kind === "player" && entity.id !== playerId).length,
        remoteCount: entities.length - 1,
        interestRadius: INTEREST_RADIUS
      },
      entities
    };
  }

  snapshotAll() {
    return {
      players: [...this.players.values()],
      npcs: [...this.npcs.values()],
      auctions: [...this.auctions.values()],
      guilds: [...this.guilds.values()],
      raidersSunk: this.raidersSunk
    };
  }

  static fromSnapshot(snapshot: StateDump): GameWorld {
    const world = new GameWorld();
    snapshot.players.forEach((player) => world.players.set(player.id, player));
    snapshot.npcs.forEach((npc) => world.npcs.set(npc.id, npc));
    snapshot.auctions.forEach((auction) => world.auctions.set(auction.auctionId, auction));
    snapshot.guilds.forEach((guild) => world.guilds.set(guild.guildId, guild));
    world.raidersSunk = snapshot.raidersSunk;
    return world;
  }

  private getEntity(id: string): Player | Npc | undefined {
    return this.players.get(id) ?? this.npcs.get(id);
  }

  private publicEntity(entity: Entity) {
    return {
      id: entity.id,
      kind: entity.kind,
      name: entity.name,
      position: entity.position,
      hp: entity.hp,
      maxHp: entity.maxHp,
      hpRatio: entity.hp / entity.maxHp,
      alive: entity.alive,
      targetable: entity.targetable,
      reloadRemainingMs: Math.max(0, entity.reloadMs - (Date.now() - entity.lastFireAt)),
      status: entity.alive ? "alive" : "destroyed"
    };
  }

  private grantNpcReward(player: Player, npc: Npc): Reward {
    const base = cloneReward(NPC_REWARDS[npc.npcType]);
    const totalDamage = Object.values(npc.damageByPlayer).reduce((sum, value) => sum + value, 0);
    const contribution = totalDamage > 0 ? (npc.damageByPlayer[player.id] ?? 0) / totalDamage : 1;
    const scale = npc.npcType === "Boss" || npc.npcType === "Admiral" ? contribution : 1;
    const reward: Reward = {
      xp: Math.floor(base.xp * scale),
      gold: Math.floor(base.gold * (1 + player.stats.goldBonus) * scale),
      pe: Math.floor(base.pe * scale),
      resources: {},
      fragments: {},
      contribution
    };

    for (const [key, value] of Object.entries(base.resources)) {
      reward.resources[key as ResourceKey] = Math.max(1, Math.floor((value ?? 0) * scale));
      player.inventory.resources[key as ResourceKey] += reward.resources[key as ResourceKey] ?? 0;
    }
    for (const [key, value] of Object.entries(base.fragments)) {
      reward.fragments[key as FragmentKey] = Math.max(1, Math.floor((value ?? 0) * (1 + player.stats.fragmentBonus) * scale));
      player.inventory.fragments[key as FragmentKey] += reward.fragments[key as FragmentKey] ?? 0;
    }

    player.xp += reward.xp;
    player.gold += reward.gold;
    player.pe += reward.pe;
    this.applyLevelUps(player);

    if (npc.npcType === "Raider") {
      this.raidersSunk += 1;
      if (this.raidersSunk > 0 && this.raidersSunk % 30 === 0) {
        this.spawnNpc("Admiral", { x: npc.home.x + 900, y: npc.home.y + 400 });
      }
    }

    return reward;
  }

  private applyLevelUps(player: Player): void {
    while (player.xp >= player.level * 100) {
      player.xp -= player.level * 100;
      player.level += 1;
      player.skillPoints += 1;
    }
  }

  private reputationFor(npcType: NpcType): number {
    const values: Record<NpcType, number> = {
      Raider: 5,
      Hunter: 8,
      BountyHunter: 25,
      Admiral: 60,
      Escort: 15,
      Boss: 100
    };
    return values[npcType];
  }

  private spawnBountyIfNeeded(player: Player): void {
    if (player.reputation < BOUNTY_REPUTATION_THRESHOLD) return;
    const existing = [...this.npcs.values()].some((npc) => npc.npcType === "BountyHunter" && npc.aggroTargetId === player.id && npc.alive);
    if (!existing) {
      const bounty = this.spawnNpc("BountyHunter", { x: player.position.x + 700, y: player.position.y - 300 });
      bounty.aggroTargetId = player.id;
    }
  }

  private addInventoryItem(inventory: Inventory, itemId: string, quantity: number): void {
    if (itemId === "ammo_basic") inventory.ammo += quantity;
    else if (itemId.startsWith("cannon_")) inventory.cannons[itemId] = (inventory.cannons[itemId] ?? 0) + quantity;
    else if (itemId.startsWith("crew_")) inventory.crew[itemId] = (inventory.crew[itemId] ?? 0) + quantity;
    else if (itemId === "resource_common") inventory.resources.common += quantity;
    else inventory.materials[itemId] = (inventory.materials[itemId] ?? 0) + quantity;
  }

  private removeInventoryItem(inventory: Inventory, itemId: string, quantity: number): boolean {
    if (quantity <= 0) return false;
    if (itemId === "ammo_basic") {
      if (inventory.ammo < quantity) return false;
      inventory.ammo -= quantity;
      return true;
    }
    if (itemId.startsWith("cannon_")) {
      if ((inventory.cannons[itemId] ?? 0) < quantity) return false;
      inventory.cannons[itemId] -= quantity;
      return true;
    }
    if (itemId === "resource_common") {
      if (inventory.resources.common < quantity) return false;
      inventory.resources.common -= quantity;
      return true;
    }
    return false;
  }

  private settleAuction(auction: Auction): void {
    if (!auction.bidderId) return;
    const buyer = this.players.get(auction.bidderId);
    const seller = this.players.get(auction.sellerId);
    if (!buyer || !seller) return;
    this.addInventoryItem(buyer.inventory, auction.itemId, auction.quantity);
    seller.gold += auction.currentBid;
    seller.inventory.reservedItems[auction.itemId] = Math.max(0, (seller.inventory.reservedItems[auction.itemId] ?? 0) - auction.quantity);
  }
}

