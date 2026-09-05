import { expect, type Page } from "@playwright/test";

export const UNI = "Gen Commencement University";
export const EVENT = "Gen Commencement";
export const CEREMONY = "Saturday commencement";
export const VENUE = "Gen Hall";
export const EVENT_DATE = "2026-11-21";
export const PAY = "2800";
export const PAY_LABEL = "$2,800.00";
export const SAM = "Sam Okonkwo";
export const ELENA = "Elena Voss";
export const MARCUS = "Marcus Hale";

export async function startClean(page: Page, path = "/admin") {
  await page.goto(path);
  await page.evaluate(() => {
    localStorage.removeItem("vti-operations-overlay");
    sessionStorage.removeItem("vti-operations-overlay");
    sessionStorage.removeItem("vti-demo-reader");
  });
  await page.reload();
  await page.goto(path);
  await expect(page.getByText("Loading this record…")).toHaveCount(0);
}

export async function openAdmin(page: Page, path = "/admin") {
  await page.goto(path);
  await expect(page.getByText("Loading this record…")).toHaveCount(0);
}

export async function switchReader(page: Page, name: string) {
  await page.locator("#demo-reader").selectOption({ label: name });
  await expect(page.locator("#demo-reader")).toHaveValue(
    name === SAM ? "reader-sam" : name === ELENA ? "reader-elena" : name === MARCUS ? "reader-marcus" : /.*/,
  );
}

export async function onboardUniversity(page: Page, name = UNI) {
  await page.goto("/admin/clients/new");
  await page.locator("#uni-name").fill(name);
  await page.locator("#uni-city").fill("Geneva");
  await page.locator("#uni-region").fill("IL");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator("#p-name").fill("Jordan Coordinator");
  await page.locator("#p-email").fill("coordinator@gen.edu");
  await page.locator("#p-phone").fill("555-0100");
  await page.getByRole("button", { name: "Continue" }).click();
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole("button", { name: "Continue" }).click();
  }
  await page.getByRole("button", { name: "Create university" }).click();
  await expect(page.getByRole("heading", { name: "University onboarded successfully" })).toBeVisible();
}

export async function createInquiryForUniversity(page: Page, university = UNI) {
  await page.goto("/admin/inquiries/new");
  await page.locator("#inq-uni").selectOption({ label: university });
  await page.locator("#inq-notes").fill("Golden journey inquiry");
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
  await expect(page.getByText("Won")).toBeVisible();
}

export async function createGenEvent(page: Page) {
  if (!page.url().includes("/admin/events/new")) {
    await page.getByRole("link", { name: "Create event" }).click();
  }
  await page.locator("#ev-name").fill(EVENT);
  await page.locator("#cer-name").fill(CEREMONY);
  await page.locator("#cer-date").fill(EVENT_DATE);
  await page.locator("#cer-start").fill("10:00");
  await page.locator("#cer-venue").fill(VENUE);
  await page.locator("#tr").fill("Drive from Chicago.");
  await page.locator("#hot").fill("Campus inn, one night.");
  await page.getByRole("button", { name: "Create event" }).click();
  await expect(page.getByRole("heading", { name: EVENT })).toBeVisible();
}

export async function assignSam(page: Page) {
  await page.locator("#asg-reader").selectOption({ label: SAM });
  await page.locator("#asg-role").selectOption("reader");
  await page.locator("#asg-pay").fill(PAY);
  await page.getByRole("button", { name: "Assign reader" }).click();
  await expect(page.getByRole("heading", { name: new RegExp(`${SAM} · ${EVENT}`) })).toBeVisible();
  await expect(page.getByText(PAY_LABEL).first()).toBeVisible();
}

export async function issueCallSheetFromEvent(page: Page) {
  await page.getByRole("link", { name: "Open event" }).click();
  await page.getByRole("button", { name: "Issue Call Sheet" }).first().click();
  await expect(page.getByText("Call Sheet v1 issued.")).toBeVisible();
}

export async function attachReceipt(page: Page, amount = "42.50", description = "Airport rideshare") {
  await page.getByLabel("Photo or PDF").setInputFiles({
    name: "rideshare.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 demo receipt"),
  });
  await page.getByLabel("Amount (USD)").fill(amount);
  await page.getByLabel("Description").fill(description);
  await page.getByRole("button", { name: "Attach receipt to report" }).click();
  await expect(page.getByText("Receipt attached to this report.")).toBeVisible();
}

export async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 2;
  });
  expect(overflow).toBeFalsy();
}

export function collectPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (
        text.includes("Failed to load resource") ||
        text.includes("net::ERR") ||
        text.includes("Hydration") ||
        text.includes("Minified React error")
      ) {
        errors.push(text);
      }
    }
  });
  return errors;
}
