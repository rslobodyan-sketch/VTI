import { expect, test } from "@playwright/test";
import {
  EVENT,
  PAY_LABEL,
  SAM,
  UNI,
  assignSam,
  attachReceipt,
  createGenEvent,
  issueCallSheetFromEvent,
  onboardUniversity,
  startClean,
  switchReader,
} from "./helpers";

test.describe("Golden Journey", () => {
  test("Admin → Sam → Admin payment tracking", async ({ page }) => {
    test.setTimeout(180_000);
    await startClean(page, "/");
    await expect(page.getByRole("heading", { name: "Voice Talent International" })).toBeVisible();
    await page.getByRole("link", { name: "Open operations" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await onboardUniversity(page);
    await page.getByRole("link", { name: "Create inquiry" }).click();
    await page.locator("#inq-notes").fill("Golden journey inquiry");
    await page.getByRole("button", { name: "Create inquiry" }).click();
    await expect(page.getByRole("heading", { name: UNI })).toBeVisible();
    for (const label of [
      "Move to Discovery",
      "Move to Pending admin approval",
      "Move to Coordinator logistics",
      "Move to Won",
    ]) {
      await page.getByRole("button", { name: label }).click();
    }

    await createGenEvent(page);
    await expect(page.getByText("Saturday commencement").first()).toBeVisible();
    await assignSam(page);
    await expect(page.getByRole("button", { name: "Prepare assignment notice" })).toBeVisible();
    await page.getByRole("button", { name: "Prepare assignment notice" }).click();
    await expect(page.getByText("No email was sent.")).toBeVisible();
    await expect(page.getByText("Assignment notification prepared.").first()).toBeVisible();

    await issueCallSheetFromEvent(page);
    await expect(page.getByText(SAM).first()).toBeVisible();
    await expect(page.getByText(PAY_LABEL).first()).toBeVisible();
    await expect(page.getByText("Saturday commencement").first()).toBeVisible();

    await page.goto("/reader");
    await switchReader(page, SAM);
    await expect(page.getByRole("heading", { name: /Hello, Sam/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: EVENT })).toBeVisible();
    await expect(page.getByText(PAY_LABEL)).toBeVisible();
    await expect(page.getByText(UNI)).toBeVisible();

    await page.getByRole("link", { name: "Open assignment" }).click();
    await expect(page.getByText(PAY_LABEL)).toBeVisible();
    await expect(page.getByText("Saturday commencement").first()).toBeVisible();
    await page.getByRole("button", { name: "Accept assignment" }).click();
    await expect(page.getByText("Assignment accepted")).toBeVisible();

    await page.getByRole("link", { name: /Review and accept Call Sheet|Open Call Sheet/ }).click();
    await expect(page.getByText("Promised for this assignment")).toBeVisible();
    await expect(page.getByText(PAY_LABEL)).toBeVisible();
    await expect(page.getByText("Other readers’ compensation is never shown")).toBeVisible();
    await page.getByRole("button", { name: "I accept this Call Sheet version" }).click();
    await expect(page.getByText("You accepted this Call Sheet version.")).toBeVisible();

    await page.goto("/reader/calendar");
    await expect(page.getByText("November 2026").first()).toBeVisible();
    await expect(page.getByText(UNI).first()).toBeVisible();

    await page.goto("/reader/expenses");
    await attachReceipt(page);
    await page.getByRole("button", { name: "Submit expense report" }).click();
    await expect(page.getByText("Expense submitted for review")).toBeVisible();

    await page.goto("/reader/debrief");
    await page.locator("#debrief-event").fill("Ceremony ran on time.");
    await page.locator("#debrief-readers").fill("Solo assignment.");
    await page.locator("#debrief-staff").fill("Coordinator was ready.");
    await page.locator("#debrief-problems").fill("None.");
    await page.locator("#debrief-plan").fill("Keep the same call time.");
    await page.getByRole("button", { name: "Complete debrief" }).click();
    await expect(page.getByText("Debrief completed.")).toBeVisible();

    await page.goto("/admin/assignments");
    await page.getByRole("link", { name: EVENT }).first().click();
    await expect(page.getByText(/accepted|assigned/i).first()).toBeVisible();
    await page.getByRole("button", { name: "Confirm assignment" }).click();
    await expect(page.getByText("Assignment confirmed.")).toBeVisible();

    await page.goto("/admin/expenses");
    await page.getByRole("link", { name: EVENT }).first().click();
    await expect(page.getByText("Airport rideshare").first()).toBeVisible();
    await page.getByRole("button", { name: "Approve expense" }).click();
    await expect(page.getByText("Expense approved.")).toBeVisible();

    await page.goto("/admin/debriefs");
    await expect(page.getByText("Ceremony ran on time.")).toBeVisible();

    await page.goto("/admin/payments");
    const payRow = page.locator("tr").filter({ hasText: SAM }).filter({ hasText: PAY_LABEL }).first();
    await expect(payRow).toBeVisible();
    await payRow.getByRole("button", { name: "Approve" }).click();
    await expect(page.getByText("Chester approved this payment.")).toBeVisible();
    await payRow.getByRole("button", { name: "Queue for payout" }).click();
    await expect(page.getByText("Queued for payout (tracking only).")).toBeVisible();
    await payRow.getByPlaceholder("Check #").fill("VTI-2800");
    await payRow.getByRole("button", { name: "Mark paid" }).click();
    await expect(page.getByText("Marked paid (tracking only).")).toBeVisible();
    await payRow.getByRole("button", { name: "Mark cashed" }).click();
    await expect(page.getByText("Cashed date recorded.")).toBeVisible();
    await expect(payRow.getByText("Check VTI-2800")).toBeVisible();

    await page.goto("/admin/events");
    await page.getByRole("link", { name: EVENT }).first().click();
    await page.getByRole("button", { name: "Mark work-again / event-ready" }).click();
    await expect(page.getByText("Marked work-again / event-ready.")).toBeVisible();
    await expect(page.getByText("Event ready").first()).toBeVisible();
  });
});
