# AWAKEN Phase 0: architecture and truth audit

Audited 2026-10-27 against README, PLAN, RESTORATION_AUDIT, source manifest/controller, server, and browser/unit tests. This is a source audit, not a claim of physical-device verification.

## Actual architecture
- Browser: Vite + TypeScript, Three.js scene and procedural/locally imported avatars; Rapier WASM kinematic capsule and character controller; fixed-step movement motor at 60 Hz. Main.ts currently owns menu, controls, scenes, network UI, chat, and mode-specific gameplay.
- World registry: `src/sdk/worlds.ts` and declarative `WorldManifest`. The Lounge is protected and creator scripts are not executed. The validator currently checks mostly top-level shapes, **not** deep geometry, bounds, access policies or cross-world portal integrity.
- Server: Node Colyseus `lounge` room only, 16 clients, 60 Hz simulation timer; capped and rate-checked inputs, chat throttle and appearance allowlists. Server currently simulates **flat X/Z movement only**, not Rapier collision, gravity, jump, stairs or slide. Server broadcasts full player data from its simulation, rather than delta snapshots.
- Client: `src/network/lounge-client.ts` connects to Colyseus when configured, shows actual remote players, and labels offline state. GitHub Pages is static; without `VITE_AWAKEN_WS_URL` it does **not** provide real multiplayer.
- Avatar Studio: procedural wardrobe, local presets and GLB import; GLBs remain local. Combat is currently local solo-training controls, not server-authoritative matches.

## Real vs not yet delivered
| Capability | Current truth |
| --- | --- |
| Local 3D worlds and Rapier movement | Implemented in source; browser test checks entry and movement inputs |
| Lounge two-browser join, presence, chat, leave/rejoin | Implemented with a local server; browser test exists, not yet verified in this audit |
| Production WSS multiplayer | **Not deployed** by GitHub Pages workflow |
| All-world multiplayer, per-world counts and identity transfer | **Not implemented** |
| Server Rapier parity and prediction/reconciliation | **Not implemented** |
| Server-validated races, DELTA-9 rounds and hits | **Not implemented** |
| Social emotes, block/mute, parties, branching Miko | **Not implemented** |
| Creator publishing and fuzzed manifest validator | **Not implemented** |
| Real-phone iOS Safari verification | **Not performed** |

## Risks and release gates
1. Source and server physics differ, so do not present current remote positions as reconciled authoritative Rapier gameplay.
2. Static Pages can show offline-only sessions; never fake a live population.
3. Browser tests must start **both** Vite and Colyseus, and must install server dependencies separately. Test selectors must reflect the default-closed chat UI.
4. Existing `README.md` contained literal `\\n` characters and previously claimed a test count/performance result not remeasured here.
5. Validator accepts malformed nested objects; harden before allowing creator uploads. Protect Lounge, return portals and Escape/MENU.
6. Browser emulation at 390x844 is not a physical iPhone test. Do not claim FPS, tick cost, bandwidth or gzip sizes until measured.

## Phase decisions
- Phase 0: add separate non-deploying PR CI for typecheck/build, Vitest and Playwright Chromium at desktop and 390x844, with Colyseus dependencies installed. Only mark phase green after real GitHub Actions results.
- Phase 1: keep existing 60 Hz motor and Colyseus. Reuse Rapier in Node; use fixed input sequences, ack/replay and bounded snapshots; prove parity in tests before rollout.
- Phase 2: validated manifest-ID rooms and per-world rules; no fabricated player counts.
- Phase 3: social UI and server-enforced moderation.
- Phase 4: select WSS hosting after measured load/cost review; keep Pages static client.
- Phase 5: declarative creator builder, server-side validation, storage and remix.

## Reproducible local commands
```sh
npm ci
npm --prefix server ci
npx playwright install --with-deps chromium
npm run build
npm test
npm run test:browser
```
Playwright config automatically starts the server and Vite on localhost:2567 and localhost:4173. For interactive development, use `npm run server` and `VITE_AWAKEN_WS_URL=ws://127.0.0.1:2567 npm run dev` in separate terminals. The command sequence is **not yet verified locally** because the current runtime cannot resolve github.com for a checkout. The PR CI is the executable verification gate.
