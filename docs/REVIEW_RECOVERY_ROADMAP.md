# AWAKEN Recovery Roadmap: Reviewed Issues and Release Gates

Baseline: main after PR #3. This branch contains only **initial fixes**: nonblocking physics boot, 20-line named chat history, and world geometry/material disposal. It does NOT complete the entire roadmap. Run `npm run build && npm test && npm run test:browser` before merge, then verify real iPhone Safari. The GitHub connector cannot run these commands.

## Stage 1: Network Terminal front door (separate PR)
- Render menu immediately, including while Rapier WASM initializes. The Jack In control is disabled until physics is ready and reports loading/errors.
- Restore cyber-noir terminal, original Lounge as live 3D backdrop, pedestal/avatar preview, Worlds and Avatar tabs, “one link, many people” explainer and ~3s cancellable handshake.
- Preserve full Avatar Studio, accessibility, touch controls and original world landmarks. Add first-frame and loading-state screenshot tests.

## Stage 2: Social chat (separate PR)
- Keep 20 recent messages with sender names, not a single replaced line. Use textContent, never HTML injection.
- Add chat bubbles above remote avatars with short TTL and occlusion rules; do not obstruct mobile controls.
- Provide scrolling, unread count, mute and rate limits. Verify two clients with distinct names.

## Stage 3: Portals (separate PR)
- Named destination labels, restrained particle swirl, 0.6s transition, 1.5s arrival grace and entry-edge detection.
- Move accidental Lounge entry triggers away from spawn without changing recognizable torii, pavilion, pond, Miko or authored world positions.
- Verify outbound and return navigation without retrigger loops.

## Stage 4: Neon Traverse (separate PR)
- Replace all-purpose floor with authored platforms/gaps and matching Rapier colliders.
- Add falling respawn, ordered checkpoint trigger volumes, a finish gate AFTER the last obstacle, and best-run ghost replay from validated local samples.
- Do not use bare z-thresholds to finish; keep checkpoint/game rules testable independently.
- Test jumping, course completion, fall recovery and saved best time.

## Stage 5: Multiplayer integrity and security (separate PR)
- Current server uses flat X/Z motor and bounded radius, not Rapier obstacles, jumping, or slide. Design a shared input/collider simulation before changing gameplay authority.
- Send input sequence acknowledgements; client-side prediction and reconciliation; remote interpolation; authoritative spawn and world travel.
- Replace sessionId fallback for per-IP limits with actual trusted request IP extracted from Colyseus auth context/proxy configuration; don't trust arbitrary forwarded headers. Enforce allowed origins and caps; document proxy settings.
- Verify against malicious inputs and two actual devices. Never claim server-authoritative collision until tested.

## Stage 6: Performance and maintainability (separate PR)
- Dispose world geometry/materials and portal meshes on every hop; dispose canvas nameplate textures/materials when remote avatars leave.
- Remove committed stale bundles from docs/assets only after verifying the Pages workflow, .gitignore and deployment artifact strategy.
- Split main.ts by ownership: menu, studio, HUD, chat, networking glue, portals, world manager, game loop. Avoid wholesale rewrite.
- Verify memory usage over 30 world hops and screenshot all five original worlds.

## Stage 7: Feel (separate PR)
- WebAudio ambience with user gesture opt-in, mute and reduced-sensory controls.
- Emotes with synced small validated IDs; subtle mobile-friendly postprocessing; meaningful shard collectibles and replay loops.

## Required reporting
For each PR: precise diff, tests run, desktop/mobile screenshots, known issues, performance measurements, and regression proof. Do not merge until checks pass. Protect original AWAKEN visual identity and all existing features.
