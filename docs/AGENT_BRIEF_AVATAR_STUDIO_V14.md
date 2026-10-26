# AWAKEN v1.4: Character Creator, Wardrobe & Shareable Avatar Identity

**Base branch:** `v1.3.1-real-multiplayer` at `f08f0fc8cff678e6e7a931c3e412010249edb1bc`.

## Product intent
Make avatar creation a major standalone destination. Design an original stylized, modular low-poly/blocky character system inspired by the *flexibility* of Roblox and readability of Minecraft, not copied branded assets. Distinct full bodies with articulated arms and legs, non-pink random default outfits, hats, hair, masks, tops, pants, shoes and accessories. Give players creative freedom while keeping mobile frame times and multiplayer payloads small.

## Verified current gaps
- `src/avatar/avatar.ts` built-ins are a cone/cylinder torso and sphere head with no articulated limbs; defaults use pink geisha.
- New avatar saved under one localStorage config and GLB stored under IndexedDB key `active`, preventing true avatar collections.
- `src/main.ts` avatar UI is a small `<details>` element; no full-screen preview, body-part editor or wardrobe.
- Multiplayer `server/index.mjs` Player schema sends only `name` and `style`, so colors and wearables are invisible to other players.
- Remote player rendering calls `builtIn({...cfg, style:p.style})`, mixing the local player's colors with every remote avatar. This is a **confirmed cross-player appearance bug**. Fix by constructing each remote model strictly from a validated remote avatar appearance, never local `cfg`.

## Delivery stages

### Stage 0: Regression guard
Save screenshots and establish running build, all five worlds, real two-client Lounge, chat, disconnect/reconnect, portals, touch controls, imported GLB, Miko landmark. Keep `main` unchanged; work on feature branch. Refactor incrementally and maintain passing tests.

### Stage 1: Shared modular rig
Implement `AvatarDefinitionV2` with versioned migration from `awaken-avatar-v12` and defaults. Make full body from modular articulated meshes: head, neck optional, torso, left/right upper and lower arms, hands, left/right upper and lower legs, feet. Consistent pivot points and named attachment sockets: HEAD_TOP, HEAD_FACE, BACK, LEFT_HAND, RIGHT_HAND, TORSO, FEET. Provide at least two silhouettes: blocky and stylized. Match the existing Rapier capsule footprint without affecting game collision; adjust rendering only. Provide idle/walk/run/jump/slide limb movement driven from existing animation state. Preserve historical geisha/ronin/ghost/fox looks as presets, rather than deleting them.

### Stage 2: Real Avatar Studio screen
Accessible directly from Network Terminal, separate from world/game loop with its own scene/camera or isolated preview stage. Large rotatable/zoomable preview, front/back reset, undo/cancel/save, accessible mobile menus.
Tabs: BODY (shape, proportions within limits, body/skin color); FACE/HAIR (head, eyes, hair, colors); CLOTHING (tops, pants, shoes); ACCESSORIES (hats, glasses, masks, backpacks, handheld cosmetic); COLORS; MY AVATARS; IMPORT.
Make accessories attach to named sockets so they move with limbs/head; avoid arbitrary parenting offsets. Ship a compact usable free starter wardrobe: 4 hats, 3 hairstyles, 3 tops, 3 pants, 3 shoe designs, 2 glasses, 2 masks, 2 backpacks, with clear empty/none options. Tune performance for mobile, cap active accessories, avoid copyrighted third-party assets.

### Stage 3: Distinct random starters
Generate a color-coordinated avatar and optional starting outfit only ONCE for a new local identity. Vary clothing colors (not everyone pink), skin tones, hair colors, silhouettes, and sensible combinations. Make all colors manually editable. Do not randomize on every refresh, connection or world join. Generate and save a stable appearance seed; Randomize button explicitly generates a new option and allows undo/cancel. Preserve accessibility/contrast and avoid forced demographic assumptions. Show actual color swatches.

### Stage 4: Multiplayer synchronization
Add a schema-versioned, small `avatarAppearance` payload (preset ID or constrained color/part/accessory enum IDs, no binary data) to Lounge room join and avatar updates. Server validates whitelist, numeric bounds, hex colors or palette IDs, rate-limits updates and broadcasts authoritative sanitized appearance. Remote avatars render their OWN appearance, not spread local `cfg`. Appearance persists during movement and rejoin, updates live after save, and defaults gracefully on old clients. Keep imported GLBs local-only initially, with a distinctive safe remote fallback. Document privacy and no direct transfer of user files.

### Stage 5: Custom 3D model imports
Keep existing validated GLB input; add a multi-avatar IndexedDB library instead of overwriting `active`. Preview models before activation, file-size/geometry/material/texture limits, bounds/ground normalization, orientation check, rig detection, clipping checks, dispose on removal. Explicitly label static/unrigged GLB as non-animated or provide tested procedural fallback only when feasible. Research VRM import via `@pixiv/three-vrm` as a follow-on behind an optional lazy-loaded import, not a hard requirement for first delivery. Do not upload models or expose IndexedDB assets in Colyseus rooms. Server-side validation and authorized object storage are prerequisites for publishing avatars to other players. No fake claim that arbitrary GLB models are multiplayer-visible.

### Stage 6: Test gates
- New identity gets non-fixed, coordinated random colors, stable after reload.
- All body parts attach to correct pivots, move with animations; hat tracks head; backpacks track torso.
- Studio saves/cancels and swaps between multiple named presets without losing the old ones.
- Legacy avatar and existing GLB imports migrate with no data loss.
- Two separate browser clients with different colors, hats, body types see the SAME distinct looks on each other's remote player (and don't inherit local `cfg`).
- Live appearance update, disconnect/reconnect, and invalid payload rejection.
- Valid/invalid GLB file browser tests with committed fixtures, restored after refresh.
- Desktop/mobile UI no overlap; five worlds, portals, chat, movement remain functional.
- Browser screenshots of 3 clearly different avatars in-world and in Studio.
- Build, unit, and Playwright suites pass; report actual measured mobile performance.

## Engineering targets
Refactor avatar data, rig, renderer, accessories, preview stage and persistence into small modules without replacing Three.js/Rapier/Colyseus. Keep shared avatar schema and validation under a package or identical generated schema used by client/server. Avoid copying Roblox or Minecraft intellectual property. New code must maintain network backward compatibility where practical. Document exact persistence/migration/versioning behavior.

## Definition of done
A brand-new user starts with a uniquely colored articulated avatar (not the same default pink), opens a real Avatar Studio before entering a world, changes body/limbs and wardrobe including hats, saves at least 2 looks, reloads, and sees their selected outfit. A second real browser client simultaneously sees the first player's correct body style, colors and accessories. Local GLB import works and is explicitly flagged local-only for other players.

Deliver tested working implementation, screenshots, accurate README and agent handoff, and commit to the feature branch, not main.
