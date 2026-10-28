import { expect, test } from "@playwright/test";

for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
  test(`visible nonblank WebGL world at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.getByRole("button", { name: "JACK IN" }).click();
    await expect(page.locator("#where")).toContainText("AWAKEN Lounge");
    const canvas = page.locator("#app > canvas").first();
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(500);
    const dimensions = await canvas.evaluate((c: HTMLCanvasElement) => ({
      internalWidth: c.width, internalHeight: c.height,
      cssWidth: c.getBoundingClientRect().width,
      cssHeight: c.getBoundingClientRect().height,
    }));
    expect(dimensions.internalWidth).toBeGreaterThan(200);
    expect(dimensions.internalHeight).toBeGreaterThan(200);
    expect(dimensions.cssWidth).toBeGreaterThan(300);
    expect(dimensions.cssHeight).toBeGreaterThan(500);
    const png = await canvas.screenshot({ path: `test-results/visible-world-${viewport.width}.png` });
    const stats = await page.evaluate(async (base64: string) => {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
      const output = document.createElement("canvas");
      output.width = 64; output.height = 64;
      const context = output.getContext("2d")!;
      context.drawImage(bitmap, 0, 0, 64, 64);
      const rgba = context.getImageData(0, 0, 64, 64).data;
      const colors = new Set<string>();
      let bright = 0;
      for (let i = 0; i < rgba.length; i += 4) {
        colors.add(`${rgba[i] >> 4},${rgba[i + 1] >> 4},${rgba[i + 2] >> 4}`);
        if (rgba[i] + rgba[i + 1] + rgba[i + 2] > 75) bright++;
      }
      bitmap.close();
      return { distinctColors: colors.size, brightFraction: bright / 4096 };
    }, png.toString("base64"));
    expect(stats.distinctColors).toBeGreaterThan(12);
    expect(stats.brightFraction).toBeGreaterThan(0.03);
  });
}
