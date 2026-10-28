// Server-owned background inhabitants. No LLM calls, credentials, or player slots.
export const NPC_IDS = ["npc-koi", "npc-ghost", "npc-neon"];
const NPCS = [
  { id: NPC_IDS[0], name: "KOI · NPC", style: "fox", radius: 3.5, phase: 0, speed: 0.13 },
  { id: NPC_IDS[1], name: "GHOST · NPC", style: "ghost", radius: 6, phase: 2.1, speed: -0.09 },
  { id: NPC_IDS[2], name: "NEON · NPC", style: "ronin", radius: 8, phase: 4.2, speed: 0.075 },
];
export function loungeNpcs(elapsedSeconds) {
  const t = Number.isFinite(elapsedSeconds) ? Math.max(0, elapsedSeconds) : 0;
  return NPCS.map(({ id, name, style, radius, phase, speed }) => {
    const angle = phase + t * speed;
    return {
      id, name, style, appearance: "",
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      yaw: -angle,
      npc: true,
    };
  });
}
