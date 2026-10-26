import { createServer } from 'node:http';
import { Server, Room } from 'colyseus';
import { Schema, MapSchema, defineTypes } from '@colyseus/schema';

const PORT = Number(process.env.PORT || 2567);
const CAPACITY = 16;
const MAX_INPUTS_PER_SECOND = 30;
const WORLD_RADIUS = 24;

class Player extends Schema {
  name = 'WANDERER';
  style = 'geisha';
  x = 0;
  z = 9;
  yaw = 0;
}
defineTypes(Player, { name: 'string', style: 'string', x: 'number', z: 'number', yaw: 'number' });

class LoungeState extends Schema {
  players = new MapSchema();
}
defineTypes(LoungeState, { players: { map: Player } });

const safeName = (value) => String(value || 'WANDERER').replace(/[^ A-Z0-9_-]/gi, '').slice(0, 14) || 'WANDERER';
const safeStyle = (value) => ['geisha', 'ronin', 'ghost', 'fox'].includes(value) ? value : 'geisha';

class LoungeRoom extends Room {
  maxClients = CAPACITY;
  onCreate() {
    this.setState(new LoungeState());
    this.inputs = new Map();
    this.onMessage('input', (client, message) => {
      const now = Date.now(); const last = this.inputs.get(client.sessionId)?.at || 0;
      if (now - last < 1000 / MAX_INPUTS_PER_SECOND || !message || typeof message !== 'object') return;
      const forward = Number(message.forward), right = Number(message.right), yaw = Number(message.yaw);
      if (![forward, right, yaw].every(Number.isFinite) || Math.abs(forward) > 1 || Math.abs(right) > 1) return;
      this.inputs.set(client.sessionId, { forward, right, yaw, at: now });
    });
    this.onMessage('chat', (client, message) => {
      const text = String(message?.text || '').trim().slice(0, 120);
      if (text) this.broadcast('chat', { id: client.sessionId, text });
    });
    this.setSimulationInterval((delta) => this.simulate(delta), 1000 / 60);
  }
  onJoin(client, options) {
    this.state.players.set(client.sessionId, new Player({ name: safeName(options?.name), style: safeStyle(options?.style) }));
  }
  onLeave(client) { this.state.players.delete(client.sessionId); this.inputs.delete(client.sessionId); }
  simulate(delta) {
    const seconds = Math.min(delta / 1000, 1 / 30);
    for (const [id, player] of this.state.players) {
      const input = this.inputs.get(id); if (!input) continue;
      const magnitude = Math.max(1, Math.hypot(input.forward, input.right));
      const speed = 4.5;
      player.x += ((-Math.sin(input.yaw) * input.forward + Math.cos(input.yaw) * input.right) / magnitude) * speed * seconds;
      player.z += ((-Math.cos(input.yaw) * input.forward - Math.sin(input.yaw) * input.right) / magnitude) * speed * seconds;
      const d = Math.hypot(player.x, player.z); if (d > WORLD_RADIUS) { player.x *= WORLD_RADIUS / d; player.z *= WORLD_RADIUS / d; }
      player.yaw = input.yaw;
    }
  }
}

const httpServer = createServer((req, res) => {
  if (req.url === '/health') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ status: 'ok' })); return; }
  res.writeHead(404); res.end();
});
const gameServer = new Server({ server: httpServer });
gameServer.define('lounge', LoungeRoom);
httpServer.listen(PORT, () => console.log(`AWAKEN Colyseus lounge listening on :${PORT}`));
