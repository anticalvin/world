# AWAKEN Agent Brief: v1.3.1 Real Multiplayer Vertical Slice

Baseline: commit `6cd1f3ee406474a91972fa8ff2b8e06ec02de96d`. Read `docs/MULTIPLAYER_FOUNDATION.md`, `server/index.mjs`, `src/main.ts`, `src/movement/rapier-controller.ts`, `src/avatar/avatar.ts`, `src/sdk/worlds.ts`, and `RESTORATION_AUDIT.md` first.

## Actual status
The Colyseus 0.16.5 server exists but the browser is offline-only. Server movement is flat X/Z integration without Rapier obstacles, gravity, jump, slide or server-side collision. No browser client connection, remote avatars, or multiplayer integration tests exist. Do not claim multiplayer is working until two independent browser clients connect and see each other.

## P0: Connect two real clients
1. Add a version-compatible Colyseus browser SDK and a dedicated network client module, with environment-based WSS URL, connection status, retry, graceful offline fallback, and explicit disconnect on exit. Never embed production secrets.
2. In the Lounge, join the `lounge` room; render remote players as distinct Three.js avatars using built-in style/name validated by server. Do not render a second copy of the local player. Add readable nameplates, interpolation, and join/leave cleanup.
3. Send bounded input messages with sequence/timestamp; server remains authoritative and must reject malformed input. Fix stale-input behavior: zero movement after a short timeout. Rate-limit chat and joins as well as movement; sanitize messages. Handle reconnect without ghosts.
4. Resolve physics divergence. Prefer a shared server-side Rapier-compatible character simulation using the same world colliders and input semantics; client prediction/reconciliation is a later optimization, but no competitive results should trust local positions. If this is too large, scope the first multiplayer room to safe flat Lounge movement with collision checks and explicitly document feature restrictions.
5. Add a small accessible chat panel with mute/block/report groundwork and connection state. Do not enable voice.
6. Ensure world travel either transfers to the appropriate room or explicitly disconnects; never leave a ghost in the Lounge.

## P0 acceptance tests
- Start server and client locally; two independent Playwright contexts join the same Lounge, see each other's *real* avatars and names, and observe remote movement.
- Disconnect one; remote avatar disappears. Rejoin works.
- Bad input, NaN/Infinity, oversized chat, rapid messages and stale input do not produce unsafe movement or server crashes.
- Test desktop and mobile viewports; confirm MENU returns and avatar persists.
- Verify no real-player claims in offline mode.

## P1: Avatar Studio
- Standalone menu destination with orbit/zoom preview, all existing built-in styles, skin/hair/outfit/accent, name, reset, save/cancel and mobile layout.
- Keep GLB import with size/vertex checks, local IndexedDB persistence, multiple named presets, grounding/forward direction checks, and clear error UI.
- Imported GLBs stay local-only for now. Remote players receive safe built-in fallback until a separately validated asset publishing service exists. Never send file bytes through room state.

## Preservation contract
Keep five worlds (AWAKEN Lounge, Koi Hours, Rain Alley 404, Neon Traverse, DELTA-9), Miko, torii, koi pond, lanterns, arena ring, portals, mobile controls, original cyber-noir palette, and Rapier movement. Capture screenshots and add regression tests before refactoring. No wholesale rewrite.

## Operational deliverables
- Repeatable commands for server+client and two-client tests; pin compatible package versions.
- Document deployment: GitHub Pages serves static client only; Colyseus requires a separate WebSocket-capable server and secure WSS endpoint.
- Build/test logs, two-client screenshots, network limitations, and a precise handoff.
- Fix README inaccuracies, including server scripts, when found.

Do not call this done based on server /health alone. The player-visible two-client test is the release gate.
