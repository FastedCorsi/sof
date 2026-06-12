import websocket from "@fastify/websocket";
import Fastify from "fastify";
import { z } from "zod";
import { GameWorld } from "../domain/world.js";
import { registerRealtime } from "../ws/realtime.js";

const moveSchema = z.object({
  playerId: z.string(),
  x: z.number(),
  y: z.number(),
  deltaSeconds: z.number().positive()
});

const fireSchema = z.object({
  attackerId: z.string(),
  targetId: z.string(),
  nowMs: z.number().optional()
});

export function buildServer(world = new GameWorld()) {
  const app = Fastify({ logger: true });
  app.register(websocket);

  if (world.npcs.size === 0) {
    world.spawnInitialSlice();
  }

  app.get("/health", async () => ({
    ok: true,
    shard: world.shardId,
    players: world.players.size,
    npcs: world.npcs.size
  }));

  app.get("/launcher/manifest", async () => ({
    version: process.env.RELEASE_VERSION ?? "0.1.0-local",
    androidUrl: process.env.ANDROID_ARTIFACT_URL ?? "",
    windowsUrl: process.env.WINDOWS_ARTIFACT_URL ?? "",
    macUrl: process.env.MAC_ARTIFACT_URL ?? "",
    backendUrl: process.env.PUBLIC_BACKEND_URL ?? "http://localhost:8080",
    websocketUrl: process.env.PUBLIC_WS_URL ?? "ws://localhost:8080/ws",
    sha256: process.env.RELEASE_SHA256 ?? ""
  }));

  app.post("/players", async (request) => {
    const body = z.object({ name: z.string().min(1).max(24) }).parse(request.body);
    return world.createPlayer(body.name);
  });

  app.get("/snapshot/:playerId", async (request, reply) => {
    const params = z.object({ playerId: z.string() }).parse(request.params);
    const snapshot = world.snapshotFor(params.playerId);
    if (!snapshot) return reply.code(404).send({ ok: false, reason: "player_unknown" });
    return snapshot;
  });

  app.post("/move", async (request) => {
    const body = moveSchema.parse(request.body);
    return world.movePlayer(body.playerId, { x: body.x, y: body.y }, body.deltaSeconds);
  });

  app.post("/fire", async (request) => {
    const body = fireSchema.parse(request.body);
    return world.fireCannon(body.attackerId, body.targetId, body.nowMs ?? Date.now());
  });

  app.post("/inventory/equip-skin", async (request) => {
    const body = z.object({ playerId: z.string(), skinId: z.string() }).parse(request.body);
    return world.equipSkin(body.playerId, body.skinId);
  });

  app.post("/shop/buy", async (request) => {
    const body = z.object({ playerId: z.string(), itemId: z.string(), quantity: z.number().int().min(1).default(1) }).parse(request.body);
    return world.buyShopItem(body.playerId, body.itemId, body.quantity);
  });

  app.post("/shop/auction", async (request) => {
    const body = z.object({
      playerId: z.string(),
      itemId: z.string(),
      quantity: z.number().int().min(1),
      startBid: z.number().int().min(1),
      buyoutPrice: z.number().int().min(1).optional()
    }).parse(request.body);
    return world.createAuction(body.playerId, body.itemId, body.quantity, body.startBid, body.buyoutPrice);
  });

  app.post("/shop/bid", async (request) => {
    const body = z.object({ playerId: z.string(), auctionId: z.string(), bid: z.number().int().min(1) }).parse(request.body);
    return world.bidAuction(body.playerId, body.auctionId, body.bid, Date.now());
  });

  app.post("/guild/create", async (request) => {
    const body = z.object({ ownerId: z.string(), name: z.string().min(3).max(32), tag: z.string().min(2).max(5) }).parse(request.body);
    return world.createGuild(body.ownerId, body.name, body.tag);
  });

  app.post("/chat", async (request) => {
    const body = z.object({
      playerId: z.string(),
      channel: z.enum(["global", "guild"]),
      message: z.string().min(1).max(240)
    }).parse(request.body);
    return world.sendChat(body.playerId, body.channel, body.message, Date.now());
  });

  registerRealtime(app, world);
  return app;
}

