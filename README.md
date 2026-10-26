# AWAKEN Engine 1.2 / Identity, Animation & Flow

AWAKEN is a local browser prototype: one persisted avatar identity travels between declarative experiences. It never represents local placeholders as real multiplayer.

## Run

```sh
npm install
npm run dev
npm run build
npm test
npm run test:browser
```

`dist/` is a static production build with locally bundled Three.js and Rapier. No runtime CDN is required.

## Controls

WASD/arrows move, Shift sprints, Space jumps, C slides, V switches camera. Drag on the canvas to look. The Network Terminal retains the violet/magenta/cyan identity and persists the player handle at `awaken-avatar` in local storage.

Avatar controls in the terminal provide four procedural identities (geisha, ronin, ghost, fox) and GLB 2.0 import. Compatible files are size-limited to 8 MB, normalized to the player capsule, and saved in IndexedDB. Imported static models are supported; animation clips are used only when available.

## Experiences and SDK

`src/sdk/manifest.ts` defines version 1 of the safe, declarative manifest: identity, scene collision assets, spawn points, portals, triggers, game mode, visibility, and builder access. `src/sdk/worlds.ts` ships AWAKEN Lounge, Neon Traverse (the obstacle course), and DELTA-9 Arena. Add a third experience by exporting a `WorldManifest`, validating it with `validateManifest`, and adding it to the registry—no engine-core changes or user-supplied JavaScript are needed.

The Lounge is `protected` and has `build: 'none'`. The runtime does not execute creator JavaScript.

## Movement

The fixed 60 Hz motor has tuned acceleration/braking, sprint, airborne control, coyote time, buffered jump, and sliding. Rapier's kinematic capsule controller supplies collision, autostep/stairs, ground snap, and slope limits. Third-person camera collision raycasts against authored geometry.

## Verification and performance

- `npm test`: 6 deterministic movement, SDK, portal, and course-timer tests.
- `npm run test:browser`: Playwright runs the entry flow and movement at 1280×800 and 390×844.
- Latest movement microbenchmark: 3,600 fixed ticks in **0.186 ms** on this development host. This measures motor arithmetic, not browser rendering.
- Production bundle: 2.84 MB / 989 KB gzip JavaScript. Rapier and the GLB loader dominate the initial payload; split them into on-demand chunks before public deployment.

## Evaluation notes

Rapier was selected because it provides maintained WASM collision and a kinematic character controller with autostep/slope support. Three.js remains appropriate for the existing renderer and avatar pipeline. GG Web Engine was not integrated: its product framing does not replace the small, browser-native Three + Rapier runtime without adding a second engine abstraction. Existing generic controllers were not adopted because their input/state formats would have displaced the fixed-step, testable AWAKEN movement API; Rapier supplies the collision layer while AWAKEN owns feel tuning.
