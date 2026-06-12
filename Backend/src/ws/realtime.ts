import type { FastifyInstance } from "fastify";
import type { GameWorld } from "../domain/world.js";

export function registerRealtime(app: FastifyInstance, world: GameWorld): void {
  app.get("/ws", { websocket: true }, (socket) => {
    let playerId: string | undefined;

    socket.on("message", (raw: Buffer | ArrayBuffer | string) => {
      try {
        const message = JSON.parse(raw.toString());
        if (message.type === "join") {
          const player = world.createPlayer(String(message.name ?? "Player"), message.playerId);
          playerId = player.id;
          socket.send(JSON.stringify({ type: "joined", player, snapshot: world.snapshotFor(player.id) }));
          return;
        }
        if (message.type === "move" && playerId) {
          const result = world.movePlayer(playerId, { x: Number(message.x), y: Number(message.y) }, Number(message.deltaSeconds));
          socket.send(JSON.stringify({ type: "moveResult", result, snapshot: world.snapshotFor(playerId) }));
          return;
        }
        if (message.type === "fire" && playerId) {
          const result = world.fireCannon(playerId, String(message.targetId), Date.now());
          socket.send(JSON.stringify({ type: "fireResult", result, snapshot: world.snapshotFor(playerId) }));
          return;
        }
        if (message.type === "ping") {
          socket.send(JSON.stringify({ type: "pong", serverTime: Date.now(), shard: world.shardId }));
        }
      } catch (error) {
        socket.send(JSON.stringify({ type: "error", reason: error instanceof Error ? error.message : "invalid_message" }));
      }
    });
  });
}
