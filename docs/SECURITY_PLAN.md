# VTI Operations Platform — Security Plan

This plan only includes controls supported by the BRD, Discovery Summary, and Chester’s comments. It does **not** claim HIPAA, SOC 2, PCI-DSS, FedRAMP, or other certifications. Those frameworks are not required by the source documents.

Chester’s security concern in discovery is concrete: reader onboarding may include **Social Security numbers** and **driver’s-license copies**. Call Sheets also carry confidential instructions and contractual/legal content.

---

## 1. Authentication

| Requirement | Plan |
|---|---|
| Known users only | Invite-only accounts. No public reader signup. No university login in MVP (OQ-09). |
| Mechanism | Auth.js session cookies. Email + password (or magic link). |
| Session | HTTP-only, Secure, SameSite cookies. Server-side session invalidation on password change. |
| Secrets | Password hashes only (modern slow hash). No storing raw passwords. |
| Recovery | Password reset to the enrolled email. |

Chester did not specify SSO. Do not add Google/Microsoft login unless he asks.

---

## 2. Role-based access

MVP roles:

| Role | May access |
|---|---|
| VTI Admin | All operational records; sensitive reader fields; files; billing; payment approval |
| Reader | Own non-sensitive profile; own assignments; own Call Sheets; own receipts/expenses; own pay history; permission-filtered calendar (view) |

Enforcement is not only UI hiding. Every query, Server Action, and file download checks role and ownership.

Future roles (sub-admin, university) are not implemented. Do not create shared “staff” passwords.

Comment on university self-service / staff: **“At this point, only VTI access.”** Sensitive onboarding documents are admin-only in MVP.

---

## 3. Reader privacy

Readers can view their profile and cannot update it after onboarding (OQ-07).

Readers must **not** see:

- Other readers’ SSN, EIN, DOB, KTN, DL/passport images, or addresses
- Other readers’ pay (except what a debrief form asks them to *describe qualitatively* — the form must not display others’ compensation)
- University billing, quotes, last-year university payments, or Chester’s personal calendar events (unless Chester confirms otherwise)
- The full operational calendar (OQ-08)

Veteran-first matching and sound notes are admin tools.

---

## 4. Sensitive information

Treat as sensitive:

- SSN / EIN
- Driver’s license and passport images and numbers
- Date of birth
- KTN
- Full addresses
- Emergency-contact details (limit exposure)
- Bank-related status such as check cashed (operational, still not for notifications)
- Call Sheet legal/confidential instructions
- Receipt images (may contain personal purchases)

Rules from SEC-002: do not reproduce sensitive values in notifications, emails, exports, search snippets, or dashboard widgets.

Screens that need a tax ID show masked values by default (`***-**-1234`) with an explicit Admin “reveal” that is audit-logged.

---

## 5. Documents

| Document | Access | Extra control |
|---|---|---|
| Driver’s license / passport | VTI Admin only (MVP) | Encrypted at rest; expiring-queue shows dates not images |
| NDA | Admin; reader may view own | Status + file |
| Call Sheet | Admin; assigned readers | Versioned; acknowledgement stored |
| University packet / name lists | Admin; assigned readers | Download via auth’d URL only |
| Receipts | Admin; owning reader | Not attached to email |

No public bucket links. Signed, short-lived download routes.

---

## 6. Receipts

Receipts are financial and personal. They belong to an expense line and assignment.

- Uploaded over HTTPS
- Stored encrypted
- Visible to the submitting reader and VTI Admin
- Not shown in notification bodies
- Retention follows the same tax-oriented window as other financial records (OQ-14: typically 4–7 years depending on type)

---

## 7. Permissions (object level)

| Object | Admin | Assigned reader | Other reader |
|---|---|---|---|
| University CRM / invoices | Yes | No | No |
| Event logistics / Call Sheet | Yes | Yes | No |
| Assignment | Yes | Own | No |
| Reader sensitive fields | Yes | No (not even own SSN on mobile unless later required) | No |
| Own pay history | Yes | Yes | No |
| Calendar full month | Yes | No | No |
| Calendar filtered | — | View | No |
| Payment approval | Yes | No | No |

---

## 8. Client data

Universities do not have accounts in MVP. Their contacts, notes, budgets, quotes, and history are VTI confidential operational data.

Do not build a university-visible portal until Chester asks. If that portal is added later, it must show **only that university’s** events and payment history.

---

## 9. Auditability

SEC-004 / product principle: material changes are reviewable.

Log at least:

- Login success/failure (no passwords)
- Invite issued
- Create/update of reader sensitive fields
- Reveal of masked tax ID
- Document upload/download
- Call Sheet issue and acknowledgement
- Assignment status changes (including return to pool)
- Expense submit/approve
- Payment approval (mandatory human step)
- Event status changes (cancel/postpone)

Do not put raw SSN or image contents in logs.

Automation, if added later, must record what it did so Chester can retract it (OQ-18). MVP automation is reminders only.

---

## 10. Secure file access

- Authenticated download only
- Authorize against assignment membership or admin role
- Application-level encryption for DL/passport (and prefer it for receipts)
- Encryption keys in environment/secret store, not in git
- Production files not on ephemeral host disks
- Filename/content-type validated on upload

---

## 11. Session / application security

Standard professional controls, not extra certifications:

- HTTPS only in production
- CSRF protection on Server Actions (Next.js defaults)
- Rate-limit login
- Security headers (CSP as feasible, nosniff, frame denial)
- Least-privilege database credentials
- Backups encrypted
- Environment secrets never committed

---

## 12. Retention and deletion

OQ-14: retention should follow IRS rules and data privacy laws, focused on tax compliance and liability protection. Depending on document type, **4–7 years**.

Exact per-type schedule is still a practical implementation detail. Until Chester confirms a table:

- Do not auto-delete production records in MVP
- Do not build a consumer “right to delete everything immediately” without a legal review Chester has not requested
- Provide an admin-controlled archive path later

This document does not invent GDPR/CCPA program obligations beyond “follow applicable privacy law” as Chester stated.

---

## 13. Payments and PCI

VTI tracks compensation and university payment **status**. Wave is the invoicing/ledger system. Patriot is the intended pay initiator.

MVP does **not**:

- Store card numbers
- Connect Wells Fargo
- Process cards
- Claim PCI scope

If a future bank connection appears, treat it as a new security review.

---

## 14. AI

Not in MVP. When added: no autonomous payment; every other action needs proofs and retractability (OQ-18). Do not send SSN, DL images, or full Call Sheet legal packets to a third-party model unless Chester explicitly approves that exposure.
