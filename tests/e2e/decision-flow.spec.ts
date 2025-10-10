import { test, expect } from "@playwright/test";

test.describe.skip("Socratic decision flow", () => {
  test("creates decision, runs flow, exports brief", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /ask sharper questions/i })).toBeVisible();
    // Full end-to-end flow requires running Next.js server and seeded database.
  });
});
