import { expect, test } from "@playwright/test";
import { EVENT, SAM, UNI, assignSam, createGenEvent, onboardUniversity, startClean, switchReader } from "./helpers";

test.describe("Overlay persistence", () => {
  test("Admin write reaches Reader, survives refresh, resets", async ({ page, context }) => {
    test.setTimeout(180_000);
    await startClean(page, "/admin");
    await onboardUniversity(page);
    await page.getByRole("link", { name: "View university" }).click();
    await expect(page.getByRole("heading", { name: UNI })).toBeVisible();

    await page.goto("/admin/events/new");
    await page.locator("#ev-uni").selectOption({ label: UNI });
    await createGenEvent(page);
    await assignSam(page);

    await page.reload();
    await expect(page.getByRole("heading", { name: new RegExp(`${SAM} · ${EVENT}`) })).toBeVisible();

    const readerPage = await context.newPage();
    await readerPage.goto("/reader");
    await switchReader(readerPage, SAM);
    await expect(readerPage.getByRole("heading", { name: EVENT })).toBeVisible();

    await page.getByRole("button", { name: "Account" }).click();
    await page.getByRole("menuitem", { name: "Clear session changes" }).click();
    await expect(page.getByText("Session changes cleared.")).toBeVisible();

    await page.goto("/admin/clients");
    await expect(page.getByText(UNI)).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Walden University" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Harborview College of Arts" })).toBeVisible();

    await readerPage.reload();
    await expect(readerPage.getByText("Nothing on the books")).toBeVisible();
    await readerPage.close();
  });
});
