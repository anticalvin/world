import { LOUNGE_WALKABLE_RADIUS } from "../src/sdk/lounge-bounds.mjs";
import { createServer } from "node:http";
import { Server, Room } from "colyseus";
import { Schema, MapSchema, defineTypes } from "@colyseus/schema";

const PORT = Number(process.env.PORT || 2567);
const CAPACITY = 16;
const MAX_INPUTS_PER_SECOND = 30;
const WORLD_RADIUS = LOUNGE_WALKABLE_RADIUS;
const INPUT_TIMEOUT_MS = 250;
const CHAT_COOLDOWN_MS = 850;
const JOIN_WINDOW_MS = 10_000;
const MAX_JOINS_PER_WINDOW = 6;
const recentJoins = new Map();

class Player extends Schema {
  constructor(values = {}) {
    super();
    this.name = values.name || "WANDERER";
    this.style = values.style || "geisha";
    this.appearance = values.appearance || "";
    this.x = Number(values.x) || 0;
    this.z = Number(values.z) || 9;
    this.yaw = Number(values.yaw) || 0;
  }
}
defineTypes(Player, {
  name: "string",
  style: "string",
  appearance: "string",
  x: "number",
  z: "number",
  yaw: "number",
});

class LoungeState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
  }
}
defineTypes(LoungeState, { players: { map: Player } });

const safeName = (value) =>
  String(value || "WANDERER")
    .replace(/[^ A-Z0-9_-]/gi, "")
    .slice(0, 14) || "WANDERER";
const safeStyle = (value) =>
  ["geisha", "ronin", "ghost", "fox"].includes(value) ? value : "geisha";
const safeChat = (value) =>
  String(value || "")
    .replace(/[\x00-\x1f\x7f]/g, "")
    .trim()
    .slice(0, 120);
const options = {
  body: ["blocky", "stylized"],
  hair: ["bob", "mohawk", "bun"],
  top: ["jacket", "hoodie", "armor"],
  pants: ["cargo", "skirt", "shorts"],
  shoes: ["boots", "sneakers", "sandals"],
  hat: ["none", "cap", "beanie", "halo", "crown"],
  glasses: ["none", "round", "visor"],
  mask: ["none", "half", "neon"],
  backpack: ["none", "pack", "wings"],
  style: ["geisha", "ronin", "ghost", "fox"],
};
const safeAppearance = (value) => {
  const v = value && typeof value === "object" ? value : {};
  const result = {};
  for (const [key, list] of Object.entries(options))
    result[key] = list.includes(v[key]) ? v[key] : list[0];
  for (const key of ["outfit", "accent", "skin", "hairColor"])
    result[key] =
      typeof v[key] === "string" && /^#[0-9a-f]{6}$/i.test(v[key])
        ? v[key]
        : "#35f0ff";
  return JSON.stringify(result);
};

class LoungeRoom extends Room {
  maxClients = CAPACITY;
  onCreate() {
    this.setState(new LoungeState());
    this.inputs = new Map();
    this.chatAt = new Map();
    this.onMessage("input", (client, message) => {
      const now = Date.now();
      const last = this.inputs.get(client.sessionId)?.at || 0;
      if (
        now - last < 1000 / MAX_INPUTS_PER_SECOND ||
        !message ||
        typeof message !== "object"
      )
        return;
      const forward = Number(message.forward),
        right = Number(message.right),
        yaw = Number(message.yaw),
        seq = Number(message.seq),
        timestamp = Number(message.timestamp);
      if (
        ![forward, right, yaw].every(Number.isFinite) ||
        Math.abs(forward) > 1 ||
        Math.abs(right) > 1
      )
        return;
      if (
        !Number.isSafeInteger(seq) ||
        !Number.isFinite(timestamp) ||
        Math.abs(timestamp - now) > 30_000
      )
        return;
      const previous = this.inputs.get(client.sessionId);
      if (previous && seq <= previous.seq) return;
      this.inputs.set(client.sessionId, { forward, right, yaw, seq, at: now });
    });
    this.onMessage("chat", (client, message) => {
      const now = Date.now();
      if (now - (this.chatAt.get(client.sessionId) || 0) < CHAT_COOLDOWN_MS)
        return;
      const text = safeChat(message?.text);
      this.chatAt.set(client.sessionId, now);
      if (text) this.broadcast("chat", { id: client.sessionId, text });
    });
    this.onMessage("sync", (client) => client.send("presence", this.players()));
    this.onMessage("appearance", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.appearance = safeAppearance(message?.appearance);
      this.broadcast("appearance", {
        id: client.sessionId,
        appearance: player.appearance,
      });
    });
    this.setSimulationInterval((delta) => this.simulate(delta), 1000 / 60);
  }
  onAuth(client) {
    const now = Date.now();
    const ip = client.auth?.ip || client.sessionId;
    const joins = (recentJoins.get(ip) || []).filter(
      (at) => now - at < JOIN_WINDOW_MS,
    );
    if (joins.length >= MAX_JOINS_PER_WINDOW)
      throw new Error("Join rate limit exceeded");
    joins.push(now);
    recentJoins.set(ip, joins);
    return true;
  }
  onJoin(client, options) {
    this.state.players.set(
      client.sessionId,
      new Player({
        name: safeName(options?.name),
        style: safeStyle(options?.style),
        appearance: safeAppearance(options?.appearance),
      }),
    );
    this.broadcast("presence", this.players());
  }
  onLeave(client) {
    this.state.players.delete(client.sessionId);
    this.inputs.delete(client.sessionId);
    this.chatAt.delete(client.sessionId);
    this.broadcast("remove", { id: client.sessionId });
  }
  simulate(delta) {
    const seconds = Math.min(delta / 1000, 1 / 30);
    for (const [id, player] of this.state.players) {
      const input = this.inputs.get(id);
      if (!input || Date.now() - input.at > INPUT_TIMEOUT_MS) continue;
      const magnitude = Math.max(1, Math.hypot(input.forward, input.right));
      const speed = 4.5;
      player.x +=
        ((-Math.sin(input.yaw) * input.forward +
          Math.cos(input.yaw) * input.right) /
          magnitude) *
        speed *
        seconds;
      player.z +=
        ((-Math.cos(input.yaw) * input.forward -
          Math.sin(input.yaw) * input.right) /
          magnitude) *
        speed *
        seconds;
      const d = Math.hypot(player.x, player.z);
      if (d > WORLD_RADIUS) {
        player.x *= WORLD_RADIUS / d;
        player.z *= WORLD_RADIUS / d;
      }
      player.yaw = input.yaw;
      this.broadcast("player", {
        id,
        name: player.name,
        style: player.style,
        appearance: player.appearance,
        x: player.x,
        z: player.z,
        yaw: player.yaw,
      });
    }
  }
  players() {
    return Array.from(this.state.players, ([id, player]) => ({
      id,
      name: player.name,
      style: player.style,
      appearance: player.appearance,
      x: player.x,
      z: player.z,
      yaw: player.yaw,
    }));
  }
}

const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(404);
  res.end();
});
const gameServer = new Server({ server: httpServer });
gameServer.define("lounge", LoungeRoom);
httpServer.listen(PORT, () =>
  console.log(`AWAKEN Colyseus lounge listening on :${PORT}`),
);
