import { expect, type Page, test } from "@playwright/test";
import { copy } from "../content/copy";

/** Collects anything the page logs as an error, so tests can assert there was none. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

test("the home page loads cleanly and says what the app is", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(copy.hero.title);
  await expect(page).toHaveTitle(copy.meta.title);
  for (const promise of ["Free", "No ads", "No in-app purchases"]) {
    await expect(page.getByTestId("hero-promises").getByText(promise, { exact: true })).toBeVisible();
  }
  const badge = page.getByTestId("app-store-badge").first();
  await expect(badge.getByAltText("Download on the App Store")).toBeVisible();
  // Walk the whole page so lazy sections mount before checking for errors.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
  });
  await expect(page.getByRole("contentinfo")).toBeVisible();
  expect(errors).toEqual([]);
});

test("the site promises only what was agreed: no ads and no in-app purchases", async ({ page }) => {
  await page.goto("/");
  const text = (await page.locator("body").innerText()).toLowerCase();
  expect(text).toContain("no ads");
  expect(text).toContain("no in-app purchases");
  for (const claim of ["no tracking", "no data collection", "we never collect", "100% private"]) {
    expect(text).not.toContain(claim);
  }
});

test("the hero plays the Remotion composition", async ({ page }) => {
  await page.goto("/");
  const reel = page.getByTestId("hero-reel");
  await expect(reel).toHaveAttribute("data-animated", "true");
  const player = reel.locator(".__remotion-player");
  await expect(player).toBeVisible({ timeout: 15_000 });
  // The composition has mounted and is drawing: its wordmark is on screen in the first seconds.
  await expect(reel.getByText("Paw Party", { exact: true })).toBeAttached({ timeout: 15_000 });
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the hero shows a still and nothing auto-plays", async ({ page }) => {
    await page.goto("/");
    const reel = page.getByTestId("hero-reel");
    await expect(reel).toHaveAttribute("data-animated", "false");
    await expect(reel.locator(".__remotion-player")).toHaveCount(0);
    await expect(reel.locator("img")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // The demo waits for a click instead of starting on its own.
    await page.getByTestId("demo-canvas").scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: copy.demo.start })).toBeVisible();
    await expect(page.getByTestId("demo-canvas")).toHaveAttribute("data-status", "idle");
  });
});

test("the demo runs and a click on the mouse scores", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  const canvas = page.getByTestId("demo-canvas");
  await canvas.scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute("data-status", "playing", { timeout: 15_000 });
  await expect(page.getByTestId("demo-caught")).toHaveText("0");

  // Chase the mouse until one click lands. It moves, so allow a few tries.
  await expect(async () => {
    const box = await canvas.boundingBox();
    const spot = await page.evaluate(() => Array.from(window.pawPartyDemo?.first_mouse() ?? []));
    expect(box).not.toBeNull();
    expect(spot).toHaveLength(2);
    if (!box) return;
    const inside = spot[0] > 10 && spot[1] > 10 && spot[0] < box.width - 10 && spot[1] < box.height - 10;
    expect(inside).toBe(true);
    await page.mouse.click(box.x + spot[0], box.y + spot[1]);
    await expect(page.getByTestId("demo-caught")).not.toHaveText("0", { timeout: 300 });
  }).toPass({ timeout: 30_000 });

  expect(Number(await page.getByTestId("demo-score").innerText())).toBeGreaterThanOrEqual(10);
  expect(errors).toEqual([]);
});

test("a click on empty floor is a miss, not a catch", async ({ page }) => {
  await page.goto("/");
  const canvas = page.getByTestId("demo-canvas");
  await canvas.scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute("data-status", "playing", { timeout: 15_000 });
  const result = await page.evaluate(() => {
    const demo = window.pawPartyDemo;
    if (!demo) return null;
    // Far outside any mouse: the corner of a very large coordinate space is always empty.
    return { caught: demo.tap(-5000, -5000), catches: demo.catches, score: demo.score };
  });
  expect(result).toEqual({ caught: false, catches: 0, score: 0 });
});

test("all eleven games are listed with a clip and a poster that exist", async ({ page, request }) => {
  await page.goto("/");
  const cards = page.getByTestId("game-card");
  await expect(cards).toHaveCount(11);
  for (const game of copy.games.items) {
    await expect(page.getByRole("heading", { name: new RegExp(`${game.name}$`) })).toBeAttached();
    const video = page.locator(`video[data-game="${game.id}"]`);
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute("preload", "none");
    expect((await request.get(`/video/${game.id}.jpg`)).status()).toBe(200);
    const clip = await request.head(`/video/${game.id}.mp4`);
    expect(clip.status()).toBe(200);
    expect(clip.headers()["content-type"]).toContain("video/mp4");
  }
});

test("on a wide screen the page scroll moves the game shelf sideways", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const shelf = page.getByTestId("games-shelf");
  await shelf.scrollIntoViewIfNeeded();
  const before = (await shelf.boundingBox())?.x ?? 0;
  await page.mouse.wheel(0, 2400);
  await page.waitForTimeout(1200);
  const after = (await shelf.boundingBox())?.x ?? 0;
  expect(after).toBeLessThan(before - 200);
});

test("nothing spills sideways on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("the privacy page is marked as a draft and kept out of search", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(copy.privacy.title);
  await expect(page.getByTestId("draft-note")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  for (const section of copy.privacy.sections) {
    await expect(page.getByRole("heading", { name: section.heading })).toBeVisible();
  }
});

test("the support page works without a contact address", async ({ page }) => {
  await page.goto("/support");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(copy.support.title);
  await expect(page.getByTestId("support-contact")).toHaveText(copy.support.noContact);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});

test("footer links, sitemap and robots are in place", async ({ page, request }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Privacy" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/privacy");
  expect(sitemap).toContain("/support");
  expect(await (await request.get("/robots.txt")).text()).toContain("sitemap.xml");
});
