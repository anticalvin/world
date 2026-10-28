import * as THREE from "three";

/** Preserve authored bitmap pixels on 3D props instead of applying scanlines. */
export function configureBitmapTexture(texture: THREE.Texture): THREE.Texture {
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestMipmapNearestFilter;
  texture.generateMipmaps = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function bitmapMaterial(texture: THREE.Texture): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({
    map: configureBitmapTexture(texture),
    flatShading: true,
  });
}

/** A local PNG can be mapped to any UV-equipped mesh. Never execute uploaded content. */
export async function loadBitmapPng(file: File): Promise<THREE.Texture> {
  if (file.type !== "image/png" || file.size > 2 * 1024 * 1024)
    throw new Error("Bitmap must be a PNG under 2 MB");
  const bitmap = await createImageBitmap(file);
  if (bitmap.width > 1024 || bitmap.height > 1024) {
    bitmap.close();
    throw new Error("Bitmap dimensions must be at most 1024 × 1024");
  }
  return configureBitmapTexture(new THREE.CanvasTexture(bitmap));
}
