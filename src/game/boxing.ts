export type Hand = "left" | "right";
export type Boxer = { stamina: number; health: number; cooldown: number; combo: number; guarding: boolean };
export const RING_HALF_WIDTH = 4.2;
export const RING_MIN_Z = -8.2;
export const RING_MAX_Z = 0.2;
export const createBoxer = (): Boxer => ({ stamina: 100, health: 100, cooldown: 0, combo: 0, guarding: false });
export function tickBoxer(boxer: Boxer, dt: number) {
  boxer.cooldown = Math.max(0, boxer.cooldown - dt);
  boxer.stamina = Math.min(100, boxer.stamina + (boxer.guarding ? 7 : 16) * dt);
}
export function punch(boxer: Boxer, hand: Hand): { landed: boolean; damage: number; hand: Hand } {
  const cost = hand === "left" ? 10 : 17;
  if (boxer.cooldown > 0 || boxer.stamina < cost) return { landed: false, damage: 0, hand };
  boxer.stamina -= cost;
  boxer.cooldown = hand === "left" ? 0.22 : 0.4;
  boxer.combo = (boxer.combo + 1) % 4;
  return { landed: true, damage: hand === "left" ? 8 : 14, hand };
}
export function takeHit(boxer: Boxer, damage: number) {
  boxer.health = Math.max(0, boxer.health - damage * (boxer.guarding ? 0.25 : 1));
}
export function ringPosition(x: number, z: number) {
  const nx = Math.max(-RING_HALF_WIDTH, Math.min(RING_HALF_WIDTH, x));
  const nz = Math.max(RING_MIN_Z, Math.min(RING_MAX_Z, z));
  return { x: nx, z: nz, bounced: nx !== x || nz !== z };
}
