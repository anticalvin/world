import { describe, expect, it } from "vitest";
import { sanitizeAvatar, builtIn, defaults, randomAvatar } from "../src/avatar/avatar";
import { SKIN, HAIR_COLORS, TOP_COLORS } from "../src/avatar/character-studio";

describe("Character Select integration", () => {
  it("new avatars do not have surprise face masks or backpack panels", () => {
    for (const seed of [1, 1234, 142857, 99999]) {
      const c = randomAvatar(seed);
      expect(c.mask).toBe("none");
      expect(c.backpack).toBe("none");
      const model = builtIn(c);
      expect(model.getObjectByName("MASK")).toBeUndefined();
      expect(model.getObjectByName("BACKPACK")).toBeUndefined();
    }
  });
  it("preserves older saved accessories until the user removes them", () => {
    const c = sanitizeAvatar({ ...defaults, mask:"neon", backpack:"pack" });
    const model = builtIn(c);
    expect(model.getObjectByName("MASK")).toBeTruthy();
    expect(model.getObjectByName("BACKPACK")).toBeTruthy();
  });
  it("retains the user's new hair and clothing choices", () => {
    for (const hair of ["twists","buzz","afro","braids","bald"] as const) {
      expect(sanitizeAvatar({ ...defaults, hair }).hair).toBe(hair);
    }
    for (const top of ["tee","tank","hoodie"] as const) {
      expect(sanitizeAvatar({ ...defaults, top }).top).toBe(top);
    }
    expect(sanitizeAvatar({ ...defaults, pants:"jeans" }).pants).toBe("jeans");
  });
  it("uses the same joint names as movement and boxing animations", () => {
    const model = builtIn(sanitizeAvatar({ ...defaults, hair:"twists", top:"tee" }));
    for (const joint of ["LEFT_UPPER_ARM","RIGHT_UPPER_ARM","LEFT_LOWER_ARM","RIGHT_LOWER_ARM","LEFT_UPPER_LEG","RIGHT_UPPER_LEG","LEFT_LOWER_LEG","RIGHT_LOWER_LEG","LEFT_FOOT","RIGHT_FOOT"]) {
      expect(model.getObjectByName(joint),joint).toBeTruthy();
    }
    expect(model.userData.procedural).toBe(true);
  });
  it("offers the original skin and hair palettes without remote assets", () => {
    expect(SKIN).toHaveLength(6);
    expect(HAIR_COLORS).toHaveLength(6);
    expect(TOP_COLORS).toHaveLength(6);
  });
});
