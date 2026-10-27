# AWAKEN Engine 1.3.1 / Real Lounge Multiplayer Slice

AWAKEN is a local browser prototype: one persisted avatar identity travels between declarative experiences. It never represents local placeholders as real multiplayer.

## Run

Prerequisites: Node.js 22, npm, and Playwright Chromium. The Colyseus server runs separately from the Vite dev server. Run from the repository root:

```sh
npm ci
npm --prefix server ci
npx playwright install --with-deps chromium
npm run server
# In another terminal:
VITE_AWAKEN_WS_URL=ws://127.0.0.1:2567 npm run dev
# In another terminal, with both services running:
npm run build
npm test
npm run test:browser
```

`docs/` is the static production build used by GitHub Pages. No runtime CDN is required. For a fully clean checkout use `npm ci` rather than an unpinned install. Browser tests require Playwright Chromium and any test-server configuration defined in `playwright.config.ts`. GitHub Pages hosts the browser only, not Colyseus.\n\n**Verification status:** These are the repository setup commands, not a claim of a successful local run in this execution environment. A GitHub clone attempt failed because github.com could not resolve; local install, dev server and browser tests were therefore not executed. Consult `PLAN.md` for release gates and known risks.

## Controls

WASD/arrows move, Shift sprints, Space jumps, C slides, V switches camera. Drag on the canvas to look. The Network Terminal retains the violet/magenta/cyan identity and persists the player handle at `awaken-avatar` in local storage.

Avatar controls in the terminal provide four procedural identities (geisha, ronin, ghost, fox) and GLB 2.0 import. Compatible files are size-limited to 8 MB, normalized to the player capsule, and saved in IndexedDB. Imported static models are supported; animation clips are used only when available.

## Avatar Studio v1.4

`AVATAR STUDIO` provides an articulated full-body procedural rig, blocky/stylized bodies, wardrobe parts, hats, hair, face accessories, backpacks, editable colors, randomized first appearance, and named saved looks. New local identities receive a stable color-coordinated seed once; they are not randomized on reload. GLB imports remain local-only. Multiplayer sends only a constrained wardrobe/color payload—never a GLB or local file.

## Experiences and SDK

`src/sdk/manifest.ts` defines version 1 of the safe, declarative manifest: identity, scene collision assets, spawn points, portals, triggers, game mode, visibility, and builder access. `src/sdk/worlds.ts` ships AWAKEN Lounge, Neon Traverse (the obstacle course), and DELTA-9 Arena. Add a third experience by exporting a `WorldManifest`, validating it with `validateManifest`, and adding it to the registry—no engine-core changes or user-supplied JavaScript are needed.

The Lounge is `protected` and has `build: 'none'`. The runtime does not execute creator JavaScript.

The world directory includes AWAKEN Lounge, Koi Hours, Rain Alley 404, Neon Traverse, and DELTA-9. `MENU` (or Escape) always returns to the directory; every destination has a validated Lounge return portal. See `RESTORATION_AUDIT.md` for recovered landmarks and known differences.

## Lounge multiplayer

The Lounge browser client connects to the pinned Colyseus server when `VITE_AWAKEN_WS_URL` is supplied (or to port 2567 on the current host). A player sees only real connected clients using built-in avatar styles, receives server-originated presence/movement updates, can chat, and sees disconnect cleanup. When the server is unavailable it says **OFFLINE · LOCAL SESSION** and does not invent occupants.

The server validates names/styles, bounded sequenced inputs, timestamps, chat length/rate, room capacity, stale input, and server-owned X/Z positions. Imported GLBs remain local-only and are never transmitted. This first vertical slice uses a bounded, flat Lounge network motor; local Rapier movement remains the authoritative-feeling single-player controller, so network collision/gravity/jump parity is not complete. A static GitHub Pages site cannot host the required WebSocket service; deploy a separate WSS endpoint before enabling multiplayer in production.

## Movement

The fixed 60 Hz motor has tuned acceleration/braking, sprint, airborne control, coyote time, buffered jump, and sliding. Rapier's kinematic capsule controller supplies collision, autostep/stairs, ground snap, and slope limits. Third-person camera collision raycasts against authored geometry.

## Mobile rendering recovery

The iPhone black/upper-left rendering fault was caused by the canvas being sized solely from `innerWidth`/`innerHeight`, without reacting to iOS visual-viewport changes caused by browser chrome. The renderer now uses `visualViewport` dimensions, keeps its CSS canvas fixed to the active gameplay viewport, and updates its camera projection whenever that viewport changes. Gameplay has compact safe-area HUD placement, a pointer-cancel-safe joystick, and 48px touch actions. No physical iPhone was available for this release; the result is browser-viewport verified only.

## Verification and performance

- `npm test`: 6 deterministic movement, SDK, portal, and course-timer tests.
- `npm run test:browser`: Playwright runs the entry flow at 1280×800 and 390×844, plus two independent real browser clients joining, seeing movement, chatting, disconnecting, and reconnecting.
- Latest movement microbenchmark: 3,600 fixed ticks in **0.186 ms** on this development host. This measures motor arithmetic, not browser rendering.
- Production bundle: 2.84 MB / 989 KB gzip JavaScript. Rapier and the GLB loader dominate the initial payload; split them into on-demand chunks before public deployment.

## Evaluation notes

Rapier was selected because it provides maintained WASM collision and a kinematic character controller with autostep/slope support. Three.js remains appropriate for the existing renderer and avatar pipeline. GG Web Engine was not integrated: its product framing does not replace the small, browser-native Three + Rapier runtime without adding a second engine abstraction. Existing generic controllers were not adopted because their input/state formats would have displaced the fixed-step, testable AWAKEN movement API; Rapier supplies the collision layer while AWAKEN owns feel tuning.
