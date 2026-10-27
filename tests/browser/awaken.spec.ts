import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`loads and enters at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "AWAKEN" })).toBeVisible();
    await page.getByRole("button", { name: "JACK IN" }).click();
    await expect(page.locator("#where")).toContainText("AWAKEN Lounge");
    await page.keyboard.press("KeyV");
    await page.keyboard.down("KeyW");
    await page.waitForTimeout(300);
    await page.keyboard.up("KeyW");
  });
}

test("two real browser clients meet, move, chat, disconnect and reconnect", async ({
  browser,
}) => {
  const first = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const second = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const alpha = await first.newPage();
  const beta = await second.newPage();
  for (const page of [alpha, beta]) {
    await page.goto("/");
    await page.getByRole("button", { name: "JACK IN" }).click();
    await expect(page.locator("#network-status")).toHaveText(
      "CONNECTED · LIVE LOUNGE",
    );
  }
  await expect
    .poll(() =>
      alpha.evaluate(() => (window as any).__AWAKEN_DEBUG?.remoteCount),
    )
    .toBe(1);
  await expect
    .poll(() =>
      beta.evaluate(() => (window as any).__AWAKEN_DEBUG?.remoteCount),
    )
    .toBe(1);
  const before = await beta.evaluate(
    () => (window as any).__AWAKEN_DEBUG?.remotePosition?.z,
  );
  await alpha.keyboard.down("KeyW");
  await alpha.waitForTimeout(550);
  await alpha.keyboard.up("KeyW");
  await expect
    .poll(() =>
      beta.evaluate(() => (window as any).__AWAKEN_DEBUG?.remotePosition?.z),
    )
    .not.toBe(before);
  await alpha.locator("#chat-toggle").click();
  await beta.locator("#chat-toggle").click();
  await alpha.getByRole("textbox", { name: "Lounge chat" }).fill("hello beta");
  await alpha.getByRole("button", { name: "SEND" }).click();
  await expect(beta.getByText("WANDERER: hello beta")).toBeVisible();
  await beta.screenshot({ path: "test-results/lounge-two-client.png" });
  await alpha.close();
  await expect
    .poll(() =>
      beta.evaluate(() => (window as any).__AWAKEN_DEBUG?.remoteCount),
    )
    .toBe(0);
  const alphaAgain = await first.newPage();
  await alphaAgain.goto("/");
  await expect(alphaAgain.getByRole("button", { name: "JACK IN" })).toBeEnabled({ timeout: 20000 });
  await alphaAgain.getByRole("button", { name: "JACK IN" }).click();
  await expect
    .poll(() =>
      beta.evaluate(() => (window as any).__AWAKEN_DEBUG?.remoteCount),
    )
    .toBe(1);
  await first.close();
  await second.close();
});

test("Avatar Studio saves a wardrobe preset", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "AVATAR STUDIO" }).click();
  await expect(
    page.getByRole("heading", { name: "AVATAR STUDIO" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "crown" }).click();
  await page.getByRole("button", { name: "SAVE LOOK" }).click();
  await expect(page.getByRole("heading", { name: "AWAKEN" })).toBeVisible();
  await page.screenshot({ path: "test-results/avatar-studio.png" });
});

test("mobile chat starts closed and can be toggled without blocking movement", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto("/");
  await page.getByRole("button", { name: "JACK IN" }).click();
  const chat = page.locator("#lounge-chat");
  await expect(chat).toBeHidden();
  await page.locator("#chat-toggle").click();
  await expect(chat).toBeVisible();
  await page.locator("#chat-toggle").click();
  await expect(chat).toBeHidden();
  await expect(page.locator("#mjump")).toBeVisible();
  await expect(page.locator("#stick")).toBeVisible();
  await context.close();
});
