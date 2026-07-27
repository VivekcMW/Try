# 06 — Payments & Wallet

> In-app wallet, UPI, escrow for marketplace, refunds, and a clean ledger.

---

## 1. Goal

Let residents and merchants transact safely without leaving Lokul — wallet top-up via UPI, escrow for bookings, instant refunds, and a transparent transaction history.

---

## 2. User stories

- **US-6.1** As a resident, I can top up a Lokul Wallet via UPI/card and pay for bookings instantly.
- **US-6.2** As a resident, I can pay a neighbor (chip in for an event, settle dues).
- **US-6.3** As a resident, I can request refunds from cancelled bookings and get them instantly to wallet (or back to source in 3–5 days).
- **US-6.4** As a merchant, I receive payouts to my bank weekly (T+7) or on-demand (with a fee).
- **US-6.5** As any user, I can see a full statement of credits and debits.
- **US-6.6** As an RWA admin, I can collect society dues from members via Lokul.

---

## 3. UX flows

### 3.1 Wallet home

```
You → Wallet → Balance + Top-up + Statement tabs
- Top-up: Amount → UPI Intent / Cards / Net Banking → Razorpay flow → Success
- Statement: filterable by date / type / counterparty
```

### 3.2 Pay flow (booking)

```
Booking → Payment method picker → Wallet (default if balance ≥ amount) /
UPI / Cards / Pay on arrival → Razorpay handoff (if non-wallet)
→ Success → Booking confirmed + escrow locked
```

### 3.3 Refund

```
Booking → Cancel → Refund preview → Confirm →
Wallet refund instant; bank refund T+3–5 → Push when complete
```

### 3.4 Society dues (RWA)

```
RWA admin → Dues → Create cycle (month, amount per flat) → Notify residents
Residents see "Pending: ₹500 maintenance" → Tap → Pay → Done
```

---

## 4. Functional requirements

### Wallet
- **FR-6.1** Lokul Wallet is a **closed prepaid instrument** operated under a PPI partnership (e.g., M2P / Razorpay X) — Lokul itself is **not** the regulated entity.
- **FR-6.2** Per-user wallet balance limit: ₹10,000 for KYC Silver, ₹2,00,000 for KYC Gold (RBI PPI norms).
- **FR-6.3** Wallet cannot be withdrawn to bank (P2P out blocked) for KYC Silver; Gold users can withdraw with verification.
- **FR-6.4** Top-up methods: UPI, Cards (debit/credit), Net Banking via Razorpay.
- **FR-6.5** Auto-top-up trigger when wallet balance < ₹100 (opt-in).

### Transactions
- **FR-6.6** Every money movement creates a `ledger_entry` (double-entry: debit + credit).
- **FR-6.7** Transaction types: `topup`, `booking_pay`, `booking_refund`, `p2p_send`, `p2p_receive`, `dues_pay`, `payout`, `platform_fee`, `escrow_hold`, `escrow_release`.
- **FR-6.8** Idempotency: every API write supports `Idempotency-Key` header.
- **FR-6.9** Reconciliation: nightly job reconciles Razorpay settlements vs ledger; mismatches flagged.

### Escrow
- **FR-6.10** Booking payments via Wallet/UPI/Card hold funds in `escrow` ledger account.
- **FR-6.11** On booking `completed` + 24h cooling, escrow auto-releases to merchant available balance.
- **FR-6.12** On dispute, escrow holds until resolved by moderation (max 14 days; auto-resolve to resident if no merchant response).

### Payouts
- **FR-6.13** Merchant payouts: weekly auto (Mondays, prev week's released earnings) OR instant on-demand (₹10 + 0.5% fee, min ₹100 withdrawal).
- **FR-6.14** Payouts via Razorpay Payouts to merchant bank account; UPI ID supported.
- **FR-6.15** Payout TDS: 1% deducted under 194-O if merchant GMV > ₹5L/year (auto-deducted, certificate emailed).

### P2P
- **FR-6.16** P2P send: only between residents in the same society OR with prior interaction (shared chat/booking).
- **FR-6.17** P2P limit: ₹5,000 per transaction, ₹20,000 per day per user.
- **FR-6.18** P2P requires Silver KYC minimum.

### RWA dues
- **FR-6.19** RWA admin creates a `dues_cycle` (society, month, amount-per-flat or per-flat-type).
- **FR-6.20** Residents see dues card on Home Feed and in Wallet.
- **FR-6.21** Lokul charges RWA 0.5% fee on dues collected (capped at ₹10/transaction).
- **FR-6.22** Dues collected go to RWA's bank account on T+1.

### Security & compliance
- **FR-6.23** All payment APIs require step-up auth (re-OTP) for amounts ≥ ₹2,000.
- **FR-6.24** PCI-DSS scope: zero. Card data never touches Lokul servers; tokenized via Razorpay.
- **FR-6.25** Suspicious activity (>3 failed UPI in 10 min, geo-mismatch) → freeze wallet, push to user, manual review.
- **FR-6.26** Statement export: CSV / PDF; available for last 18 months.

---

## 5. Data model

```
wallets
  id, user_id (FK, unique)
  balance_inr_paise (BIGINT)  -- always in paise
  status ('active'|'frozen'|'closed')
  kyc_tier_at_open
  created_at

ledger_accounts
  id, kind ('user_wallet'|'escrow'|'platform_fee'|'merchant_payable'|'razorpay_settlement')
  owner_id  -- user_id or merchant_id or NULL for platform accounts

ledger_entries
  id, txn_id (FK transactions)
  account_id (FK ledger_accounts)
  side ('debit'|'credit')
  amount_paise (BIGINT)
  posted_at
  -- per txn: debits must equal credits

transactions
  id (ULID)
  type
  initiator_user_id
  counterparty_user_id (nullable)
  reference_id (booking_id / dues_id / payout_id)
  amount_paise
  fee_paise
  status ('pending'|'success'|'failed'|'reversed')
  external_ref (razorpay payment_id, etc.)
  idempotency_key (unique)
  created_at, settled_at

payouts
  id, merchant_id, amount_paise, fee_paise, mode ('weekly'|'instant')
  razorpay_payout_id
  status, scheduled_at, settled_at

dues_cycles
  id, society_id, month, amount_per_flat_paise, due_date
  created_by

dues_invoices
  id, cycle_id, resident_user_id, flat_id
  amount_paise, status ('pending'|'paid'|'waived'), txn_id (nullable)

webhooks_in
  id, provider ('razorpay'), event, payload_json, signature_ok, received_at, processed_at
```

---

## 6. APIs

```
GET    /v1/wallet                       → { balance_paise, status }
POST   /v1/wallet/topup                 { amount_paise, method } → { order_id }
POST   /v1/wallet/topup/verify          { order_id, razorpay_payment_id, signature }

GET    /v1/transactions?type=&from=&to=

POST   /v1/payments                     { booking_id, amount_paise, method }
                                        → { txn_id, redirect_url? }
POST   /v1/payments/:id/verify

POST   /v1/refunds                      { txn_id, amount_paise?, reason }
GET    /v1/refunds/:id

POST   /v1/p2p                          { to_user_id, amount_paise, note }

GET    /v1/merchant/earnings
POST   /v1/merchant/payouts/instant     { amount_paise }

# RWA dues
POST   /v1/societies/:id/dues-cycles
GET    /v1/societies/:id/dues-cycles
GET    /v1/me/dues
POST   /v1/dues/:invoice_id/pay

# Webhooks
POST   /v1/webhooks/razorpay            (signed)
```

---

## 7. Edge cases

- **EC-6.1** Razorpay callback delayed → poll `/payments/:id` for terminal status; never trust client.
- **EC-6.2** Double-charge from retry → idempotency-key prevents duplicate ledger entries.
- **EC-6.3** Wallet frozen mid-booking → booking auto-cancelled, payment reversed.
- **EC-6.4** UPI mandate failure → fall back to UPI Intent.
- **EC-6.5** Refund amount > original (shouldn't happen) → API rejects.
- **EC-6.6** Currency rounding: all math in paise (integer); UI displays ₹X.XX.
- **EC-6.7** Merchant bank account rejected by Razorpay → payout stays pending; merchant re-submits.
- **EC-6.8** Resident closes account with positive wallet → balance withdrawn to source (or via grievance).
- **EC-6.9** Disputed booking after 14d auto-resolution → cannot be reversed; appeal via support.

---

## 8. Metrics

| Metric | Target |
|---|---|
| % bookings paid in-app | ≥ 65% |
| Top-up success rate | ≥ 96% |
| Avg wallet balance per active user | ≥ ₹300 |
| Refund success p95 | < 10 min for wallet, < 5 business days for bank |
| Payout failure rate | ≤ 2% |
| Dues collection rate in onboarded RWAs | ≥ 75% |
| Disputed transactions | ≤ 1% |

---

## 9. Dependencies

- Razorpay merchant account + KYC.
- PPI partner agreement for wallet float.
- Bookings module 05 for escrow lifecycle.
- Notifications module 12 for payment alerts.
- Compliance: DPDPA-2023 (data), RBI PPI master direction, KYC norms.
- 2FA flow (re-OTP) shared with auth module 01.

---

## 10. Out of scope (v1.0)

- Lokul-branded credit / debit card.
- Lending or BNPL.
- International remittance.
- Cryptocurrency.
- Subscriptions billing engine (use one-shot for v1).
- Multi-currency.
- Auto-split bills (deferred to v1.1).
