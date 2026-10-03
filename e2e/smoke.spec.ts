import { expect, test, type ConsoleMessage } from "@playwright/test";

/**
 * Every launched route renders: a 200, the page's own heading, and no
 * error written to the browser console. Series and article pages take
 * the first code and slug the listing pages link to, so the test follows
 * whatever catalogue the build read.
 */
const ROUTES: { path: string; heading: RegExp }[] = [
  { path: "/", heading: /market intelligence for the wine industry/i },
  { path: "/markets", heading: /markets/i },
  { path: "/markets/bulk-wine", heading: /bulk wine/i },
  { path: "/markets/grapes", heading: /grape/i },
  { path: "/markets/must-concentrates", heading: /must/i },
  { path: "/markets/compare", heading: /compar/i },
  { path: "/supply", heading: /supply|availability/i },
  { path: "/supply/production", heading: /production/i },
  { path: "/supply/stocks", heading: /stocks/i },
  { path: "/harvest", heading: /harvest/i },
  { path: "/trade", heading: /imports and exports/i },
  { path: "/outlook", heading: /./ },
  { path: "/insights", heading: /insights/i },
  { path: "/insights/analysis", heading: /analysis/i },
  { path: "/insights/news", heading: /news/i },
  { path: "/insights/weekly-briefing", heading: /weekly briefing/i },
  { path: "/insights/methodology", heading: /methodology/i },
  { path: "/about", heading: /market desk/i },
  { path: "/contact", heading: /contact/i },
  { path: "/briefing", heading: /every friday/i },
  { path: "/terms", heading: /terms/i },
  { path: "/privacy", heading: /privacy/i },
];

/** Messages the page writes that count as failures. */
function isPageError(message: ConsoleMessage): boolean {
  if (message.type() !== "error") return false;
  // A blocked third-party request is the sandbox's doing, not the page's.
  return !/net::ERR_|Failed to load resource/.test(message.text());
}

for (const route of ROUTES) {
  test(`renders ${route.path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (isPageError(message)) errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    const response = await page.goto(route.path);
    expect(response?.status(), `${route.path} status`).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      route.heading,
    );
    expect(errors, `${route.path} console errors`).toEqual([]);
  });
}

test("follows a series link from the bulk wine table", async ({ page }) => {
  await page.goto("/markets/bulk-wine");
  const link = page.locator('a[href^="/markets/series/"]').first();
  const href = await link.getAttribute("href");
  expect(href).toBeTruthy();
  const response = await page.goto(href!);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Current price")).toBeVisible();
});

test("follows an article link from the analysis listing", async ({ page }) => {
  await page.goto("/insights/analysis");
  const link = page.locator('a[href^="/insights/analysis/"]').first();
  const href = await link.getAttribute("href");
  expect(href).toBeTruthy();
  const response = await page.goto(href!);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("serves the sitemap and robots", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("<urlset");
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap:");
});

test("unknown routes return the not-found page", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
});
