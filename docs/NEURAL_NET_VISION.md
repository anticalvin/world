# AWAKEN Neural Net: implementation direction

## Visual rule
**Bitmap textures, not scanline overlays.** Use authored pixel art on UV-mapped 3D meshes with nearest-neighbor sampling, flat-shaded geometry and controlled texture resolution. Never substitute a full-screen scanline effect for actual bitmap assets.

## Phase 1: gameplay foundations
- Fix punch direction and simplify DELTA-9 controls to left/right punch.
- Support simultaneous run, jump, movement and punch on touch devices.
- Add real opponent and server-authoritative hit validation separately; do not claim the current local training slice is PvP.
- Verify on mobile and in two-client browser tests.

## Phase 2: AI inhabitant
- Server-owned, visibly tagged AI avatar with navigation, collision, conversations and bounded actions.
- Durable memory in a database: events, player consent, preferences, objectives and test reports.
- Explicit opt-in for player-specific memory, privacy controls and deletion.
- Safe test mode: replay movement paths and report defects. Never execute user-supplied code or self-merge changes.
- A hosted model and a database are required. A server-side character is not continuous awareness or a copy of this ChatGPT conversation.

## Phase 3: bitmap creator workflow
- PNG import, validation, UV preview and object editor.
- Server-side validation and moderation before publishing; file size, pixel dimensions and storage quotas.
- Creator attribution and content reporting.

## Phase 4: player shops
- Server-authoritative inventories, listings, escrowed trades and audit logs.
- Begin with game-only credits; real payments require identity, tax, fraud, dispute and compliance design.

## Deployment
- Production Colyseus requires a reachable secure WSS host and secrets management.
- Each phase gets its own reviewable PR with unit and browser coverage. Do not merge failing CI.
