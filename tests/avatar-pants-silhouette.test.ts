import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { builtIn, defaults } from "../src/avatar/avatar";

describe("Character Select pant silhouette", () => {
  const avatar = (pants: "cargo" | "jeans" | "shorts") => builtIn({ ...defaults, pants, hat:"none", backpack:"none" });
  it("matches the user's Character Select 2 cargo and jeans radii", () => {
    const cargo = avatar("cargo"), jeans = avatar("jeans"), shorts = avatar("shorts");
    const radii = (model: THREE.Group) => {
      const thigh = model.getObjectByName("THIGH") as THREE.Mesh;
      const shin = model.getObjectByName("SHIN") as THREE.Mesh;
      return {
        thigh: (thigh.geometry as THREE.CylinderGeometry).parameters,
        shin: (shin.geometry as THREE.CylinderGeometry).parameters,
        hip: model.getObjectByName("RIGHT_UPPER_LEG")!.position.x
      };
    };
    expect(radii(cargo).thigh.radiusTop).toBeCloseTo(0.13);
    expect(radii(cargo).thigh.radiusBottom).toBeCloseTo(0.19 * 1.15);
    expect(radii(jeans).thigh.radiusBottom).toBeCloseTo(0.19 * 0.85);
    expect(radii(cargo).shin.radiusTop).toBeCloseTo(0.19 * 1.15);
    expect(radii(jeans).shin.radiusTop).toBeCloseTo(0.19 * 0.85);
    for (const model of [cargo, jeans, shorts]) {
      expect(radii(model).hip).toBeCloseTo(0.15);
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
