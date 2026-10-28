import { test, expect } from "@playwright/test";

test("bitmap studio paints pixels and places a textured world prop", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "JACK IN" }).click();
  await page.locator("#bitmap-open").click();
  const studio = page.getByRole("region", { name: "Bitmap Studio" });
  await expect(studio).toBeVisible();
  const canvas = studio.getByLabel("32 by 32 bitmap painting canvas");
  const before = await canvas.evaluate((element: HTMLCanvasElement) =>
    element.getContext("2d")!.getImageData(0, 0, 1, 1).data[0]);
  await studio.getByRole("button", { name: "Paint #ffffff" }).click();
  await canvas.click({ position: { x: 4, y: 4 } });
  const after = await canvas.evaluate((element: HTMLCanvasElement) =>
    element.getContext("2d")!.getImageData(0, 0, 1, 1).data[0]);
  expect(after).not.toBe(before);
  await studio.getByRole("button", { name: "PLACE CUBE" }).click();
  await expect(studio).toBeHidden();
  await page.locator("#bitmap-open").click();
  await expect(studio).toBeVisible();
  await expect(canvas).toBeVisible();
});
