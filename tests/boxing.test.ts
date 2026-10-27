import { describe, expect, it } from "vitest";
import { createBoxer, punch, ringPosition, tickBoxer, takeHit } from "../src/game/boxing";
describe("DELTA-9 solo boxing", () => {
  it("has distinct left and right punches with cooldown and stamina", () => {
    const b=createBoxer();
    const left=punch(b,"left");
    expect(left.landed).toBe(true);
    expect(left.damage).toBe(8);
    expect(b.stamina).toBe(90);
    expect(punch(b,"right").landed).toBe(false);
    tickBoxer(b,0.3);
    const right=punch(b,"right");
    expect(right.landed).toBe(true);
    expect(right.damage).toBe(14);
  });
  it("clamps to the ropes and indicates a bounce", () => {
    expect(ringPosition(99,-99)).toEqual({x:4.2,z:-8.2,bounced:true});
    expect(ringPosition(0,-4).bounced).toBe(false);
  });
  it("guard reduces damage", () => {
    const b=createBoxer(); b.guarding=true;
    takeHit(b,20);
    expect(b.health).toBe(95);
  });
});
