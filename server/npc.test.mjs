import test from "node:test";
import assert from "node:assert/strict";
import { loungeNpcs, NPC_IDS } from "./npc.mjs";

test("NPC population is stable and distinct from client session IDs", () => {
  const first = loungeNpcs(0);
  const later = loungeNpcs(120);
  assert.deepEqual(first.map(n => n.id), NPC_IDS);
  assert.deepEqual(later.map(n => n.id), NPC_IDS);
  assert.ok(first.every(n => n.npc === true && n.name.includes("NPC")));
  assert.notDeepEqual(first.map(n => n.x), later.map(n => n.x));
});
test("NPCs stay within Lounge walkable bounds and produce finite positions", () => {
  for (const t of [0, 1, 100, 10000, NaN, -3]) {
    for (const npc of loungeNpcs(t)) {
      assert.ok([npc.x, npc.z, npc.yaw].every(Number.isFinite));
      assert.ok(Math.hypot(npc.x, npc.z) <= 8.01);
    }
  }
});
