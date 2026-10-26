# AWAKEN v1.2.1 restoration audit

## Recovery point

`recovery-v1.2.1-before-restoration` preserves the pre-restoration state. The baseline build and six tests passed before changes.

## Recovered locations

| World | Recovered/authored landmarks | Spawn |
| --- | --- | --- |
| AWAKEN Lounge | Torii gate, lanterns, koi pond, pavilion floor/columns/roof, AWAKEN sign, Miko | `[0, 1, 9]` (historic) |
| Koi Hours | Teal pond, walkway, perimeter lanterns | `[0, 1, 9]` (newly documented) |
| Rain Alley 404 | opposing alley walls and alternating neon signage | `[0, 1, 9]` (newly documented) |
| Neon Traverse | authored obstacle arrangement | `[0, 1, 9]` |
| DELTA-9 | raised ring and corner posts | `[0, 1, 9]` |

Visual roots are now separate from manifest Rapier colliders. The Lounge landmark positions are ported from `original-demo.html`; Koi, Alley, Traverse, and Delta-9 geometry remains a compact authored restoration rather than a claim of pixel-identical historic art.

## Navigation

The Lounge exposes portals to Traverse, Delta-9, Koi Hours, and Rain Alley. Every non-Lounge world has a Lounge return portal. `MENU` and Escape return to the directory and disable gameplay input.

## Remaining differences

Miko's visual landmark and proximity copy are restored, but the complete branching dialogue UI and a dedicated full-screen Avatar Studio remain incomplete. The current avatar controls retain persistence/import infrastructure but are still embedded in the terminal panel. Touch thumbstick controls and committed screenshot baselines are also outstanding.
