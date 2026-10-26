# Multiplayer foundation

`server/` is a separate pinned Colyseus 0.16.5 proof-of-concept. It owns Lounge room state, session IDs, capacity, rate-limited movement input, validated display names/styles, position integration, chat length validation, disconnect cleanup, and `/health`.

It intentionally does not accept client positions or GLB files. Imported avatars remain local-only. The browser client remains offline-only until the Colyseus client integration and two-client integration suite are implemented; it must not imply connected users today.

Run it locally with `cd server && npm start`, then check `http://localhost:2567/health`.
