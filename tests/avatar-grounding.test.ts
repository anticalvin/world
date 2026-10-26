import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { builtIn, randomAvatar } from "../src/avatar/avatar";

describe("procedural avatar floor contact", () => {
  for (const body of ["blocky", "stylized"] as const) {
    it(`${body} has shoes at y=0 and no geometry below the ground`, () => {
      const avatar = builtIn({ ...randomAvatar(1234), body, hat: "cap" });
      avatar.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(avatar);
      expect(bounds.min.y).toBeGreaterThanOrEqual(-0.001);
      for (const side of ["LEFT", "RIGHT"]) {
        const shoe = avatar.getObjectByName(`${side}_FOOT`);
        expect(shoe).toBeTruthy();
        const footBounds = new THREE.Box3().setFromObject(shoe!);
        expect(footBounds.min.y).toBeCloseTo(0, 3);
      }
    });
  }
});
