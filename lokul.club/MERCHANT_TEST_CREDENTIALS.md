# Merchant login — local dev test credentials

Local/dev only. These accounts exist in the seeded local Postgres database
(`lokul_club` on `127.0.0.1:5433`) and mean nothing outside a local dev
environment — do not treat this file as containing real secrets.

## How merchant OTP login works locally

Login page: `/merchant/login`

1. Enter the phone number (the `+91` prefix is already applied by the form —
   just type the 10-digit number).
2. Request the OTP.
3. Enter **`123456`** as the OTP.

Why this works: in `next dev` (`NODE_ENV=development`), `POST /api/merchant/auth/login`
accepts **any 6-digit code** — it never checks a real OTP store outside
production. `123456` is used here because that's also the fixed code
`POST /api/web/otp/send` logs to the console in dev, and what the Playwright
e2e suite (`e2e/merchant.spec.ts`) uses.

## Seeded merchants — one active account per category

All seeded merchants share `workflowProfile: retail` (the seed script never
varies that field) — the real variation across this dataset is `category`.

| Phone | Business | Category |
|---|---|---|
| `9000000206` | Shah Interiors & Carpentry | carpenter |
| `9876501234` | Anil AC & Electrical Works | electrician |
| `9000000214` | Leela Fitness Studio | gym |
| `9000000304` | Venkat Grocery & Kirana | kirana |
| `9000000312` | Achar's Laundry & Dry Clean | laundry |
| `9988776655` | Sunita Home Maid Services | maid |
| `9000000306` | Gowda Pest Control Services | pest_control |
| `9000000313` | Shankar Photography | photographer |
| `9000000204` | Pawar Plumbing & Sanitation | plumber |
| `9000000106` | Kavita's Beauty Studio | salon |
| `9654321098` | Deepa Tiffin Services | tiffin |

All rows above have `status: active`.

## Not-yet-verified accounts (may have restricted dashboard access)

| Phone | Business | Category | Status |
|---|---|---|---|
| `9071933517` | My SHop 1st time | kirana | pending_verification |
| `9078324823` | Salon 01 | salon | pending_verification |

## E2E / instant bypass account

`POST /api/merchant/auth/login` has a full bypass when `E2E_TEST=1` (or when
`DATABASE_URL` is the placeholder `USER:PASSWORD` string) — it logs straight
in as a synthetic merchant, no OTP step at all:

- Phone: `9999999999`
- Business: "Test Shop" (`e2e_merchant`)

This is what `e2e/merchant.spec.ts` uses in CI; it does not require the OTP
step or a seeded DB row.
