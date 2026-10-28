import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { applyForwardPunch } from "../src/game/punch-pose";
import { configureBitmapTexture, bitmapMaterial } from "../src/render/bitmap";

describe("forward punch pose", () => {
  for (const hand of ["left", "right"] as const) {
    it(hand + " fist extends in the avatar's forward +Z direction", () => {
      const shoulder = new THREE.Group();
      const elbow = new THREE.Group();
      elbow.name = (hand === "left" ? "LEFT" : "RIGHT") + "_LOWER_ARM";
      elbow.position.y = -0.34;
      const fist = new THREE.Object3D();
      fist.position.y = -0.27;
      elbow.add(fist);
      shoulder.add(elbow);
      applyForwardPunch(shoulder, hand);
      shoulder.updateMatrixWorld(true);
      expect(fist.getWorldPosition(new THREE.Vector3()).z).toBeGreaterThan(0.3);
    });
  }
});
describe("bitmap material", () => {
  it("preserves pixels with nearest filtering and sRGB colors", () => {
    const texture = configureBitmapTexture(new THREE.Texture());
    expect(texture.magFilter).toBe(THREE.NearestFilter);
    expect(texture.minFilter).toBe(THREE.NearestMipmapNearestFilter);
    expect(texture.colorSpace).toBe(THREE.SRGBColorSpace);
    expect(bitmapMaterial(texture).map).toBe(texture);
  });
});
