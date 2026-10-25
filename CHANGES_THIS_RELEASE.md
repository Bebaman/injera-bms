# Release bms-v13 - audit fixes

Pages: dashboard, inventory, settings, sales, customers, purchases, suppliers, production, derkosh, pettycash, overhead, cashflow, loans, profit, reports, budget
Shared: js/app-state.js, css/shared-shell.css, sw.js (bms-v13), api/create-user.js
Removed: the stray file "pl" (an old copy of pl.html; with clean URLs it could be served at /pl instead of pl.html)
Database (NOT applied): sql/audit_20_reject_markup_gaps.sql - run it in the Supabase SQL editor if you want it.

## Fixed
- Loans / Derkosh / Sales / Shareholders / Production / Suppliers / Petty Cash: action menus clipped, or Actions column off-screen at 1280-1440px
- Loans: Delete and Mark Paid Off use the in-page dialog (the browser confirm box can be blocked)
- Dashboard: a failed side request blanked the page; "today" alerts ignored the selected month; month picker no longer lists future months; Derkosh no longer counted as a stock item; names escaped
- Inventory: bell shows stock alerts; Adjust/Usage/Transfer/Import only on the current month; import preview escaped, negative numbers rejected; apostrophes in item names; failed reads show an error
- Settings: low-stock % must be 0-100; an unlisted session timeout is kept on Save; a failed shareholder save/delete reverts the screen
- Cashflow: about 100 requests became about 30; a failed month load no longer corrupts later opening balances; stale opening balance after edits
- Double-click on Save/Delete no longer creates duplicates (sales, payments, purchases, overhead, advances, payroll, distributions, cash entries, transfers, users)
- Petty Cash: Export Data -> PDF button
- api/create-user.js: only an owner can create owner/manager accounts; email and name validated
- app-state.js: a deactivated user is signed out directly

## Still your decision
- Reorder level 0 (Teff, Rice and most items) means no stock alert
- Notification Email/Phone in Settings: nothing sends alerts yet

## Added in v12 (line-by-line calculation audit)
- Derkosh: Closing stock KPI was the SUM of every batch's running balance (3 batches of 20 kg, 10 kg sold showed 90 kg; correct is 50 kg, same as the database). Sold kg and closing stock now cover sales larger than the month's production
- Production: a batch with no material rows no longer turns the yield rate / averages into Infinity
- Sales: a payment on one sale could be larger than what is still owed on it (the database accepted 1,500 on a 1,000 sale); now blocked
- Purchases: a purchase / edit / delete / approve that the database refused stayed on screen as if saved; now rolled back with the real reason. Delete uses the in-page dialog
- Suppliers: same fix for add / edit / activate / import
- Profit: if recording a distribution failed after its header was saved, the empty header blocked that month for good; now removed (and an old empty one is cleaned up). History loads in 2 requests instead of 2 per month
- Overhead: one failed request could switch the page to the old mode that writes NET pay into labor overhead (the database uses gross); it now stays in the current mode
- Budget: interest actual now = interest paid in the month incl. late fees (same as the P&L), not scheduled interest

## Added in v13
- Customers / Sales: the payment lookups put every sale id in one web address, which fails for a customer with several hundred sales (the page then showed zeros). They now ask in batches of 80 (sbGetInChunks in app-state.js). Results are identical; I could not reproduce the address-length limit in my test, so this is a safeguard
- Exports: every PDF and Excel export on 17 pages produced a file with no errors, and the figures inside the Excel files match the screen (P&L, Dashboard, Reports)

## Checked and correct (no change needed)
- Database chain on a hand-computed scenario: purchases -> milling (11,200 total, 80/kg) -> weighted-average blend cost -> batch cost -> cost per injera -> Derkosh transfer -> COGS -> gross profit; cash by channel (milling's internal purchase is excluded from bank)
- P&L page, Reports and Dashboard show the same figures as monthly_pnl_net; loan payment preview = database annuity; payroll gross = base x days present / days in month

## Note (not changed)
- Budget "actuals" are spend-based (purchases of materials, not materials consumed), so its Net Profit is not the same figure as the P&L's Net Profit
- The database accepts a payment larger than its sale; the pages now block it, a database rule would block it everywhere
