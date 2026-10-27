# Character Select integration

The user's uploaded **NEW GAME — Character Select** HTML is the design source. The game uses the installed Three.js package, not the original standalone prototype's external CDN scripts.

## Try it
1. From the main menu choose **AVATAR STUDIO**.
2. Drag the preview to rotate; use left/right arrows to change skin, hair, hair color, top, top color, pants, and shoes.
3. Enter a handle and press **CONFIRM**. Reload and reopen the studio to check persistence.
4. Choose **JACK IN** to see the same character rig in the world. Remote Lounge players use the same procedural factory with server-constrained appearance fields.

## Verification
- `npm run build`
- `npm test`
- `npm run test:browser`
- `tests/character-select.test.ts` checks appearance options and named joints required by the existing animation/boxing system.
- Browser test checks editing, CONFIRM and persistence after reload.

## Known limitations
- The new screen exposes seven options from the supplied design plus legacy saved choices. Previous advanced accessory controls and local GLB upload are **not yet exposed in the redesigned UI**; existing saved accessories remain rendered by the shared avatar model.
- A physical iPhone and multiplayer visual appearance have not been manually verified. Playwright's 390×844 test is an emulator.
- This change does not add a hosted multiplayer server or alter 60 Hz movement physics.
