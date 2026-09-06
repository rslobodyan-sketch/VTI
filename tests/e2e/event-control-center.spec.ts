import { expect, test } from "@playwright/test";
import { startClean } from "./helpers";

test.describe("Event control center", () => {
  test("Walden event shows readiness, travel, tasks, and financial links", async ({ page }) => {
    await startClean(page, "/admin/events/evt-walden-fall-2026");
    await expect(page.getByRole("heading", { name: "Walden Fall Commencement 2026" })).toBeVisible();
    await expect(page.getByText("Event control center")).toBeVisible();

    const readiness = page.locator("#event-readiness");
    await expect(readiness.getByText("Staffing", { exact: true })).toBeVisible();
    await expect(readiness.getByText("Travel", { exact: true })).toBeVisible();
    await expect(readiness.getByText("Call Sheet", { exact: true })).toBeVisible();
    await expect(readiness.getByText("Documents", { exact: true })).toBeVisible();
    await expect(readiness.getByText("Financial", { exact: true })).toBeVisible();
    await expect(readiness.getByText("Tasks", { exact: true })).toBeVisible();
    await expect(readiness.getByText("Attention", { exact: true }).first()).toBeVisible();

    await expect(page.getByRole("heading", { name: "Travel" })).toBeVisible();
    await expect(page.getByText("DL 1844")).toBeVisible();
    await expect(page.getByText("Graduate Minneapolis", { exact: true })).toBeVisible();
    await expect(page.getByText("Rideshare", { exact: true })).toBeVisible();

    await expect(page.getByRole("heading", { name: "Call Sheet" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Call Sheet v2" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Call Sheet v1" })).toBeVisible();

    const totals = page.locator("#event-operational-totals");
    await expect(totals.getByText("$24,200.00").first()).toBeVisible();
    await expect(totals.getByRole("link", { name: /\$24,200\.00/ }).first()).toBeVisible();

    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();
    await expect(page.getByText("Chase Elena Call Sheet acknowledgement")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
    await expect(page.getByText("Call Sheet v2 issued").first()).toBeVisible();
  });

  test("Eastbridge shows missing staffing in readiness", async ({ page }) => {
    await startClean(page, "/admin/events/evt-eastbridge-honor-2026");
    await expect(page.getByRole("heading", { name: "Eastbridge Honors Convocation" })).toBeVisible();
    const readiness = page.locator("#event-readiness");
    await expect(readiness.getByText("No reader currently assigned")).toBeVisible();
    await expect(readiness.getByText("Missing").first()).toBeVisible();
    await expect(page.getByText("Missing staffing")).toBeVisible();
  });

  test("Completing an event task updates the event task list", async ({ page }) => {
    await startClean(page, "/admin/events/evt-walden-fall-2026");
    const taskRow = page
      .locator("li")
      .filter({ hasText: "Chase Elena Call Sheet acknowledgement" })
      .first();
    await taskRow.getByRole("button", { name: "Mark done" }).click();
    await expect(page.getByText("Task completed.")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Tasks" }).locator("..").getByText("Chase Elena Call Sheet acknowledgement"),
    ).toHaveCount(0);
  });
});
