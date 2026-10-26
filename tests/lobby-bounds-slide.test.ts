import { describe, expect, it } from "vitest";
import { LOUNGE_RADIUS, LOUNGE_WALKABLE_RADIUS, clampLoungeXZ } from "../src/sdk/lounge-bounds";
import { createMotor, simulate, tuning, TICK } from "../src/movement/motor";
import { worlds } from "../src/sdk/worlds";

describe("40-unit Lounge boundary", () => {
  it("matches visible radius and gives the player capsule clearance", () => {
    expect(LOUNGE_RADIUS).toBe(40);
    expect(LOUNGE_WALKABLE_RADIUS).toBeCloseTo(39.66);
    const floor = worlds.find(w => w.id === "awaken-lounge")!.scene.colliders[0];
    expect(floor.size[0]).toBe(80);
    expect(floor.size[2]).toBe(80);
    const edge = clampLoungeXZ(100, 0);
    expect(edge.x).toBeCloseTo(LOUNGE_WALKABLE_RADIUS);
    expect(edge.z).toBe(0);
  });
});

describe("slide burst", () => {
  it("accelerates to slideSpeed and preserves heading while decaying", () => {
    const s = createMotor();
    s.velocity.z = -tuning.walk;
    const input = { forward: 1, right: 0, yaw: 0, slide: true };
    simulate(s, input, TICK, true);
    const initial = Math.hypot(s.velocity.x, s.velocity.z);
    expect(s.slide).toBeGreaterThan(0);
    expect(initial).toBeGreaterThan(tuning.sprint);
    expect(initial).toBeLessThanOrEqual(tuning.slideSpeed);
    for (let i = 0; i < 10; i++) simulate(s, {forward:0,right:1,yaw:0}, TICK, true);
    expect(s.velocity.z).toBeLessThan(0);
    expect(Math.abs(s.velocity.x)).toBeLessThan(0.001);
    expect(Math.hypot(s.velocity.x,s.velocity.z)).toBeLessThan(initial);
  });
});
