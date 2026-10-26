// Shared by browser and Colyseus server. The visible Lounge ground has radius 40.
export const LOUNGE_RADIUS = 40;
export const LOUNGE_PLAYER_RADIUS = 0.34;
export const LOUNGE_WALKABLE_RADIUS = LOUNGE_RADIUS - LOUNGE_PLAYER_RADIUS;
export const FALL_RESPAWN_Y = -12;
export function clampLoungeXZ(x: number, z: number) {
  const d = Math.hypot(x, z);
  if (d <= LOUNGE_WALKABLE_RADIUS) return { x, z };
  const scale = LOUNGE_WALKABLE_RADIUS / d;
  return { x: x * scale, z: z * scale };
}
