/**
 * Render the complete 3D scene into a deliberately low-resolution canvas.
 * CSS nearest-neighbor scaling enlarges real rendered pixels, including avatars,
 * NPCs, imported GLBs, particles and world geometry, without obscuring HTML UI.
 */
export const WORLD_PIXEL_SIZE = 3;
export function pixelRenderSize(width: number, height: number, pixelSize = WORLD_PIXEL_SIZE) {
  const scale = Math.max(1, Math.floor(pixelSize));
  return {
    width: Math.max(1, Math.ceil(width / scale)),
    height: Math.max(1, Math.ceil(height / scale)),
  };
}
