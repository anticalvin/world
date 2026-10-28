import { expect, test } from "@playwright/test";

test("RAW PIXEL CITY is reachable and returns to AWAKEN without losing controls", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /RAW PIXEL CITY/ })).toBeVisible();
  await page.getByRole("button", { name: /RAW PIXEL CITY/ }).click();
  await page.getByRole("button", { name: "JACK IN" }).click();
  const overlay = page.getByRole("region", { name: "RAW PIXEL CITY world" });
  await expect(overlay).toBeVisible();
  const frame = page.frameLocator("#raw-pixel-city-frame");
  await expect(frame.locator("#stage")).toBeVisible();
  await expect(frame.locator("#name")).toHaveValue("PLAYERONE");
  await expect(frame.locator("#menu")).toBeVisible();
  await page.getByRole("button", { name: "Return to AWAKEN Lounge" }).click();
  await expect(overlay).toHaveCount(0);
  await expect(page.locator("#where")).toContainText("AWAKEN Lounge");
  await expect(page.locator("#mjump")).toBeVisible();
});

test("city source retains original renderer, character creator and shader", async ({ request }) => {
  const response = await request.get("/raw-pixel-city.html");
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain("NEW GAME");
  expect(html).toContain("CKmk");
  expect(html).toContain("WebGLRenderTarget");
  expect(html).toContain("ShaderMaterial");
  expect(html).toContain("touchmove");
  expect(html).toContain("PIXELS:");
});
