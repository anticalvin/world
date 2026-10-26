// Runtime shared by the Node Colyseus server and browser-side bounds wrapper.
export const LOUNGE_RADIUS = 40;
export const LOUNGE_PLAYER_RADIUS = 0.34;
export const LOUNGE_WALKABLE_RADIUS = LOUNGE_RADIUS - LOUNGE_PLAYER_RADIUS;
export const FALL_RESPAWN_Y = -12;
export function clampLoungeXZ(x, z) {
  const d = Math.hypot(x, z);
  if (d <= LOUNGE_WALKABLE_RADIUS) return { x, z };
  const scale = LOUNGE_WALKABLE_RADIUS / d;
  return { x: x * scale, z: z * scale };
}
