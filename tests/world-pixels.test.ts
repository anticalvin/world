import { describe, it, expect } from "vitest";
import { createWorldScene } from "../src/worlds/scenes";
import * as THREE from "three";

describe("pixel-art world renderer", () => {
  it("maps nearest-neighbor bitmap textures onto real world geometry", () => {
    const original = document.createElement;
    expect(typeof original).toBe("function");
    const group = createWorldScene("awaken-lounge");
    let mapped = 0;
    group.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const material = object.material;
      if (!(material instanceof THREE.MeshStandardMaterial) || !material.map) return;
      mapped++;
      expect(material.map.magFilter).toBe(THREE.NearestFilter);
    });
    expect(mapped).toBeGreaterThan(5);
  });
});
