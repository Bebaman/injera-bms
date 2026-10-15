# Mena Injera & Derkosh BMS — audit & fix report (11 Oct 2026)

## 1. Database changes (already applied to Supabase project mfxkkaavgzyttasgqnmw)
| # | Migration | What / why |
|---|---|---|
| 01 | audit_01_missing_columns | Added `suppliers.contact_person`, `suppliers.preferred_currency`, `shareholders.role`, `purchases.description` — the UI already collected these; saves failed / data was lost |
| 02-03 | audit_02/03_pnl_views | `monthly_pnl`: injera used for Derkosh moves out of injera COGS into Derkosh COGS (no double count; total COGS = production cost + Derkosh packaging). Months with costs but no sales now appear. Overhead of a month with no production is expensed as unabsorbed overhead. Loan late fees count with interest. `monthly_pnl_net.net_profit` now includes gain/loss on asset disposal |
| 04, 12 | audit_04/12_cash_flow | `monthly_cash_flow`: opening balance anchors on the NEAREST opening-balance row (as cashflow.html does); one row per month up to the current month (balance carried forward) |
| 05 | audit_05_inventory_balance | Usage/adjustment valued at latest WAC (was 0 in a month with no purchase); carry-forward rows for quiet months; Teff/Rice matched through Settings ids |
| 06 | audit_06_loan_delete_integrity | A loan with recorded repayments cannot be deleted; deleting an unpaid loan removes its disbursement from the cash ledger |
| 07-08 | audit_07/08_seed | Master lists the code looks up by name: expense categories (15), overhead categories (6), inventory items (10), batch standards (normal/special — placeholder targets, calibrate in Production); Settings now points Teff / Rice / Injera Blend at the real rows |
| 09-11 | audit_09/10/11_shareholders | Old trigger demanded 100% after every single row change (ownership could never be edited, a 3rd shareholder could never be added). Now: total must be 100% when profit is distributed; every % change is logged to `ownership_history`; `joined_date` defaults to today |

## 2. Code fixes (this zip)
* **dashboard.html** – charts did not render: datalabels plugin was registered after the first chart existed (Chart.js crashed with `_labels`). Loss months were clipped by `min:0`.
* **purchases.html** – supplier name loaded straight from DB; description saved; VAT rate from Settings; fake `local-…` item/category fallbacks removed (they made every save fail); Injera Blend hidden from purchasable list.
* **suppliers.html** – preferred currency saved/loaded.
* **pl.html** – P&L now reads `monthly_pnl_net`, `production_batch_costs`, `derkosh_batch_costs`: identical to Dashboard/Reports; per-product (Injera / Derkosh) COGS and gross profit; YTD starts at the Settings fiscal-year month.
* **reports.html** – net profit now equals the database (it ignored petty cash, bank charges, depreciation, disposals); cost per injera adds back the Derkosh transfer.
* **production.html** – overhead preview uses the DB rule (month overhead shared by injera produced); invented fallback prices removed; saving Efficiency Targets works on an empty table.
* **derkosh.html** – cost preview uses DB rules (avg injera production cost of the month; bag WAC) instead of fixed rates.
* **milling.html** – fee pre-fill uses "Milling Material Transport" (not "Transport", which double counted) and skips fees already charged to earlier runs.
* **inventory.html** – Opening + Purchased − Used = Current; monthly "used" no longer limited to 8 rows; low-stock % and Teff/Rice from Settings; integer guards.
* **cashflow.html** – loan late fees included in repayments.
* **sales.html / customers.html** – one settle rule (the DB trigger); 0-day terms; contact person on import.
* **overhead.html** – signs in as the logged-in user; whole-number days; negative net pay blocked.
* **loans.html** – 0% loans; "Mark Paid Off" blocked while installments are unpaid; clearer delete message.
* **profit.html** – payment channel selectable; negative-profit and 100%-ownership guards; header amounts equal what the lines pay.
* **budget.html** – actuals count approved purchases only.
* **settings.html** – WAC switch locked on (it never had an alternative).
* **js/app-state.js** – whole `business_settings` row exposed as `APP_SETTINGS`; session idle timeout enforced.
* **js/report-engine.js** – company name/address/phone/email/TIN from Settings on every export.
* **sw.js** – cache version bumped (bms-v4) so browsers load the new files.
* Removed stray file `pl` (old copy of pl.html).

## 3. Verified
Every page loads in headless Chromium with no script errors; all inline scripts pass syntax checks; Dashboard charts draw; the P&L page's net profit equals the database view; saves send exactly the DB columns (supplier, purchase, shareholder, customer, loan). A rolled-back SQL scenario confirmed: injera COGS 480 + Derkosh COGS 140 = total 620 on production cost 600 + packaging 20.

## 4. Open items / decisions for the owner
* Row-level security is OFF on every table (anyone with the public key can read/write). Needs policies before it can be enabled.
* Batch-standard targets (300/400 injera) are placeholders; real batches are ~1,750–2,400.
* Budget "actual" is a spend basis (purchases paid), the P&L is a consumption basis — intentionally different.
* `notification_email` / `notification_phone` are stored but nothing sends email/SMS yet.
* `bank_charge_etb` is never written; bank fees are recorded via the "Bank Charges" expense category.
* Dates use the device clock (UTC date between 00:00–03:00 Addis time can be the previous day).


---------------------------------------------------------------------------------------------------
# ROUND 2 — module-by-module deep audit (11 Oct 2026)

## Database (applied: migrations audit_13 … audit_15, plus checks of every earlier one)
| Problem found | Fix |
|---|---|
| **Period lock only protected milling.** "Approve & Lock" a month in Reports did not stop edits to its sales, purchases, production, derkosh, petty cash, payroll, overhead, cash entries, stock usage/adjustments, credit payments | Lock now enforced on all of those tables (a late payment on an old credit sale still works) |
| **Depreciation never ran** (no screen/job called it) so asset purchases never produced depreciation; running it twice depreciated twice; no cap at zero book value | Idempotent, capped at cost, `run_depreciation_catchup()` fills every missing month; the app calls it once per day |
| Asset purchase approved later (was pending) never created the asset or cash entry; deleting an asset purchase left both behind | Trigger now handles approval and deletion |
| Disposing an asset twice booked proceeds twice | Blocked |
| `monthly_wac` ignored opening stock → items with only an opening balance were costed at 0 (production, milling refused to run) | Opening stock counts as a purchase in its month |
| `vat_summary` / `price_history` counted pending & rejected purchases; VAT dropped months with purchases but no sales | Approved only; all months |
| `customer_profitability.avg_days_to_pay` mixed in the age of unpaid invoices | Settled credit sales only |
| New view `customer_cogs` | Real gross margin per customer (Customers page showed 0.0% for everyone) |
| No milling supplier existed → Milling raised "Mill supplier not configured" | Supplier "Mill" created and set in Settings |
| Stored script injection: free-text fields were printed into HTML by many pages | `<` and `>` are rejected in all free-text columns |
| Ownership %, shareholders, `joined_date` (see round 1) | — |

Verified in the real database with rolled-back scenarios: a full month (stock purchases → milling 13,500 → production 8,200 → Derkosh 920 → sales 8,700 → expenses, petty cash, payroll, loan interest, asset depreciation) reproduces hand-calculated P&L (net −370) and exact cash movements per channel; loan schedules add up exactly (0% and 17.5%); periods follow date edits on every table.

## Code (this zip)
* **Dates / timezone (all modules):** `toISOString()` shifts local dates back a day in UTC+3 — Cash Flow's month-end was the 30th, so every last-day-of-month transaction was dropped; "today" was yesterday after midnight; weekly production calendar days were off by one. New shared helpers `appToday()`, `localISODate()`, `monthEndISO()` (business timezone from Settings).
* **sales.html:** average price is now weighted (was a simple mean of unit prices); A/R panel and customer profitability use the database balance (partial payments were ignored; could show NaN); "Recent collections" shows real payments received (was whole sales) with the true month total.
* **customers.html:** real gross margin; credit utilization no longer inflated by customers with no limit; overpaid customers floor at 0.
* **pettycash.html:** opening balance read from `monthly_cash_flow` (own calculation skipped the first month's movements).
* **derkosh.html:** warns when injera used exceeds injera produced − sold − already used.
* **purchases.html:** foreign-currency amount × rate must agree with the ETB total (warns >1%).
* **suppliers.html:** rejected purchases are not counted as spend.
* **manage-users.html + api/create-user.js:** a manager could create an Owner or promote themselves to Owner. Now only an owner can create/promote owners and managers; names are HTML-escaped.
* **overhead.html:** clear message for duplicate month/category and for locked months.

## Still open (needs your decision)
* Row-level security is off on all tables — every rule above is enforced in the UI/triggers but anyone with the public key can still call the REST API directly.
* VAT: purchases/sales store VAT separately (price excludes VAT). If you become VAT-registered, cash paid/received includes VAT but Cash Flow counts the ex-VAT amount. Needs a decision before registering.
* No screen exists to view/dispose fixed assets (they are created from Purchases > Asset and now depreciate automatically).
* Budget "actual" is spend-based; the P&L is consumption-based (intentional).


---------------------------------------------------------------------------------------------------
# ROUND 3 — final full scan: security, JS/offline layer, exports, database soundness (13 Oct 2026)

## Security (database, applied: audit_16 … audit_19)
| Problem | Fix |
|---|---|
| Row-Level Security was OFF on every table — anyone with the public key (it is in the page source) could read, edit and delete everything, and 10 views bypassed permissions | RLS ON everywhere. Anonymous visitors have no access (except writing the login log before sign-in). Views run with the caller's permissions. Two old "anon full access" policies removed |
| Any signed-in user, even a worker, could edit shareholders, business settings, period locks and profit distributions through the API | Database now enforces: shareholders = owner only; settings, period locks, profit distributions, ownership history = owner or manager |
| A manager could promote themselves / others to Owner by calling the API directly | Trigger `users_guard_changes` blocks it in the database |
| Trigger/definer functions callable through the REST API | Execute rights revoked |
Verified in the real database (rolled back): anonymous role blocked on tables, views and functions; signed-in owner can do everything incl. trigger-driven writes; a simulated worker is blocked from shareholders/settings/locks but can still record sales; manager can lock periods but not touch shareholders. Remaining advisor note: enable "Leaked password protection" in Supabase Auth settings (a dashboard switch, not SQL).
**To undo RLS in an emergency:** `ALTER TABLE <t> DISABLE ROW LEVEL SECURITY` per table and `GRANT ALL ON ALL TABLES IN SCHEMA public TO anon`.

## JS / offline / shared layer (all files read: app-state, header, sidebar, offline-sync, report-engine, sw, api)
* **Inventory and Loans created their database client with only the public key** — every call ran as the anonymous role (worked only because RLS was off). **Milling's writes** and the old Overhead helper did the same. All now use the signed-in user's token.
* **Two token managers fought over the refresh token** (Reports, Settings gave supabase-js their own copy): a rotated/used refresh token signs the user out at random. New shared `createAppSupabaseClient()` asks the app's single token manager for the token on every call. Verified: all 19 pages issue zero anonymous calls.
* Static analysis (ESLint, every script bundle in browser load order): no undefined names or redeclared identifiers that can fail at runtime (remaining hits are `typeof`-guarded or `window.*` properties).
* Offline queue / service worker reviewed: replay order, duplicate protection (client-generated ids), rejected-item handling are sound; cache version bumped (bms-v5).
* **Export engine tested for real:** all 38 PDF / Excel / CSV exports across 16 modules generate; contents scanned for NaN / undefined / null / #DIV (none); P&L PDF figures equal the on-screen P&L. Found and fixed: **Profit's Excel export always failed** (a sheet named "History" is reserved by Excel; the engine now also guards this for every module).

## Functionality gaps closed
* **Fixed Assets screen** (Purchases page): list with cost, life, monthly depreciation, accumulated, book value, status, totals; **Dispose** action (date, proceeds, channel) that books proceeds to cash and gain/loss to the P&L. Tested in the real database: book value 900 after 3 months, gain 100 on 1,000 proceeds, double disposal blocked, depreciation stops after disposal.

## Database soundness checks that passed (real database, rolled back)
Full month scenario reproduces hand-calculated P&L and exact cash per channel; loan schedules sum exactly to principal at 0% and 17.5%; period (month) follows date edits on every table; every function and trigger re-read (loan disbursement/repayment, capital, profit distribution, transfers, milling, audit); coverage scan shows every table is used by a page; the only unused columns are `purchases.bank_charge_etb`, `purchases.expiry_date`, `shareholders.joined_date`, `budget_lines.alert_threshold_pct` (harmless defaults).

## Still your decision
* VAT handling if you register (see round 2).
* Batch-standard targets are placeholders (300 / 400 injera).
* Enable "Leaked password protection" in Supabase → Authentication.
