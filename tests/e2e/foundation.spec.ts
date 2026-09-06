import { expect, test } from "@playwright/test";
import { startClean } from "./helpers";

test.describe("Operational foundation", () => {
  test("Seed tasks and durable notifications load and persist", async ({ page }) => {
    await startClean(page, "/admin");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Open tasks" })).toBeVisible();
    await expect(page.getByText("Chase Elena Call Sheet acknowledgement")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recent activity" })).toBeVisible();
    await expect(page.getByText("Call Sheet v2 issued").first()).toBeVisible();

    await page.getByRole("button", { name: /Alerts/ }).click();
    await expect(page.getByRole("menuitem", { name: "Call Sheet unsigned" })).toBeVisible();
    await page.keyboard.press("Escape");

    const chaseRow = page
      .locator("li")
      .filter({ hasText: "Chase Elena Call Sheet acknowledgement" })
      .first();
    await chaseRow.getByRole("button", { name: "Mark done" }).click();
    await expect(
      page
        .getByRole("heading", { name: "Open tasks" })
        .locator("..")
        .getByText("Chase Elena Call Sheet acknowledgement"),
    ).toHaveCount(0);

    await page.reload();
    await expect(
      page
        .getByRole("heading", { name: "Open tasks" })
        .locator("..")
        .getByText("Chase Elena Call Sheet acknowledgement"),
    ).toHaveCount(0);
    await expect(page.getByText("Confirm Walden name-list arrival")).toBeVisible();
    await expect(page.getByText("Task completed").first()).toBeVisible();
  });

  test("Reset restores seed tasks", async ({ page }) => {
    await startClean(page, "/admin");
    const chaseRow = page
      .locator("li")
      .filter({ hasText: "Chase Elena Call Sheet acknowledgement" })
      .first();
    await chaseRow.getByRole("button", { name: "Mark done" }).click();
    await page.getByRole("button", { name: "Account" }).click();
    await page.getByRole("menuitem", { name: "Clear session changes" }).click();
    await expect(page.getByText("Session changes cleared.")).toBeVisible();
    await page.goto("/admin");
    await expect(page.getByText("Chase Elena Call Sheet acknowledgement")).toBeVisible();
  });
});
