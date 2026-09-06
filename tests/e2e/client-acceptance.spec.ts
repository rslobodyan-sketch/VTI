import { expect, test } from "@playwright/test";
import {
  EVENT,
  PAY_LABEL,
  SAM,
  UNI,
  attachReceipt,
  assignSam,
  createGenEvent,
  issueCallSheetFromEvent,
  onboardUniversity,
  startClean,
  switchReader,
} from "./helpers";

/**
 * VTI client acceptance suite.
 *
 * This suite is intentionally mapped to the Business Requirements Document and
 * the operational workflow Chester described. It is a release gate, not a
 * duplicate visual smoke suite. A failing test means a client-critical
 * workflow is broken, missing, or has regressed.
 */

test.describe("VTI Client Acceptance — requirements gate", () => {
  test("University lifecycle: inquiry → qualification → event", async ({ page }) => {
    await startClean(page, "/admin/inquiries/new");
    await onboardUniversity(page);
    await page.goto("/admin/inquiries/new");
    await page.locator("#inq-uni").selectOption({ label: UNI });
    await page.locator("#inq-notes").fill("Client acceptance inquiry: needs commencement readers and logistics.");
    await page.getByRole("button", { name: "Create inquiry" }).click();
    await expect(page.getByText("Inquiry created.")).toBeVisible();

    for (const label of [
      "Move to Discovery",
      "Move to Pending admin approval",
      "Move to Coordinator logistics",
      "Move to Won",
    ]) {
      await page.getByRole("button", { name: label }).click();
    }
    await expect(page.getByText("Won", { exact: true }).first()).toBeVisible();

    await page.getByRole("link", { name: "Create event" }).click();
    await page.locator("#ev-name").fill(EVENT);
    await page.locator("#cer-name").fill("Saturday commencement");
    await page.locator("#cer-date").fill("2026-12-05");
    await page.locator("#cer-start").fill("10:00");
    await page.locator("#cer-venue").fill("Gen Hall");
    await page.getByRole("button", { name: "Create event" }).click();
    await expect(page.getByRole("heading", { name: EVENT })).toBeVisible();
    await expect(page.getByText(UNI, { exact: true }).first()).toBeVisible();
    await expect(page.locator("#event-operational-totals").getByText("Estimate", { exact: true }).first()).toBeVisible();
  });

  test("Reader operations: profile → availability → assignment → reader privacy", async ({ page }) => {
    await startClean(page, "/admin/readers");
    await expect(page.getByRole("heading", { name: "Readers" })).toBeVisible();
    await page.getByRole("link", { name: SAM }).first().click();
    await expect(page.getByRole("heading", { name: SAM })).toBeVisible();
    await expect(page.getByText("Onboarding")).toBeVisible();
    await expect(page.getByText("NDA", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Availability" })).toBeVisible();

    await page.goto("/admin/calendar");
    await expect(page.getByRole("heading", { name: "Reader availability & conflicts" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Save availability block" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Personal / external commitments" })).toBeVisible();

    await page.goto("/admin/events/evt-eastbridge-honor-2026");
    await expect(page.getByRole("heading", { name: "Staffing" })).toBeVisible();
    await expect(page.getByText(/reader\(s\) need attention before assignment/i)).toHaveCount(1);

    await page.goto("/reader");
    await switchReader(page, SAM);
    await expect(page.getByRole("heading", { name: /Hello, Sam/ })).toBeVisible();
    await expect(page.getByText(/your calendar|Assigned events only/i).first()).toBeVisible();
    await page.goto("/reader/profile");
    await expect(page.getByText("Your payment history", { exact: true })).toBeVisible();
  });

  test("Assignment → Call Sheet → acceptance → event packet", async ({ page }) => {
    await startClean(page, "/admin/events");
    await onboardUniversity(page);
    await page.goto("/admin/events/new");
    await createGenEvent(page);
    await assignSam(page);
    await expect(page.getByRole("button", { name: "Prepare assignment notice" })).toBeVisible();
    await page.getByRole("button", { name: "Prepare assignment notice" }).click();
    await expect(page.getByText("No email was sent.")).toBeVisible();
    await expect(page.getByText("because your sound is a strong match for this event.")).toBeVisible();

    await issueCallSheetFromEvent(page);
    await page.goto("/reader");
    await switchReader(page, SAM);
    await page.getByRole("link", { name: "Open assignment" }).click();
    await expect(page.getByText(UNI, { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "Accept assignment" }).click();
    await expect(page.getByText("Assignment accepted")).toBeVisible();
    await page.getByRole("link", { name: /Review and accept Call Sheet|Open Call Sheet/ }).click();
    await expect(page.getByText(PAY_LABEL)).toBeVisible();
    await expect(page.getByText("Other readers’ compensation is never shown")).toBeVisible();
    await page.getByRole("button", { name: "I accept this Call Sheet version" }).click();
    await expect(page.getByText("You accepted this Call Sheet version.")).toBeVisible();
  });

  test("Expenses → approval → reader compensation payment tracking", async ({ page }) => {
    await startClean(page, "/admin/events");
    await onboardUniversity(page);
    await page.goto("/admin/events/new");
    await createGenEvent(page);
    await assignSam(page);
    await issueCallSheetFromEvent(page);

    await page.goto("/reader");
    await switchReader(page, SAM);
    await page.goto("/reader/expenses");
    await attachReceipt(page);
    await page.getByRole("button", { name: "Submit expense report" }).click();
    await expect(page.getByText("Expense submitted for review")).toBeVisible();

    await page.goto("/admin/expenses");
    await page.getByRole("link", { name: EVENT }).first().click();
    await expect(page.getByText("Airport rideshare").first()).toBeVisible();
    await page.getByRole("button", { name: "Approve expense" }).click();
    await expect(page.getByText("Expense approved.")).toBeVisible();

    await page.goto("/admin/payments");
    const payRow = page.locator("tr").filter({ hasText: SAM }).filter({ hasText: PAY_LABEL }).first();
    await expect(payRow).toBeVisible();
    await payRow.getByRole("button", { name: "Approve" }).click();
    await payRow.getByRole("button", { name: "Queue for payout" }).click();
    await payRow.getByPlaceholder("Check #").fill("VTI-ACCEPTANCE-2800");
    await payRow.getByRole("button", { name: "Mark paid" }).click();
    await payRow.getByRole("button", { name: "Mark cashed" }).click();
    await expect(payRow.getByText("Check VTI-ACCEPTANCE-2800")).toBeVisible();

    await page.goto("/reader/expenses");
    await switchReader(page, SAM);
    await expect(page.getByRole("heading", { name: "Add an expense" })).toBeVisible();
    await attachReceipt(page, "15.75", "Post-event parking");
    await expect(page.getByRole("button", { name: "Submit expense report" }).last()).toBeVisible();
  });

  test("Calendar + financial command center provide Chester's operational overview", async ({ page }) => {
    await startClean(page, "/admin");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText(/Open tasks|Needs attention/i).first()).toBeVisible();

    await page.goto("/admin/calendar");
    await expect(page.getByRole("heading", { name: "Calendar" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reader availability & conflicts" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Personal / external commitments" })).toBeVisible();

    await page.goto("/admin/financial");
    await expect(page.getByRole("heading", { name: "Financial Command Center" })).toBeVisible();
    for (const heading of ["University receivables", "Reader financial overview", "University performance"]) {
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    }
    await expect(page.getByText("Walden University", { exact: true }).first()).toBeVisible();
  });

  test("Event operations: travel + document upload + task creation persist and update activity", async ({ page }) => {
    await startClean(page, "/admin/events/evt-eastbridge-honor-2026");

    await page.getByLabel("Airline").fill("United");
    await page.getByLabel("Flight").fill("UA-ACCEPT");
    await page.locator("#flight-departs").fill("2026-12-04T16:00");
    await page.locator("#flight-arrives").fill("2026-12-04T18:30");
    await page.getByRole("button", { name: "Add flight" }).click();
    await expect(page.getByText("United UA-ACCEPT", { exact: true })).toBeVisible();

    await page.getByLabel("Property").fill("Marriott Downtown");
    await page.locator("#hotel-checkin").fill("2026-12-04");
    await page.locator("#hotel-checkout").fill("2026-12-06");
    await page.getByRole("button", { name: "Add hotel" }).click();
    await expect(page.getByText("Marriott Downtown", { exact: true })).toBeVisible();

    await page.locator("#transfer-provider").fill("Hotel shuttle");
    await page.locator("#transfer-notes").fill("Pickup at 7:30 AM");
    await page.getByRole("button", { name: "Add transfer" }).click();
    await expect(page.getByText("Hotel shuttle", { exact: true })).toBeVisible();
    await expect(page.getByText("Pickup at 7:30 AM", { exact: true })).toBeVisible();

    await page.locator("#event-document").setInputFiles({
      name: "client-acceptance.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 client acceptance document"),
    });
    await page.getByRole("button", { name: "Upload document" }).click();
    await expect(page.getByText("client-acceptance.pdf", { exact: true }).first()).toBeVisible();

    const taskTitle = "Client acceptance task";
    await page.getByPlaceholder("Confirm reader travel").fill(taskTitle);
    await page.getByRole("button", { name: "Create task" }).click();
    await expect(page.getByText(taskTitle, { exact: true })).toBeVisible();
    await expect(page.getByText("United UA-ACCEPT", { exact: true })).toBeVisible();

    await expect(page.getByRole("button", { name: "Create invoice draft" })).toBeVisible();
    await page.getByRole("button", { name: "Create invoice draft" }).click();
    await expect(page.getByText("Invoice draft created.")).toBeVisible();
    await expect(page.locator("#event-operational-totals").getByText("draft", { exact: true }).first()).toBeVisible();

    await page.reload();
    await expect(page.getByText("client-acceptance.pdf", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(taskTitle, { exact: true })).toBeVisible();
  });

  test("Event control center: readiness + ceremonies + staffing + travel + documents + tasks + activity", async ({ page }) => {
    await startClean(page, "/admin/events/evt-eastbridge-honor-2026");
    await expect(page.getByRole("heading", { name: "Eastbridge Honors Convocation" })).toBeVisible();
    for (const label of ["Readiness", "Event overview", "Ceremonies", "Staffing", "Travel", "Call Sheet", "Financial summary", "Documents", "Tasks", "Activity"]) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
    }
  });

  test("Reader privacy: own assignment/pay only, with no admin financial history", async ({ page }) => {
    await startClean(page, "/reader");
    await switchReader(page, SAM);
    await page.goto("/reader/assignments/asg-eastbridge-sam");
    await expect(page.getByText(/Your pay for this assignment/)).toBeVisible();
    await expect(page.getByText("Other readers’ compensation is never shown")).toHaveCount(0);
    await expect(page.getByText(/Prior-year pay|Reader financial overview|University receivables/)).toHaveCount(0);
  });

  test("Persistence: operational state survives refresh", async ({ page }) => {
    await startClean(page, "/admin/events/evt-eastbridge-honor-2026");
    const taskTitle = "Client acceptance persistent task";
    await page.getByPlaceholder("Confirm reader travel").fill(taskTitle);
    await page.getByRole("button", { name: "Create task" }).click();
    await expect(page.getByText(taskTitle, { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText(taskTitle, { exact: true })).toBeVisible();
  });
});
