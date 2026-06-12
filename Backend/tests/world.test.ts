import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GameWorld } from "../src/domain/world.js";

describe("authoritative world rules", () => {
  it("rejects speed hacks and teleports", () => {
    const world = new GameWorld();
    const player = world.createPlayer("Anne");
    assert.equal(world.movePlayer(player.id, { x: 200, y: 0 }, 1).ok, true);
    assert.equal(world.movePlayer(player.id, { x: 1000, y: 0 }, 0.1).reason, "speed_too_high");
    assert.equal(world.movePlayer(player.id, { x: 5000, y: 0 }, 1).reason, "teleport");
  });

  it("enforces cannon reload, range, server damage, and dead target state", () => {
    const world = new GameWorld();
    const player = world.createPlayer("Anne");
    const raider = world.spawnNpc("Raider", { x: 100, y: 0 }, "raider");

    const first = world.fireCannon(player.id, raider.id, 1000);
    assert.equal(first.ok, true);
    assert.equal(first.damage, 18);
    assert.equal(world.fireCannon(player.id, raider.id, 1200).reason, "reload");

    raider.hp = 1;
    const kill = world.fireCannon(player.id, raider.id, 5000);
    assert.equal(kill.killed, true);
    assert.equal(raider.targetable, false);
    assert.equal(world.fireCannon(player.id, raider.id, 9000).reason, "target_dead");

    const hunter = world.spawnNpc("Hunter", { x: 5000, y: 0 }, "hunter");
    assert.equal(world.fireCannon(player.id, hunter.id, 9000).reason, "out_of_range");
  });

  it("rejects unowned skins and accepts signed owned skins", () => {
    const world = new GameWorld();
    const player = world.createPlayer("Anne");
    assert.equal(world.equipSkin(player.id, "raider_bonewake").reason, "skin_not_owned");
    player.ownedSkinIds.push("raider_bonewake");
    assert.equal(world.equipSkin(player.id, "raider_bonewake").ok, true);
    assert.equal(player.activeSkinId, "raider_bonewake");
  });

  it("grants contribution-scaled rewards for Admiral and Boss", () => {
    const world = new GameWorld();
    const anne = world.createPlayer("Anne", "anne");
    const mary = world.createPlayer("Mary", "mary");
    const boss = world.spawnNpc("Boss", { x: 100, y: 0 }, "boss");
    boss.damageByPlayer.anne = 800;
    boss.damageByPlayer.mary = 200;
    boss.hp = 1;

    const reward = world.fireCannon(anne.id, boss.id, 1000).reward;
    assert.ok((reward?.contribution ?? 0) > 0.8);
    assert.ok((reward?.gold ?? 0) > 400);
    assert.ok(anne.pe >= 200);
    assert.equal(mary.pe, 0);
  });

  it("persists inventory rewards and guild state through snapshots", () => {
    const world = new GameWorld();
    const player = world.createPlayer("Anne");
    const raider = world.spawnNpc("Raider", { x: 100, y: 0 }, "raider");
    raider.hp = 1;
    world.fireCannon(player.id, raider.id, 1000);
    const guild = world.createGuild(player.id, "Corsair Court", "SEA");
    assert.equal(guild.ok, true);

    const restored = GameWorld.fromSnapshot(world.snapshotAll());
    const restoredPlayer = restored.players.get(player.id);
    assert.equal(restoredPlayer?.inventory.fragments.Raider, 1);
    assert.equal(restored.guilds.size, 1);
    assert.equal(restoredPlayer?.guildId, guild.guild?.guildId);
  });

  it("enforces direct shop purchase, auction bidding, and anti-duplication reservation", () => {
    const world = new GameWorld();
    const seller = world.createPlayer("Seller", "seller");
    const buyer = world.createPlayer("Buyer", "buyer");
    buyer.gold = 500;

    assert.equal(world.buyShopItem(seller.id, "ammo_basic", 1).ok, true);
    const ammoBeforeAuction = seller.inventory.ammo;
    const auction = world.createAuction(seller.id, "ammo_basic", 10, 20, 50);
    assert.equal(auction.ok, true);
    assert.equal(seller.inventory.ammo, ammoBeforeAuction - 10);
    assert.equal(seller.inventory.reservedItems.ammo_basic, 10);
    assert.equal(world.createAuction(seller.id, "ammo_basic", 10000, 20).reason, "item_missing");

    const bid = world.bidAuction(buyer.id, auction.auction!.auctionId, 50, 1000);
    assert.equal(bid.ok, true);
    assert.equal(bid.auction?.status, "sold");
    assert.equal(buyer.inventory.ammo, 50);
    assert.equal(seller.inventory.reservedItems.ammo_basic, 0);
  });

  it("rate limits chat spam", () => {
    const world = new GameWorld();
    const player = world.createPlayer("Anne");
    for (let i = 0; i < 5; i += 1) {
      assert.equal(world.sendChat(player.id, "global", `msg ${i}`, 1000 + i).ok, true);
    }
    assert.equal(world.sendChat(player.id, "global", "blocked", 1006).reason, "chat_spam");
  });
});
