# AWAKEN delivery plan

## Baseline and architecture
Current main identifies itself as Engine 1.3.1, not 1.2.1. Browser: Vite/TypeScript, Three.js scene/avatars, Rapier kinematic character collision, fixed 60 Hz motor (`src/movement/motor.ts`), declarative world registry and manifest validator. Server: Colyseus room currently only for the Lounge, with a simplified X/Z authoritative motor. Static GitHub Pages cannot host the server. Existing tests include Vitest and Playwright.

The current manifest validator is too permissive for untrusted published worlds: it checks basic presence but not every collider, portal target, trigger or property range. Before enabling publishing, harden validation and add adversarial tests. Keep `awaken-lounge` protected with `build: 'none'`, return portals validated, and Escape/MENU reliable.

## Phase 0: reproducible baseline and safety
Read README, RESTORATION_AUDIT, manifest, worlds, motor and test configuration. Run `npm ci` (lockfile), `npm run dev`, `npm test`, `npm run test:browser` (desktop 1280x800 and mobile 390x844), and `npm run build`. Document actual output and environmental limitations. **This environment cannot clone github.com (DNS resolution fails); do not mark local tests as passed.** The existing GitHub Pages workflow validates build and unit tests, not the full browser suite. Phase 0 cannot be marked verified until the above commands run in CI or a reachable checkout.

## Phase 1: deterministic local ghost racing
Record exact per-tick `Input` plus grounded/collision events in Neon Traverse. Store bounded local best replay with version, manifest fingerprint, motor tuning fingerprint, initial state, tick inputs and optional checkpoints. Replay as explicitly labeled **LOCAL GHOST**, with translucent avatar and local-only leaderboard. Deterministic motor tests: same initial state and input/grounded sequence => identical final state and checkpoints. Rapier collisions require identical collision world, timestep and version; do not claim cross-device physics determinism without verification. Keep course finish after last obstacle and ordered checkpoints. Do not alter existing motor feel.

## Phase 2: authoritative rooms per world
Keep **Colyseus**: already integrated in browser and server, schema support, test scaffolding and WebSocket transport. PartyKit would add a migration and hosting coupling without clear benefit. One room per validated world ID, shared collision-authoritative 60 Hz simulation, client input sequence ack/prediction/reconciliation, 10-20 Hz snapshots and interpolation. Sync handle, safe avatar appearance or approved GLB reference, movement and animation. Explicit reconnect and honest offline states. Run 50+ headless clients per room; report server tick p50/p95 and ingress/egress bytes per client. Hosting and WSS configuration are prerequisites for live multiplayer.

## Phase 3: social
Real nameplates, eight validated emote IDs, rate-limited/filterable text chat, proximity, actual server population counts, mute/block. No fake occupants.

## Phase 4: creator tools
Browser editor emits only `WorldManifest` JSON; never evaluate creator code. Live validation and local test play; server-stored publish links, remix, directory visibility and permissions. Harden validator before accepting creator submissions; fuzz malformed manifests and enforce quotas. Protect Lounge and return portals.

## Phase 5: retention
Authenticated persistent profile and server-owned currency/unlocks, earn from verified races/events, cosmetic shop, daily Lounge event, server-verified leaderboards. Never trust client currency or replay completion.

## Phase 6: feel and performance
Lazy-load Rapier, GLB, and world chunks; instance repeated geometry, LOD, KTX2/Draco, spatial audio and ambient hooks, optional neon/rain effects, preserve mobile touch controls. Measure first-interactive <3 s on mid-range phone, 60 fps desktop, >=30 fps mobile and initial JS <1 MB gzip.

## Release gates for every phase
- `npm test`, `npm run build`, and Playwright at 1280x800 and 390x844, with real-server scenarios when applicable
- A focused demo document in `docs/` describing setup, reproducible checks and limitations
- README and PLAN updates; separate commit/PR per phase
- Preserve declarative worlds, validated Lounge return portals, MENU/Escape, and the existing 60 Hz motor
- Never conflate a successful build with verified browser gameplay or production hosting

## Risks and decisions
1. Ghost playback must not pretend to be a connected player. Local replay is not real multiplayer.
2. Client Rapier and server flat motor currently diverge; collision-authoritative server is a major rewrite confined to Phase 2.
3. The current course uses z-threshold checkpoints and finish before its last obstacles; fix the course geometry/rules before treating ghost times as competitive.
4. GitHub Pages deployment does not establish a hosted Colyseus service.
5. Browser test automation and actual iPhone Safari testing are different gates. Report both.

## Revised phase order (2026-10-27)
The requested sequence supersedes the earlier ghost-first roadmap: Phase 0 audit and CI; Phase 1 shared Rapier motor/prediction; Phase 2 rooms and per-world rules; Phase 3 social; Phase 4 WSS hosting and performance; Phase 5 declarative creator worlds. Retain ghost racing as part of Phase 2, not a claim of finished multiplayer. GitHub Actions must pass build, unit and browser tests before beginning Phase 1. See `AUDIT.md` for real-vs-stubbed inventory. For hosting, defer vendor choice until measurements; choose the simplest Colyseus-compatible WSS host with persistent processes and health checks, rather than moving away from Colyseus.
