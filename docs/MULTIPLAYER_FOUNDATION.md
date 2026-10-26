# Multiplayer foundation

`server/` is a separate pinned Colyseus 0.16.5 Lounge vertical slice. It owns room state, session IDs, capacity, rate-limited sequenced movement input, validated display names/styles, server position integration, chat validation/rate limiting, stale-input handling, disconnect cleanup, and `/health`.

It intentionally does not accept client positions or GLB files. Imported avatars remain local-only. The browser client joins `lounge`, displays only genuine connected built-in avatars, interpolates server-originated position messages, and labels an unavailable service as `OFFLINE · LOCAL SESSION`.

Run it locally with `npm run server`, then check `http://localhost:2567/health`. Start the client with `VITE_AWAKEN_WS_URL=ws://127.0.0.1:2567 npm run dev`.

Current limitation: network movement is a safe, bounded flat-Lounge motor. Shared Rapier server physics, jump/slide parity, and production WSS deployment are not implemented yet.
