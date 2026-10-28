# AWAKEN Worlds: Phase 5 — Living World Rebuild

Status: **implementation specification only**. This branch does not yet contain the gameplay changes described below.

## Baseline and integration rule
- The repository's existing modular game is distinct from the experimental standalone Phase 4 HTML. Do not overwrite `index.html` or deploy the experimental prototype without porting and testing its systems.
- Preserve the existing character creator, correct character facing, working vehicle entry, and pixelated visual style.
- Maintain separate development checkpoints with tests and visible proof of function.

## A. World connectivity and mountain temple
1. Define an authoritative road graph (node ID, x/z coordinates, adjacency, lane width, surface type, district).
2. Derive visible road meshes, junction geometry, map lines, traffic routes and pedestrian paths from that graph, not independently authored rectangles.
3. Run BFS/DFS from city spawn to every drivable POI; reject disconnected graph components.
4. Report dead-end nodes. Allow them only when explicitly flagged as parking, lookout, cul-de-sac, pier, or destination.
5. Locate the *actual* temple entrance in the original temple transform, reserve the mountain approach, and create a continuous accessible path from the city to the torii entrance.
6. Add junction signs, a map destination label and an arrival landmark. Include a debug teleport to the entrance.
7. Test routes: city -> temple; city -> harbour; city -> Sandlands -> beach -> city.

## B. Shared physics, collision, damage
1. Inventory existing collision AABBs, original city instanced geometry, vehicles, poles, destructible buildings and apartment furniture.
2. Create one world entity registry with stable IDs and optional collider, health, damage, interaction, and render components.
3. Distinguish static blockers, dynamic bodies and triggers. Make destroyed geometry update/remove its colliders.
4. Use an optimized broadphase (spatial hash or physics engine) to avoid checking every object each frame on mobile.
5. Streetlight prototype: damage pole base -> disable emitted light -> tip toward impact over time -> ground contact -> persistent fallen collision shape.
6. Vehicle prototype: impact damage -> damaged visual state -> disabled driving -> persistent road-blocking wreck.
7. Building prototype: modular breakable panels/signage/windows and selected structural pieces; collapse to pooled rubble, not thousands of rigid bodies.
8. Verify: projectile impacts, correct hit registration, movement blocked by intact object, movement permitted after its destruction where appropriate.
9. Limit simultaneous debris and use fixed-step simulation; benchmark on mobile.

## C. NPC combat
1. NPC states: idle, patrol, alert, chase, attack, stagger, defeated, recovery/respawn.
2. Health, attack cooldown, distance checks, line of sight and knockback must use shared world entity and collision systems.
3. Melee should hit only a valid target in an arc/range, not every NPC within a radius.
4. NPC attacks should cause visible feedback and player damage; add invulnerability frames and a recovery path.
5. Test one-on-one fights before multiple opponents; ensure AI does not attack through walls.

## D. Apartment as a home
1. Reserve walkable zones and doors before placing decorative furniture; add collision for bed, kitchen, wardrobe, sofa and balcony rail.
2. Create distinct bedroom, living area, kitchen, wardrobe, bathroom and city-facing window/balcony.
3. Shared interaction prompts: bed -> choose sleep until morning/night; wardrobe -> open existing character creator while retaining current appearance; sofa -> sit and stand; balcony/window -> city-view camera; exit -> return to real loft entrance.
4. Keep home fast-travel inside map UI to avoid mobile overlay crowding.
5. Sleep changes game clock and refreshes lighting; sitting locks locomotion until stand action.
6. The window view must show the actual world or an intentionally synchronized scene, not an empty backdrop.
7. Test every action on desktop and touch controls.

## E. QA and release gates
- Automated checks: JavaScript syntax, road graph connectivity, valid POI entrances, collider registry consistency, state transitions.
- Browser checks: 8-way character facing, running, entering/exiting car, driving, map home travel, combat, apartment actions.
- Mobile checks: iPhone Brave touch overlap, simultaneous driving inputs, frame rate, render visibility, UI safe-area.
- Each feature reports: implemented / automated-test passed / browser-tested / device-tested.
- Do not merge into `main` or claim live deployment until the playable implementation passes these gates.

## Reference material
- https://rapier.rs/docs/
- https://threejs.org/docs/
- https://github.com/lanmower/Procedural-Cities
- https://github.com/jstrait/city-tour

Use reference algorithms only after verifying licenses and compatibility.
