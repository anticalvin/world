import { Client, type Room } from "colyseus.js";
import type { AvatarAppearance } from "../avatar/avatar";

export type LoungeProfile = {
  name: string;
  style: "geisha" | "ronin" | "ghost" | "fox";
  appearance?: AvatarAppearance;
};
export type LoungePlayer = LoungeProfile & {
  id: string;
  x: number;
  z: number;
  yaw: number;
};
export type LoungeStatus =
  | "offline"
  | "connecting"
  | "connected"
  | "reconnecting";

type Handlers = {
  self: (id: string) => void;
  player: (player: LoungePlayer) => void;
  remove: (id: string) => void;
  chat: (message: { id: string; text: string }) => void;
  status: (status: LoungeStatus, detail: string) => void;
};

const endpoint = () =>
  import.meta.env.VITE_AWAKEN_WS_URL ||
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:2567`;

/** Small browser-only bridge. It never sends client positions or local avatar files. */
export class LoungeClient {
  private room?: Room;
  private stopped = false;
  private attempt = 0;
  private retry?: number;
  private profile?: LoungeProfile;

  constructor(private readonly handlers: Handlers) {}

  get connected() {
    return Boolean(this.room);
  }

  async connect(profile: LoungeProfile) {
    this.profile = profile;
    this.stopped = false;
    clearTimeout(this.retry);
    this.handlers.status(
      this.attempt ? "reconnecting" : "connecting",
      "CONNECTING TO LOUNGE…",
    );
    try {
      const room = await new Client(endpoint()).joinOrCreate("lounge", profile);
      if (this.stopped) {
        room.leave();
        return;
      }
      this.room = room;
      this.attempt = 0;
      this.handlers.self(room.sessionId);
      this.handlers.status("connected", "CONNECTED · LIVE LOUNGE");
      const decode = (player: any): LoungePlayer => ({
        ...player,
        appearance:
          typeof player.appearance === "string"
            ? JSON.parse(player.appearance || "{}")
            : player.appearance,
      });
      room.onMessage("presence", (players: LoungePlayer[]) => {
        for (const player of players)
          if (player.id !== room.sessionId)
            this.handlers.player(decode(player));
      });
      room.onMessage("player", (player: LoungePlayer) => {
        if (player.id !== room.sessionId) this.handlers.player(decode(player));
      });
      room.onMessage("appearance", (player: LoungePlayer) => {
        if (player.id !== room.sessionId) this.handlers.player(decode(player));
      });
      room.onMessage("remove", ({ id }: { id: string }) =>
        this.handlers.remove(id),
      );
      room.send("sync");
      room.onMessage("chat", (message) => this.handlers.chat(message));
      room.onLeave((code) => {
        console.warn("AWAKEN Lounge left", code);
        this.room = undefined;
        if (!this.stopped) this.scheduleReconnect();
      });
    } catch (error) {
      console.warn("AWAKEN Lounge connection failed", error);
      this.room = undefined;
      if (this.stopped) return;
      this.handlers.status("offline", "OFFLINE · LOCAL SESSION");
      this.scheduleReconnect();
    }
  }

  sendInput(input: {
    forward: number;
    right: number;
    yaw: number;
    seq: number;
  }) {
    this.room?.send("input", { ...input, timestamp: Date.now() });
  }

  sendChat(text: string) {
    this.room?.send("chat", { text });
  }

  sendAppearance(appearance: AvatarAppearance) {
    this.room?.send("appearance", { appearance });
  }

  disconnect() {
    this.stopped = true;
    clearTimeout(this.retry);
    const room = this.room;
    this.room = undefined;
    room?.leave();
  }

  private scheduleReconnect() {
    if (this.stopped || !this.profile) return;
    const delay = Math.min(10_000, 1_000 * 2 ** this.attempt++);
    this.handlers.status(
      "reconnecting",
      `RETRYING LOUNGE IN ${Math.ceil(delay / 1000)}s…`,
    );
    this.retry = window.setTimeout(() => this.connect(this.profile!), delay);
  }
}
