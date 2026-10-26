# AWAKEN Engine 1.2.1 handoff

## Verified

- `npm run build` succeeds.
- `npm test` passes 6 deterministic tests, including ordered course checkpoints and personal bests.
- Playwright browser tests pass at 1280×800 and 390×844. They verify terminal load, entering the Lounge, camera toggle, and movement input.
- The production browser build is local-bundled; Three.js and Rapier have no CDN runtime dependency.

## Architecture

- `src/main.ts`: renderer, Network Terminal, portable locally persisted handle, input, camera collision, world load/portal loop. The HUD always says local session.
- `src/movement/motor.ts`: framework-independent 60 Hz movement feel state machine.
- `src/movement/rapier-controller.ts`: Rapier WASM capsule controller, collision and stairs/ground snap.
- `src/sdk/manifest.ts`: versioned safe Experience SDK schema and validator.
- `src/sdk/worlds.ts`: three examples. AWAKEN Lounge is protected (`build: none`); Neon Traverse is the small obstacle course; DELTA-9 is the arena shell.
- `src/worlds/scenes.ts`: separate authored visual scene roots for Lounge, Koi Hours, Rain Alley, Traverse, and Delta-9. Do not replace them with collision meshes.
- `src/avatar/avatar.ts`: four procedural avatars, safe GLB 2.0 validation/normalization, and IndexedDB persistence.
- `src/avatar/animation.ts`: uses Rapier velocity/ground state for procedural or compatible GLB animation states.
- `src/game/course.ts`: deterministic Neon Traverse timer/checkpoint/personal-best logic.
- `tests/movement.test.ts` and `tests/browser/awaken.spec.ts`: test coverage.

## Critical product invariants

Do not claim local sessions are multiplayer. Do not run creator-supplied JavaScript. Keep the official Lounge protected. Preserve local avatar persistence and GLB importing when reintroducing the original detailed avatar UI (the former monolithic prototype is preserved in `original-demo.html`).

## Mobile recovery

The renderer must be resized from `visualViewport` as well as window resize events. The canvas is fixed to the gameplay viewport; do not reintroduce a global debug grid. Camera occlusion uses authored visual meshes in addition to portal objects. The joystick owns exactly one pointer and clears input on pointerup, pointercancel, and lost pointer capture. This was verified in browser emulation, not on a physical iPhone.

## Next work

1. Complete the full-screen avatar studio and Miko dialogue UI. The restoration audit documents these gaps explicitly.
2. Replace simple obstacle meshes with manifest asset URLs plus an explicit server-side asset validation pipeline.
3. Split Rapier into an experience-runtime chunk to reduce the 956 KB gzip initial JavaScript payload.
4. Add a genuine mobile thumbstick and physical-device check; the current mobile browser viewport test verifies layout/input safety but is not a physical handset test.
5. If networked play is added, make server physics authoritative; do not display fabricated occupants or chat.
