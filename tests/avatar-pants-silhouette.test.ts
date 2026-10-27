import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { builtIn, defaults } from "../src/avatar/avatar";

describe("Character Select pant silhouette", () => {
  const avatar = (pants: "cargo" | "jeans" | "shorts") => builtIn({ ...defaults, pants, hat:"none", backpack:"none" });
  it("cargo and jeans have a wider leg silhouette than shorts", () => {
    const short = avatar("shorts");
    const shortsThigh = short.getObjectByName("THIGH") as THREE.Mesh;
    const shortWidth = new THREE.Box3().setFromObject(shortsThigh).getSize(new THREE.Vector3()).x;
    for (const pants of ["cargo", "jeans"] as const) {
      const model = avatar(pants);
      const thigh = model.getObjectByName("THIGH") as THREE.Mesh;
      const width = new THREE.Box3().setFromObject(thigh).getSize(new THREE.Vector3()).x;
      expect(width).toBeGreaterThan(shortWidth + 0.04);
      const left = model.getObjectByName("LEFT_UPPER_LEG")!;
      const right = model.getObjectByName("RIGHT_UPPER_LEG")!;
      expect(left.position.x).toBeLessThan(0);
      expect(right.position.x).toBeGreaterThan(0);
      expect(right.position.x - left.position.x).toBeGreaterThan(0.4);
    }
  });
  it("wide pants preserve floor contact and articulated joints", () => {
    for (const pants of ["cargo", "jeans"] as const) {
      const model = avatar(pants);
      const shoe = model.getObjectByName("SHOE") as THREE.Mesh;
      expect(new THREE.Box3().setFromObject(shoe).min.y).toBeCloseTo(0, 3);
      for (const name of ["LEFT_UPPER_LEG", "RIGHT_UPPER_LEG", "LEFT_LOWER_LEG", "RIGHT_LOWER_LEG", "LEFT_FOOT", "RIGHT_FOOT"]) {
        expect(model.getObjectByName(name), name).toBeTruthy();
      }
    }
  });
});
