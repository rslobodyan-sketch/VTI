import { expect, test } from "@playwright/test";
import { startClean, switchReader, MARCUS, SAM } from "./helpers";

test.describe("Calendars", () => {
  test("Admin month label, Previous, Next, Today (demo as-of)", async ({ page }) => {
    await startClean(page, "/admin/calendar");
    await expect(page.getByRole("button", { name: "Nov 2026" })).toHaveCount(0);
    const heading = page.locator("p.font-serif.text-2xl").first();
    await expect(heading).toBeVisible();
    const initial = (await heading.innerText()).trim();
    const label = page.getByText(initial, { exact: true });
    await expect(label.first()).toBeVisible();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(heading).not.toHaveText(initial);
    await page.getByRole("button", { name: "Previous" }).click();
    await expect(heading).toHaveText(initial);

    await page.getByRole("button", { name: "Today" }).click();
    await expect(heading).toHaveText("August 2026");
    await expect(page.getByText("August 2026").nth(1)).toBeVisible();
  });

  test("Admin seed events appear in November", async ({ page }) => {
    await startClean(page, "/admin/calendar");
    const heading = page.locator("p.font-serif.text-2xl").first();
    if ((await heading.innerText()) !== "November 2026") {
      for (let i = 0; i < 8; i += 1) {
        if ((await heading.innerText()) === "November 2026") break;
        await page.getByRole("button", { name: "Next", exact: true }).click();
      }
    }
    await expect(heading).toHaveText("November 2026");
    await expect(page.getByText("Walden University").first()).toBeVisible();
  });

  test("Reader calendar is assigned-only and navigable", async ({ page }) => {
    await startClean(page, "/reader/calendar");
    await switchReader(page, SAM);
    await expect(page.getByText("Your assigned ceremonies")).toBeVisible();
    await expect(page.getByRole("button", { name: "Nov 2026" })).toHaveCount(0);
    await expect(page.getByText("$2,800")).toHaveCount(0);
    await expect(page.getByText("last year")).toHaveCount(0);

    const heading = page.locator("p.font-serif.text-2xl").first();
    const initial = (await heading.innerText()).trim();
    await page.getByRole("button", { name: "Previous" }).click();
    await expect(heading).not.toHaveText(initial);
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(heading).toHaveText(initial);
    await page.getByRole("button", { name: "Today" }).click();
    await expect(heading).toHaveText(/2026|2025|2027/);

    await expect(page.getByRole("button", { name: "Print" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Export .ics" })).toBeVisible();
  });

  test("Reader print is wired and .ics contains assigned Walden", async ({ page }) => {
    await startClean(page, "/reader/calendar");
    await switchReader(page, MARCUS);
    const heading = page.locator("p.font-serif.text-2xl").first();
    if ((await heading.innerText()) !== "November 2026") {
      for (let i = 0; i < 8; i += 1) {
        if ((await heading.innerText()) === "November 2026") break;
        await page.getByRole("button", { name: "Next", exact: true }).click();
      }
    }
    await expect(heading).toHaveText("November 2026");

    await page.evaluate(() => {
      window.print = () => {
        (window as Window & { __vtiPrintCalled?: boolean }).__vtiPrintCalled = true;
      };
    });
    await page.getByRole("button", { name: "Print" }).click();
    expect(
      await page.evaluate(
        () => Boolean((window as Window & { __vtiPrintCalled?: boolean }).__vtiPrintCalled),
      ),
    ).toBeTruthy();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Export .ics" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/vti-reader-calendar-2026-11\.ics/);
    const stream = await download.createReadStream();
    expect(stream).toBeTruthy();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
    const ics = Buffer.concat(chunks).toString("utf8");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toMatch(/Walden/i);
    expect(ics).toContain("DTSTART:20261113T160000Z");
    expect(ics).not.toContain("$2,800");
    expect(ics).not.toContain("280000");
    expect(ics).not.toContain("last year");
  });
});
