/* ============================================================
   MENA INJERA & DERKOSH BMS — SHARED REPORT ENGINE
   report-engine.js  (v3.39)
   ------------------------------------------------------------
   WHAT'S NEW IN v3.39 - wiring fixes found while connecting sales / purchases / profit / reports
   - Chart.js plugins registered globally by a page (the pages load chartjs-plugin-datalabels and call
     Chart.register(ChartDataLabels)) no longer leak into the engine's off-screen charts: datalabels is switched
     off for every engine chart, so exported PDFs / Excel images never get stray value labels on top of the
     engine's own labels.
   - PALETTE (the colours the presets hand to donut charts) now follows THEME.palette, so every donut uses the
     same forest / gold / sage / slate / clay / plum set as the rest of the redesign.

   WHAT'S NEW IN v3.38 - Multi-Year preset (reports.html)
   - presets.multiyear(input): Summary page = 6 KPI cards (revenue, COGS, net profit, net margin, injera and
     derkosh produced), Revenue Trend and Net Profit Trend charts, Key Insights, and the Year-over-Year Summary
     beside Production by Year. Detailed PDF / Excel adds the YoY P&L, revenue, COGS, profit and margin, product
     mix, per-unit economics (injera and derkosh), top customers, concentration, retention / churn, ingredient
     prices, seasonality, variance and COGS decomposition (amounts and mix), each with a chart where one helps.
   - The engine does not recalculate the module: the page passes the figures it already computes (input contract
     is documented above the preset). Anything not supplied is left out. A part-year (YTD) is compared with the
     same months of the previous year when input.years[].likeForLike is given, never with a full year.
   - Reconciliation checks run only on figures the page supplies (gross profit, net profit, COGS components vs.
     total COGS). No other preset, chart or layout changed.
   - Engine, opt-in and used only by this preset: reportData.detailSections = [{ title, charts?, tables?, insights? }]
     prints the detailed PDF as an ordered list of sections (heading, charts two to a row, then tables) instead of
     "all extra charts, then all tables". Multi-Year uses it to follow the plan: YoY P&L, Revenue, COGS, Profit &
     Margin, Production, Product Mix, Per-Unit Economics, Customers, Ingredients, Seasonality, Variance, COGS
     Decomposition, then the Executive Summary as the conclusion. Excel / CSV ignore it. reportData.typeTitles =
     { summary, detailed } sets the page title per PDF type ("Multi-Year Report — Summary" / "— Detailed").
     drawCharts takes an optional { perRow } so a lone chart can stay half width. Without these fields every
     other module renders exactly as before.

   WHAT'S NEW IN v3.37 — unit economics, product mix and top buyers
   - Production: two new KPI cards, "Cost per Injera" (production cost / injera produced, with the change vs. the
     previous period when input.previousCostPerUnit is given) and "Profit per Injera" (average selling price less
     cost per injera, with the margin). The Production Cost card now shows cost per batch instead (the per-injera
     figure has its own card). Profit needs a selling price: input.avgPrice (aliases sellingPrice / avgSellingPrice)
     or input.injeraRevenue + input.injeraSold; without one the card is left out and the footer says why. Detailed
     PDF / Excel: new "Unit Economics per Injera" table (price, cost by component, cost, profit, margin) and, when a
     price is known, a "Profit / Injera" column on "Cost Detail by Batch". A Key Insight states the profit per injera.
   - Derkosh: two new KPI cards, "Cost per kg" and "Profit per kg", per kg SOLD (profit per kg = gross profit / kg sold;
     cost per kg = average price - profit per kg), so they always tie to the Gross Profit card; the cost card says
     "Estimated cost" when the engine had to fall back to an estimate. Detailed PDF / Excel: new "Unit Economics per kg"
     table with memo lines for this period's production cost per kg and the BMS weighted-average cost.
   - Dashboard (management): Product Mix. The Key Insights always keep a slot for it (e.g. "Product mix: Injera 78% ·
     Derkosh 22% of revenue", plus the biggest share move when prior revenue is given). Input: input.productMix =
     [{ name, revenue, previousRevenue?, grossProfit? }] or the shortcut injeraRevenue / derkoshRevenue (+
     previousInjeraRevenue / previousDerkoshRevenue, injeraGrossProfit / derkoshGrossProfit). Detailed PDF / Excel: a
     "Product Mix" table (revenue, share, prior share and change, gross profit and margin when supplied; revenue not
     assigned to a product is shown as "Other revenue" so the table foots to total revenue) and a donut chart. Nothing
     changes when no product revenue is supplied.
   - Customers: the page no longer answers only "who owes us". The Summary gets a "Top Buyers" panel (ranked by
     revenue, share of revenue) beside the A/R chart, and the Key Insights now give buyers at least two of the four
     slots (top buyer and whether they also owe, dependence on one customer, top-3 share, customers who stopped
     buying or are buying less). Detailed PDF / Excel, placed first: "Top Buyers — Full Ranking" (rank, revenue,
     share, cumulative share, owes, typical days to pay, and orders / average order / change vs. last period / last
     order when the page supplies them), "Revenue Concentration" (top 1 / 3 / 5 / 10 and the average per buying
     customer) and "Customers With No Purchases This Period". New optional customer fields: orders, lastOrder,
     previousRevenue. Everything is built from figures the page already passes; the extra fields only add columns.

   WHAT'S NEW IN v3.36 — the last leftovers (everything except the KPI cards is now on the new design)
   - "No data" page: soft tinted dashed card with a gold tick and sentence-case message (PDF and Excel).
   - Excel: forest titles with a gold rule, sentence-case section labels (Overview charts, Highlights,
     ranking titles), plain (non-italic) meta line, insight tags in sentence case.

   WHAT'S NEW IN v3.35 — header, footer and ranked lists join the new look
   - Page header: forest company name, hairline rule with the same short gold tick as the section headings.
   - Footer rule is the same hairline; text positions are unchanged.
   - Ranked lists: soft rank badges (gold ring for #1), forest values, hairline separators, and a slim
     proportion bar under each row when every value is a positive number (opt out: rankedList.bars = false).

   WHAT'S NEW IN v3.34 — proportions & resolution
   - Every chart bitmap is now rendered at the exact aspect ratio of the box it is placed in (the
     extra-charts grid used a fixed 900x420 render squeezed into a 1:0.55 box = visible distortion).
   - One print-resolution rule for all charts: 4.2 px per PDF point (~300 dpi). Chart.js is pinned to
     devicePixelRatio 1, so a retina screen no longer produces a different bitmap than a normal one.
   - Chart text is sized in points (7-7.6 pt) instead of as a fraction of canvas width, so labels stay
     the same physical size in every panel. Donut centre text scales with the canvas and shrinks to fit
     the hole. Excel charts render at 1100x600 for a 330x180 slot (same 11:6 ratio, 3.3x density).
   - PDF chart images are Flate-compressed ('FAST') so the higher resolution doesn't bloat the file.

   WHAT'S NEW IN v3.33 — complete visual redesign ("teff & forest")
   -----------------
   - Tables: no more boxed grid. Hairline row rules, a forest-green rule under the header and above the
     totals row, a barely-there zebra tint, sage section bands, right-aligned numeric columns by default.
     Excel follows the same look (no gridlines, hairline rules, forest header rule).
   - Charts: every bar / line chart now goes through the refined "clean" renderer unless a spec asks for
     style:'classic'. Soft gradient bars with rounded tops, dashed light gridlines, gradient area under
     lines, calm categorical palette (THEME.palette) with teff-gold as the single warm accent, negatives
     in clay red. Donuts: rounded, spaced segments, a thinner ring and the share printed on each segment.
   - Cards: chart panels and insight cards share one soft card (hairline border + faint shadow).
     Section headings are sentence case with a short gold tick. KPI cards are unchanged.
   - Nothing about the data contract changed: every existing chart spec / table / preset renders as before,
     only the look is new. chartSpec.style = 'classic' keeps the old chart look for a single chart.

   WHAT'S NEW IN v3.32 — audit fixes (pagination, reconciliation, validation, CSV)
   -----------------
   - Pagination: detail tables no longer break into the footer band (autoTable's bottom margin is now
     62pt, the same clearance the insight cards and charts already used). Every titled table in the
     detailed PDF goes through drawTitledTable(): the heading is only drawn when the header row and
     the first rows (or the whole table, when it is short) fit below it, otherwise both move to the
     next page together. The fixed "y > pageHeight - 192" guesses are gone.
   - Reconciliation: every check now has a status — Matches, Differs, or Not checked (with the reason).
     A check that could not be made (non-numeric cells, a declared column with no total, a declared table
     with no totals row, a statement-style table, a custom check with a missing figure) is listed as
     Not checked in amber instead of silently disappearing, so it can never be read as a pass. A table
     that has no totals row and declares nothing (a plain ledger) is not listed: there is nothing to check. A table may name its additive columns explicitly with
     table.additive = [columnIndex | 'Column name', ...], or switch the engine's own checks off with
     table.reconcile = false. Without either, the old column-name heuristic still applies.
   - Validation: validateReportData() now also checks KPI items (label + value), insight items,
     rankedList, definitions, custom checks, table row / totals-row widths against the column count
     and, for PDF, every chart spec — so a malformed input fails with one clear message before
     rendering starts rather than part-way through.
   - CSV: an empty report no longer throws; it downloads a one-row "No data" CSV, matching the PDF and
     Excel empty states. Per-table CSVs accept { excludeTotals: true } to leave the totals row out
     (pure data), and every row is padded to the header width so files stay rectangular. Use
     { perTable: true } for anything that will be imported into another system.

   WHAT'S NEW IN v3.31 — Sales preset (Detailed Report Design Plan, the last module)
   -----------------
   - presets.sales(input): Sales built in the engine like every other module. Summary page: Total Sales
     (vs. the previous period), Units Sold, Average Sale Value, Credit Sales and Outstanding A/R cards, a
     daily sales trend, a sales-by-product donut, Key Insights, a short ledger and the top customers.
     Detailed PDF / Excel: "Daily Sales Breakdown" (with running total; undated sales listed last),
     "Sales by Product Type" (quantity, share, average price), "Payment-Method Breakdown", "Customer Sales
     Detail" (revenue, share, credit sales, amount owed), "Credit Sales and Outstanding A/R Detail" (each
     credit sale with collected, owed and, when input.asOf is given, days open) and the full Sales Ledger.
   - Credit sale = payment method or status says credit / unpaid / partial / open. Owed comes from
     balance, else amount - paid, else the full amount of an unpaid sale; otherwise it is UNKNOWN: shown as
     "—", left out of Outstanding A/R and named in a note. Checks tie every table to the ledger and, when
     input.customerBalances is given, the owed total to the BMS balances. The existing Sales page is not
     changed by this; it keeps working until it is switched to presets.sales.

   WHAT'S NEW IN v3.30 — Cash Flow and Budget transaction detail (Detailed Report Design Plan, final pass)
   -----------------
   - Cash Flow: "Cash Movement by Date and Channel" (every day with cash movement: net by Cash / Bank /
     Mobile, inflow, outflow, net and the running balance from the opening cash), "Transaction Detail vs.
     Statement by Channel" (each channel's inflow and outflow from the transaction lists set beside the
     statement, Matches / Differs) and, when inflows / outflows carry activity: 'operating' |
     'investing' | 'financing', "Cash Movements by Activity" (every movement under its activity with
     a net per activity, checked against the statement). Optional reference on a movement is printed
     with its description. Checks: closing cash rebuilt from the dated movements, each channel's inflow
     and outflow, and each activity. A movement with no date or channel is listed last / as Unassigned,
     and a note says how many; nothing is guessed. The Summary page and the statement are unchanged.
   - Budget: "Supporting Transactions by Budget Line" now lists the transactions behind EVERY line
     (not only lines that are Over / Miss), grouped by section with each line tagged by its status, a
     subtotal per line and a total per section. Each line's actual is checked against its
     transactions; lines with no transactions and transactions matching no line are named in the
     notes. Replaces "Transactions Behind Significant Variances" (the 60-row cap is gone). The
     Summary page is unchanged.
   - Hardening: a preset input that should be a list (batches, sales, items, transactions, loans,
     expenses and the like) but arrives as anything else is now treated as empty instead of
     throwing. Checked by running all 15 presets with empty, null and malformed input: no crashes,
     and every table's rows, totals row, row kinds and alignment match its columns.

   WHAT'S NEW IN v3.29 — Dashboard detail (Detailed Report Design Plan, remaining modules, 6)
   -----------------
   - Dashboard: "Headline Figures vs. Prior" (the six headline figures with the prior value, change and
     change %, red / green by whether the move is good for that figure), "Expense Split" as exact amounts
     and shares, "Revenue vs. Expenses by Period" with a detailed-PDF chart (input.expenseTrend =
     [{ label, amount }] beside revenueTrend; periods are matched by label and a period missing from
     one side shows "—", never zero) and "Items Needing Attention" (every module the table flags, plus
     cross-module alerts with the figures behind them: collections vs. cash, net loss, revenue drop; and
     any input.alerts = [{ module, issue, detail, tone? }] the page adds). totals.expenses, when given,
     is checked against the expense split. The Summary page is unchanged.

   WHAT'S NEW IN v3.28 — Profit & Loss detail (Detailed Report Design Plan, remaining modules, 5)
   -----------------
   - Profit & Loss: "Supporting Transactions by Line" (input.transactions = [{ line, section?, date,
     description, amount, reference? }]) lists the records behind every revenue, cost-of-goods-sold
     and operating-expense line, grouped in statement order with a subtotal per line and a grand total,
     so any figure on the statement can be traced to its source. The Notes and Reconciliation page
     checks each line's statement amount against its transactions, and says which lines have no
     transactions and which transactions match no line (those are left out of the table, not guessed
     into a line). Without input.transactions nothing changes. The Summary page is unchanged.

   WHAT'S NEW IN v3.27 — Overhead detail (Detailed Report Design Plan, remaining modules, 4)
   -----------------
   - Overhead: "Labor Cost by Employee" (role, entries, gross pay, cost to the business and share of
     labor, so the payroll can be read person by person) and "Overhead by Payment Channel" (entries,
     amount and share for Cash / Bank / Mobile, with labor and non-labor split out). Checks compare the
     Summary totals with the entry detail and the current month in the monthly history. An entry with no
     employee name is grouped as "Unnamed", and one with no channel as "Not stated"; a note says how many.
     The Summary page is unchanged.

   WHAT'S NEW IN v3.26 — Petty Cash detail (Detailed Report Design Plan, remaining modules, 3)
   -----------------
   - Petty Cash: "Cash Position Calculation" (opening balance + replenishments = funds available,
     less spent = calculated remaining, set beside the remaining cash the page reports, with the
     difference), "Spending by Day" (transactions, amount, running total and cash left after each day),
     "Spending by Channel" (when transactions carry a channel), "Receipt Coverage" (with / without a
     receipt reference: count, amount, share) and "Transactions Without Receipt Reference" (each one
     listed). Checks compare the remaining cash with opening + replenishments - spent, the spent figure
     with the ledger, and the missing-receipt amount with the coverage table. Summary page unchanged.

   WHAT'S NEW IN v3.25 — Customers detail (Detailed Report Design Plan, remaining modules, 2)
   -----------------
   - Customers: "Customer Aging Detail" (every customer's balance in Current / 30+ / 60+ / 90+ days,
     plus any balance with no invoice age), "Payment Terms and Behaviour" (terms, typical days to pay,
     days late against the terms, oldest open invoice, status), "Customer Revenue and Credit Sales"
     (every customer's revenue, share of revenue, credit sales, credit share and open balance) and,
     when invoices are supplied, "Open Invoices" (each unpaid invoice with its age, how far past the
     customer's terms it is, and an optional invoice reference). Checks compare revenue, credit sales
     and outstanding A/R with the Summary. The Summary page is unchanged.

   WHAT'S NEW IN v3.24 — Production detail (Detailed Report Design Plan, remaining modules, 1)
   -----------------
   - Production: "Production by Day" (batches, units, rejected, average yield, cost and cost per
     injera for each production day, with totals) and "Yield and Rejects by Batch" (units, rejected,
     good units, reject rate, yield and the gap to the yield target). Rejected quantities are shown
     only for batches that record them (batches[].rejected); a batch without one shows "—" and is left
     out of the reject totals, and a note says how many. Yield is the BMS figure for each batch and the
     engine only displays it. Checks compare units and cost with the Summary. The Summary page is unchanged.

   WHAT'S NEW IN v3.23 — Inventory detail (Detailed Report Design Plan, gap-closing pass)
   -----------------
   - Inventory: "Stock Movement by Item" (opening + received - used (+ adjustments) = calculated
     closing, set beside the reported closing with the difference; an item that cannot be rebuilt
     shows "—" rather than a guessed figure), "Low Stock and Reorder Detail" (closing against the
     reorder level, days of supply and the last receipt; drawn only when movements carry receipt dates) and "Inventory Movement
     Records" (every movement in date order with its type, signed quantity, reference and balance
     after, when supplied). Received / used come from the item's own figures, else from the movements.
     A check reports how many items do not reconcile, so the Notes and Reconciliation page shows it.
     Every table appears only when the page passes the data for it. The Summary page is unchanged.

   WHAT'S NEW IN v3.22 — Loans detail (Detailed Report Design Plan, gap-closing pass, 3 of 4)
   -----------------
   - Loans: "Loan Position by Loan" (principal, principal repaid, % repaid, outstanding, interest paid,
     next due date, overdue amount), "Overdue Payments" (each overdue instalment with its principal,
     interest and days overdue), "Payments Made" (paid instalments; a Paid On column and days
     early / late appear when paid dates are supplied) and "Still to Pay by Month" (unpaid
     instalments grouped by due month). Checks compare the outstanding balance with the principal
     still in the schedule, and the interest-paid figure with the per-loan detail. The register and
     the full repayment schedule were already printed by the detailed PDF. The Summary page is unchanged.

   WHAT'S NEW IN v3.21 — Purchases detail (Detailed Report Design Plan, gap-closing pass, 2 of 4)
   -----------------
   - Purchases: "Spend by Type" (raw materials / operating / other, reconciled to the KPIs),
     "Purchase Trend by Week", "Item Breakdown by Category" (appears when purchases carry a
     description), "Approval Status" (when statuses are recorded) and "Awaiting Approval" (every
     pending purchase, large ones flagged, with a check against the Large Expenses Pending figure).
     The full purchase ledger and the full supplier list were already printed by the detailed PDF.
     The Summary page is unchanged.

   WHAT'S NEW IN v3.20 — Milling detail (Detailed Report Design Plan, gap-closing pass, 1 of 4)
   -----------------
   - Milling: "Conversion Detail by Run" (date, batch, teff, rice, total input, blend, yield, total
     cost, cost per kg, status — a column appears only when at least one run carries it),
     "Inputs Used" (teff vs. rice, quantity and share) and "Cost and Inventory Value" (runs, blend
     produced, total conversion cost, average cost per kg, inventory value generated).
   - Runs with no cost are left out of the average and the inventory value, and the Notes and
     Reconciliation page says how many; definitions explain yield, cost per kg and inventory value.
     The Summary page is unchanged.

   WHAT'S NEW IN v3.19 — Suppliers, Derkosh and Profit Distribution detail (Detailed Report Design Plan, step 7)
   -----------------
   - Suppliers: "Purchases by Supplier" (purchase count, quantity, total, share of spend, average
     price, paid / owed when payments are recorded, on-time %) and "Purchase Detail by Supplier"
     (every purchase grouped under its supplier, with a subtotal per supplier and a grand total;
     optional Item / Reference columns appear only when the purchases carry them).
   - Derkosh: "Production vs. Sales Quantity" (every day with production or sales: produced, sold,
     net, running net, with totals that must match the Summary); when openingStock is supplied, a
     "Stock Movement" table (opening + produced - sold = calculated closing stock).
   - Derkosh: "Revenue and Gross Profit by Customer" and "Sales Ledger with Gross Profit" (every
     sale with its revenue, cost of goods sold, gross profit and margin). COGS follows the same
     order as the Summary (BMS figure first, WAC next, an estimate only as a disclosed last
     resort); a sale with no cost shows "—" rather than a guessed profit.
   - Profit Distribution: "Distributable Amount Calculation" (the BMS passes its own steps as
     input.calculation; without them the engine lays out the figures it was given — cash in, cash
     out, net cash profit, distributable amount, closing cash, headroom — and invents none),
     "Shareholder Split" (ownership %, share of the distributable amount, recorded and pending
     distributions), "Cash In vs. Cash Out by Period", "Owner Injections" and, when supplied,
     "Closing Cash by Channel".
   - Each of these adds cross-checks (reportData.checks) so the Notes and Reconciliation page
     shows whether the detail adds up to the Summary figure. The Summary pages are unchanged.

   WHAT'S NEW IN v3.18 — Inventory, Petty Cash and Customers detail (Detailed Report Design Plan, step 6)
   -----------------
   - Inventory: "Price Movement by Item" (records, first and latest price with dates, change).
   - Petty Cash: "Spending by Category" (every category, share) and "Largest Expenses" (top ten).
   - Customers: "A/R Aging by Bucket" with exact amounts and share of aged A/R.
   All appear in the detailed PDF and Excel; the Summary pages are unchanged.

   WHAT'S NEW IN v3.17 — Production and Overhead detail (Detailed Report Design Plan, step 5)
   -----------------
   - Production: new "Cost Detail by Batch" table (date, batch, units, material, overhead, other,
     total cost, cost per injera) in the detailed PDF and Excel. Total cost is the BMS figure when
     supplied; if the BMS period total is larger than the batches add up to, the reconciliation
     section shows that difference rather than hiding it.
   - Overhead: new "Overhead by Category" (every category, labor / non-labor, share) and
     "Monthly Overhead" (total, labor, non-labor, change vs the prior month) tables.

   WHAT'S NEW IN v3.16 — Notes and Reconciliation (Detailed Report Design Plan, step 4)
   -----------------
   - Every detailed PDF now ends with a "Notes and Reconciliation" section: reconciliation checks
     (for each table with a totals row, the sum of the additive columns vs. the reported total,
     "Matches" or "Differs by ..."; per-unit / % / average / balance columns are skipped), then
     optional definitions (reportData.definitions = [{ term, text }]), then ALL notes in full
     (the footer only has room for three lines). A module can add cross-checks of its own with
     reportData.checks = [{ label, expected, actual, tolerance? }] and extra notes with
     reportData.notes = ['...'].

   WHAT'S NEW IN v3.15 — page footer on every page (Detailed Report Design Plan, step 3)
   -----------------
   - Every page footer now carries the module and period plus the generation time, next to the
     page number (continuation pages used to show only "Page n of N"). One timestamp is shared
     by the header and all footers.

   WHAT'S NEW IN v3.14 — empty tables (Detailed Report Design Plan, step 2)
   -----------------
   - A table with no rows is drawn as one quiet "No records for this period." box (override with
     table.emptyMessage) instead of a bare header row and an all-zero totals line. Applies to
     every table in every module, summary and detailed.

   WHAT'S NEW IN v3.13 — detailed PDF: full ranked lists (Detailed Report Design Plan, step 1)
   -----------------
   - The ranked list on the Summary (Top Suppliers, Sales by Customer, Top Debtors, Reorder Now ...)
     shows only a few rows. The detailed PDF now lists EVERY item as a "... — Full List" table
     (only when the Summary left some out), and the Excel export now carries every item too,
     not just the first maxRows. Applies to every module that passes a rankedList.

   WHAT'S NEW IN v3.12 — hardening pass (no design changes)
   -----------------
   - The Summary page is strictly ONE page. drawSummarySection() no longer adds pages: Row 2
     is capped so Row 3 keeps room, every Row 3 table is fitted to the space actually left
     (summaryMaxRows is only the starting cap; rows are trimmed further if needed, with the
     "+ N more rows" note), ranked lists show only the rows that fit, and as a safety net any
     overflow page autoTable still creates is removed. Whatever the page cannot show is
     printed in full in the detailed PDF and always present in Excel/CSV. The detailed pages
     now always start on a fresh page after the Summary.
   - Key Insights are never silently dropped. One shared layout routine (layoutInsights)
     sizes the column AND draws it. Too much text is first compacted (font/spacing, three
     levels), then shortened with "..." (never below one line per card); the full text is
     then printed in the detailed PDF and a footer note says it was shortened. Only an
     unusually long list can still leave trailing cards off, and that is disclosed the same way.
   - Production: accepts the BMS-calculated batch cost (batches[].cost) and period cost
     (totals.cost) and displays it as-is instead of recomputing material + overhead + other.
     The Cost Breakdown adds an "Other / unallocated" row so it still foots to the BMS total.
     With no BMS cost supplied it falls back to the component sum and says so in the footer.
   - Derkosh: accepts the BMS weighted-average cost (unitCost / wac) and totals.cogs. COGS
     comes from totals.cogs, then the sales rows' cogs, then units sold x WAC; only if none
     is given does it estimate from the period's average production cost, with a footer note.
   - Report-engine rule: the BMS calculates, the engine only formats and presents.

   WHAT'S NEW IN v3.11 — a second, quieter chart look for Cash Flow, P&L and Budget
   -----------------
   - chartSpec.minimal (with style:'clean'): no axes and no gridlines — thin pill-shaped bars, one
     soft baseline, every value written on its bar, and a lighter card frame on the summary page.
     chartSpec.precise keeps one decimal above 100K (265.9K); labelTexts prints exact text per bar;
     chartSpec.stacked puts bars of one month in one column (up for positive, down for negative).
   - Cash Flow summary chart is now a waterfall from OPENING cash through operating, investing
     and financing to CLOSING cash. Its detailed charts are Monthly Cash Flow (inflow above the
     baseline, outflow below, net as a line) and Opening vs. Closing Cash by Channel.
   - P&L and Budget charts use the same quiet look, with a softer green / amber / coral palette.

   WHAT'S NEW IN v3.10 — a cleaner chart style, used by Cash Flow, P&L and Budget
   -----------------
   - chartSpec.style = 'clean' (opt-in; every other module's charts look exactly as before).
     Text is sized from the picture width so axis labels and legends are readable on the page,
     bars/points carry short value labels (458K, 1.2M, 103%), gridlines are light and
     horizontal-only, bars are rounded, long names wrap, and the legend sits clear of the axis.
   - P&L summary chart is now a waterfall (revenue -> costs -> gross profit -> operating
     expenses -> net profit); the P&L trend is revenue bars with net profit as a line on its own
     right-hand axis; the expense donut shows each share in its legend.
   - Budget charts run horizontally (budget vs. actual by section, utilization with a dashed
     100% line, favourable / unfavourable variance by line); monthly stays vertical.
   - New chartSpec fields: horizontal, labelFormat, valueLabels, labelSeries, ranges,
     labelValues, connectors, refLine, and series[].type / series[].axis for bar + line combos.

   WHAT'S NEW IN v3.9 — Cash Flow, Profit & Loss and Budget get the dashboard summary page
   -----------------
   - The three statement modules now use the same page as every other module. Summary: KPI
     cards (Cash Flow 5, P&L 6, Budget 5), one main chart, Key Insights and a compact table
     that fits one landscape page. The formal statement is unchanged (IAS 7 by channel,
     IAS 2 with overhead in cost of goods sold, favourable-positive variances) and is the first
     page of the detailed PDF. Pass layout:'statement' to a preset for the old statement-only page.
   - Detailed PDF, per module (every extra is optional; whatever the page does not pass is
     simply not drawn, and nothing unknown is shown as zero):
       Cash Flow  - full statement; monthly inflow/outflow and net cash trend charts (history);
                    inflow and outflow transaction tables; reconciliation; exceptions table.
       P&L        - full statement; period comparison with Change and Change %; revenue and
                    net profit trend, gross vs net, expense-split donut; revenue breakdown by
                    product (quantity, average price, and product profit only when costs exist);
                    expense breakdown; data notes.
       Budget     - full line-by-line table with Trend; utilization and variance charts; monthly
                    comparison; variance explanation (overs, unders, lines with no budget);
                    the transactions behind lines that are over budget or missed.
   - Engine: chart.detailOnly keeps a chart off the summary page and in the detailed PDF;
     table.beforeCharts prints a table ahead of the extra charts in the detailed PDF;
     reportData.detailChartsTitle renames the extra-charts heading; table.sheetName sets a
     short Excel sheet name. With none of these set, behaviour is exactly as before.
   - Budget no longer adds revenue and expenses into one "total variance": cards read
     revenue, expenses and the net result separately.

   WHAT'S NEW IN v3.8 — minus signs, green profit / red loss
   -----------------
   - Negative numbers are written with a minus sign (-1,234.50, -2.8%), never in brackets.
     This is the shared formatter (ReportEngine.format.n), so every preset follows it; the
     default footer note now says so. A value that rounds to zero prints as 0, never -0.
     Reports a page builds itself (e.g. Sales) pass their own strings and are not affected.
   - Profit and Loss: gross and net profit rows are green when positive and red when
     negative, and the labels switch between GROSS PROFIT / GROSS LOSS and NET PROFIT / NET
     LOSS. The Budget net line and Cash Flow's net change in cash follow the same colouring.

   WHAT'S NEW IN v3.7 — Budget (the last planned module design)
   -----------------
   - presets added in v3.7: budget
   - Budget (presets.budget): Particulars / Budget / Actual / Variance / Variance % / Trend vs.
     Prior Month / Status, line by line, with a subtotal per section and a net line when the
     report has both income and expense sections. Income lines are Beat / On Target / Miss,
     expense lines Under / On Target / Over (within tolerancePct, default 2%, is On Target).
     Variance is favourable-positive by default, so red always means "worse than budget"
     (varianceSign:'raw' gives Actual - Budget). Trend compares each line's distance from
     budget with last month's, in points (Better / Steady / Worse). No cards, no chart.
     Notes: how many lines met budget, the biggest gap, the net result vs. budget, the trend.
   - With Budget, every module in the PDF Export Design Plan has a preset: the 13 dashboard
     designs (Sales is page-built as the reference) and the 3 statements.

   WHAT'S NEW IN v3.6 — Profit & Loss
   -----------------
   - presets added in v3.6: pl
   - Profit & Loss (presets.pl): Particulars / This Month / % of Revenue / Year-to-Date /
     % of Revenue on an IAS 2 basis — Revenue, Cost of goods sold (overhead included), GROSS
     PROFIT with its margin, Operating expenses, NET PROFIT / (LOSS) with its margin. No cards,
     no chart. The Year-to-Date columns appear only when every line has a ytd figure (a
     half-filled column would understate totals; a footer note says when it is dropped).
     Notes: an opex line labelled "overhead" is flagged (IAS 2 puts it in COGS), net profit or
     loss, revenue and gross-margin movement versus last month, the largest cost, YTD result.

   WHAT'S NEW IN v3.5 — statement modules, one at a time (Cash Flow first)
   -----------------
   Same opt-in rule as before: nothing here changes how any earlier preset renders.
   - presets added in v3.5: cashflow
   - Cash Flow (presets.cashflow): the IAS 7 Direct Method statement as the plan describes —
     opening balance, then Operating / Investing / Financing activities with a subtotal for
     each, net increase / (decrease), and the closing balance, across the Cash, Bank and
     Mobile channels plus a Total column. A second table reconciles each channel's opening
     balance against last month's computed closing balance (Reconciled / Difference, colour
     coded). No KPI cards, no chart. Notes underneath flag a negative channel balance, an
     opening balance that does not match last month, a closing figure that disagrees with the
     statement, operating cash burn and the movement in total cash.
   - Fix (PDF text): four spots wrote characters the embedded Nunito/Quicksand subsets have
     no glyph for, so they would have printed as blanks/boxes whenever they fired — the
     arrow in the Overhead "rising every month", Customers "bucket grew" and Suppliers
     "price hike" insights (now ", " / "to"), and the ellipsis that Petty Cash appended to a
     shortened description (now three dots).

   WHAT'S NEW IN v3.4 — the last planned module designs
   -----------------
   Same opt-in rule as before: nothing here changes how any earlier preset renders.
   - presets added in v3.4 (one at a time, in plan order): profit, dashboard
   - Profit Distribution (presets.profit): Net Cash Profit / Distributable / Closing Cash /
     Owner Injections cards, a Cash In vs. Cash Out line chart, the shareholder-split donut
     (the 80/20 ownership), Key Insights (cash short of the distributable amount, distributable
     down on last month, pending distributions, owner injections), and the Distribution History
     table. Cancelled distributions stay visible in the table but are left out of its total.
   - Dashboard (presets.dashboard): the six-KPI row (Total Revenue / Net Profit / Gross Profit /
     Cash Balance / Outstanding A/R / Derkosh Stock) as ONE tight row of six cards — the open
     "two rows or one" question from the plan is settled as one row. Revenue Trend line, Expense
     Split donut, cross-module Key Insights (A/R rising while cash falls, net loss, A/R share of
     revenue, modules needing attention, Derkosh days of cover) and a one-row-per-module summary
     table (value, unit, vs. prior, status). Figures over 10 million shorten to 12.5M.
   - Fix (drawKPICards): when a long value pushes the unit onto its own line, the delta line
     ("+14.6% vs Aug") used to be drawn on top of it; it now sits one line lower in that case
     only. Cards where the unit fits beside the value are unchanged.

   WHAT'S NEW IN v3.3 — the rest of the planned module designs
   -----------------
   Same opt-in rule as v3.2: nothing here changes how Sales, Purchases, Production,
   Derkosh or Milling render. New presets are added one module at a time, in the order
   of the PDF Export Design Plan:
   - presets added in v3.3: inventory, overhead, pettycash, customers, suppliers, loans
   - Inventory: Reorder Now list + Stock Status table (most urgent first), a Price
     Trend chart (one item as an actual price, several as % change), and an extra
     "Expiring Soon" table that appears in the detailed PDF / Excel only.
   - Overhead: month-over-month trend chart (total + labor), an exact Labor vs. Non-Labor
     table in the middle slot (no donut), and the payroll / overhead ledger with an
     overhead-vs-output insight when production volumes are supplied.
   - Petty Cash: both charts kept as designed (daily spending bars with the peak day
     highlighted + a top-categories donut), and a ledger whose missing receipt
     references are flagged in amber and called out in Key Insights.
   - Customers: A/R Aging bar chart (Current / 30+ / 60+ / 90+ days, bars coloured green to
     red), Aging Detail table with a derived Status per customer, and a Top Debtors list.
     Aging is built from open invoices or per-customer buckets; any receivables with no
     invoice age are called out in the footer rather than silently left out of the chart.
   - Suppliers: price-trend lines for the biggest suppliers (plus a market-average line when
     one is supplied), a Supplier Comparison table with "vs. Market Avg." and on-time %
     colour-coded, and a Top Suppliers by Spend list. Without an external market average
     the "market" is the all-supplier weighted average, and a footer note says so.
   - Loans: no chart, as designed — Key Insights at full width, then the Loan Register and the
     Repayment Schedule side by side (reportData.summaryTables = 2). The schedule lists what
     is still to be paid first (overdue leading, in red), paid instalments after.
   ------------------------------------------------------------
   WHAT'S NEW IN v3.2 — the remaining module designs from the PDF Export Design Plan
   -----------------
   Everything below is opt-in. A reportData that uses none of it (e.g. the Sales
   report) renders exactly as it did in v3.1 — verified page-for-page.
   - ReportEngine.presets.<module>(input) — one preset per planned design. The page
     passes its own computed figures; the preset returns the complete reportData
     (KPIs, charts, generated Key Insights, tables, ranked list). Modules done so far:
     purchases, production, derkosh, milling.
   - ReportEngine.format — the number helpers the presets use (money, pct, ...).
   - Table cells may be { v, tone, bold } objects; tone = good | warn | bad | info | muted
     colours the cell (status columns: Overdue, Reorder, Beat, Miss ...). Excel and CSV
     still receive plain values.
   - table.rowKinds (section | line | subtotal | total | pct | note), table.statement,
     table.alignNumeric, table.negativeRed, table.columnAlign — statement-style row
     formatting, right-aligned numbers, red negatives. Mirrored in Excel.
   - table.summaryMaxRows — the PDF summary page shows the first N rows plus a
     "+ N more rows" line; the detailed PDF prints the full table, Excel/CSV always
     carry every row.
   - reportData.summaryTables = 2 — Row 3 shows tables[0] and tables[1] side by side
     (Loans: register + repayment schedule) instead of table + ranked list.
   - reportData.panelTable — a compact table in the Row-2 middle slot when there is no
     second chart (Production cost breakdown, Overhead labor split). Also exported to
     Excel/CSV as the last table.
   - reportData.layout = 'statement' — formal statement pages (Cash Flow, Profit &
     Loss, Budget): no KPI cards or charts, full-width statement tables. Optional
     statementTitle / statementBasis.
   - Documentation fix: generatePDF has always defaulted to 'landscape' (as the code
     comment says); the v3.1 note below that says the default stays 'portrait' was wrong.

   WHAT'S NEW IN v3.1 — pre-17-module hardening
   -----------------
   - Fixed a real Excel bug: a table titled "Summary" could collide with the
     Summary sheet ExcelJS worksheet names must be unique, so dedup now seeds
     from the workbook's existing sheet names instead of starting empty.
   - Fixed the Excel Summary KPI grid: KPI cards now divide a fixed 14-column
     canvas evenly (wrapping every 7 KPIs) instead of a fixed 3-col-per-card
     width that pushed a 6th KPI past the 14-column title/meta area.
   - PDF summary page: estimates whether the table + its side-by-side charts
     fit in the space left on the page before drawing either, so autoTable's
     own pagination can no longer split a table from its charts.
   - Added validateReportData(), called first by generatePDF/generateExcel/
     generateCSV, so a malformed reportData (wrong types, missing arrays)
     fails with one clear message instead of an internal crash mid-render.
   - Added a standardized empty-report state: set reportData.status = 'empty'
     (optionally with reportData.emptyMessage) and PDF/Excel render a single
     branded "NO DATA FOR THIS PERIOD" message instead of a blank-looking
     report; CSV throws a clear "no data available" error instead of the
     previous bare "tables is empty".
   - Footer notes are now bounded to a fixed-height band and never run past
     the bottom of the page; once there are more notes than fit, the rest
     collapse into a single "+N more notes" line instead of overflowing.
   - Charts (line/bar) accept an optional chartSpec.series = [{ label,
     values, color, fill }, ...] for multi-line/grouped-bar datasets (e.g.
     purchase quantity vs. spend, production input vs. output), on top of
     the original single-series `values` shape, which is still the default
     and renders exactly as before when `series` isn't passed.
   - generateCSV(reportData, { perTable: true }) downloads one CSV file per
     table instead of the blank-line-separated all-tables file — better for
     automated processing. The original all-in-one and single-table modes
     are unchanged and still the default.
   - CDN load failures now name the specific library and every URL that was
     tried, instead of a bare "All CDN sources failed for <url>" message.
   - generatePDF(reportData, { orientation: 'landscape' }) now works — added
     the option (default stays 'portrait') and converted every hardcoded
     page-bottom pagination threshold (drawCharts, drawSummarySection,
     drawHighlights, the detailed-mode table loop) to be computed from the
     actual page height instead of assuming a fixed 842pt portrait page, so
     landscape reports paginate correctly instead of overflowing the page.
   ------------------------------------------------------------
   Fifth shared file, alongside shared-shell.css / app-state.js /
   sidebar.js / header.js. Purely additive — no existing page is
   required to use this. Wire a page in only when you're ready.

   Works for ALL modules (Cash Flow, Sales, Purchases, Inventory,
   Payroll, Production, Overhead, Distribution, etc.) — every page
   just builds a ReportData object in the shape below and calls:

        await ReportEngine.generatePDF(reportData, { type: 'summary' })
        await ReportEngine.generatePDF(reportData, { type: 'detailed' })
        await ReportEngine.generateExcel(reportData)
        ReportEngine.generateCSV(reportData)                 // all tables
        ReportEngine.generateCSV(reportData, { tableIndex: 0 }) // one table

   WHAT'S NEW IN v2
   -----------------
   - generateCSV() added (was missing entirely).
   - Fixed a real bug in the chart grid layout: charts after a page
     break used to land at the wrong Y position because the row
     counter wasn't reset. Now uses a running x/y cursor instead.
   - Highlights row is now page-break aware (used to silently run
     off the bottom of the page with 6+ insights).
   - Page-1 summary section now lays out the summary table and its
     charts side-by-side (like the approved design mock), instead
     of always stacking them.
   - KPI cards now draw an actual small vector icon (wallet, arrow,
     exchange, safe, percent, trend, box, cart, bag, users, gear,
     shield, coins...) instead of a plain colored dot. Pass any
     `icon` key on a KPI; unknown keys fall back to an initial-letter
     badge, so this never breaks for a module-specific KPI you add
     later.
   - Excel export now uses ExcelJS instead of SheetJS. SheetJS's
     free tier can't apply any cell colors/fonts, so numbers were
     being written as pre-formatted TEXT strings ('37,030.00') that
     couldn't be summed or sorted in Excel. ExcelJS gives us a
     branded header band, a real green header row, accounting
     number formats with red negatives, alternating row shading,
     and a frozen header — with genuine numeric cells underneath.
   - The Excel workbook now opens on a "Summary" sheet that mirrors
     the PDF's page 1: the same branded header band, KPI cards
     colored per kpi.color, and the *same* Chart.js-rendered chart
     images used in the PDF (not a second, different chart engine —
     literally the same renderChartToImage() call), plus a
     highlights strip. Each table still gets its own sheet after it.
   - The MENA logo is baked in as a default (extracted from the
     circular brand mark you supplied) so every export is branded
     out of the box. Pass reportData.company.logoDataUrl to override
     it per-report if you ever need to.
   - Optional QR code in the PDF footer: set reportData.footer.qrText
     (e.g. a verification URL) and it renders bottom-right. If the
     QR library fails to load for any reason, it's skipped silently
     — it never breaks the rest of the export.
   - Filenames are sanitized properly (all OS-invalid characters
     stripped, not just spaces), and sheet names in Excel are
     de-duplicated so two same-titled tables don't crash the export.

   WHAT'S NEW IN v3 — LIGHTER RESTYLE
   -----------------
   Visual restyle only — the reportData shape, generatePDF/generateExcel/
   generateCSV signatures, and summary/detailed layout rules are all
   unchanged, so no module wiring into this engine needs to change.
   - Header: no more solid green top bar. Logo + company name now sit
     left, report title + generated meta sit right, one thin green
     rule underneath — two columns instead of the old centered title.
   - KPI cards: dropped the drawn icon-in-a-circle badge. Cards are now
     flat, left-aligned (label / big value / small unit, stacked), with
     kpi.color kept only as a slim 2pt left accent bar instead of
     coloring the whole value — quieter, but the color field you pass
     still means something.
   - Table header row is a light gray band with small muted-gray
     caption text instead of a solid green fill with white text; grid
     lines are thin gray instead of black. Totals row is white with
     bold green text (no more solid pale-green fill block).
   - Section titles (e.g. "REVENUE BY PRODUCT") are now dark gray/black
     instead of green, matching the plainer look; green is reserved for
     the header rule, totals text, and chart accents.
   - Excel: header bands and the Summary sheet's title/meta rows are no
     longer solid green fills — white background with a green bottom
     rule instead. KPI values on the Summary sheet are dark text now,
     same "color as accent, not as fill" idea as the PDF.

   STANDARD REPORT OBJECT (unchanged — same shape as before)
   -----------------------
   {
     module: 'Cash Flow',
     title: 'Cash Flow Report',
     period: 'May 2026',
     currency: 'ETB',
     generatedBy: 'Eyasu Mesfin',
     generatedRole: 'Owner',
     company: {
       name: 'MENA INJERA',
       subtitle: '& DERKOSH',
       tagline: 'BUSINESS MANAGEMENT SYSTEM',
       logoDataUrl: null // optional base64 image override; else uses the built-in logo
     },
     kpis: [
       { icon: 'wallet', label: 'OPENING CASH BALANCE', value: '37,030.00', unit: 'ETB', color: '#2D6A4F' },
       { icon: 'arrowDown', label: 'TOTAL CASH INFLOW', value: '56,810.00', unit: 'ETB', color: '#2E86DE' },
       { icon: 'arrowUp', label: 'TOTAL CASH OUTFLOW', value: '77,360.00', unit: 'ETB', color: '#C0392B' },
       { icon: 'exchange', label: 'NET CASH FLOW', value: '(20,550.00)', unit: 'ETB', color: '#E67E22' },
       { icon: 'safe', label: 'CLOSING CASH BALANCE', value: '14,890.00', unit: 'ETB', color: '#2D6A4F' },
       { icon: 'percent', label: 'CASH FLOW CHANGE', value: '-55.49%', unit: 'vs Apr 2026', color: '#8E44AD' }
     ],
     charts: [
       { type: 'bar', title: 'Cash Inflow vs Outflow (ETB)',
         labels: ['Total Inflow','Total Outflow'], values: [56810, 77360],
         colors: ['#2D6A4F','#C0392B'] },
       { type: 'line', title: 'Net Cash Flow Trend (Last 6 Months)',
         labels: [...], values: [...] },
       { type: 'doughnut', title: 'Cash Flow by Activities (ETB)',
         labels: [...], values: [...], colors: [...] }
     ],
     tables: [
       { title: 'CASH FLOW STATEMENT (SUMMARY)',
         columns: ['Particulars','Amount (ETB)'],
         rows: [ ['A. OPERATING ACTIVITIES',''], ['Cash Receipts','56,810.00'], ... ],
         totalsRow: ['CLOSING CASH BALANCE','14,890.00'] // optional, bolded
       },
       { title: 'MAJOR CASH TRANSACTIONS',
         columns: ['Date','Description','Activity Type','Cash Inflow (ETB)','Cash Outflow (ETB)','Net Amount (ETB)'],
         rows: [...],
         totalsRow: ['TOTAL','','','41,910.00','52,050.00','(10,140.00)']
       }
     ],
     insights: [
       // icon/color are optional — omit both for a plain accent-colored dot.
       // label (e.g. 'WATCH', 'GROWTH') is an alternative to icon — a short
       // uppercase tag drawn above the text instead of a badge; a card can
       // use either, both, or neither.
       { icon: 'trendDown', color: '#C0392B', text: 'Operating activities used cash of 20,550.00 ETB' },
       { label: 'Watch', color: '#C89B3C', text: 'Outstanding A/R rose to 15% of revenue.' },
       ...
     ],
     rankedList: { // optional — bottom-right panel beside tables[0], e.g. "Top Customers"
       title: 'Top Customers by Revenue',
       maxRows: 4, // optional, defaults to 6
       items: [
         { rank: 1, name: 'Addis Ababa Hotel', meta: 'Cash — 4 orders', value: '142,600 ETB', sub: '11.4% of revenue' },
         ...
       ]
     },
     footer: {
       preparedBy: 'Business Management System',
       company: 'MENA Injera & Derkosh',
       qrText: null, // optional — e.g. a verification URL; renders a QR bottom-right if set
       notes: [
         'Negative values are shown in brackets.',
         'This report is auto-generated. For any issues, please contact the system administrator.'
       ]
     }
   }

   LAYOUT RULE FOR THE SUMMARY PAGE (applies to every module)
   -----------------------
   Row 1 (always): KPI cards, from reportData.kpis.
   Row 2: up to three panels side by side —
     - charts[0]   -> primary chart (e.g. a trend/bar chart), left column
     - charts[1]   -> secondary chart (e.g. a donut), middle column
     - insights    -> Key Insights card column, right column
     Any of the three may be omitted; present panels share the row width
     (chart+donut+insights uses a 38/30/32 split; any two split evenly;
     a single panel takes the full width).
   Row 3: table[0] (e.g. a breakdown table) + reportData.rankedList (e.g.
     "Top Customers", a numbered name/value list) side by side. If only one
     of the two is present it takes the full width; if neither is present
     the row is omitted.
   - options.type === 'detailed' additionally renders charts[2..] in a
     2-per-row grid and tables[1..] full-width, each on its own page
     if needed. This is true regardless of which module is calling it.
   ============================================================ */

(function (global) {
  'use strict';

  const THEME = {
    primaryDark: '#1B4332',
    primary: '#2D6A4F',
    accent: '#52B788',
    danger: '#C0392B',
    warning: '#E67E22',
    info: '#2E86DE',
    purple: '#8E44AD',
    gold: '#C89B3C',
    textDark: '#1F2937',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    rowAlt: '#F8FAF7',
    tableHeaderBg: '#EEF2EF', // light sage-tinted header (was near-white #F8F9FA,
                               // which gave almost no contrast against the white
                               // page and muted-gray header text)
    cardBg: '#FFFFFF',
    // v3.33 palette — calm, ordered, colour-blind-friendly. Forest leads, teff-gold is the warm accent.
    sage: '#74C69D',
    slate: '#4F7CAC',
    clay: '#C2684F',
    plum: '#7C5C8A',
    hairline: '#E3E9E4',
    palette: ['#2D6A4F', '#C89B3C', '#74C69D', '#4F7CAC', '#C2684F', '#7C5C8A'],
    fontHeading: 'Quicksand', // embedded below — falls back to helvetica if embedding fails for any reason
    fontBody: 'Nunito'
  };

  // Built-in brand mark (masked to a transparent circle from the logo you supplied).
  // Used as the default in the PDF header and on the first Excel sheet whenever
  // reportData.company.logoDataUrl is not provided.
  const MENA_LOGO_B64 = 'data:image/png;base64,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';

  // Real Quicksand/Nunito TTFs (subset to Latin glyphs, ~27KB each), embedded
  // directly into the PDF so headings/body text match the brand system —
  // no CDN fetch, no font installed on the reader's machine required.
  const FONT_FILES = {
    'Quicksand-Regular.ttf': { family: 'Quicksand', style: 'normal', data: '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AAD/9f/2AAAACgAA//YAFP/2AAD/ywAA/+wAAAAAAAD/v//k//YAAAAAAAAAAAAAAAAAAAAAAAAAAP/0//oAAAAAAAAAAAAAAAAAAAAAAAD/8QAAAAAAAAAAAAD/4v/2//YAAAAAAAAAAP/2AAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAA//v/3QAAAAAAAAAAAAD/0//s//b/9gAAAAAAAP/7AAAAAAAAAAAAAP/7AAD/+QAAAAAAFAAA//YAAP/2/+f/1QAA//sAAAAAAAD/zv+k/+oAAAAAAAAAAAAAAAAAAAAAAAD/+//k//cAAAAAAAAAAP/7//YAAAAA//YAAAAAAAAAAP/2AAAAAAAAAAAAAAAAAAAAAP/2AAAAAAAAAAAAAP/xAAAAAAAAAAAAAAAAAAD/9gAAAAD/9gAAAAAAAP/2//YAAAAAAAD/9gAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+wAAAAAAAP/7AAD/5wAAAAD/9gAAAAAAAAAAAAD/9gAAAAD/7P/2AAAAAP/xAAAAAAAA//YAAAAAAAAAAAAAAAD/4P/X/+z/1f/2//YAAAAA/+b/6f+6/+cACgAAAAAAAAAAAAAAAP/aAAD/6wAA/9wAAP/2//b/7P/2AAAAAAAIAAD/+wAAAAD/5gAAAAAAAP/xAAD/7P/1//v/4f/xAAAAAAAAAAAAAAAAAAAAAAAAAAD/9v//AAAAAAAAAAAAAAAA//v/5wAAAAAAAAAAAAD/4v/xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7AAAAAAAAAAAAAP//AAAAAAAAAAD/6f/9AAAAAAAAAAD/8f/4//r/9AAAAAAAAP/7AAAAAAAAAAAAAAAAAAD//QAAAAD/7P/x//H/4AAAAAAAAAAA//f/9/+I//sADwAAAAD/+wAAAAAAAP/2AAD/9wAA//YAAP/7AAD/8f/7AAAADgAAAAAAAAAAAAD/6AAAAAAAAAAAAAD/5//x//YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/r//QAAP/x/+wAFAAA/+L/+P/7//YAAP/7//sAAAAAAAAAAAAAAAD/+AAA//z//f/5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ABcANgA3AAgAOAA4ABgAOQA/AAEAQgBCABkARABEABsARgBKAAMASwBLABwATABMAB0ATQBNAAoATgBOAB4AVABUAB8AVgBWACAAVwBXACEAWABZAAoAZABkACIAZQBlACMAZgBmACQAaABoACUAaQBtAAIAbgBuACYAbwBvACcAcABwACgAcQBzAAcAdAB0ACkAfAB8AAkAlACUABoAAgAnAAEAAQAEAAoACgAJABQAFAAJABsAGwALACEAIQAJACoAKgAJACwALAAMAC0ALQANAC4AMgAFADMAMwAOADQANAAPADUANQAQADYANwAHADgAOAARADkAPwABAEEAQQAIAEIAQgACAEQARAACAEYASgACAEsASwATAEwATAAUAE0ATQAIAFQAVAAVAFYAVwAIAFgAWQAKAFsAWwACAGIAYgAWAGQAZAACAGUAZQAKAGYAZgAYAGgAaAAZAGkAbQADAG4AbgAaAG8AbwAbAHAAcAAcAHEAcwAGAHQAdAAdAJMAkwAXAJQAlAASAAEAAAAKACQAMgACREZMVAAObGF0bgAOAAQAAAAA//8AAQAAAAFsaWdhAAgAAAABAAAAAQAEAAQACAABAAgAAQA2AAEACAAFAAwAFAAcACIAKAB2AAMASwBOAHcAAwBLAFcAdQACAEsAeAACAE4AeQACAFcAAQABAEsAAAABAAEACAABAAAAFAABAAAAHAACd2dodAEAAAAAAgADAAAAAgECAZAAAAK8AAAAAA==' },
    'Quicksand-Bold.ttf': { family: 'Quicksand', style: 'bold', data: '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' },
    'Nunito-Regular.ttf': { family: 'Nunito', style: 'normal', data: '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AAQABAAeAAQABAAGAAYABgABAAEAAQABAAEAAQABAAYABAABAAYADAAEAA4ABwAHAAcABwAHAAkACQAtAAkACQAJABAAAgAVABUAHwAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASABIAGwAbACYAJwApACoADQANACMAAAAsACQADQANAA0ADQASABoAGAANABgAGgAYABIAEgAXABcAFwAXABwAHQAAAAAAFgAWAAMAIgAoACsAAwADACUAAgACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAIAAAAAEAAAAKACwARgADREZMVAAUY3lybAAUbGF0bgAUAAQAAAAA//8AAgAAAAEAAmNhbHQADmxpZ2EAFAAAAAEAAQAAAAEAAAAEAAoAMgCCAIIABAAIAAEACAABABoAAQAIAAIABgAMAHUAAgBOAHYAAgBWAAEAAQBLAAYAAAABAAgAAgBWABgAEAAYAAIAAAAiAAEAZgABAAEAAgABAAEAOAABAAIABgAWAAEAAQABAAEAAQABAAAAAgACAAEAAQABAAAAAQAAAAMAAQAAAAEACAABAAYADgABAAEAZgABAAEACAACAAAAFAACAAAAJAACd2dodAEAAABpdGFsAQEAAQAEABQAAwAAAAIBBAGQAAACvAAAAAMAAQACASEAAAAAAAEAAA==' },
    'Nunito-Bold.ttf': { family: 'Nunito', style: 'bold', data: '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/8EAAP/7AAD/9gAA/+IAIwAoAAAAAP/2AAAAS//YAAAAAAAA/9UAAP/TAAAABQAA/9MABQAAADz//wAA/8QAAP/2////7P/E/8QAAP/iAAAAI//E/7//9gAo/8QAKP+XAA//xAAAAAAADQAo/9gAAP/s/7//zgAAABQAAAAKAAAAAAAAAAMAAP/EAAAAMv/EAAD/0//OAAD/8wAAAAAAAAAAAAAAAAAA//YAAAAA//v/5wAAAAD/+wAAAA8AAP/9AAAAAAAFAAAAAAAAAAD/5P/2AAAAFAAAAAAAAAANAAD/+wAAAAAAAP/nAAAAAAAPAAAAAgAMAAEAOQAAAEAATgA5AFAAdABIAHYAeABtAIsAjQBwAJAAmgBzAJwAowB+AKUApwCGAKkAsACJALMAtwCRALkAvQCWAM0AzQCbAAEAAQC9AAcABwAHAAcABwAHAAcABQAiABYAFgABAAEABQAFAAUABQAFACkAFwADAAMAAwADAAMAAwAaACMAEQADAAMAAwABAAEAAQABAAEAAQABACoAKwABABIADAAYAAoACgAKAAoACgAbABsALAANAA0AHAAIAAAAAAAAAAAAAAAAAAYAAgAZABkABAACAAYABgAGAAYABgAzAAAACAAEAAAABAAEAAQABAAEAB4AEwAIAAgACAACAAIAAgACAAIAAgACAAIAAgA1ABQADgA0ABUAAAAAAAAAAAAAAAsACwA5AAsACwALABAAJQAAABMAKAAoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkACQAJAAAAAAAdAB0AJAAkADEAMgA2ADcADwAPAC4AAAA4AC8ADwAPAA8ADwAdACEAAAAhAA8AIQAAAB0AHQAgACAAIAAgACYAJwAAAAAAHwAfAAEALQADAAAAAQABADAAAwADAAEAAQDOAAUABQAFAAUABQAFAAUABQACAAMAAwACAAIAAgACAAIAAgACAAIAAwACAAIAAgACAAIAAgAZAAIAAgACAAIAAgADAAMAAwADAAMAAwADAAIAAgADAAIACgAPAAgACAAIAAgACAARABEAIQALAAsAEwAUAAAAAAAAAAAAAAAAABQABAABAAEAAQABAAEAAQABAAEAAQAVAAEABAAEAAAABAAEAAQABAAeAAQABAAGAAYABgABAAEAAQABAAEAAQABAAYABAABAAYADAAEAA4ABwAHAAcABwAHAAkACQAtAAkACQAJABAAAgAVABUAHwAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASABIAGwAbACYAJwApACoADQANACMAAAAsACQADQANAA0ADQASABoAGAANABgAGgAYABIAEgAXABcAFwAXABwAHQAAAAAAFgAWAAMAIgAoACsAAwADACUAAgACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAIAABAAAACgAsAEYAA0RGTFQAFGN5cmwAFGxhdG4AFAAEAAAAAP//AAIAAAABAAJjYWx0AA5saWdhABQAAAABAAEAAAABAAAABAAKADIAggCCAAQACAABAAgAAQAaAAEACAACAAYADAB1AAIATgB2AAIAVgABAAEASwAGAAAAAQAIAAIAVgAYABAAGAACAAAAIgABAGYAAQABAAIAAQABADgAAQACAAYAFgABAAEAAQABAAEAAQAAAAIAAgABAAEAAQAAAAEAAAADAAEAAAABAAgAAQAGAA4AAQABAGYAAQABAAgAAgAAABQAAgAAACQAAndnaHQBAAAAaXRhbAEBAAEABAAQAAEAAAAAAQcCvAAAAAMAAQACASEAAAAAAAEAAA==' }
  };

  // Registers the embedded fonts on a jsPDF doc instance. If this fails for any
  // reason (corrupted VFS write, old jsPDF build, etc.) we fall back to Helvetica
  // rather than let font setup take down the whole export.
  let fontsRegistered = false;
  function registerFonts(doc) {
    try {
      Object.keys(FONT_FILES).forEach(fileName => {
        const f = FONT_FILES[fileName];
        doc.addFileToVFS(fileName, f.data);
        doc.addFont(fileName, f.family, f.style);
      });
      fontsRegistered = true;
    } catch (e) {
      fontsRegistered = false;
      THEME.fontHeading = 'helvetica';
      THEME.fontBody = 'helvetica';
    }
  }

  // ------------------------------------------------------------
  // LIBRARY LOADING — jsdelivr primary, cdnjs fallback, retry-until-loaded
  // (mirrors the pattern already used in monthly-overhead.html / derkosh.html)
  // ------------------------------------------------------------
  const CDN_SOURCES = {
    jspdf: [
      'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    ],
    autotable: [
      'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
    ],
    chartjs: [
      'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js'
    ],
    exceljs: [
      'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js'
    ],
    qrcode: [
      'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
    ]
  };

  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = url;
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error('Failed to load ' + url));
      document.head.appendChild(s);
    });
  }

  async function loadWithFallback(libName, sources) {
    const failedUrls = [];
    for (const url of sources) {
      try {
        await loadScript(url);
        return true;
      } catch (e) { failedUrls.push(url); }
    }
    throw new Error(
      `ReportEngine: could not load required library "${libName}" — all ${failedUrls.length} ` +
      `CDN source(s) failed (${failedUrls.join(', ')}). Check your network connection, or whether ` +
      `a firewall/ad-blocker/CSP is blocking script tags from cdn.jsdelivr.net or cdnjs.cloudflare.com.`
    );
  }

  async function ensureLibs(needed) {
    const checks = {
      jspdf: () => !!(global.jspdf && global.jspdf.jsPDF),
      autotable: () => !!(global.jspdf && global.jspdf.jsPDF && global.jspdf.jsPDF.API && global.jspdf.jsPDF.API.autoTable),
      chartjs: () => !!global.Chart,
      exceljs: () => !!global.ExcelJS,
      qrcode: () => !!global.QRCode
    };
    for (const lib of needed) {
      if (!checks[lib]()) {
        await loadWithFallback(lib, CDN_SOURCES[lib]);
      }
    }
    // retry-until-loaded: autotable attaches to jsPDF prototype async in some builds
    let tries = 0;
    while (needed.includes('autotable') && !checks.autotable() && tries < 20) {
      await new Promise(r => setTimeout(r, 100));
      tries++;
    }
  }

  // ------------------------------------------------------------
  // SMALL UTILITIES
  // ------------------------------------------------------------
  function safeFileName(s) {
    return String(s || '')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[\\/:*?"<>|]/g, '');
  }

  function triggerDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function base64ToUint8Array(b64) {
    const raw = b64.includes(',') ? b64.split(',')[1] : b64;
    const binary = atob(raw);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  // Parses a display string like '37,030.00', '(5,400.00)' or '-55.49%'
  // into a real number (or leaves it as text if it isn't numeric-looking).
  function parseCellValue(raw) {
    if (typeof raw === 'number') return { value: raw, negative: raw < 0, isPct: false };
    const s = String(raw === null || raw === undefined ? '' : raw).trim();
    if (s === '') return { value: '', negative: false, isPct: false };
    const negative = /^\(.*\)$/.test(s);
    const isPct = /%$/.test(s);
    const cleaned = s.replace(/[(),%]/g, '').replace(/,/g, '');
    if (cleaned !== '' && !isNaN(Number(cleaned))) {
      let n = Number(cleaned);
      if (negative) n = -Math.abs(n);
      if (isPct) n = n / 100;
      return { value: n, negative: n < 0, isPct };
    }
    return { value: s, negative: false, isPct: false };
  }

  // Like parseCellValue, but also handles a value with a trailing unit word baked in
  // (e.g. "142,600 ETB", "774,300 ETB") — the documented rankedList.items[].value
  // format. Strips one trailing non-numeric word before parsing, so Excel gets a
  // genuine numeric cell (sortable/summable) instead of the whole string landing in
  // a text column; the stripped unit is returned separately so callers that want to
  // display it (or re-attach it) still can. Falls back to parseCellValue unchanged
  // when there's no trailing unit to strip.
  function parseValueWithUnit(raw) {
    const s = String(raw === null || raw === undefined ? '' : raw).trim();
    const match = s.match(/^(.*?)\s+([A-Za-z]+)$/);
    if (match) {
      const numPart = parseCellValue(match[1]);
      if (typeof numPart.value === 'number') {
        return { value: numPart.value, unit: match[2], negative: numPart.negative, isPct: numPart.isPct };
      }
    }
    const parsed = parseCellValue(s);
    return Object.assign({ unit: '' }, parsed);
  }

  // ------------------------------------------------------------
  // TABLE ENRICHMENTS (v3.2) — all opt-in; a table that uses none of these
  // renders exactly as it did in v3.1.
  //
  //   cell objects   any body/totals cell may be { v: 'Overdue', tone: 'bad', bold: true }
  //                  instead of a plain string. tone is 'good' | 'warn' | 'bad' |
  //                  'info' | 'muted'. Cells are flattened back to plain strings
  //                  before anything is drawn/exported, so Excel and CSV only ever
  //                  see the text.
  //   rowKinds       table.rowKinds = ['section','line','line','subtotal',...] — one
  //                  entry per body row. section = shaded group heading, line =
  //                  indented line item, subtotal / total = bold with a top rule,
  //                  pct = muted ratio row, note = muted footnote row.
  //   statement      table.statement = true turns on right-aligned numeric columns
  //                  and red negatives (also implied by layout:'statement').
  //   alignNumeric / negativeRed / columnAlign   individual switches for the above.
  //   summaryMaxRows PDF summary page only: show the first N rows plus a
  //                  "+ N more rows" line. The detailed PDF, Excel and CSV
  //                  always carry every row.
  // ------------------------------------------------------------
  const TONE_COLORS = {
    good: THEME.primary,
    warn: THEME.warning,
    bad: THEME.danger,
    info: THEME.info,
    muted: THEME.textMuted
  };

  function flattenCell(cell) {
    if (cell !== null && typeof cell === 'object' && !Array.isArray(cell)) {
      return { text: cell.v === undefined || cell.v === null ? '' : cell.v, tone: cell.tone || null, bold: !!cell.bold };
    }
    return { text: cell, tone: null, bold: false };
  }

  function normalizeTable(t) {
    if (!t || t._normalized) return t;
    const tones = {};
    const bolds = {};
    const flatRow = (r, ri, prefix) => (r || []).map((c, ci) => {
      const f = flattenCell(c);
      if (f.tone) tones[prefix + ri + ',' + ci] = f.tone;
      if (f.bold) bolds[prefix + ri + ',' + ci] = true;
      return f.text;
    });
    return Object.assign({}, t, {
      rows: (t.rows || []).map((r, ri) => flatRow(r, ri, 'b')),
      totalsRow: t.totalsRow ? flatRow(t.totalsRow, 0, 'f') : t.totalsRow,
      _tones: tones,
      _bolds: bolds,
      _normalized: true
    });
  }

  function normalizeReportData(rd) {
    const out = Object.assign({}, rd);
    if (Array.isArray(rd.tables)) out.tables = rd.tables.map(normalizeTable);
    if (rd.panelTable) out.panelTable = normalizeTable(rd.panelTable);
    return out;
  }

  // Every table that Excel / CSV should carry: tables[] plus the Row-2 panelTable
  // (which has no other home in a spreadsheet).
  function exportTables(rd) {
    return (rd.tables || []).concat(rd.panelTable ? [rd.panelTable] : []);
  }

  // Applies summaryMaxRows: returns the same table when nothing is cut, else a copy with
  // only the first N rows plus `note` — a short "+ N more rows" line the caller draws
  // under the table (kept out of the table itself so it can't be mistaken for data and
  // doesn't cost a full row of height).
  function capTableRows(table, maxRows, noteText) {
    const cap = maxRows || table.summaryMaxRows;
    if (!cap || !table.rows || table.rows.length <= cap) return { table, hidden: 0, note: '' };
    const hidden = table.rows.length - cap;
    const copy = Object.assign({}, table, {
      rows: table.rows.slice(0, cap),
      rowKinds: table.rowKinds ? table.rowKinds.slice(0, cap) : table.rowKinds
    });
    const note = noteText || `+ ${hidden} more row${hidden > 1 ? 's' : ''} — see the detailed report or Excel export`;
    return { table: copy, hidden, note };
  }

  // Small muted "+ N more rows" line under a capped summary table. Returns the new y.
  function drawMoreNote(doc, note, x, y) {
    if (!note) return y;
    doc.setFont(THEME.fontBody, 'normal');
    doc.setFontSize(7);
    doc.setTextColor(THEME.textMuted);
    doc.text(note, x, y + 9);
    return y + 12;
  }

  const NUMERIC_CELL = /^[(+\-–]?\s*[\d][\d,]*(\.\d+)?\s*[)%]?(\s?[A-Za-z]{1,4})?$|^[-–—]$/;

  // Builds the extra autoTable options (a didParseCell hook) for a table, or {} when the
  // table uses none of the v3.2 features — which keeps v3.1 tables byte-identical.
  function tableExtraOptions(table, pad) {
    const kinds = table.rowKinds || [];
    const tones = table._tones || {};
    const bolds = table._bolds || {};
    const statement = !!table.statement;
    const alignNumeric = table.alignNumeric !== undefined ? table.alignNumeric : true;
    const negativeRed = table.negativeRed !== undefined ? table.negativeRed : statement;
    const explicitAlign = Array.isArray(table.columnAlign) ? table.columnAlign : null;

    const base = pad === undefined ? 5 : pad;
    const cols = table.columns || [];
    const bodyRows = table.rows || [];
    const colAlign = cols.map((c, ci) => {
      if (explicitAlign && explicitAlign[ci]) return explicitAlign[ci];
      if (!alignNumeric) return null;
      let numeric = 0, filled = 0;
      bodyRows.forEach((r, ri) => {
        if (kinds[ri] === 'section' || kinds[ri] === 'note') return;
        const s = String(r[ci] === undefined || r[ci] === null ? '' : r[ci]).trim();
        if (!s) return;
        filled++;
        if (NUMERIC_CELL.test(s)) numeric++;
      });
      return filled && numeric / filled >= 0.7 ? 'right' : null;
    });

    return {
      didParseCell(data) {
        const { section, row, column, cell } = data;
        const ci = column.index;
        if (colAlign[ci]) cell.styles.halign = colAlign[ci];
        // v3.33 — rules, not boxes: a forest rule under the header and over the totals row,
        // a hairline between body rows, nothing else.
        if (section === 'head') {
          cell.styles.lineColor = THEME.primaryDark;
          cell.styles.lineWidth = { top: 0, right: 0, bottom: 1.1, left: 0 };
          return;
        }
        if (section === 'foot') {
          cell.styles.lineColor = THEME.primaryDark;
          cell.styles.lineWidth = { top: 1.1, right: 0, bottom: 0, left: 0 };
        } else {
          cell.styles.lineColor = THEME.hairline;
          cell.styles.lineWidth = { top: 0, right: 0, bottom: 0.45, left: 0 };
        }

        const prefix = section === 'foot' ? 'f' : 'b';
        const kind = section === 'body' ? kinds[row.index] : null;
        const raw = Array.isArray(cell.text) ? cell.text.join(' ') : String(cell.text || '');

        if (kind === 'section') {
          cell.styles.fillColor = '#EAF2EC';
          cell.styles.textColor = THEME.primaryDark;
          cell.styles.fontStyle = 'bold';
          cell.styles.lineWidth = 0;
        } else if (kind === 'subtotal' || kind === 'total') {
          cell.styles.fontStyle = 'bold';
          cell.styles.textColor = kind === 'total' ? THEME.primaryDark : THEME.textDark;
          cell.styles.fillColor = kind === 'total' ? '#F0F6F2' : '#FFFFFF';
          cell.styles.lineColor = kind === 'total' ? THEME.primaryDark : '#9DB3A6';
          cell.styles.lineWidth = kind === 'total'
            ? { top: 1, right: 0, bottom: 1, left: 0 }
            : { top: 0.7, right: 0, bottom: 0.45, left: 0 };
        } else if (kind === 'pct' || kind === 'note') {
          cell.styles.textColor = THEME.textMuted;
          if (kind === 'note') cell.styles.fillColor = '#FFFFFF';
        } else if (kind === 'line' && ci === 0) {
          cell.styles.cellPadding = { top: base, bottom: base, right: base, left: base + 8 };
        }

        if (negativeRed && kind !== 'section' && kind !== 'note' && /^\(.*\)$|^-\s?\d/.test(raw.trim())) {
          cell.styles.textColor = THEME.danger;
        }

        const tone = tones[prefix + row.index + ',' + ci];
        if (tone && TONE_COLORS[tone]) {
          cell.styles.textColor = TONE_COLORS[tone];
          cell.styles.fontStyle = 'bold';
        }
        if (bolds[prefix + row.index + ',' + ci]) cell.styles.fontStyle = 'bold';
      }
    };
  }

  // ------------------------------------------------------------
  // VECTOR KPI / INSIGHT ICONS — drawn directly with jsPDF primitives,
  // so no icon font or extra asset is needed. Add new keys here as
  // modules need them; unknown keys fall back to a lettered badge.
  // ------------------------------------------------------------
  function drawIcon(doc, key, cx, cy, r, color) {
    const c = color || THEME.primary;
    doc.setDrawColor(c);
    doc.setFillColor(c);
    doc.setLineWidth(1.1);
    const s = r * 0.62;

    switch (key) {
      case 'wallet':
        doc.roundedRect(cx - s, cy - s * 0.7, s * 2, s * 1.4, 1.5, 1.5, 'S');
        doc.circle(cx + s * 0.55, cy, s * 0.22, 'F');
        break;

      case 'arrowDown':
        doc.setLineWidth(1.3);
        doc.line(cx, cy - s, cx, cy + s * 0.35);
        doc.triangle(cx - s * 0.55, cy + s * 0.05, cx + s * 0.55, cy + s * 0.05, cx, cy + s * 0.8, 'F');
        break;

      case 'arrowUp':
        doc.setLineWidth(1.3);
        doc.line(cx, cy + s, cx, cy - s * 0.35);
        doc.triangle(cx - s * 0.55, cy - s * 0.05, cx + s * 0.55, cy - s * 0.05, cx, cy - s * 0.8, 'F');
        break;

      case 'exchange':
        doc.setLineWidth(1.2);
        doc.line(cx - s, cy - s * 0.35, cx + s * 0.45, cy - s * 0.35);
        doc.triangle(cx + s * 0.3, cy - s * 0.65, cx + s * 0.3, cy - s * 0.05, cx + s * 0.8, cy - s * 0.35, 'F');
        doc.line(cx + s, cy + s * 0.35, cx - s * 0.45, cy + s * 0.35);
        doc.triangle(cx - s * 0.3, cy + s * 0.05, cx - s * 0.3, cy + s * 0.65, cx - s * 0.8, cy + s * 0.35, 'F');
        break;

      case 'safe':
        doc.roundedRect(cx - s, cy - s, s * 2, s * 2, 1.5, 1.5, 'S');
        doc.circle(cx, cy, s * 0.32, 'S');
        doc.circle(cx, cy, s * 0.06, 'F');
        break;

      case 'percent':
        doc.setFont(THEME.fontHeading, 'bold');
        doc.setFontSize(r * 1.05);
        doc.setTextColor(c);
        doc.text('%', cx, cy + r * 0.35, { align: 'center' });
        break;

      case 'trendUp':
        doc.setLineWidth(1.3);
        doc.line(cx - s, cy + s * 0.5, cx - s * 0.15, cy - s * 0.1);
        doc.line(cx - s * 0.15, cy - s * 0.1, cx + s * 0.35, cy + s * 0.3);
        doc.line(cx + s * 0.35, cy + s * 0.3, cx + s, cy - s * 0.6);
        doc.triangle(cx + s * 0.55, cy - s * 0.6, cx + s, cy - s * 0.6, cx + s * 0.85, cy - s * 0.15, 'F');
        break;

      case 'trendDown':
        doc.setLineWidth(1.3);
        doc.line(cx - s, cy - s * 0.5, cx - s * 0.15, cy + s * 0.1);
        doc.line(cx - s * 0.15, cy + s * 0.1, cx + s * 0.35, cy - s * 0.3);
        doc.line(cx + s * 0.35, cy - s * 0.3, cx + s, cy + s * 0.6);
        doc.triangle(cx + s * 0.55, cy + s * 0.6, cx + s, cy + s * 0.6, cx + s * 0.85, cy + s * 0.15, 'F');
        break;

      case 'chart':
        doc.rect(cx - s * 0.9, cy + s * 0.1, s * 0.45, s * 0.7, 'F');
        doc.rect(cx - s * 0.2, cy - s * 0.3, s * 0.45, s * 1.1, 'F');
        doc.rect(cx + s * 0.5, cy - s * 0.7, s * 0.45, s * 1.5, 'F');
        break;

      case 'box':
        doc.roundedRect(cx - s, cy - s * 0.8, s * 2, s * 1.6, 1, 1, 'S');
        doc.line(cx - s, cy - s * 0.1, cx + s, cy - s * 0.1);
        doc.line(cx, cy - s * 0.8, cx, cy - s * 0.1);
        break;

      case 'cart':
        doc.roundedRect(cx - s * 0.9, cy - s * 0.5, s * 1.5, s * 0.9, 1, 1, 'S');
        doc.line(cx - s, cy - s * 0.9, cx - s * 0.9, cy - s * 0.5);
        doc.circle(cx - s * 0.55, cy + s * 0.65, s * 0.16, 'F');
        doc.circle(cx + s * 0.25, cy + s * 0.65, s * 0.16, 'F');
        break;

      case 'bag':
        doc.roundedRect(cx - s * 0.85, cy - s * 0.5, s * 1.7, s * 1.3, 1.5, 1.5, 'S');
        doc.setLineWidth(1);
        doc.circle(cx, cy - s * 0.55, s * 0.35, 'S');
        break;

      case 'users':
        doc.circle(cx - s * 0.32, cy - s * 0.15, s * 0.32, 'F');
        doc.circle(cx + s * 0.4, cy - s * 0.1, s * 0.24, 'F');
        doc.roundedRect(cx - s * 0.75, cy + s * 0.2, s * 1.5, s * 0.65, 3, 3, 'F');
        break;

      case 'gear':
        doc.setLineWidth(1.4);
        doc.circle(cx, cy, s * 0.55, 'S');
        doc.circle(cx, cy, s * 0.2, 'F');
        break;

      case 'shield':
        doc.triangle(cx - s * 0.7, cy - s * 0.7, cx + s * 0.7, cy - s * 0.7, cx, cy + s * 0.85, 'S');
        break;

      case 'coins':
        doc.setLineWidth(1.1);
        doc.circle(cx - s * 0.3, cy + s * 0.2, s * 0.5, 'S');
        doc.circle(cx + s * 0.25, cy - s * 0.15, s * 0.5, 'S');
        break;

      default:
        doc.setFillColor(c);
        doc.circle(cx, cy, r * 0.72, 'F');
        doc.setFont(THEME.fontHeading, 'bold');
        doc.setFontSize(r * 0.9);
        doc.setTextColor('#FFFFFF');
        doc.text((key || '?').charAt(0).toUpperCase(), cx, cy + r * 0.28, { align: 'center' });
    }
  }

  // ------------------------------------------------------------
  // CHART RENDERING — Chart.js drawn to an offscreen canvas,
  // exported as a PNG data URL for embedding into the PDF
  // ------------------------------------------------------------
  // Validates a chartSpec before anything touches the DOM or Chart.js, so a
  // malformed spec throws one clear error instead of silently falling through
  // Chart.js's own defaults into a chart that renders fine but shows the
  // wrong (or empty) data — e.g. a values array shorter than labels, which
  // Chart.js will happily draw as a truncated, mathematically wrong chart.
  const SUPPORTED_CHART_TYPES = ['bar', 'line', 'doughnut', 'pie'];
  function validateChartSpec(chartSpec) {
    if (!chartSpec || typeof chartSpec !== 'object') {
      throw new Error('ReportEngine: chart spec must be an object.');
    }
    const errors = [];
    const label = chartSpec.title ? `chart "${chartSpec.title}"` : 'chart';

    if (!SUPPORTED_CHART_TYPES.includes(chartSpec.type)) {
      errors.push(`type must be one of ${SUPPORTED_CHART_TYPES.join(', ')} (got ${JSON.stringify(chartSpec.type)})`);
    }
    if (!Array.isArray(chartSpec.labels) || !chartSpec.labels.length) {
      errors.push('labels must be a non-empty array');
    }

    const multi = Array.isArray(chartSpec.series) && chartSpec.series.length;
    if (multi) {
      chartSpec.series.forEach((s, i) => {
        if (!s || typeof s !== 'object') { errors.push(`series[${i}] must be an object`); return; }
        if (!Array.isArray(s.values) || !s.values.length) {
          errors.push(`series[${i}].values must be a non-empty array`);
        } else {
          if (Array.isArray(chartSpec.labels) && s.values.length !== chartSpec.labels.length) {
            errors.push(`series[${i}].values length (${s.values.length}) must match labels length (${chartSpec.labels.length})`);
          }
          if (s.values.some(v => typeof v !== 'number' || !Number.isFinite(v))) {
            errors.push(`series[${i}].values must contain only finite numbers`);
          }
        }
      });
    } else {
      if (!Array.isArray(chartSpec.values) || !chartSpec.values.length) {
        errors.push('values must be a non-empty array (or pass chartSpec.series for multi-series)');
      } else {
        if (Array.isArray(chartSpec.labels) && chartSpec.values.length !== chartSpec.labels.length) {
          errors.push(`values length (${chartSpec.values.length}) must match labels length (${chartSpec.labels.length})`);
        }
        if (chartSpec.values.some(v => typeof v !== 'number' || !Number.isFinite(v))) {
          errors.push('values must contain only finite numbers');
        }
      }
    }

    if (errors.length) {
      throw new Error(`ReportEngine: invalid ${label} — ` + errors.join('; '));
    }
  }

  // Injects @font-face rules for Quicksand/Nunito into the page, reusing the same
  // embedded TTF data jsPDF registers for the PDF text — so Chart.js (which renders
  // to a <canvas> via the browser's own font stack, not jsPDF's) draws axis labels,
  // legends, and titles in the same typeface as the surrounding PDF text instead of
  // silently falling back to a generic sans-serif. Runs once per page; safe to call
  // before every chart render.
  let chartFontsInjected = false;
  async function ensureChartFonts() {
    if (chartFontsInjected) return;
    chartFontsInjected = true;
    try {
      const specs = [
        ['Quicksand', 'normal', FONT_FILES['Quicksand-Regular.ttf'].data],
        ['Quicksand', 'bold', FONT_FILES['Quicksand-Bold.ttf'].data],
        ['Nunito', 'normal', FONT_FILES['Nunito-Regular.ttf'].data],
        ['Nunito', 'bold', FONT_FILES['Nunito-Bold.ttf'].data]
      ];
      const loaded = await Promise.all(specs.map(([family, weight, data]) => {
        const face = new FontFace(family, `url(data:font/ttf;base64,${data})`, { weight });
        return face.load().then(f => { document.fonts.add(f); return f; }).catch(() => null);
      }));
      if (loaded.every(f => f)) {
        global.Chart.defaults.font.family = "'Nunito', sans-serif";
      }
      // If a font failed to load, Chart.js silently keeps its own default family —
      // charts still render correctly, just without the matched typeface.
    } catch (e) {
      // Font injection is a visual nicety, never a reason to fail chart rendering.
    }
  }

  // ------------------------------------------------------------
  // CLEAN CHART STYLE (v3.10, refined in v3.11) — opt in with chartSpec.style = 'clean'
  //
  // A calmer, larger, easier-to-read look used by Cash Flow, P&L and Budget (other modules
  // keep the original look until they opt in). What it does differently:
  //  - text is sized from the image width, so axis labels and legends stay readable once the
  //    picture is placed on the page (the old look rendered 12px text that printed at ~4pt);
  //  - value labels on bars/points in short form (458K, 1.2M, 103%); light horizontal
  //    gridlines only, no axis lines, a stronger zero line; rounded bars; long category names
  //    wrap instead of shrinking; a small round-cornered legend at the top.
  // Extra chartSpec fields it understands (all optional):
  //   minimal: true              no axis and no gridlines at all — thin pill-shaped bars, a single
  //                              soft baseline and every value written directly on its bar
  //   precise: true              labels keep one decimal above 100K (265.9K instead of 266K)
  //   horizontal: true           bars run left to right (long names, many lines)
  //   stacked: true              bars share a column: positives go up, negatives go down
  //   labelFormat: 'pct'         labels/ticks as percentages instead of money
  //   valueLabels: false         turn the value labels off
  //   labelSeries: [1]           only label these series (e.g. the line of a bar + line chart)
  //   labelTexts: ['+102K',..]   the exact text to print for each bar (single-series charts)
  //   ranges: [[lo,hi],...]      floating bars (a waterfall); pass labelValues / labelTexts for labels
  //   labelValues: [..]          the numbers to print above each bar when `ranges` is used
  //   connectors: [level,...]    thin dashed steps between neighbouring bars (waterfall)
  //   refLine: { value, label }  a dashed reference line, e.g. 100% of budget
  //   fontPx: 23                 override the text size (px) when the picture is scaled up on the page
  //   series[k].type: 'line'     draw that series as a line over bars; series[k].axis: 'right'
  //                              puts it on its own right-hand axis
  // ------------------------------------------------------------
  const isHex = c => /^#[0-9a-f]{6}$/i.test(String(c || ''));
  const alpha = (c, a) => (isHex(c) ? c + a : c);

  const abbrNum = (v, precise) => {
    const x = Number(v);
    if (!Number.isFinite(x)) return '';
    const n = Math.abs(x);
    let s;
    if (n >= 1e6) s = (n / 1e6).toFixed(precise ? 2 : (n >= 1e7 ? 0 : 1)).replace(/\.?0+$/, '') + 'M';
    else if (n >= 1e5) s = (precise ? (n / 1e3).toFixed(1).replace(/\.0$/, '') : String(Math.round(n / 1e3))) + 'K';
    else if (n >= 1e3) s = (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    else s = String(Math.round(n * 10) / 10);
    return (x < 0 && n >= 0.05 ? '-' : '') + s;
  };

  function cleanTitleOptions(spec, fs) {
    const show = spec.showTitle !== false && !!spec.title;
    return {
      title: { display: show, text: spec.title || '', align: 'start', color: THEME.primaryDark,
        font: { family: 'Quicksand, sans-serif', size: Math.round(fs * 1.15), weight: 'bold' }, padding: { top: 0, bottom: spec.subtitle ? 2 : Math.round(fs * 0.5) } },
      subtitle: { display: show && !!spec.subtitle, text: spec.subtitle || '', align: 'start', color: THEME.textMuted,
        font: { family: 'Nunito, sans-serif', size: Math.round(fs * 0.85) }, padding: { bottom: Math.round(fs * 0.7) } }
    };
  }

  function cleanChartConfig(spec, widthPx, heightPx, palette) {
    const fs = spec.fontPx || Math.max(11, Math.round(widthPx / 46));
    const FONT = 'Nunito, sans-serif';
    const INK = THEME.textDark, MUTED = THEME.textMuted, GRID = '#ECEFEC';
    const minimal = spec.minimal === true;
    const pct = spec.labelFormat === 'pct';
    const fmtVal = v => (pct ? `${Number(v).toFixed(1).replace(/\.0$/, '')}%` : abbrNum(v, spec.precise));
    const multi = Array.isArray(spec.series) && spec.series.length;
    const list = multi ? spec.series : [{ label: '', values: spec.values }];
    const n = spec.labels.length;
    const baseKind = spec.type === 'line' ? 'line' : 'bar';
    const horizontal = spec.horizontal === true && baseKind === 'bar' && !list.some(s => s.type === 'line');
    const rightAxis = list.some(s => s.axis === 'right');
    const hasNeg = list.some(s => (s.values || []).some(v => v < 0)) || (Array.isArray(spec.ranges) && spec.ranges.some(r => r[0] < 0));

    const wrap = (s, max) => {
      if (Array.isArray(s)) return s;
      const lines = []; let cur = '';
      String(s).split(' ').forEach(w => {
        if (cur && (cur + ' ' + w).length > max) { lines.push(cur); cur = w; } else cur = (cur ? cur + ' ' : '') + w;
      });
      if (cur) lines.push(cur);
      return lines.length > 1 ? lines : (lines[0] || '');
    };
    const dense = horizontal && n > 6;
    const maxChars = horizontal ? (dense ? 30 : 17) : Math.max(7, Math.floor((widthPx * 0.84 / n) / (fs * 0.56)));
    const gradient = c => ctx => {
      const a = ctx.chart.chartArea;
      if (!a) return c + '33';
      const g = ctx.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom);
      g.addColorStop(0, alpha(c, '66')); g.addColorStop(0.6, alpha(c, '1A')); g.addColorStop(1, alpha(c, '00'));
      return g;
    };
    // soft vertical (or horizontal) sheen on bars; solid for waterfalls and charts with negatives
    const barFill = c => {
      if (spec.ranges || hasNeg || !isHex(c)) return c;
      return ctx => {
        const a = ctx.chart.chartArea;
        if (!a) return c;
        const g = horizontal ? ctx.chart.ctx.createLinearGradient(a.left, 0, a.right, 0) : ctx.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom);
        if (horizontal) { g.addColorStop(0, alpha(c, 'AA')); g.addColorStop(1, c); }
        else { g.addColorStop(0, c); g.addColorStop(1, alpha(c, '9E')); }
        return g;
      };
    };
    // single-series per-bar colours: explicit colours, a highlighted bar, or negatives in clay red
    const hiSet = new Set(spec.highlightIndex == null ? [] : [].concat(spec.highlightIndex));
    const singleVals = (!multi && !spec.ranges && Array.isArray(spec.values)) ? spec.values : [];
    const negSingle = baseKind === 'bar' && !spec.barColor && singleVals.some(v => v < 0);
    const perBarAuto = (!multi && (hiSet.size || negSingle))
      ? spec.labels.map((_, i) => (hiSet.has(i) ? (spec.highlightColor || THEME.primary)
          : (singleVals[i] < 0 && negSingle ? THEME.clay : (spec.barColor || (spec.colors && spec.colors.length === 1 ? spec.colors[0] : palette[0])))))
      : null;

    const datasets = list.map((s, k) => {
      const kind = s.type || baseKind;
      const color = s.color || spec.barColor || (spec.colors && spec.colors.length !== n && spec.colors[k]) || palette[k % palette.length];
      if (kind === 'line') {
        // v3.37: a series called average / target / budget ... is a reference line: thin, dashed, no
        // markers. A dense series (a point per day) gets a clean line with only the last point marked,
        // instead of a ring on all 30 points.
        const nPts = (s.values || []).length;
        const refLike = multi && /average|avg|target|budget|plan|benchmark|market|prior|previous/i.test(String(s.label || ''));
        const denseLine = nPts > 12;
        const mainCount = multi ? list.filter(x => !(/average|avg|target|budget|plan|benchmark|market|prior|previous/i.test(String(x.label || '')))).length : 1;
        const dotR = Math.max(3, fs * 0.3);
        return { type: 'line', label: s.label || '', data: s.values, borderColor: color,
          borderWidth: refLike ? Math.max(1.6, fs * 0.11) : Math.max(2.2, fs * (denseLine ? 0.15 : 0.17)),
          borderDash: refLike ? [Math.round(fs * 0.5), Math.round(fs * 0.4)] : undefined,
          pointRadius: refLike ? 0 : (denseLine ? (c => (c.dataIndex === nPts - 1 ? dotR : 0)) : dotR),
          pointHoverRadius: 0, pointBackgroundColor: refLike || denseLine ? color : '#FFFFFF', pointBorderColor: color, pointBorderWidth: Math.max(2, fs * 0.13),
          tension: denseLine ? 0.25 : 0.3, cubicInterpolationMode: 'monotone', fill: !refLike && mainCount === 1 && !minimal, backgroundColor: gradient(color),
          yAxisID: s.axis === 'right' ? 'y1' : 'y', order: refLike ? 1 : 0 };
      }
      const perBar = (!multi && Array.isArray(spec.colors) && spec.colors.length === n ? spec.colors : null) || perBarAuto;
      return { type: 'bar', label: s.label || '', data: (!multi && spec.ranges) ? spec.ranges : s.values,
        backgroundColor: perBar || barFill(color), borderWidth: 0,
        borderRadius: minimal ? 999 : Math.round(fs * 0.3),
        borderSkipped: ((spec.ranges || minimal) && !spec.stacked) ? false : 'start',
        barPercentage: minimal ? (multi && !spec.stacked ? 0.8 : (spec.stacked ? 0.5 : 0.46)) : (multi ? 0.9 : 0.62), categoryPercentage: minimal ? 0.72 : (multi ? 0.72 : 0.8),
        maxBarThickness: Math.round(fs * (minimal ? 2.4 : 3.6)), yAxisID: 'y', order: 1 };
    });

    const tickFont = size => ({ family: FONT, size: Math.round(size) });
    const zeroAware = { color: c => (c.tick && c.tick.value === 0 ? '#9AA5A0' : GRID), lineWidth: c => (c.tick && c.tick.value === 0 ? 1.6 : 1), drawTicks: false };
    // v3.37: a line chart whose values sit in a narrow band (yield 90-96%, cost/kg 6-9) used to be
    // drawn from zero and looked flat. When every value is positive and the lowest is at least half
    // the highest, the axis is fitted to the data (plus room for a reference line) instead.
    const lineOnly = baseKind === 'line' && !list.some(s => s.type === 'bar');
    let fitRange = null;
    if (lineOnly && spec.beginAtZero !== true && !rightAxis) {
      const vals = [];
      list.forEach(s => (s.values || []).forEach(v => { if (Number.isFinite(Number(v))) vals.push(Number(v)); }));
      if (spec.refLine && Number.isFinite(Number(spec.refLine.value))) vals.push(Number(spec.refLine.value));
      if (vals.length >= 3) {
        const lo = Math.min(...vals), hi = Math.max(...vals);
        if (lo > 0 && lo >= hi * 0.5) {
          const pad = (hi - lo) > 0 ? (hi - lo) * 0.3 : hi * 0.05;
          fitRange = { min: Math.max(0, lo - pad), max: hi + pad };
        }
      }
    }
    const valueAxis = (pos, color) => {
      if (fitRange && pos !== 'right') {
        return { position: pos, beginAtZero: false, suggestedMin: fitRange.min, suggestedMax: fitRange.max, grace: 0, border: { display: false, dash: [3, 4] },
          grid: Object.assign({}, zeroAware), display: !minimal,
          ticks: { color: color || MUTED, font: tickFont(fs * 0.9), maxTicksLimit: 5, padding: 6, callback: v => fmtVal(v) } };
      }
      if (minimal && pos !== 'right') return { display: false, beginAtZero: true, grace: hasNeg && horizontal ? '32%' : '14%', stacked: spec.stacked === true };
      return {
        position: pos, beginAtZero: true, grace: '10%', border: { display: false, dash: [3, 4] }, stacked: spec.stacked === true,
        grid: pos === 'right' ? { display: false } : Object.assign({}, zeroAware),
        ticks: { color: color || MUTED, font: tickFont(fs * 0.9), maxTicksLimit: 5, padding: 6, callback: v => fmtVal(v) }
      };
    };
    // Daily charts label every day 1..30; that row of numbers is clutter, so it is hidden.
    const dayNumberAxis = !horizontal && Array.isArray(spec.labels) && spec.labels.length >= 8 && spec.labels.every(l => /^\d{1,2}$/.test(String(l)));
    const catAxis = {
      grid: { display: false }, border: minimal ? { display: false } : { color: '#CBD3CE' }, stacked: spec.stacked === true,
      ticks: { color: minimal ? '#374151' : INK, font: { family: FONT, size: Math.round(horizontal ? (dense ? fs * 0.8 : fs * 0.95) : (minimal ? fs * 0.95 : fs)), weight: '600' }, autoSkip: !horizontal && n > 9, maxTicksLimit: 8, maxRotation: 0, minRotation: 0, padding: minimal ? 8 : 6, display: !dayNumberAxis }
    };
    const scales = horizontal
      ? { x: valueAxis('bottom'), y: Object.assign({ reverse: false }, catAxis) }
      : { x: catAxis, y: valueAxis('left') };
    if (rightAxis) {
      const lc = (list.find(s => s.axis === 'right') || {}).color || INK;
      scales.y1 = valueAxis('right', lc);
    }

    // baseline, connectors, reference line and value labels are drawn by one small plugin
    const only = Array.isArray(spec.labelSeries) ? new Set(spec.labelSeries) : null;
    const plugin = {
      id: 'cleanExtras',
      beforeDatasetsDraw(chart) {
        if (!minimal) return;
        const { ctx, chartArea } = chart;
        const vs = horizontal ? chart.scales.x : chart.scales.y;
        if (!vs || vs.min > 0 || vs.max < 0) return;
        const z = vs.getPixelForValue(0);
        ctx.save();
        ctx.strokeStyle = '#D5DCD8'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (horizontal) { ctx.moveTo(z, chartArea.top); ctx.lineTo(z, chartArea.bottom); }
        else { ctx.moveTo(chartArea.left, z); ctx.lineTo(chartArea.right, z); }
        ctx.stroke(); ctx.restore();
      },
      afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;
        ctx.save();
        if (Array.isArray(spec.connectors) && !horizontal) {
          const meta = chart.getDatasetMeta(0);
          const yScale = chart.scales.y;
          ctx.strokeStyle = '#B4BDB8'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]);
          spec.connectors.forEach((lvl, i) => {
            const a = meta.data[i], b = meta.data[i + 1];
            if (!a || !b || !Number.isFinite(lvl)) return;
            const y = yScale.getPixelForValue(lvl);
            ctx.beginPath(); ctx.moveTo(a.x + a.width / 2, y); ctx.lineTo(b.x - b.width / 2, y); ctx.stroke();
          });
          ctx.setLineDash([]);
        }
        if (spec.refLine && Number.isFinite(spec.refLine.value)) {
          ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
          ctx.beginPath();
          if (horizontal) {
            const x = chart.scales.x.getPixelForValue(spec.refLine.value);
            ctx.moveTo(x, chartArea.top); ctx.lineTo(x, chartArea.bottom);
            ctx.stroke(); ctx.setLineDash([]);
            if (spec.refLine.label) { ctx.fillStyle = MUTED; ctx.font = `600 ${Math.round(fs * 0.8)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(spec.refLine.label, x, chartArea.top - 3); }
          } else {
            const y = chart.scales.y.getPixelForValue(spec.refLine.value);
            ctx.moveTo(chartArea.left, y); ctx.lineTo(chartArea.right, y);
            ctx.stroke(); ctx.setLineDash([]);
          }
        }
        if (spec.valueLabels !== false) {
          ctx.font = `700 ${Math.round(fs * (minimal ? 0.95 : 0.88))}px ${FONT}`;
          ctx.fillStyle = INK;
          chart.data.datasets.forEach((ds, di) => {
            if (only && !only.has(di)) return;
            const meta = chart.getDatasetMeta(di);
            if (meta.hidden) return;
            const isLine = ds.type === 'line';
            if (isLine && n > 9) return;
            meta.data.forEach((el, i) => {
              const raw = ds.data[i];
              const single = !multi;
              let val = (single && Array.isArray(spec.labelValues)) ? spec.labelValues[i] : (Array.isArray(raw) ? null : raw);
              let text = (single && Array.isArray(spec.labelTexts)) ? spec.labelTexts[i] : null;
              if (text == null) {
                if (!Number.isFinite(val) || Math.abs(val) < 0.0001) return;
                text = fmtVal(val);
              } else if (!Number.isFinite(val)) val = 1;
              if (!text) return;
              if (isLine) {
                ctx.textAlign = 'center'; ctx.textBaseline = val >= 0 ? 'bottom' : 'top';
                ctx.fillText(text, el.x, el.y + (val >= 0 ? -fs * 0.7 : fs * 0.7));
              } else if (horizontal) {
                const right = Math.max(el.x, el.base), left = Math.min(el.x, el.base);
                ctx.textBaseline = 'middle';
                if (val >= 0) { ctx.textAlign = 'left'; ctx.fillText(text, right + fs * 0.45, el.y); }
                else { ctx.textAlign = 'right'; ctx.fillText(text, left - fs * 0.45, el.y); }
              } else {
                const top = Math.min(el.y, el.base), bot = Math.max(el.y, el.base);
                ctx.textAlign = 'center';
                if (val >= 0 || Array.isArray(raw)) { ctx.textBaseline = 'bottom'; ctx.fillText(text, el.x, top - fs * 0.35); }
                else { ctx.textBaseline = 'top'; ctx.fillText(text, el.x, bot + fs * 0.35); }
              }
            });
          });
        }
        ctx.restore();
      }
    };

    return {
      type: 'bar',
      data: { labels: spec.labels.map(l => wrap(l, maxChars)), datasets },
      plugins: [plugin],
      options: Object.assign({
        responsive: false, animation: false, devicePixelRatio: 1,
        indexAxis: horizontal ? 'y' : 'x',
        layout: { padding: { top: Math.round(fs * (spec.refLine && horizontal ? 1.6 : (multi && !horizontal ? 1.5 : 1.2))), right: Math.round(horizontal ? fs * (spec.labelTexts ? 5.2 : 3.4) : fs * 0.8), left: 2, bottom: 2 } },
        plugins: Object.assign({
          legend: { display: !!multi, position: 'top', align: (horizontal || spec.stacked) ? 'start' : (rightAxis ? 'center' : 'end'),
            labels: { sort: (a, b) => a.datasetIndex - b.datasetIndex, usePointStyle: true, pointStyle: 'rectRounded', boxWidth: Math.round(fs * 0.8), boxHeight: Math.round(fs * 0.8), padding: Math.round(fs * 0.9), color: INK, font: { family: FONT, size: fs, weight: '600' } } }
        }, cleanTitleOptions(spec, fs)),
        scales
      })
    };
  }

  // v3.34 — one print-resolution rule for every chart bitmap: 4.2 px per PDF point (~300 dpi).
  const CHART_PX_PER_PT = 4.2;
  // pixel size for a slot of wPt x hPt points, with the bitmap's ratio matching the slot's exactly
  function chartPx(wPt, hPt) {
    const w = Math.max(120, Math.round(wPt * CHART_PX_PER_PT));
    return { w, h: Math.max(80, Math.round(w * hPt / wPt)) };
  }

  async function renderChartToImage(chartSpec, widthPx = 900, heightPx = 420) {
    validateChartSpec(chartSpec);
    await ensureLibs(['chartjs']);
    await ensureChartFonts();

    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    canvas.style.position = 'fixed';
    canvas.style.left = '-99999px';
    document.body.appendChild(canvas);

    let chart = null;
    try {
      const palette = chartSpec.colors || THEME.palette;

      let config;
      const isDonut = chartSpec.type === 'doughnut' || chartSpec.type === 'pie';
      if (chartSpec.style !== 'classic' && !isDonut) {
        config = cleanChartConfig(chartSpec, widthPx, heightPx, palette);
      } else if (isDonut) {
        // Optional center label (doughnut only) — e.g. "Total Sales / 1,248,750 / ETB"
        // drawn in the donut's hole, matching the approved design. Only registered
        // when chartSpec.centerLabel is supplied, so charts that don't want it are
        // unaffected.
        const centerPlugins = [];
        if (chartSpec.type === 'doughnut' && chartSpec.centerLabel) {
          const cl = chartSpec.centerLabel; // { top, value, bottom }
          centerPlugins.push({
            id: 'centerLabel',
            afterDraw(chart) {
              const { ctx, chartArea } = chart;
              const cx = (chartArea.left + chartArea.right) / 2;
              const cy = (chartArea.top + chartArea.bottom) / 2;
              ctx.save();
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              // v3.37: sized from the hole itself so the total reads clearly at any chart size
              const holeD = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top) * 0.70;
              const holeW = holeD * 0.84;                    // usable width inside the ring
              const unit = holeD / 100;                      // 1% of the hole diameter
              if (cl.top) {
                ctx.font = `600 ${Math.round(8.5 * unit)}px Nunito, sans-serif`;
                ctx.fillStyle = THEME.textMuted;
                ctx.fillText(cl.top, cx, cy - 15 * unit);
              }
              if (cl.value) {
                let vs = 16 * unit;
                ctx.font = `bold ${Math.round(vs)}px Quicksand, sans-serif`;
                const vw = ctx.measureText(String(cl.value)).width;
                if (vw > holeW) { vs *= holeW / vw; ctx.font = `bold ${Math.round(vs)}px Quicksand, sans-serif`; }
                ctx.fillStyle = THEME.primaryDark;
                ctx.fillText(cl.value, cx, cy + 2 * unit);
              }
              if (cl.bottom) {
                ctx.font = `600 ${Math.round(8.5 * unit)}px Nunito, sans-serif`;
                ctx.fillStyle = THEME.textMuted;
                ctx.fillText(cl.bottom, cx, cy + 17 * unit);
              }
              ctx.restore();
            }
          });
        }
        config = {
          type: chartSpec.type,
          data: {
            labels: chartSpec.labels,
            datasets: [{ data: chartSpec.values, backgroundColor: palette, borderWidth: 0,
              borderRadius: chartSpec.type === 'doughnut' ? Math.max(3, Math.round(widthPx / 60)) : 0,
              spacing: chartSpec.type === 'doughnut' ? Math.max(2, Math.round(widthPx / 140)) : 0, hoverOffset: 0 }]
          },
          plugins: centerPlugins.concat(chartSpec.showPercent === false ? [] : [{
            id: 'segmentShare',
            afterDatasetsDraw(chart) {
              const vals = (chart.data.datasets[0].data || []).map(Number);
              const total = vals.reduce((a, b) => a + (Number.isFinite(b) ? Math.max(b, 0) : 0), 0);
              if (!(total > 0)) return;
              const meta = chart.getDatasetMeta(0);
              const { ctx } = chart;
              ctx.save();
              ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
              // v3.37: label size follows the ring's thickness, so it stays legible when the donut is small
              const a0 = meta.data[0];
              const ringT = a0 ? Math.max(0, a0.outerRadius - a0.innerRadius) : 0;
              ctx.font = `700 ${Math.max(10, Math.round(ringT > 0 ? ringT * 0.42 : widthPx / 30))}px Nunito, sans-serif`;
              ctx.fillStyle = '#FFFFFF';
              meta.data.forEach((arc, i) => {
                const share = Math.max(vals[i], 0) / total;
                if (share < 0.07) return;
                const p = arc.tooltipPosition();
                ctx.fillText(Math.round(share * 100) + '%', p.x, p.y);
              });
              ctx.restore();
            }
          }]),
          options: {
            responsive: false,
            devicePixelRatio: 1,
            animation: false,
            cutout: chartSpec.type === 'doughnut' ? '70%' : undefined,
            plugins: {
              // legendPosition override lets a caller switch to a 'bottom' legend for
              // square/compact chart boxes, where a 'right' legend has no room and
              // ends up illegibly small — this is what made the donut's legend
              // unreadable at small box sizes.
              legend: {
                display: chartSpec.showLegend !== false,
                position: chartSpec.legendPosition || 'right',
                labels: chartSpec.style !== 'classic'
                  ? { font: { family: 'Nunito, sans-serif', size: chartSpec.fontPx || Math.max(11, Math.round(widthPx / 46)), weight: '600' }, usePointStyle: true, pointStyle: 'rectRounded',
                      boxWidth: chartSpec.fontPx ? Math.round(chartSpec.fontPx * 0.8) : Math.round(widthPx / 58), boxHeight: chartSpec.fontPx ? Math.round(chartSpec.fontPx * 0.8) : Math.round(widthPx / 58), padding: chartSpec.fontPx ? Math.round(chartSpec.fontPx * 0.9) : Math.round(widthPx / 52), color: THEME.textDark }
                  : { font: { size: 13 }, boxWidth: 14, padding: 10 }
              },
              title: chartSpec.style !== 'classic'
                ? cleanTitleOptions(chartSpec, chartSpec.fontPx || Math.max(11, Math.round(widthPx / 46))).title
                : { display: chartSpec.showTitle !== false && !!chartSpec.title, text: chartSpec.title || '', font: { size: 15, weight: 'bold' } }
            }
          }
        };
      } else if (chartSpec.type === 'line') {
        // Optional chartSpec.series = [{ label, values, color, fill }, ...] for multi-line
        // charts (e.g. purchase quantity vs. spend, production input vs. output) — falls
        // straight through to the original single-series behavior when series is absent.
        const multi = Array.isArray(chartSpec.series) && chartSpec.series.length;
        config = {
          type: 'line',
          data: {
            labels: chartSpec.labels,
            datasets: multi
              ? chartSpec.series.map((s, i) => ({
                  label: s.label || `Series ${i + 1}`,
                  data: s.values || [],
                  borderColor: s.color || palette[i % palette.length],
                  backgroundColor: (s.color || palette[i % palette.length]) + '22',
                  pointRadius: 4,
                  tension: 0.3,
                  cubicInterpolationMode: 'monotone', // never overshoots below a 0 day (plain curves dip under the axis)
                  fill: !!s.fill
                }))
              : [{
                  data: chartSpec.values,
                  borderColor: THEME.primary,
                  backgroundColor: 'rgba(45,106,79,0.08)',
                  pointBackgroundColor: chartSpec.values.map(v => (v < 0 ? THEME.danger : THEME.primary)),
                  pointRadius: 5,
                  tension: 0.3,
                  cubicInterpolationMode: 'monotone', // never overshoots below a 0 day (plain curves dip under the axis)
                  fill: true
                }]
          },
          options: {
            responsive: false,
            devicePixelRatio: 1,
            animation: false,
            plugins: {
              legend: { display: multi },
              title: { display: chartSpec.showTitle !== false && !!chartSpec.title, text: chartSpec.title || '', font: { size: 15, weight: 'bold' } }
            },
            scales: { y: { grid: { color: THEME.border } }, x: { grid: { display: false } } }
          }
        };
      } else {
        // bar / waterfall-style bar — same optional chartSpec.series support as line, for
        // grouped bars (e.g. per-supplier spend broken out by category).
        const multi = Array.isArray(chartSpec.series) && chartSpec.series.length;
        // Single-series bar coloring:
        //  - chartSpec.barColor: one base color applied to every bar (e.g. a daily
        //    trend chart where every bar means the same thing) — this is the common
        //    case and what chartSpec.colors with a single entry now also does.
        //  - chartSpec.highlightIndex: optional index (or array of indices) drawn in
        //    THEME.primary (or chartSpec.highlightColor) instead of the base color,
        //    e.g. to call out the best/worst day.
        //  - Omit both for the original per-category palette behavior (each bar a
        //    different color, falling back to red for negative values) — used for
        //    category comparisons like "Sales by Channel".
        const singleBaseColor = chartSpec.barColor || (chartSpec.colors && chartSpec.colors.length === 1 ? chartSpec.colors[0] : null);
        const highlightSet = new Set(
          chartSpec.highlightIndex == null ? [] :
          Array.isArray(chartSpec.highlightIndex) ? chartSpec.highlightIndex : [chartSpec.highlightIndex]
        );
        const highlightColor = chartSpec.highlightColor || THEME.primary;
        config = {
          type: 'bar',
          data: {
            labels: chartSpec.labels,
            datasets: multi
              ? chartSpec.series.map((s, i) => ({
                  label: s.label || `Series ${i + 1}`,
                  data: s.values || [],
                  backgroundColor: s.color || palette[i % palette.length]
                }))
              : [{
                  data: chartSpec.values,
                  backgroundColor: chartSpec.values.map((v, i) => {
                    if (highlightSet.has(i)) return highlightColor;
                    if (singleBaseColor) return singleBaseColor;
                    return palette[i] || (v < 0 ? THEME.danger : THEME.primary);
                  })
                }]
          },
          options: {
            responsive: false,
            devicePixelRatio: 1,
            animation: false,
            plugins: {
              legend: { display: multi },
              title: { display: chartSpec.showTitle !== false && !!chartSpec.title, text: chartSpec.title || '', font: { size: 15, weight: 'bold' } }
            },
            scales: { y: { grid: { color: THEME.border } }, x: { grid: { display: false } } }
          }
        };
      }

      // v3.39: a page that registered chartjs-plugin-datalabels globally must not decorate engine charts
      config.options = config.options || {};
      config.options.plugins = config.options.plugins || {};
      config.options.plugins.datalabels = false;
      chart = new global.Chart(canvas.getContext('2d'), config);
      // allow one render frame
      await new Promise(r => setTimeout(r, 50));
      return canvas.toDataURL('image/png', 1.0);
    } finally {
      // Guaranteed cleanup: if chart construction/config-building above threw,
      // or resolved normally, the temporary canvas (and Chart.js instance, if
      // one was created) is always removed — repeated report generation can
      // no longer leave stray canvases behind in the page.
      if (chart) chart.destroy();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  }

  async function renderQRCodeImage(text, size) {
    size = size || 120;
    await ensureLibs(['qrcode']);
    let container = null;
    try {
      return await new Promise((resolve, reject) => {
        try {
          container = document.createElement('div');
          container.style.position = 'fixed';
          container.style.left = '-99999px';
          document.body.appendChild(container);
          // eslint-disable-next-line no-new
          new global.QRCode(container, { text: text, width: size, height: size, correctLevel: global.QRCode.CorrectLevel.M });
          setTimeout(() => {
            const canvas = container.querySelector('canvas');
            const img = container.querySelector('img');
            let dataUrl = null;
            if (canvas) dataUrl = canvas.toDataURL('image/png');
            else if (img) dataUrl = img.src;
            resolve(dataUrl);
          }, 80);
        } catch (e) { reject(e); }
      });
    } finally {
      // Guaranteed cleanup: whether the QR render resolved, threw synchronously,
      // or rejected, the temporary container is always removed.
      if (container && container.parentNode) container.parentNode.removeChild(container);
    }
  }

  // ------------------------------------------------------------
  // PDF SECTION RENDERERS
  // ------------------------------------------------------------
  // Lighter, two-column header — logo + company block on the left,
  // report title + generated meta right-aligned on the right, with a
  // single thin accent rule underneath. No solid color fill anywhere.
  function drawHeader(doc, reportData, pageWidth) {
    const margin = 40;
    const company = reportData.company || {};
    const logo = company.logoDataUrl || MENA_LOGO_B64;

    // Left block: logo + company name/subtitle on one line, tagline below
    if (logo) {
      try {
        doc.addImage(logo, 'PNG', margin, 14, 30, 30);
      } catch (e) {
        doc.setFillColor(THEME.primaryDark);
        doc.circle(margin + 15, 29, 15, 'F');
        doc.setTextColor('#FFFFFF');
        doc.setFontSize(13);
        doc.setFont(THEME.fontHeading, 'bold');
        doc.text('M', margin + 15, 33, { align: 'center' });
      }
    }

    const textX = margin + (logo ? 40 : 0);
    doc.setTextColor(THEME.primaryDark);
    doc.setFont(THEME.fontHeading, 'bold');
    doc.setFontSize(14);
    doc.text(`${company.name || 'MENA INJERA'} ${company.subtitle || '& DERKOSH'}`, textX, 26);
    doc.setFont(THEME.fontHeading, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(THEME.textMuted);
    doc.text(company.tagline || 'Business Management System', textX, 38);

    // Right block: report title, then period/generated meta, all muted and small.
    // Sized a notch below the company name (14pt) so the brand reads as the
    // dominant element and the report title as a secondary document label,
    // instead of the two competing at identical weight.
    doc.setTextColor(THEME.primaryDark);
    doc.setFont(THEME.fontHeading, 'bold');
    doc.setFontSize(12);
    const titleLine = reportData.period && !(reportData.title || '').includes(reportData.period)
      ? `${reportData.title || reportData.module || 'Report'} — ${reportData.period}`
      : (reportData.title || reportData.module || 'Report');
    doc.text(titleLine, pageWidth - margin, 22, { align: 'right' });

    doc.setFont(THEME.fontHeading, 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(THEME.textMuted);
    const now = reportData.generatedAt || new Date().toLocaleString();
    doc.text(`Generated ${now}`, pageWidth - margin, 34, { align: 'right' });
    if (reportData.generatedBy) {
      doc.text(`By ${reportData.generatedBy}${reportData.generatedRole ? ' — ' + reportData.generatedRole : ''}`, pageWidth - margin, 44, { align: 'right' });
    }

    doc.setDrawColor('#D5DDD7');
    doc.setLineWidth(0.6);
    doc.line(margin, 56, pageWidth - margin, 56);
    doc.setFillColor(THEME.gold);
    doc.roundedRect(margin, 55.1, 40, 1.9, 0.95, 0.95, 'F');

    return 76; // next Y cursor
  }

  // v3.33: the one card every panel shares — white, hairline border, a faint offset shadow.
  function drawCard(doc, x, y, w, h, r) {
    const rad = r === undefined ? 6 : r;
    doc.setFillColor('#EEF1EE');
    doc.roundedRect(x + 0.7, y + 1.3, w, h, rad, rad, 'F');
    doc.setFillColor('#FFFFFF');
    doc.setDrawColor('#E1E7E2');
    doc.setLineWidth(0.6);
    doc.roundedRect(x, y, w, h, rad, rad, 'FD');
  }

  function drawSectionTitle(doc, text, y, margin) {
    // Page-level heading (e.g. "SALES SUMMARY") — deliberately larger and bolder
    // than the panel sub-headings below it (10pt), so the page reads with two
    // clear tiers instead of every title looking the same weight.
    doc.setFont(THEME.fontHeading, 'bold');
    doc.setFontSize(13);
    doc.setTextColor(THEME.primaryDark);
    doc.text(text, margin, y);
    // the single warm accent: a short teff-gold tick under every page heading
    doc.setFillColor(THEME.gold);
    doc.roundedRect(margin, y + 4.4, 22, 1.8, 0.9, 0.9, 'F');
    return y + 16;
  }

  // Flat, left-aligned cards — label / big value / subtitle, stacked
  // top-to-bottom like the approved screenshot. No icon or colored
  // badge; kpi.color is kept only as a slim 2pt left accent so the
  // color field a module supplies still means something, without the
  // card itself reading as "loud".
  function drawKPICards(doc, kpis, y, pageWidth, margin) {
    if (!kpis || !kpis.length) return y;
    const usable = pageWidth - margin * 2;
    const gap = 10;
    const perRow = kpis.length > 5 ? 6 : kpis.length;
    const cardW = (usable - gap * (perRow - 1)) / perRow;
    // Taller, roomier cards with real breathing space — the previous 54/60pt cards
    // packed label/value/unit/delta into a cramped stack with little visual weight.
    const hasAnyDelta = kpis.some(k => k.delta);
    const cardH = hasAnyDelta ? 66 : 58;
    const pad = 12;

    kpis.forEach((kpi, i) => {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const x = margin + col * (cardW + gap);
      const cy = y + row * (cardH + gap);
      const color = kpi.color || THEME.primary;

      // Card body
      doc.setDrawColor(THEME.border);
      doc.setFillColor(THEME.cardBg);
      doc.setLineWidth(0.75);
      doc.roundedRect(x, cy, cardW, cardH, 4, 4, 'FD');

      // Top accent bar (full-width, not just a slim left stripe) gives each card a
      // clearer color identity at a glance, closer to how a real dashboard reads.
      doc.setFillColor(color);
      doc.roundedRect(x, cy, cardW, 3.5, 4, 4, 'F');
      // square off the bottom corners of the accent bar so it doesn't look like a
      // floating pill cut into the card
      doc.setFillColor(color);
      doc.rect(x, cy + 1.8, cardW, 1.7, 'F');

      const innerX = x + pad;
      const innerTop = cy + 3.5;

      doc.setFont(THEME.fontHeading, 'bold');
      doc.setFontSize(7);
      doc.setTextColor(THEME.textMuted);
      doc.text((kpi.label || '').toUpperCase(), innerX, innerTop + 15, { maxWidth: cardW - pad * 2, charSpace: 0.3 });

      // Value and unit sit on one baseline (e.g. "1,248,750 ETB") instead of two
      // stacked lines — reads more like a real number, less like a form field.
      doc.setFont(THEME.fontHeading, 'bold');
      doc.setFontSize(16);
      doc.setTextColor(THEME.textDark);
      const valueText = String(kpi.value);
      let unitWrapped = false; // v3.4: set when the unit drops to its own line (see the delta below)
      doc.text(valueText, innerX, innerTop + 34, { maxWidth: cardW - pad * 2 });

      if (kpi.unit) {
        const valueWidth = doc.getTextWidth(valueText);
        doc.setFont(THEME.fontHeading, 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(THEME.textMuted);
        // Only inline the unit if there's clearly room; otherwise it would overlap
        // a long value string, so fall back to a second line beneath.
        if (innerX + valueWidth + 24 < x + cardW - pad) {
          doc.text(kpi.unit, innerX + valueWidth + 5, innerTop + 34);
        } else {
          doc.text(kpi.unit, innerX, innerTop + 44);
          unitWrapped = true;
        }
      }

      // Optional delta/context line, e.g. "+12.5% vs Aug" or "62% of revenue".
      // kpi.deltaTone controls color: 'good' -> primary green, 'warn' -> danger red,
      // anything else (or omitted) -> muted gray, matching the mockup's neutral sub-lines.
      if (kpi.delta) {
        doc.setFont(THEME.fontHeading, 'bold');
        doc.setFontSize(7.5);
        const deltaColor = kpi.deltaTone === 'good' ? THEME.primary
          : kpi.deltaTone === 'warn' ? THEME.danger
          : THEME.textMuted;
        doc.setTextColor(deltaColor);
        // v3.4: when the unit wrapped onto its own line (a long value on a narrow card, e.g. the
        // six-card Dashboard row) the delta used to be drawn on top of it; it now sits one line lower.
        doc.text(String(kpi.delta), innerX, innerTop + (unitWrapped ? 56 : 48), { maxWidth: cardW - pad * 2 });
      }
    });

    const rows = Math.ceil(kpis.length / perRow);
    return y + rows * (cardH + gap) + 4;
  }

  // v3.9: which charts go on the summary page and which are detailed-only. A chart with
  // detailOnly:true never appears on the summary page; the summary shows the first two
  // charts that are NOT detailOnly, and everything else (detailOnly ones and any overflow)
  // is printed in detailed mode. With no detailOnly charts this is exactly the old rule:
  // charts[0..1] on the summary page, charts[2..] in the detailed PDF.
  function splitCharts(reportData) {
    const all = Array.isArray(reportData.charts) ? reportData.charts : [];
    const summary = [], extra = [];
    all.forEach(c => { if (c && !c.detailOnly && summary.length < 2) summary.push(c); else if (c) extra.push(c); });
    return { summary, extra };
  }

  // Chart grid used for extra charts (index 2+) in detailed mode, and as a
  // full-width fallback when a module has charts but no table on page 1.
  // Uses a running x/y cursor (not index math) so page breaks never
  // misplace a chart — this was the bug in v1.
  async function drawCharts(doc, charts, y, pageWidth, margin, opts) {
    if (!charts || !charts.length) return y;
    const usable = pageWidth - margin * 2;
    const perRow = (opts && opts.perRow) || (charts.length > 1 ? 2 : 1); // v3.38: perRow lets a lone chart stay half width
    const gap = 10;
    const chartW = (usable - gap * (perRow - 1)) / perRow;
    const chartH = chartW * 0.55;
    // 72pt reserved above the footer band — same margin the original hardcoded 770 left
    // on an 842pt-tall portrait page, now computed so it also holds on landscape.
    const pageBottom = doc.internal.pageSize.getHeight() - 72;

    let col = 0;
    let cx = margin;
    let cy = y;

    for (let i = 0; i < charts.length; i++) {
      if (col === 0 && cy + chartH > pageBottom) {
        doc.addPage();
        cy = 40;
      }

      const boxW = chartW - 8, boxH = chartH - 8;
      const px = chartPx(boxW, boxH);
      const ptText = perRow === 1 ? 7.8 : 7.2;
      const img = await renderChartToImage(
        Object.assign({ fontPx: Math.round(ptText * CHART_PX_PER_PT) }, charts[i]), px.w, px.h);
      drawCard(doc, cx, cy, chartW, chartH, 6);
      doc.addImage(img, 'PNG', cx + 4, cy + 4, boxW, boxH, undefined, 'FAST');

      col++;
      if (col >= perRow) {
        col = 0;
        cx = margin;
        cy += chartH + gap;
      } else {
        cx += chartW + gap;
      }
    }
    if (col !== 0) cy += chartH + gap; // close out a half-filled row
    return cy + 6;
  }

  // opts.bottomMargin (v3.9, optional): the page-bottom margin autoTable breaks at (its
  // default of 40 is kept when omitted). The summary page passes its own so a table can
  // never run into the footer band.
  // v3.13: a table with no rows is drawn as one quiet message box ("No records for this period")
  // instead of a bare header row with a misleading all-zero totals line. Returns the bottom y
  // and sets doc.lastAutoTable.finalY so callers that read it keep working.
  function drawEmptyTable(doc, table, y, x, width) {
    const h = 24;
    doc.setDrawColor('#D9E0DA');
    doc.setLineWidth(0.6);
    doc.setLineDashPattern([2, 2], 0);
    doc.roundedRect(x, y, width, h, 4, 4, 'S');
    doc.setLineDashPattern([], 0);
    doc.setFont(THEME.fontBody, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(THEME.textMuted);
    doc.text(String(table.emptyMessage || 'No records for this period.'), x + width / 2, y + h / 2 + 3, { align: 'center' });
    doc.lastAutoTable = { finalY: y + h };
    return y + h;
  }
  const hasNoRows = t => !t.rows || t.rows.length === 0;

  // v3.32 — clearance kept above the footer band on every page (the footer rule sits 50pt up).
  const PAGE_BOTTOM_RESERVE = 62;

  // Starts a new page when `need` points do not fit below y; otherwise returns y unchanged.
  function ensureSpace(doc, y, need) {
    const ph = doc.internal.pageSize.getHeight();
    if (y > 40 && y + need > ph - PAGE_BOTTOM_RESERVE) { doc.addPage(); return 40; }
    return y;
  }

  // Height a heading must keep company with: a short table (8 rows or fewer) travels whole when it
  // fits on one page; a longer one needs its header row and first two rows.
  function tableLeadHeight(doc, table, margin) {
    const rows = table.rows || [];
    if (!rows.length) return 60;
    const width = doc.internal.pageSize.getWidth() - margin * 2;
    const usable = doc.internal.pageSize.getHeight() - 40 - PAGE_BOTTOM_RESERVE - 24;
    const flat = r => (r || []).map(c => (c && typeof c === 'object' && c.v !== undefined ? c.v : c));
    const probe = n => measureTableHeight(doc, {
      columns: table.columns,
      rows: rows.slice(0, n).map(flat),
      totalsRow: n >= rows.length && table.totalsRow ? flat(table.totalsRow) : undefined
    }, width, 8.5, 5) * 1.1 + 6; // 10% safety: the estimate ignores autoTable's exact column widths
    if (rows.length <= 8) { const all = probe(rows.length); if (all <= usable) return all; }
    return Math.min(probe(2), usable);
  }

  // Section heading + table, kept together across a page break.
  function drawTitledTable(doc, title, table, y, margin, opts) {
    y = ensureSpace(doc, y, 16 + tableLeadHeight(doc, table, margin));
    y = drawSectionTitle(doc, title, y, margin);
    return drawTable(doc, table, y, margin, opts);
  }

  function drawTable(doc, table, y, margin, opts) {
    if (hasNoRows(table)) {
      return drawEmptyTable(doc, table, y, margin, doc.internal.pageSize.getWidth() - margin * 2) + 16;
    }
    const bottom = opts && opts.bottomMargin !== undefined ? opts.bottomMargin : PAGE_BOTTOM_RESERVE;
    doc.autoTable(Object.assign({
      startY: y,
      head: [table.columns],
      body: table.rows.slice(),
      foot: table.totalsRow ? [table.totalsRow] : undefined,
      margin: { left: margin, right: margin, bottom },
      styles: { font: THEME.fontBody, fontSize: 8.5, cellPadding: 5, textColor: THEME.textDark, lineColor: THEME.hairline, lineWidth: 0 },
      headStyles: { fillColor: '#FFFFFF', textColor: THEME.primaryDark, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: THEME.rowAlt },
      footStyles: { fillColor: '#FFFFFF', textColor: THEME.primaryDark, fontStyle: 'bold' },
      theme: 'plain'
    }, tableExtraOptions(table, 5)));
    return doc.lastAutoTable.finalY + 16;
  }

  // Narrower variant used for the left column of the side-by-side
  // summary layout (table + charts sharing the top of page 1).
  // opts (all optional, v3.2): rightMargin — right page margin (defaults to the left
  // one, as before); fontSize / cellPadding — for compact panel tables; bottomMargin (v3.9)
  // — the page-bottom margin autoTable breaks at (default 40).
  function drawTableAt(doc, table, y, margin, width, opts) {
    if (hasNoRows(table)) return drawEmptyTable(doc, table, y, margin, width);
    const o = opts || {};
    const pad = o.cellPadding === undefined ? 5 : o.cellPadding;
    doc.autoTable(Object.assign({
      startY: y,
      head: [table.columns],
      body: table.rows.slice(),
      foot: table.totalsRow ? [table.totalsRow] : undefined,
      margin: { left: margin, right: o.rightMargin === undefined ? margin : o.rightMargin,
                bottom: o.bottomMargin === undefined ? PAGE_BOTTOM_RESERVE : o.bottomMargin },
      tableWidth: width,
      styles: { font: THEME.fontBody, fontSize: o.fontSize || 8, cellPadding: pad, textColor: THEME.textDark, overflow: 'linebreak', lineColor: THEME.hairline, lineWidth: 0 },
      headStyles: { fillColor: '#FFFFFF', textColor: THEME.primaryDark, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: THEME.rowAlt },
      footStyles: { fillColor: '#FFFFFF', textColor: THEME.primaryDark, fontStyle: 'bold' },
      theme: 'plain'
    }, tableExtraOptions(table, pad)));
    return doc.lastAutoTable.finalY;
  }

  // Measures the real height drawTableAt() will render at a given width, by
  // wrapping each cell's text against its actual column width with the same
  // font/size/padding autoTable will use — instead of guessing a flat
  // per-row height. A flat guess is wrong as soon as any cell wraps to more
  // than one line (long descriptions, narrow currency columns, etc.), which
  // is exactly when the real table ends up taller than the estimate and
  // splits from its charts. Column widths are apportioned by each column's
  // longest content, mirroring autoTable's own 'auto' width algorithm
  // closely enough for a pre-render estimate.
  // ------------------------------------------------------------
  // INSIGHTS LAYOUT (v3.9) — ONE layout routine shared by the measuring pass and the
  // drawing pass, so the two can never drift apart (v3.8 kept the same constants in
  // two places and silently dropped any card that didn't fit).
  //
  // layoutInsights() never drops a card to make room. It tries three progressively
  // tighter compaction levels (font / line height / padding), and if the text still
  // doesn't fit it shortens the longest cards with an ellipsis, one line at a time
  // (never below one line per card). Only if even that can't fit — an unusually long
  // list — are trailing cards left off, and that is reported back (`dropped`) so the
  // caller can disclose it on the page instead of losing content silently.
  // ------------------------------------------------------------
  const INSIGHT_ICON_COL_W = 22; // reserved when ins.icon is present
  const INSIGHT_LEVELS = [
    { font: 7.5, lineH: 9.5, pad: 6, gap: 5, labelH: 8.5, labelFont: 6.5 }, // approved design
    { font: 7,   lineH: 8.8, pad: 5, gap: 4, labelH: 8,   labelFont: 6.5 },
    { font: 6.5, lineH: 8,   pad: 4, gap: 3, labelH: 7.5, labelFont: 6   }
  ];

  // Clips wrapped `lines` to maxLines, ending the last kept line with "..." (shortened
  // until it fits the column).
  function ellipsizeLines(doc, lines, maxLines, avail) {
    const kept = lines.slice(0, maxLines);
    let last = String(kept[kept.length - 1] || '').replace(/[\s.,;:\-–—]+$/, '');
    while (last.length > 1 && doc.getTextWidth(last + '...') > avail) {
      last = last.slice(0, -1).replace(/[\s.,;:\-–—]+$/, '');
    }
    kept[kept.length - 1] = last + '...';
    return kept;
  }

  function insightCardLayout(doc, ins, width, L, maxLines) {
    const hasIcon = !!ins.icon;
    const textX0 = hasIcon ? L.pad + INSIGHT_ICON_COL_W : L.pad;
    const avail = width - L.pad - textX0;
    doc.setFont(THEME.fontBody, 'normal');
    doc.setFontSize(L.font);
    let lines = doc.splitTextToSize(String(ins.text === undefined || ins.text === null ? '' : ins.text), avail);
    let clipped = false;
    if (maxLines && lines.length > maxLines) {
      lines = ellipsizeLines(doc, lines, maxLines, avail);
      clipped = true;
    }
    const labelRows = ins.label ? 1 : 0;
    const cardH = Math.max(
      L.pad + labelRows * L.labelH + lines.length * L.lineH + L.pad * 0.6,
      hasIcon ? L.pad * 2 + 16 : 0
    );
    return { ins, lines, textX0, cardH, clipped, fullLines: lines.length };
  }

  // Returns { level, cards, height, shortened, dropped }. `height` is the stack's real
  // height (cards plus the gaps between them, no trailing gap). maxHeight omitted →
  // natural size at the approved level, nothing shortened.
  function layoutInsights(doc, insights, width, maxHeight) {
    const list = insights || [];
    const heightOf = (cards, L) => cards.reduce((a, c) => a + c.cardH, 0) + Math.max(cards.length - 1, 0) * L.gap;

    if (!maxHeight) {
      const cards = list.map(ins => insightCardLayout(doc, ins, width, INSIGHT_LEVELS[0]));
      return { level: INSIGHT_LEVELS[0], cards, height: heightOf(cards, INSIGHT_LEVELS[0]), shortened: false, dropped: 0 };
    }

    // 1) compaction levels, no text changes
    for (let k = 0; k < INSIGHT_LEVELS.length; k++) {
      const L = INSIGHT_LEVELS[k];
      const cards = list.map(ins => insightCardLayout(doc, ins, width, L));
      const h = heightOf(cards, L);
      if (h <= maxHeight) return { level: L, cards, height: h, shortened: false, dropped: 0 };
    }

    // 2) tightest level, shorten the longest cards one line at a time
    const L = INSIGHT_LEVELS[INSIGHT_LEVELS.length - 1];
    const limits = list.map(() => 0); // 0 = unlimited
    let cards = list.map(ins => insightCardLayout(doc, ins, width, L));
    let guard = 500;
    while (heightOf(cards, L) > maxHeight && guard-- > 0) {
      let idx = -1, most = 1;
      cards.forEach((c, n) => { if (c.lines.length > most) { most = c.lines.length; idx = n; } });
      if (idx < 0) break; // everything is already one line
      limits[idx] = most - 1;
      cards[idx] = insightCardLayout(doc, list[idx], width, L, limits[idx]);
    }

    // 3) last resort: still too tall at one line each (a very long list) — leave off
    //    trailing cards, and say so.
    let dropped = 0;
    while (cards.length > 1 && heightOf(cards, L) > maxHeight) { cards.pop(); dropped++; }

    const shortened = cards.some(c => c.clipped) || dropped > 0;
    return { level: L, cards, height: heightOf(cards, L), shortened, dropped };
  }

  function measureTableHeight(doc, table, width, fontSize, cellPadding) {
    const cols = table.columns || [];
    const allRows = (table.rows || []).concat(table.totalsRow ? [table.totalsRow] : []);
    if (!cols.length) return 24;

    doc.setFont(THEME.fontBody, 'normal');
    doc.setFontSize(fontSize);

    // Proportional column widths from each column's longest cell text
    // (header included), same signal autoTable's 'auto' mode uses.
    const rawWidths = cols.map((c, i) => {
      let maxLen = String(c || '').length;
      allRows.forEach(r => { maxLen = Math.max(maxLen, String(r[i] === undefined || r[i] === null ? '' : r[i]).length); });
      return Math.max(maxLen, 3);
    });
    const totalRaw = rawWidths.reduce((a, b) => a + b, 0) || 1;
    const colWidths = rawWidths.map(w => Math.max((w / totalRaw) * width, 24));

    const lineH = fontSize * 1.15;
    const headerH = fontSize + cellPadding * 2 + 2;

    let bodyH = 0;
    allRows.forEach(r => {
      let maxLinesInRow = 1;
      cols.forEach((c, i) => {
        const cellText = String(r[i] === undefined || r[i] === null ? '' : r[i]);
        const innerWidth = Math.max(colWidths[i] - cellPadding * 2, 10);
        const wrapped = doc.splitTextToSize(cellText, innerWidth);
        maxLinesInRow = Math.max(maxLinesInRow, wrapped.length || 1);
      });
      bodyH += maxLinesInRow * lineH + cellPadding * 2;
    });

    return headerH + bodyH;
  }

  // Fits a summary-page table into availH points (v3.9). Starts from the table's own
  // summaryMaxRows cap and drops further rows, one at a time, until the measured height
  // (plus the "+ N more rows" note, and a small safety margin for the estimate) fits.
  // Returns capTableRows()'s { table, hidden, note }, or null when not even one row fits
  // (the caller then leaves the table out and points to the detailed report).
  // Hidden rows are never lost: the caller records the table in _truncatedIdx so the
  // detailed PDF prints it in full, and Excel/CSV always carry every row.
  function fitSummaryTable(doc, raw, width, availH, fontSize, pad) {
    const total = (raw.rows || []).length;
    if (!total) return { table: raw, hidden: 0, note: '' };
    const NOTE_H = 12, SAFETY = 6;
    const startCap = raw.summaryMaxRows ? Math.min(raw.summaryMaxRows, total) : total;
    for (let n = startCap; n >= 1; n--) {
      const c = capTableRows(raw, n);
      if (measureTableHeight(doc, c.table, width, fontSize, pad) + (c.note ? NOTE_H : 0) + SAFETY <= availH) return c;
    }
    return null;
  }

  // Ranked list panel (e.g. "Top Customers by Revenue") — numbered rows with a
  // name/meta line on the left and a value/percent on the right. Used in the
  // bottom-right slot of the summary page, alongside the payment/breakdown
  // table in the bottom-left slot.
  // items: [{ rank, name, meta, value, sub }]
  function drawRankedList(doc, items, y, margin, width, maxRows, opts) {
    const rowH = 31; // a middle ground between the original cramped 30pt and a
                      // more generous size — keeps row 3 fitting on page 1
                      // alongside the taller row-2 content above it
    const badgeR = 10;
    const topPad = 12; // clears the column title above, matching the visual gap
                        // autoTable's header row gives drawTableAt() for free
    const rows = (items || []).slice(0, maxRows || 6);

    // slim proportion bars — only when every shown value is a positive number (K/M/B suffixes understood)
    const mag = v => {
      const m = String(v == null ? '' : v).replace(/,/g, '').match(/(-?\d+(?:\.\d+)?)\s*([KMB])?/i);
      if (!m) return NaN;
      return parseFloat(m[1]) * ({ K: 1e3, M: 1e6, B: 1e9 }[(m[2] || '').toUpperCase()] || 1);
    };
    const mags = rows.map(it => mag(it.value));
    const showBars = !(opts && opts.bars === false) && rows.length > 1 && mags.every(v => Number.isFinite(v) && v > 0);
    const maxMag = showBars ? Math.max.apply(null, mags) : 1;

    rows.forEach((item, i) => {
      const ry = y + topPad + i * rowH;
      const rankColor = i === 0 ? THEME.gold : THEME.primary; // #1 gets a small
                                                                // highlight, like a
                                                                // leaderboard

      doc.setFillColor(i === 0 ? '#FBF3E1' : '#EAF2EC');
      doc.setDrawColor(i === 0 ? THEME.gold : '#CFE3D6');
      doc.setLineWidth(0.8);
      doc.circle(margin + badgeR, ry + rowH / 2 - 5, badgeR, 'FD');
      doc.setFont(THEME.fontHeading, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(rankColor);
      doc.text(String(item.rank || i + 1), margin + badgeR, ry + rowH / 2 - 2, { align: 'center' });

      const textX = margin + badgeR * 2 + 10;
      doc.setFont(THEME.fontHeading, 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(THEME.textDark);
      doc.text(String(item.name || ''), textX, ry + rowH / 2 - 7);

      if (item.meta) {
        doc.setFont(THEME.fontBody, 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(THEME.textMuted);
        doc.text(String(item.meta), textX, ry + rowH / 2 + 5);
      }

      doc.setFont(THEME.fontHeading, 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(THEME.primaryDark);
      doc.text(String(item.value || ''), margin + width, ry + rowH / 2 - 7, { align: 'right' });

      if (item.sub) {
        doc.setFont(THEME.fontBody, 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(THEME.textMuted);
        doc.text(String(item.sub), margin + width, ry + rowH / 2 + 5, { align: 'right' });
      }

      if (showBars) {
        const bx = textX, bw = margin + width - textX, by = ry + rowH - 6.2;
        doc.setFillColor('#EEF2EF');
        doc.roundedRect(bx, by, bw, 2.4, 1.2, 1.2, 'F');
        doc.setFillColor(i === 0 ? THEME.gold : THEME.primary);
        doc.roundedRect(bx, by, Math.max(2.4, bw * mags[i] / maxMag), 2.4, 1.2, 1.2, 'F');
      }

      if (i < rows.length - 1) {
        doc.setDrawColor(THEME.hairline);
        doc.setLineWidth(0.5);
        doc.line(margin, ry + rowH - 1.5, margin + width, ry + rowH - 1.5);
      }
    });

    return y + topPad + rows.length * rowH + 8;
  }

  // ------------------------------------------------------------
  // SUMMARY PAGE — the one shared layout for every module's page 1.
  //
  // Row 1: KPI cards (drawKPICards)
  // Row 2: three panels side by side — primary chart (reportData.charts[0]),
  //        secondary chart/donut (reportData.charts[1]), and a Key Insights
  //        column (reportData.insights) — each in its own bordered card.
  // Row 3: two panels side by side — a table (reportData.tables[0]) and a
  //        ranked list (reportData.rankedList), e.g. a breakdown table next
  //        to a "Top Customers" panel.
  //
  // Any row is omitted gracefully if its data isn't present (e.g. no second
  // chart collapses row 2 to two panels; no rankedList collapses row 3 to a
  // full-width table).
  // ------------------------------------------------------------
  async function drawSummarySection(doc, reportData, y, pageWidth, margin) {
    const usable = pageWidth - margin * 2;
    const gap = 14;
    const charts = splitCharts(reportData).summary;
    const primaryChart = charts[0];
    const secondaryChart = charts[1];
    const insights = reportData.insights;
    const rawTable = reportData.tables && reportData.tables[0];
    // v3.2: reportData.summaryTables === 2 puts tables[0] and tables[1] side by side in
    // Row 3 instead of table + ranked list (e.g. Loans: register + repayment schedule).
    const rawTable2 = reportData.summaryTables === 2 && reportData.tables ? reportData.tables[1] : null;
    // v3.2: reportData.panelTable is a compact table drawn in the Row-2 secondary slot
    // when there is no second chart (e.g. Production cost breakdown).
    const panelTable = !secondaryChart ? reportData.panelTable : null;
    const rankedList = rawTable2 ? null : reportData.rankedList;
    reportData._truncatedIdx = reportData._truncatedIdx || [];

    // The summary page is STRICTLY ONE PAGE (v3.9). Nothing in this function adds a page:
    // every block is sized to the room that is actually left, rows that don't fit are
    // trimmed (summaryMaxRows is only the starting cap), and anything cut from the page
    // is recorded in _truncatedIdx so the detailed PDF prints it in full, and Excel/CSV
    // always carry every row.
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageBottom = pageHeight - 72;
    // Tables and lists may run down to just above the footer rule (as v3.8 did); pageBottom
    // stays the stricter bound used to size Row 2.
    const tableBottom = pageHeight - 60;
    const bottomMargin = pageHeight - tableBottom; // what autoTable must leave below summary tables
    reportData._summaryNotes = reportData._summaryNotes || [];
    reportData._rankedShown = 0;
    const markTruncated = (idx) => { if (reportData._truncatedIdx.indexOf(idx) < 0) reportData._truncatedIdx.push(idx); };
    const noteOnce = (t) => { if (reportData._summaryNotes.indexOf(t) < 0) reportData._summaryNotes.push(t); };

    // Fits one table into the room below startY and draws it; returns the y it ended at.
    // `drawFn(tbl, bm)` draws the (possibly trimmed) table and returns autoTable's finalY.
    const fitAndDraw = (raw, idx, startY, x, width, fontSize, pad, drawFn) => {
      const fit = fitSummaryTable(doc, raw, width, tableBottom - startY, fontSize, pad);
      if (!fit) { // not even one row fits — leave the table out, say so
        markTruncated(idx);
        return drawMoreNote(doc, 'Table not shown here — see the detailed report or Excel export', x, startY);
      }
      if (fit.hidden) markTruncated(idx);
      const pagesBefore = doc.internal.getNumberOfPages();
      const startPage = doc.internal.getCurrentPageInfo().pageNumber;
      const endY = drawFn(fit.table, bottomMargin);
      if (doc.internal.getNumberOfPages() > pagesBefore) {
        // Safety net: the row estimate was optimistic and autoTable ran onto a new page.
        // Remove the overflow page(s) — the summary stays one page — and disclose it.
        for (let pg = doc.internal.getNumberOfPages(); pg > pagesBefore; pg--) doc.deletePage(pg);
        doc.setPage(startPage);
        markTruncated(idx);
        noteOnce('A summary table was cut to keep this page to one sheet; see the detailed report.');
        return tableBottom;
      }
      return fit.note ? drawMoreNote(doc, fit.note, x, endY) : endY;
    };

    const table = rawTable;
    const table2 = rawTable2;

    // ---- ROW 2: chart | chart-or-table | insights ----
    const panelCount = [primaryChart, secondaryChart || panelTable, insights].filter(Boolean).length;
    if (panelCount) {
      // Column widths: when all three are present, insights gets a narrower
      // share (matches the approved design); with two panels, split evenly;
      // with one, it takes the full width.
      let colWidths;
      if (primaryChart && panelTable && insights) {
        colWidths = [usable * 0.35, usable * 0.35, usable * 0.30 - (gap * 2 / 3)];
      } else if (primaryChart && secondaryChart && insights) {
        colWidths = [usable * 0.38, usable * 0.30, usable * 0.32 - (gap * 2 / 3)];
      } else if (panelCount === 2) {
        colWidths = [(usable - gap) / 2, (usable - gap) / 2];
      } else {
        colWidths = [usable];
      }

      // Row height (v3.9): Row 2 may only use what is left above Row 3's minimum. Charts
      // render at a fixed height; the insights column is laid out by layoutInsights() —
      // the same routine drawHighlights() draws from — against the room available, so
      // long insight text is compacted or shortened to fit instead of clipped or pushed
      // onto a second page.
      const hasRow3 = !!(table || table2 || rankedList);
      const ROW3_MIN = 120;
      const row2Room = pageBottom - y - 20; // row 2 = title strip (14) + panel + 6 gap
      const chartPanelH = Math.max(100, Math.min(196, row2Room - (hasRow3 ? 90 : 0))); // v3.37: taller chart/donut cards (was 164)
      const maxPanelH = Math.max(chartPanelH, Math.min(row2Room - (hasRow3 ? ROW3_MIN : 0), 260));
      let insightLayout = null;
      let panelH = chartPanelH;
      if (insights && insights.length) {
        const insightsW = colWidths[colWidths.length - 1];
        insightLayout = layoutInsights(doc, insights, insightsW, maxPanelH - 5);
        panelH = Math.max(chartPanelH, Math.min(maxPanelH, insightLayout.height + 5));
        if (insightLayout.shortened) reportData._insightsShortened = true;
      }

      let cx = margin;
      const titleY = y;
      const bodyY = y + 14;
      let colIdx = 0;

      if (primaryChart) {
        const w = colWidths[colIdx];
        // Panel sub-heading tier: smaller and colored (primary green) rather than
        // full dark-text weight, so it reads as clearly subordinate to the 12pt
        // page-level heading (drawSectionTitle) above it.
        doc.setFont(THEME.fontHeading, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(THEME.primary);
        doc.text(String(primaryChart.title || 'Chart'), cx, titleY);
        if (primaryChart.subtitle) {
          doc.setFont(THEME.fontBody, 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(THEME.textMuted);
          doc.text(primaryChart.subtitle, cx, titleY + 10);
        }
        // Chart card border: THEME.border is intentionally light for table gridlines,
        // but at that weight a standalone box around a chart barely reads as a card.
        // Use a darker, slightly thicker line here so the box is actually visible.
        const cleanP = primaryChart.style !== 'classic';
        drawCard(doc, cx, bodyY + 4, w, panelH - 18, 6);
        // showTitle:false — the panel already shows this chart's title as a header
        // above the box (drawn just above), so Chart.js's own in-canvas title would
        // just repeat it, tiny and cramped, inside the chart area.
        // Rendered close to the box's own aspect ratio (computed from w/panelH) at a
        // higher resolution than the box's point size, so axis labels and gridlines
        // stay crisp instead of being upscaled/blurred or built for a mismatched
        // wide aspect and then squeezed, which is what made text illegibly small.
        const boxW = w - 8, boxH = panelH - 26;
        const px = chartPx(boxW, boxH);
        const img = await renderChartToImage(
          Object.assign({}, primaryChart, { showTitle: false }, cleanP ? { fontPx: Math.round(7.4 * CHART_PX_PER_PT) } : {}),
          px.w, px.h
        );
        doc.addImage(img, 'PNG', cx + 4, bodyY + 8, boxW, boxH, undefined, 'FAST');
        cx += w + gap;
        colIdx++;
      }

      if (secondaryChart) {
        const w = colWidths[colIdx];
        // Panel sub-heading tier: smaller and colored (primary green) rather than
        // full dark-text weight, so it reads as clearly subordinate to the 12pt
        // page-level heading (drawSectionTitle) above it.
        doc.setFont(THEME.fontHeading, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(THEME.primary);
        doc.text(String(secondaryChart.title || 'Chart'), cx, titleY);
        // Same darker/thicker border as the chart card above — THEME.border alone
        // was too faint to read as a card outline.
        drawCard(doc, cx, bodyY + 4, w, panelH - 18, 6);
        const side = Math.min(w - 16, panelH - 40);
        // legendPosition:'bottom' — a 'right' legend has no room to breathe in a
        // small square box and was rendering illegibly small; a bottom legend below
        // the ring reads clearly at this size instead.
        const donutSpec = Object.assign({ fontPx: Math.round(6.6 * CHART_PX_PER_PT) }, secondaryChart, { showTitle: false, legendPosition: 'bottom' });
        const px = chartPx(side, side);
        const img = await renderChartToImage(donutSpec, px.w, px.w);
        doc.addImage(img, 'PNG', cx + (w - side) / 2, bodyY + 12, side, side, undefined, 'FAST');
        cx += w + gap;
        colIdx++;
      }

      if (panelTable) {
        const w = colWidths[colIdx];
        doc.setFont(THEME.fontHeading, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(THEME.primary);
        doc.text(String(panelTable.title || 'Breakdown'), cx, titleY);
        if (panelTable.subtitle) {
          doc.setFont(THEME.fontBody, 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(THEME.textMuted);
          doc.text(panelTable.subtitle, cx, titleY + 10);
        }
        // Same card outline as the chart panels so the row reads as three matching cards.
        drawCard(doc, cx, bodyY + 4, w, panelH - 18, 6);
        const inset = 7;
        const panelRaw = Object.assign({}, panelTable, { summaryMaxRows: panelTable.summaryMaxRows || 6 });
        const panelTop = bodyY + 4 + inset;
        const panelFit = fitSummaryTable(doc, panelRaw, w - inset * 2, (bodyY + panelH - 14) - panelTop - 3, 7.5, 4);
        if (panelFit) {
          const panelEnd = drawTableAt(doc, panelFit.table, panelTop, cx + inset, w - inset * 2,
            { fontSize: 7.5, cellPadding: 4, rightMargin: pageWidth - (cx + w - inset), bottomMargin });
          drawMoreNote(doc, panelFit.note, cx + inset, panelEnd + 1);
        }
        cx += w + gap;
        colIdx++;
      }

      if (insights && insights.length) {
        const w = colWidths[colIdx];
        // Panel sub-heading tier: smaller and colored (primary green) rather than
        // full dark-text weight, so it reads as clearly subordinate to the 12pt
        // page-level heading (drawSectionTitle) above it.
        doc.setFont(THEME.fontHeading, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(THEME.primary);
        doc.text('KEY INSIGHTS', cx, titleY);
        // insightLayout is the very layout panelH was sized from, so what is drawn is
        // exactly what was measured.
        drawHighlights(doc, insights, bodyY + 4, pageWidth, cx, { width: w, inline: true, layout: insightLayout });
      }

      y = bodyY + panelH + 6; // small gap so row 3's title/content doesn't
                               // crowd directly against row 2's bottom edge
                               // (e.g. the last insight card's accent bar)
    }

    // ---- ROW 3 (v3.2, summaryTables === 2): table | table ----
    // Used by modules whose real content is two tables rather than a table + ranking
    // (Loans: register + repayment schedule). v3.9: each table is fitted to the room left
    // on the page — it never paginates.
    if (table && table2) {
      const leftW = usable * (reportData.summaryTableSplit || 0.44);
      const rightW = usable - leftW - gap;
      const rightX = margin + leftW + gap;
      const pageW = doc.internal.pageSize.getWidth();

      y += 3;
      doc.setFont(THEME.fontHeading, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(THEME.primary);
      doc.text(String(table.title || 'Table'), margin, y);
      doc.text(String(table2.title || 'Table'), rightX, y);

      const bodyY = y + 14;
      const leftBottom = fitAndDraw(table, 0, bodyY, margin, leftW, 8, 5,
        (t, bm) => drawTableAt(doc, t, bodyY, margin, leftW, { rightMargin: pageW - margin - leftW, bottomMargin: bm }));
      const rightBottom = fitAndDraw(table2, 1, bodyY, rightX, rightW, 8, 5,
        (t, bm) => drawTableAt(doc, t, bodyY, rightX, rightW, { rightMargin: margin, bottomMargin: bm }));
      return Math.max(leftBottom, rightBottom) + 10;
    }

    // ---- ROW 3: table | ranked list ----
    if (table && rankedList) {
      const leftW = usable * 0.52;
      const rightW = usable - leftW - gap;
      const rightX = margin + leftW + gap;

      y += 3; // small nudge so the title clears the last insight card's accent
              // bar directly above it in row 2

      // Same panel sub-heading tier as the row-2 titles above.
      doc.setFont(THEME.fontHeading, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(THEME.primary);
      doc.text(String(table.title || 'Table'), margin, y);
      doc.text(String(rankedList.title || 'Ranking'), rightX, y);

      const bodyY = y + 14;
      const leftBottom = fitAndDraw(table, 0, bodyY, margin, leftW, 8, 5,
        (t, bm) => drawTableAt(doc, t, bodyY, margin, leftW, { bottomMargin: bm }));
      const listBottom = drawFittedRankedList(rankedList, bodyY, rightX, rightW);
      return Math.max(leftBottom, listBottom) + 10;
    }

    if (table) {
      y = drawSectionTitle(doc, table.title || 'Summary Table', y, margin);
      const startY = y;
      const endY = fitAndDraw(table, 0, startY, margin, usable, 8.5, 5,
        (t, bm) => { drawTable(doc, t, startY, margin, { bottomMargin: bm }); return doc.lastAutoTable.finalY; });
      return endY + 8;
    }

    if (rankedList) {
      y = drawSectionTitle(doc, rankedList.title || 'Ranking', y, margin);
      return drawFittedRankedList(rankedList, y, margin, usable);
    }

    return y;

    // Ranked list sized to the room left (rows are a fixed 31pt each; at least one must
    // fit or the list is left out with a pointer to the Excel export).
    function drawFittedRankedList(rl, startY, x, width) {
      const items = rl.items || [];
      const want = Math.min(items.length, rl.maxRows || 6);
      const fits = Math.floor((tableBottom - startY - 12) / 31); // 12 = list top padding
      const show = Math.min(want, Math.max(fits, 0));
      reportData._rankedShown = show; // how many the Summary actually printed (detailed PDF lists the rest)
      if (!show) {
        return want ? drawMoreNote(doc, 'List not shown here — see the Excel export', x, startY) : startY;
      }
      let bottom = drawRankedList(doc, items, startY, x, width, show, { bars: rl.bars });
      if (show < want) {
        bottom = drawMoreNote(doc, `+ ${want - show} more — see the Excel export`, x, bottom - 8);
      }
      return bottom;
    }
  }

  // Insight cards — redesigned from the original numbered-circle-row pattern into
  // stacked, left-accent-bar cards with a short label (e.g. "GROWTH", "WATCH") above
  // the insight text, matching the approved report design. Accepts both the
  // documented { icon, color, text } shape (icon drawn as a small badge) and the
  // newer { label, color, text } shape (label drawn as text) — a card can supply
  // either or both.
  //
  // opts.inline (used as the third summary-page column, beside the chart/donut):
  //   x is treated as the column's left edge (not the page margin), no section
  //   title is drawn (the caller already drew a matching column header), and the
  //   page-break decision was already made by the caller. v3.9: the caller passes
  //   opts.layout — the result of layoutInsights() that it sized the row from — so
  //   exactly what was measured is what gets drawn, and no card is ever silently
  //   clipped away (see layoutInsights for how over-long content is fitted).
  // Default (non-inline) mode: full-width, own section title, and freely paginates
  // across pages for a large insight list, always at the approved text size.
  function drawHighlights(doc, insights, y, pageWidth, x, opts) {
    if (!insights || !insights.length) return y;
    const inline = !!(opts && opts.inline);
    const pageHeight = doc.internal.pageSize.getHeight();

    if (!inline) {
      if (y > pageHeight - 142) { doc.addPage(); y = 40; }
      y = drawSectionTitle(doc, (opts && opts.title) || 'Key Insights', y, x);
    }

    const usable = opts && opts.width ? opts.width : pageWidth - x * 2;
    const layout = (opts && opts.layout) ||
      layoutInsights(doc, insights, usable, inline && opts.maxHeight ? opts.maxHeight : 0);
    const L = layout.level;
    const pageBottom = pageHeight - 62;

    let cy = y;
    for (const card of layout.cards) {
      const ins = card.ins;
      const cardH = card.cardH;
      const color = ins.color || THEME.primary;
      const hasIcon = !!ins.icon;
      const textX0 = card.textX0;

      if (!inline && cy + cardH > pageBottom) {
        doc.addPage();
        cy = 40;
      }

      doc.setFillColor('#F6F8F5');
      doc.roundedRect(x, cy, usable, cardH, 4, 4, 'F');
      doc.setFillColor(color);
      doc.roundedRect(x, cy, 2.6, cardH, 1.3, 1.3, 'F');

      if (hasIcon) {
        doc.setDrawColor(color);
        doc.setFillColor('#FFFFFF');
        doc.setLineWidth(1);
        doc.circle(x + L.pad + 7, cy + cardH / 2, 8, 'FD');
        drawIcon(doc, ins.icon, x + L.pad + 7, cy + cardH / 2, 6, color);
      }

      let textY = cy + L.pad + 2;
      if (ins.label) {
        doc.setFont(THEME.fontHeading, 'bold');
        doc.setFontSize(L.labelFont);
        doc.setTextColor(color);
        doc.text(String(ins.label), x + textX0, textY);
        textY += L.labelH;
      } else {
        textY += L.lineH - 2;
      }

      doc.setFont(THEME.fontBody, 'normal');
      doc.setFontSize(L.font);
      doc.setTextColor(THEME.textDark);
      doc.text(card.lines, x + textX0, textY + 2);

      cy += cardH + L.gap;
    }

    return cy + 4;
  }

  async function drawFooter(doc, reportData) {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const footer = reportData.footer || {};

    let qrImg = null;
    if (footer.qrText) {
      try { qrImg = await renderQRCodeImage(footer.qrText, 90); } catch (e) { qrImg = null; }
    }

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor('#D5DDD7');
      doc.setLineWidth(0.6);
      doc.line(margin, pageHeight - 50, pageWidth - margin, pageHeight - 50);

      doc.setFont(THEME.fontHeading, 'normal');
      doc.setFontSize(7);
      doc.setTextColor(THEME.textMuted);

      if (footer.notes && footer.notes.length && i === pageCount) {
        // Fixed band from notesTop to notesBottom — notes can never run past the page edge
        // regardless of count; once they don't fit, the rest collapse into "+N more notes".
        const notesTop = pageHeight - 38;
        const notesBottom = pageHeight - 8;
        const lineH = 8;
        const maxLines = Math.max(1, Math.floor((notesBottom - notesTop) / lineH));
        const overflow = footer.notes.length > maxLines;
        const shown = overflow ? footer.notes.slice(0, Math.max(maxLines - 1, 1)) : footer.notes;

        doc.text('Notes:', margin, notesTop);
        shown.forEach((n, idx) => {
          doc.text(`${idx + 1}. ${n}`, margin, notesTop + 8 + idx * lineH, { maxWidth: pageWidth / 2 - margin });
        });
        if (overflow) {
          const extra = footer.notes.length - shown.length;
          doc.text(`+ ${extra} more note${extra > 1 ? 's' : ''}`, margin, notesTop + 8 + shown.length * lineH);
        }
      }

      const qrOffset = (qrImg && i === pageCount) ? 46 : 0;
      // v3.15: every page says which report it belongs to, for what period, and when it was made —
      // continuation pages used to carry only a page number.
      {
        const idLine = `${reportData.module || reportData.title || 'Report'}${reportData.period ? ' — ' + reportData.period : ''}`;
        const idX = pageWidth - margin - qrOffset - 125;
        doc.text(idLine, idX, pageHeight - 22, { align: 'right', maxWidth: 220 });
        doc.text(`Generated ${reportData.generatedAt || ''}`, idX, pageHeight - 14, { align: 'right', maxWidth: 220 });
      }
      doc.text('Prepared By:', pageWidth - margin - qrOffset, pageHeight - 38, { align: 'right' });
      doc.text(footer.preparedBy || 'Business Management System', pageWidth - margin - qrOffset, pageHeight - 30, { align: 'right' });
      doc.text(footer.company || '', pageWidth - margin - qrOffset, pageHeight - 22, { align: 'right' });
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - qrOffset, pageHeight - 10, { align: 'right' });

      if (qrImg && i === pageCount) {
        doc.addImage(qrImg, 'PNG', pageWidth - margin - 36, pageHeight - 78, 36, 36);
      }
    }
  }

  // ------------------------------------------------------------
  // VALIDATION — called first by generatePDF/generateExcel/generateCSV so a
  // module that passes a malformed reportData gets one clear error message
  // instead of an internal crash partway through a render. Checks shape and
  // types, not that every optional field is present.
  // ------------------------------------------------------------
  function validateReportData(reportData, scope) {
    if (!reportData || typeof reportData !== 'object') {
      throw new Error('ReportEngine: reportData must be an object.');
    }
    const errors = [];
    if (reportData.kpis !== undefined && !Array.isArray(reportData.kpis)) {
      errors.push('kpis must be an array');
    }
    if (reportData.charts !== undefined && !Array.isArray(reportData.charts)) {
      errors.push('charts must be an array');
    }
    if (reportData.insights !== undefined && !Array.isArray(reportData.insights)) {
      errors.push('insights must be an array');
    }
    if (reportData.footer !== undefined && typeof reportData.footer !== 'object') {
      errors.push('footer must be an object');
    }
    const checkTable = (t, label) => {
      if (!t || typeof t !== 'object') { errors.push(`${label} must be an object`); return; }
      if (!Array.isArray(t.columns)) errors.push(`${label}.columns must be an array`);
      if (!Array.isArray(t.rows)) errors.push(`${label}.rows must be an array`);
      else if (t.rows.some(r => !Array.isArray(r))) errors.push(`${label}.rows must be an array of row arrays`);
      if (t.totalsRow !== undefined && !Array.isArray(t.totalsRow)) errors.push(`${label}.totalsRow must be an array`);
      if (t.rowKinds !== undefined && !Array.isArray(t.rowKinds)) errors.push(`${label}.rowKinds must be an array`);
      // v3.32: every row must be exactly as wide as the header.
      if (Array.isArray(t.columns) && Array.isArray(t.rows)) {
        const w = t.columns.length;
        const off = [];
        t.rows.forEach((r, ri) => { if (Array.isArray(r) && r.length !== w) off.push(`rows[${ri}] has ${r.length} cells`); });
        if (off.length) errors.push(`${label}: ${off.slice(0, 3).join(', ')}${off.length > 3 ? ` (+${off.length - 3} more)` : ''} but there are ${w} columns`);
        if (Array.isArray(t.totalsRow) && t.totalsRow.length !== w) errors.push(`${label}.totalsRow has ${t.totalsRow.length} cells but there are ${w} columns`);
      }
      if (t.additive !== undefined && !Array.isArray(t.additive)) errors.push(`${label}.additive must be an array of column indexes or names`);
    };
    if (reportData.tables !== undefined && !Array.isArray(reportData.tables)) {
      errors.push('tables must be an array');
    } else if (Array.isArray(reportData.tables)) {
      reportData.tables.forEach((t, i) => checkTable(t, `tables[${i}]`));
    }
    if (reportData.panelTable !== undefined) checkTable(reportData.panelTable, 'panelTable');
    if (reportData.summaryTables !== undefined) {
      if (reportData.summaryTables !== 1 && reportData.summaryTables !== 2) {
        errors.push('summaryTables must be 1 or 2');
      } else if (reportData.summaryTables === 2 && !(Array.isArray(reportData.tables) && reportData.tables.length >= 2)) {
        errors.push('summaryTables: 2 needs at least two entries in tables');
      }
    }
    if (reportData.layout !== undefined && reportData.layout !== 'dashboard' && reportData.layout !== 'statement') {
      errors.push("layout must be 'dashboard' or 'statement'");
    }
    // v3.32: the nested structures the renderers actually read.
    const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
    const present = v => v !== undefined && v !== null && v !== '';
    if (Array.isArray(reportData.kpis)) {
      reportData.kpis.forEach((k, i) => {
        if (!isObj(k)) { errors.push(`kpis[${i}] must be an object`); return; }
        if (!present(k.label)) errors.push(`kpis[${i}].label is required`);
        if (!present(k.value)) errors.push(`kpis[${i}].value is required`);
        ['unit', 'subtitle', 'delta', 'color'].forEach(f => {
          const v = k[f];
          if (v !== undefined && v !== null && typeof v === 'object' && f !== 'delta') errors.push(`kpis[${i}].${f} must be text`);
        });
      });
    }
    if (Array.isArray(reportData.insights)) {
      reportData.insights.forEach((n, i) => {
        if (typeof n === 'string') return;
        if (!isObj(n)) errors.push(`insights[${i}] must be a string or an object`);
        else if (!present(n.text)) errors.push(`insights[${i}].text is required`);
      });
    }
    if (reportData.rankedList !== undefined && reportData.rankedList !== null) {
      const rl = reportData.rankedList;
      if (!isObj(rl) || !Array.isArray(rl.items)) errors.push('rankedList must be an object with an items array');
      else rl.items.forEach((it, i) => {
        if (!isObj(it)) { errors.push(`rankedList.items[${i}] must be an object`); return; }
        ['name', 'meta', 'value', 'sub'].forEach(f => {
          const v = it[f];
          if (v !== undefined && v !== null && typeof v !== 'string' && typeof v !== 'number') errors.push(`rankedList.items[${i}].${f} must be text or a number`);
        });
        if (it.rank !== undefined && it.rank !== null && !Number.isFinite(Number(it.rank))) errors.push(`rankedList.items[${i}].rank must be a number`);
      });
      if (isObj(rl) && rl.maxRows !== undefined && !(Number(rl.maxRows) >= 0)) errors.push('rankedList.maxRows must be a number');
    }
    if (reportData.definitions !== undefined) {
      if (!Array.isArray(reportData.definitions)) errors.push('definitions must be an array');
      else reportData.definitions.forEach((d, i) => {
        if (!isObj(d) || !present(d.term) || !present(d.text)) errors.push(`definitions[${i}] needs a term and a text`);
      });
    }
    if (reportData.checks !== undefined) {
      if (!Array.isArray(reportData.checks)) errors.push('checks must be an array');
      else reportData.checks.forEach((c, i) => {
        if (!isObj(c)) { errors.push(`checks[${i}] must be an object`); return; }
        if (!('expected' in c) || !('actual' in c)) errors.push(`checks[${i}] needs expected and actual`);
        if (c.tolerance !== undefined && !Number.isFinite(Number(c.tolerance))) errors.push(`checks[${i}].tolerance must be a number`);
      });
    }
    if (scope === 'pdf' && reportData.status !== 'empty' && Array.isArray(reportData.charts)) {
      reportData.charts.forEach((c, i) => {
        try { validateChartSpec(c); } catch (e) { errors.push(`charts[${i}]: ${String(e.message).replace(/^ReportEngine: /, '')}`); }
      });
    }
    if (reportData.detailSections !== undefined) {
      if (!Array.isArray(reportData.detailSections)) errors.push('detailSections must be an array');
      else reportData.detailSections.forEach((sec, k) => {
        if (!sec || typeof sec !== 'object') { errors.push(`detailSections[${k}] must be an object`); return; }
        ['charts', 'tables', 'insights'].forEach(f => { if (sec[f] !== undefined && !Array.isArray(sec[f])) errors.push(`detailSections[${k}].${f} must be an array`); });
        if (Array.isArray(sec.tables)) sec.tables.forEach((t, ti) => checkTable(t, `detailSections[${k}].tables[${ti}]`));
        if (scope === 'pdf' && Array.isArray(sec.charts)) sec.charts.forEach((c, ci) => {
          try { validateChartSpec(c); } catch (e) { errors.push(`detailSections[${k}].charts[${ci}]: ${String(e.message).replace(/^ReportEngine: /, '')}`); }
        });
      });
    }
    if (errors.length) {
      throw new Error('ReportEngine: invalid reportData — ' + errors.join('; '));
    }
  }

  // Standardized "no data" state — a module passes reportData.status === 'empty'
  // instead of an empty/fabricated-looking KPI-and-table page. Renders one clean
  // message box under the header rather than a report that just looks broken.
  function drawEmptyState(doc, reportData, y, pageWidth, margin) {
    const usable = pageWidth - margin * 2;
    const boxTop = y + 30;
    const boxH = 130;

    doc.setFillColor('#F8FAF7');
    doc.setDrawColor('#D9E0DA');
    doc.setLineWidth(0.8);
    doc.setLineDashPattern([3, 3], 0);
    doc.roundedRect(margin, boxTop, usable, boxH, 8, 8, 'FD');
    doc.setLineDashPattern([], 0);

    doc.setFillColor(THEME.gold);
    doc.roundedRect(pageWidth / 2 - 11, boxTop + boxH / 2 - 34, 22, 1.8, 0.9, 0.9, 'F');

    doc.setFont(THEME.fontHeading, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(THEME.primaryDark);
    doc.text('No data for this period', pageWidth / 2, boxTop + boxH / 2 - 8, { align: 'center' });

    doc.setFont(THEME.fontBody, 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(THEME.textMuted);
    const msg = reportData.emptyMessage ||
      `There were no recorded transactions for ${reportData.period || 'this period'}.`;
    doc.text(msg, pageWidth / 2, boxTop + boxH / 2 + 14, { align: 'center', maxWidth: usable - 80 });

    return boxTop + boxH + 20;
  }

  // ------------------------------------------------------------
  // STATEMENT LAYOUT (v3.2) — reportData.layout = 'statement'
  //
  // For modules that are formal accounting statements rather than dashboards
  // (Cash Flow, Profit & Loss, Budget): a page title, an optional basis line
  // (reportData.statementBasis, e.g. "IAS 7 — Direct Method"), then each entry of
  // reportData.tables as a full-width statement table, in order. Statement tables get
  // right-aligned numeric columns and red negatives automatically, and honour
  // table.rowKinds for section / line / subtotal / total / pct / note rows. Any
  // reportData.insights are drawn underneath as plain notes; KPIs and charts are ignored.
  // ------------------------------------------------------------
  function drawStatementSection(doc, reportData, y, pageWidth, margin) {
    const pageHeight = doc.internal.pageSize.getHeight();
    y = drawSectionTitle(doc, reportData.statementTitle || ((reportData.module || '') + ' Statement'), y, margin);
    if (reportData.statementBasis) {
      doc.setFont(THEME.fontBody, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(THEME.textMuted);
      doc.text(reportData.statementBasis, margin, y - 4);
      y += 8;
    }

    (reportData.tables || []).forEach((t, i) => {
      y = ensureSpace(doc, y, (t.title ? 8 : 0) + tableLeadHeight(doc, t, margin));
      if (t.title) {
        doc.setFont(THEME.fontHeading, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(THEME.primary);
        doc.text(String(t.title), margin, y);
        y += 8;
      }
      y = drawTable(doc, Object.assign({}, t, { statement: t.statement === undefined ? true : t.statement }), y, margin);
    });

    if (reportData.insights && reportData.insights.length) {
      y = drawHighlights(doc, reportData.insights, y, pageWidth, margin, { title: reportData.insightsTitle || 'Notes' });
    }
    return y;
  }

  // Reconciliation checks the engine can make on its own (v3.16): for every table that has a
  // totals row, add up the rows of each additive numeric column and compare with the reported
  // total. Per-unit, percentage, average and balance columns are skipped (their totals are not
  // sums), as are statement-style tables (subtotals inside the rows) and any column where a cell
  // is not a plain number — so a mismatch shown here is a real one, not a guess. A module can add
  // its own cross-checks with reportData.checks = [{ label, expected, actual, tolerance? }].
  // v3.32: a table can list its additive columns (table.additive = [index | 'Column name']) or opt out
  // (table.reconcile = false); anything that cannot be checked is reported as 'unchecked', not hidden.
  // Tables with neither a totals row nor a declared additive list are plain ledgers and are not listed.
  function computeReconciliation(rd) {
    const out = [];
    const num = c => {
      const v = c && typeof c === 'object' && c.v !== undefined ? c.v : c;
      if (typeof v === 'number') return Number.isFinite(v) ? v : null;
      const t = String(v === undefined || v === null ? '' : v).trim().replace(/,/g, '');
      return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
    };
    const NOT_ADDITIVE = /%|\/|avg|average|rate|price|wac|yield|margin|days|balance|share|ratio|per /i;
    // v3.32: every entry carries status 'match' | 'differs' | 'unchecked' (+ reason). `ok` is kept
    // for older callers and is true only for 'match' — an unchecked entry is never a pass.
    const push = e => out.push(Object.assign({ ok: e.status === 'match' }, e));
    (rd.tables || []).concat(rd.panelTable ? [rd.panelTable] : []).forEach(t => {
      if (!t || !t.rows || !t.rows.length) return;
      if (t.reconcile === false) return; // module switched the engine's check off for this table
      const title = t.title || 'Table';
      if (!t.totalsRow) {
        // A table with no totals row has nothing to compare against, which is normal for a ledger.
        // But a module that declared additive columns expects a check, so say it could not be made.
        if (Array.isArray(t.additive) && t.additive.length) {
          push({ table: title, column: 'All declared columns', rows: t.rows.length, status: 'unchecked', reason: 'table has no totals row to compare with' });
        }
        return;
      }
      const declared = Array.isArray(t.additive) && t.additive.length > 0;
      // `statement` is often only a styling flag; a module that declares its additive columns has
      // said the rows do add up. Tables with subtotal rows (rowKinds) can never be summed blindly.
      if (t.rowKinds || (t.statement && !declared)) {
        push({ table: title, column: 'All columns', rows: t.rows.length, status: 'unchecked',
          reason: 'statement-style table with subtotals; rows are not simply additive' });
        return;
      }
      // Which columns to test: the module's own list when it gives one, else the name heuristic.
      let cols;
      const explicit = Array.isArray(t.additive);
      if (explicit) {
        cols = [];
        t.additive.forEach(spec => {
          const j = typeof spec === 'number' ? spec : t.columns.findIndex(c => String(c) === String(spec));
          if (!Number.isInteger(j) || j < 0 || j >= t.columns.length) {
            push({ table: title, column: String(spec), rows: t.rows.length, status: 'unchecked', reason: 'column not found in this table' });
          } else cols.push(j);
        });
      } else {
        cols = [];
        for (let j = 1; j < t.columns.length; j++) if (!NOT_ADDITIVE.test(String(t.columns[j]))) cols.push(j);
      }
      cols.forEach(j => {
        const column = String(t.columns[j]);
        const total = num(t.totalsRow[j]);
        if (total === null) {
          // A heuristic column with no numeric total simply has nothing to compare; a column the
          // module declared additive but gave no total for is reported.
          if (explicit) push({ table: title, column, rows: t.rows.length, status: 'unchecked', reason: 'no numeric reported total' });
          return;
        }
        const vals = t.rows.map(r => num(r[j]));
        const bad = vals.filter(v => v === null).length;
        if (bad) {
          push({ table: title, column, rows: t.rows.length, total, status: 'unchecked',
            reason: `${bad} of ${vals.length} rows are not plain numbers` });
          return;
        }
        const sum = vals.reduce((a, b) => a + b, 0);
        const tol = Math.max(1, t.rows.length * 0.01);
        push({ table: title, column, rows: t.rows.length, sum, total, status: Math.abs(sum - total) <= tol ? 'match' : 'differs' });
      });
    });
    (rd.checks || []).forEach(c => {
      const label = (c && c.label) || 'Check';
      const e = Number(c && c.expected), a = Number(c && c.actual);
      const missing = v => v === undefined || v === null || v === '';
      if (!c || missing(c.expected) || missing(c.actual) || !Number.isFinite(e) || !Number.isFinite(a)) {
        push({ table: label, column: 'Summary vs. detail', rows: 1, status: 'unchecked', reason: 'a figure needed for this check is missing' });
        return;
      }
      push({ table: label, column: 'Summary vs. detail', rows: 1, sum: a, total: e,
        status: Math.abs(a - e) <= (c.tolerance === undefined ? 1 : c.tolerance) ? 'match' : 'differs' });
    });
    return out;
  }

  // ------------------------------------------------------------
  // PUBLIC: PDF GENERATION
  // ------------------------------------------------------------
  // options.orientation: 'landscape' (default, matches the approved A4 landscape
  // report design) or 'portrait'
  // v3.38 — ordered detailed layout. reportData.detailSections = [{ title, charts?, tables?, insights? }]
  // prints the detailed PDF as a sequence of sections (a heading, then its charts two to a row, then its
  // tables) instead of "all extra charts, then all tables". Opt-in: without detailSections nothing changes.
  // Excel / CSV ignore it and keep carrying every table in reportData.tables.
  async function drawDetailSections(doc, reportData, y, pageWidth, margin) {
    for (const s of reportData.detailSections) {
      if (!s) continue;
      const charts = Array.isArray(s.charts) ? s.charts.filter(Boolean) : [];
      const tables = (Array.isArray(s.tables) ? s.tables.filter(Boolean) : []).map(normalizeTable);
      const insights = Array.isArray(s.insights) ? s.insights.filter(Boolean) : [];
      if (!charts.length && !tables.length && !insights.length) continue;
      const title = s.title || 'Details';
      if (!charts.length && !tables.length) { y = drawHighlights(doc, insights, y, pageWidth, margin, { title }); continue; }
      if (!charts.length && !insights.length && tables.length === 1) { y = drawTitledTable(doc, title, tables[0], y, margin); continue; }
      const chartRowH = ((pageWidth - margin * 2 - 10) / 2) * 0.55 + 16;
      y = ensureSpace(doc, y, 16 + (charts.length ? chartRowH : tableLeadHeight(doc, tables[0], margin)));
      y = drawSectionTitle(doc, title, y, margin);
      if (charts.length) y = await drawCharts(doc, charts, y, pageWidth, margin, { perRow: 2 });
      for (const t of tables) y = drawTitledTable(doc, t.title || 'Details', t, y, margin);
      if (insights.length) y = drawHighlights(doc, insights, y, pageWidth, margin, { title: 'Key Points' });
    }
    return y;
  }

  async function generatePDF(reportData, options = {}) {
    validateReportData(reportData, 'pdf');
    reportData = normalizeReportData(reportData);
    // One timestamp for the header and every page footer (v3.15).
    if (!reportData.generatedAt) reportData = Object.assign({}, reportData, { generatedAt: new Date().toLocaleString() });
    // v3.38: optional per-type page title, e.g. typeTitles = { summary: 'Multi-Year Report — Summary', detailed: '… — Detailed' }
    const typeKey = options.type === 'detailed' ? 'detailed' : 'summary';
    if (reportData.typeTitles && reportData.typeTitles[typeKey]) reportData = Object.assign({}, reportData, { title: reportData.typeTitles[typeKey] });
    await ensureLibs(['jspdf', 'autotable']);
    const { jsPDF } = global.jspdf;
    const orientation = options.orientation === 'portrait' ? 'portrait' : 'landscape';
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation });
    registerFonts(doc);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;

    let y = drawHeader(doc, reportData, pageWidth);

    if (reportData.status === 'empty') {
      y = drawEmptyState(doc, reportData, y, pageWidth, margin);
    } else if (reportData.layout === 'statement') {
      // Statement-shaped modules (Cash Flow, Profit & Loss, Budget): no KPI cards, no
      // charts — the formal statement is the page. Same for summary and detailed.
      y = drawStatementSection(doc, reportData, y, pageWidth, margin);
    } else {
      y = drawSectionTitle(doc, (reportData.module || '') + ' Summary', y, margin);
      y = drawKPICards(doc, reportData.kpis, y, pageWidth, margin);
      // drawSummarySection now draws the whole page-1 layout in one call: the
      // chart/donut/insights row, then the table/ranked-list row. Insights are
      // no longer drawn separately afterward — see the layout doc comment above
      // drawSummarySection for the shared page structure.
      y = await drawSummarySection(doc, reportData, y, pageWidth, margin);

      // Disclose anything the one-page Summary had to shorten (footer notes, last page).
      // A new footer object is built: the caller's own footer is never mutated.
      const sumNotes = (reportData._summaryNotes || []).slice();
      if (reportData._insightsShortened) {
        sumNotes.push(options.type === 'detailed'
          ? 'Insights shortened on the Summary page; full text follows below.'
          : 'Insights shortened to fit this page; full text is in the detailed report.');
      }
      if (sumNotes.length) {
        const f = reportData.footer || {};
        reportData = Object.assign({}, reportData, {
          footer: Object.assign({}, f, { notes: (f.notes || []).concat(sumNotes) })
        });
      }

      // Detailed report: additional charts + full transaction tables, unlimited pages.
      // v3.12: the Summary is always exactly one page, so every detail page starts fresh.
      if (options.type === 'detailed') {
        // v3.9: tables flagged beforeCharts (e.g. the full statement of Cash Flow / P&L /
        // Budget) are printed first, on a fresh page, ahead of the extra charts.
        const hasSections = Array.isArray(reportData.detailSections) && reportData.detailSections.length > 0; // v3.38
        const firstIdx0 = reportData.summaryTables === 2 ? 2 : 1;
        const preTables = [];
        for (let i = firstIdx0; reportData.tables && i < reportData.tables.length; i++) {
          if (reportData.tables[i] && reportData.tables[i].beforeCharts) preTables.push(reportData.tables[i]);
        }
        if (preTables.length) {
          doc.addPage();
          y = 40;
          for (const t of preTables) {
            y = drawTitledTable(doc, t.title || 'Details', Object.assign({}, t, { statement: t.statement === undefined ? true : t.statement }), y, margin);
          }
        }
        const extraCharts = hasSections ? [] : splitCharts(reportData).extra;
        let freshPage = preTables.length > 0; // a detail page has already been started
        if (extraCharts.length) {
          doc.addPage();
          freshPage = true;
          y = 40;
          y = drawSectionTitle(doc, reportData.detailChartsTitle || 'Additional Charts', y, margin);
          y = await drawCharts(doc, extraCharts, y, pageWidth, margin);
        }
        if (hasSections) {
          doc.addPage();
          freshPage = true;
          y = 40;
          y = await drawDetailSections(doc, reportData, y, pageWidth, margin);
        }
        // Tables the summary page already showed in full are skipped; ones the summary
        // page cut short (summaryMaxRows) are printed here in full.
        const firstDetailIdx = reportData.summaryTables === 2 ? 2 : 1;
        const detailTables = [];
        (hasSections ? [] : (reportData._truncatedIdx || [])).slice().sort((p, q) => p - q).forEach(i => {
          const t = reportData.tables[i];
          detailTables.push(Object.assign({}, t, { title: (t.title || 'Details') + ' — Full List' }));
        });
        for (let i = firstDetailIdx; !hasSections && reportData.tables && i < reportData.tables.length; i++) {
          if (reportData.tables[i] && reportData.tables[i].beforeCharts) continue; // already printed above
          detailTables.push(reportData.tables[i]);
        }
        const fullInsights = !hasSections && !!reportData._insightsShortened;
        if ((detailTables.length || fullInsights || (reportData.rankedList && reportData.rankedList.items && reportData.rankedList.items.length > (reportData._rankedShown || 0))) && !freshPage) {
          doc.addPage();
          y = 40;
        }
        if (fullInsights) {
          // Insight text was shortened to fit the one-page Summary — print it in full here.
          y = drawHighlights(doc, reportData.insights, y, pageWidth, margin, { title: 'Key Insights — Full Text' });
        }
        // Ranked lists (Top Suppliers, Sales by Customer, Top Debtors, Reorder Now ...) show only
        // a few rows on the Summary. The detailed PDF lists every item, as a table.
        const rl = reportData.rankedList;
        if (!hasSections && rl && Array.isArray(rl.items) && rl.items.length > (reportData._rankedShown || 0)) {
          detailTables.unshift({
            title: (rl.title || 'Ranking') + ' — Full List',
            columns: ['#', 'Name', 'Detail', 'Value', ''],
            rows: rl.items.map((it, n) => [String(it.rank || n + 1), String(it.name || ''), String(it.meta || ''), String(it.value || ''), String(it.sub || '')]),
            columnAlign: [null, null, null, 'right', 'right']
          });
        }
        if (detailTables.length) {
          // 192pt reserved above the footer band, same margin the original portrait-only
          // "y > 650" threshold left on an 842pt-tall page — now computed from the actual
          // page height so it holds on both portrait and landscape.
          for (const t of detailTables) {
            y = drawTitledTable(doc, t.title || 'Details', t, y, margin);
          }
        }

        // ---- Notes and reconciliation (v3.16) — the closing section of every detailed report.
        const checks = computeReconciliation(reportData);
        const notes = ((reportData.footer && reportData.footer.notes) || []).concat(reportData.notes || []);
        const defs = reportData.definitions || [];
        if (checks.length || notes.length || defs.length) {
          const wasFresh = freshPage || detailTables.length > 0 || fullInsights;
          if (!wasFresh) { doc.addPage(); y = 40; } else { y = ensureSpace(doc, y, 130); }
          y = drawSectionTitle(doc, 'Notes and Reconciliation', y, margin);
          if (checks.length) {
            y = drawTable(doc, normalizeTable({
              title: 'Reconciliation checks',
              columns: ['Table', 'Column', 'Rows', 'Sum of rows', 'Reported total', 'Result'],
              rows: checks.map(c => [c.table, c.column, String(c.rows),
                c.status === 'unchecked' ? '—' : fmt.n(c.sum, 2),
                c.status === 'unchecked' || c.total === undefined ? '—' : fmt.n(c.total, 2),
                c.status === 'match' ? { v: 'Matches', tone: 'good' }
                  : c.status === 'differs' ? { v: 'Differs by ' + fmt.n(Math.abs(c.sum - c.total), 2), tone: 'bad' }
                  : { v: 'Not checked — ' + (c.reason || 'could not be checked'), tone: 'warn' }]),
              columnAlign: [null, null, 'right', 'right', 'right', null]
            }), y, margin);
          }
          if (defs.length) {
            const defTable = { columns: ['Term', 'Definition'], rows: defs.map(d => [String(d.term || ''), String(d.text || '')]) };
            y = ensureSpace(doc, y, tableLeadHeight(doc, defTable, margin));
            y = drawTable(doc, defTable, y, margin);
          }
          if (notes.length) {
            const noteTable = { columns: ['#', 'Note'], rows: notes.map((n, k) => [String(k + 1), String(n)]) };
            y = ensureSpace(doc, y, tableLeadHeight(doc, noteTable, margin));
            y = drawTable(doc, noteTable, y, margin);
          }
        }
      }
    }

    await drawFooter(doc, reportData);

    const fileName = safeFileName(`${reportData.module || 'report'}_${options.type || 'summary'}_${reportData.period || ''}`) + '.pdf';
    doc.save(fileName);
    return fileName;
  }

  // ------------------------------------------------------------
  // PUBLIC: EXCEL GENERATION (ExcelJS — real numeric cells, real
  // styling: branded header band, colored header row, accounting
  // number formats with red negatives, alternating rows, frozen
  // header, logo on the first sheet)
  // ------------------------------------------------------------
  async function generateExcel(reportData) {
    validateReportData(reportData);
    reportData = normalizeReportData(reportData);
    await ensureLibs(['exceljs']);
    const ExcelJS = global.ExcelJS;
    const wb = new ExcelJS.Workbook();
    wb.creator = (reportData.footer && reportData.footer.company) || 'Business Management System';
    wb.created = new Date();

    const GREEN = 'FF1D5C38';
    const GREEN_LIGHT = 'FFF3F8F4';
    const GREEN_DARK = 'FF1B4332';
    const GOLD = 'FFC89B3C';
    const BORDER = 'FFE3E9E4';
    const TEXT_MUTED = 'FF6B7280';
    const RED = 'FFC0392B';

    function thinBorder() {
      // v3.33: a hairline under each row, no boxes
      return { bottom: { style: 'thin', color: { argb: BORDER } } };
    }

    function styleHeaderRow(row) {
      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        cell.font = { bold: true, color: { argb: GREEN }, size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = { bottom: { style: 'medium', color: { argb: GREEN } } };
      });
    }

    function addBrandHeader(ws, title, colSpan) {
      ws.mergeCells(1, 1, 1, Math.max(colSpan, 2));
      const c1 = ws.getCell(1, 1);
      c1.value = `${(reportData.company && reportData.company.name) || 'MENA INJERA'} ${(reportData.company && reportData.company.subtitle) || '& DERKOSH'} — ${title}`;
      c1.font = { bold: true, size: 13, color: { argb: GREEN_DARK } };
      c1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      c1.border = { bottom: { style: 'medium', color: { argb: GOLD } } };
      ws.getRow(1).height = 26;

      ws.mergeCells(2, 1, 2, Math.max(colSpan, 2));
      const c2 = ws.getCell(2, 1);
      c2.value = `${reportData.period || ''}   |   Currency: ${reportData.currency || 'ETB'}   |   Generated by ${reportData.generatedBy || '-'} on ${reportData.generatedAt || new Date().toLocaleString()}`;
      c2.font = { size: 9, color: { argb: TEXT_MUTED } };
      ws.getRow(2).height = 16;

      ws.addRow([]); // spacer row
    }

    // Standardized "no data" state — mirrors drawEmptyState() in the PDF path:
    // one branded sheet with a clear message instead of a blank-looking workbook.
    if (reportData.status === 'empty') {
      const ws = wb.addWorksheet('Report', { views: [{ showGridLines: false }] });
      addBrandHeader(ws, reportData.title || reportData.module || 'Report', 8);
      ws.mergeCells(4, 1, 9, 8);
      const cell = ws.getCell(4, 1);
      cell.value = 'No data for this period\n\n' + (reportData.emptyMessage ||
        `There were no recorded transactions for ${reportData.period || 'this period'}.`);
      cell.font = { size: 11, color: { argb: TEXT_MUTED } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_LIGHT } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      try {
        const logoB64 = (reportData.company && reportData.company.logoDataUrl) || MENA_LOGO_B64;
        const imgId = wb.addImage({ buffer: base64ToUint8Array(logoB64), extension: 'png' });
        ws.addImage(imgId, { tl: { col: 0.1, row: 0.1 }, ext: { width: 28, height: 28 } });
      } catch (e) { /* non-fatal — sheet continues without the logo */ }

      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const fileName = safeFileName(`${reportData.module || 'report'}_${reportData.period || ''}`) + '.xlsx';
      triggerDownload(blob, fileName);
      return fileName;
    }

    let logoEmbedded = false;

    // Summary sheet — the Excel equivalent of the PDF's page 1: branded
    // header band, KPI cards colored to match each kpi.color, the same
    // Chart.js-rendered chart images used in the PDF, and a highlights
    // strip. Skipped only if the report has none of kpis/charts/insights.
    async function addSummarySheet() {
      const hasKpis = reportData.kpis && reportData.kpis.length;
      const hasCharts = reportData.charts && reportData.charts.filter(c => c && !c.detailOnly).length;
      const hasInsights = reportData.insights && reportData.insights.length;
      if (!hasKpis && !hasCharts && !hasInsights) return;

      const ws = wb.addWorksheet('Summary', { views: [{ showGridLines: false }] });

      ws.mergeCells(1, 1, 1, 14);
      const titleCell = ws.getCell(1, 1);
      titleCell.value = `${(reportData.company && reportData.company.name) || 'MENA INJERA'} ${(reportData.company && reportData.company.subtitle) || '& DERKOSH'}  —  ${reportData.title || reportData.module || 'Report'}`;
      titleCell.font = { bold: true, size: 15, color: { argb: GREEN_DARK } };
      titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 5 };
      titleCell.border = { bottom: { style: 'medium', color: { argb: GOLD } } };
      ws.getRow(1).height = 30;

      ws.mergeCells(2, 1, 2, 14);
      const metaCell = ws.getCell(2, 1);
      metaCell.value = `${reportData.period || ''}   |   Currency: ${reportData.currency || 'ETB'}   |   Generated by ${reportData.generatedBy || '-'} on ${reportData.generatedAt || new Date().toLocaleString()}`;
      metaCell.font = { size: 9, color: { argb: TEXT_MUTED } };
      metaCell.alignment = { vertical: 'middle', indent: 5 };
      ws.getRow(2).height = 18;

      try {
        const logoB64 = (reportData.company && reportData.company.logoDataUrl) || MENA_LOGO_B64;
        const imgId = wb.addImage({ buffer: base64ToUint8Array(logoB64), extension: 'png' });
        ws.addImage(imgId, { tl: { col: 0.1, row: 0.1 }, ext: { width: 34, height: 34 } });
        logoEmbedded = true;
      } catch (e) { /* non-fatal — sheet continues without the logo */ }

      let cursorRow = 4;

      if (hasKpis) {
        // Fixed 14-column canvas (matches the title/meta merge width above) divided evenly
        // across however many KPIs are on a row, instead of a fixed 3-col-per-card width —
        // the old math put KPI 6 at columns 16-17, past the 14-column title area. Wraps to
        // a new row of cards every 7 KPIs so a card is never squeezed below 2 columns wide.
        const totalCols = 14;
        const maxPerRow = 7;
        const kpiRows = [];
        for (let i = 0; i < reportData.kpis.length; i += maxPerRow) {
          kpiRows.push(reportData.kpis.slice(i, i + maxPerRow));
        }

        kpiRows.forEach((rowKpis) => {
          const labelRow = cursorRow, valueRow = cursorRow + 1, unitRow = cursorRow + 2;
          // Delta/context row (e.g. "+12.5% vs Aug", "62% of revenue") only reserved
          // when at least one KPI in this row actually uses it, so KPI rows without
          // deltas stay as compact as before.
          const rowHasDelta = rowKpis.some(k => k.delta);
          const deltaRow = rowHasDelta ? unitRow + 1 : null;
          const lastRow = deltaRow || unitRow;
          const n = rowKpis.length;
          const base = Math.floor(totalCols / n);
          const extra = totalCols % n;
          let col = 1;

          rowKpis.forEach((kpi, i) => {
            const width = base + (i < extra ? 1 : 0);
            const colStart = col;
            const colEnd = col + width - 1;
            col += width;

            const colorArgb = 'FF' + String(kpi.color || THEME.primary).replace('#', '').toUpperCase();
            const parsed = parseCellValue(kpi.value);

            const rowsToStyle = deltaRow ? [labelRow, valueRow, unitRow, deltaRow] : [labelRow, valueRow, unitRow];
            rowsToStyle.forEach(r => {
              for (let c = colStart; c <= colEnd; c++) {
                const cell = ws.getCell(r, c);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                const border = {
                  left: { style: 'thin', color: { argb: BORDER } },
                  right: { style: 'thin', color: { argb: BORDER } }
                };
                if (r === labelRow) border.top = { style: 'medium', color: { argb: colorArgb } };
                if (r === lastRow) border.bottom = { style: 'thin', color: { argb: BORDER } };
                cell.border = border;
              }
            });

            ws.mergeCells(labelRow, colStart, labelRow, colEnd);
            const lc = ws.getCell(labelRow, colStart);
            lc.value = (kpi.label || '').toUpperCase();
            lc.font = { size: 8, bold: true, color: { argb: TEXT_MUTED } };
            lc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

            ws.mergeCells(valueRow, colStart, valueRow, colEnd);
            const vc = ws.getCell(valueRow, colStart);
            vc.value = parsed.value;
            vc.font = { size: 13, bold: true, color: { argb: parsed.negative ? RED : 'FF1F2937' } };
            vc.alignment = { horizontal: 'center', vertical: 'middle' };
            if (typeof parsed.value === 'number') {
              vc.numFmt = parsed.isPct ? '0.00%;[Red]-0.00%' : '#,##0.00;[Red](#,##0.00)';
            }

            ws.mergeCells(unitRow, colStart, unitRow, colEnd);
            const uc = ws.getCell(unitRow, colStart);
            uc.value = kpi.unit || '';
            uc.font = { size: 8, color: { argb: TEXT_MUTED } };
            uc.alignment = { horizontal: 'center', vertical: 'middle' };

            if (deltaRow) {
              ws.mergeCells(deltaRow, colStart, deltaRow, colEnd);
              const dc = ws.getCell(deltaRow, colStart);
              dc.value = kpi.delta || '';
              const deltaArgb = kpi.deltaTone === 'good' ? GREEN
                : kpi.deltaTone === 'warn' ? RED
                : TEXT_MUTED;
              dc.font = { size: 8, bold: true, color: { argb: deltaArgb } };
              dc.alignment = { horizontal: 'center', vertical: 'middle' };
            }
          });

          ws.getRow(labelRow).height = 22;
          ws.getRow(valueRow).height = 22;
          ws.getRow(unitRow).height = 16;
          if (deltaRow) ws.getRow(deltaRow).height = 16;
          cursorRow = lastRow + 2;
        });
      }

      if (hasCharts) {
        const chartsLabel = ws.getCell(cursorRow, 1);
        chartsLabel.value = 'Overview charts';
        chartsLabel.font = { bold: true, size: 12, color: { argb: GREEN_DARK } };
        ws.getRow(cursorRow).height = 20;
        cursorRow += 1;
        const chartTopRow = cursorRow;

        // Same Chart.js render used for the PDF, capped at 4 so the sheet stays a sane size
        const chartsToEmbed = reportData.charts.filter(c => c && !c.detailOnly).slice(0, 4);
        let col = 0;
        for (let i = 0; i < chartsToEmbed.length; i++) {
          try {
            const dataUrl = await renderChartToImage(Object.assign({ fontPx: 33 }, chartsToEmbed[i]), 1100, 600);
            const imgId = wb.addImage({ buffer: base64ToUint8Array(dataUrl), extension: 'png' });
            ws.addImage(imgId, {
              tl: { col: col * 7, row: (chartTopRow - 1) + Math.floor(i / 2) * 13 },
              ext: { width: 330, height: 180 }
            });
          } catch (e) { /* skip this chart, keep the export going */ }
          col = (col + 1) % 2;
        }
        cursorRow = chartTopRow + Math.ceil(chartsToEmbed.length / 2) * 13 + 1;
      }

      if (hasInsights) {
        const insightsLabel = ws.getCell(cursorRow, 1);
        insightsLabel.value = 'Highlights';
        insightsLabel.font = { bold: true, size: 12, color: { argb: GREEN_DARK } };
        ws.getRow(cursorRow).height = 20;
        cursorRow += 1;

        reportData.insights.forEach(ins => {
          const insColorArgb = 'FF' + String(ins.color || THEME.primary).replace('#', '').toUpperCase();
          // ins.label (e.g. "GROWTH", "WATCH") — the same tag the PDF shows above each
          // insight's text — is bolded as a prefix so the categorization isn't lost in
          // the Excel export; ins.icon (the older, alternative schema) has no plain-text
          // equivalent and is intentionally not rendered as a symbol here.
          ws.mergeCells(cursorRow, 1, cursorRow, 14);
          const cell = ws.getCell(cursorRow, 1);
          cell.value = ins.label ? `${ins.label}:  ${ins.text}` : '●  ' + ins.text;
          cell.font = { size: 9.5, color: { argb: 'FF1F2937' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_LIGHT } };
          cell.alignment = { vertical: 'middle', indent: 1, wrapText: true };
          cell.border = { left: { style: 'medium', color: { argb: insColorArgb } } };
          ws.getRow(cursorRow).height = 16;
          cursorRow += 1;
        });
        cursorRow += 1; // spacer before a following rankedList section, if any
      }

      // rankedList (e.g. "Top Customers by Revenue") — the PDF's bottom-right summary
      // panel had no Excel equivalent at all before this; a reader exporting to Excel
      // was silently missing this section entirely. Rendered as a simple ranked table:
      // #, Name, Meta, Value, Sub — mirroring the same fields drawRankedList() uses.
      if (reportData.rankedList && reportData.rankedList.items && reportData.rankedList.items.length) {
        const rl = reportData.rankedList;
        const rlLabel = ws.getCell(cursorRow, 1);
        rlLabel.value = String(rl.title || 'Ranking');
        rlLabel.font = { bold: true, size: 12, color: { argb: GREEN_DARK } };
        ws.getRow(cursorRow).height = 20;
        cursorRow += 1;

        const rlHeaderRow = ws.getRow(cursorRow);
        const rlHeaders = ['#', 'Name', 'Detail', 'Value', ''];
        rlHeaders.forEach((h, i) => { rlHeaderRow.getCell(i + 1).value = h; });
        styleHeaderRow(rlHeaderRow);
        rlHeaderRow.height = 18;
        cursorRow += 1;

        // v3.13: every item, not just the summary page's maxRows — the export is the full record.
        const items = rl.items;
        items.forEach((item, i) => {
          const row = ws.getRow(cursorRow);
          row.getCell(1).value = item.rank || i + 1;
          row.getCell(2).value = item.name || '';
          row.getCell(3).value = item.meta || '';
          // Splits a combined "142,600 ETB" into a numeric cell plus a unit, so the
          // Value column is genuinely numeric (sortable/summable) in Excel rather
          // than landing as plain text the way the PDF's plain-text rendering allows.
          const parsedVal = parseValueWithUnit(item.value);
          row.getCell(4).value = parsedVal.value;
          if (typeof parsedVal.value === 'number') {
            row.getCell(4).numFmt = parsedVal.unit
              ? `#,##0.00 "${parsedVal.unit}";[Red](#,##0.00) "${parsedVal.unit}"`
              : '#,##0.00;[Red](#,##0.00)';
          }
          row.getCell(5).value = item.sub || '';
          row.eachCell((cell, colNum) => {
            cell.border = thinBorder();
            cell.font = { size: 9, color: { argb: 'FF1F2937' }, bold: colNum === 2 };
            if (colNum === 4) cell.alignment = { horizontal: 'right' };
            if (i % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_LIGHT } };
          });
          cursorRow += 1;
        });
      }

      ws.getColumn(1).width = 14;
      for (let c = 2; c <= 14; c++) ws.getColumn(c).width = 10;
      ws.views = [{ state: 'frozen', ySplit: 3, showGridLines: false }];
    }

    await addSummarySheet();

    // One sheet per table (names de-duplicated so identical titles don't crash the export).
    // Seed with every worksheet name that already exists (currently just 'Summary', added
    // above by addSummarySheet()) so a table titled "Summary" can't collide with it.
    const usedNames = new Set(wb.worksheets.map(w => w.name.toLowerCase()));
    exportTables(reportData).forEach((table, idx) => {
      let base = (table.sheetName || table.title || `Table${idx + 1}`).replace(/[\\/?*[\]:]/g, '').substring(0, 28) || `Table${idx + 1}`;
      let name = base;
      let n = 2;
      while (usedNames.has(name.toLowerCase())) {
        name = `${base.substring(0, 25)} ${n++}`;
      }
      usedNames.add(name.toLowerCase());

      const ws = wb.addWorksheet(name);
      const colCount = table.columns.length;
      addBrandHeader(ws, table.title || name, colCount);

      const headerRow = ws.addRow(table.columns);
      styleHeaderRow(headerRow);

      const TONE_ARGB = { good: GREEN, bad: RED, warn: 'FFE67E22', info: 'FF2E86DE', muted: TEXT_MUTED };
      table.rows.forEach((r, ri) => {
        const parsedRow = r.map(v => parseCellValue(v));
        const row = ws.addRow(parsedRow.map(p => p.value));
        const kind = (table.rowKinds || [])[ri];
        row.eachCell((cell, colNum) => {
          const p = parsedRow[colNum - 1] || { negative: false };
          cell.border = thinBorder();
          cell.font = { size: 9.5, color: { argb: p.negative ? RED : 'FF1F2937' } };
          if (typeof p.value === 'number') {
            cell.numFmt = p.isPct ? '0.00%;[Red]-0.00%' : '#,##0.00;[Red](#,##0.00)';
            cell.alignment = { horizontal: 'right' };
          }
          if (ri % 2 === 1) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_LIGHT } };
          }
          // v3.2 row kinds / cell tones — mirrors what the PDF shows
          if (kind === 'section') {
            cell.font = { size: 9.5, bold: true, color: { argb: GREEN } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4EEE8' } };
          } else if (kind === 'subtotal' || kind === 'total') {
            cell.font = { size: 9.5, bold: true, color: { argb: p.negative ? RED : (kind === 'total' ? GREEN : 'FF1F2937') } };
            cell.border = { ...thinBorder(), top: { style: 'thin', color: { argb: 'FF9DB3A6' } } };
            if (kind === 'total') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_LIGHT } };
          } else if (kind === 'pct' || kind === 'note') {
            cell.font = { size: 9.5, color: { argb: TEXT_MUTED } };
          } else if (kind === 'line' && colNum === 1) {
            cell.alignment = { ...(cell.alignment || {}), indent: 1 };
          }
          const tone = (table._tones || {})['b' + ri + ',' + (colNum - 1)];
          if (tone && TONE_ARGB[tone]) cell.font = { size: 9.5, bold: true, color: { argb: TONE_ARGB[tone] } };
          if ((table._bolds || {})['b' + ri + ',' + (colNum - 1)]) cell.font = { ...cell.font, bold: true };
        });
      });

      if (table.totalsRow) {
        const parsedTotals = table.totalsRow.map(v => parseCellValue(v));
        const totRow = ws.addRow(parsedTotals.map(p => p.value));
        totRow.eachCell((cell, colNum) => {
          const p = parsedTotals[colNum - 1] || { negative: false };
          cell.font = { bold: true, size: 9.5, color: { argb: GREEN } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN_LIGHT } };
          cell.border = thinBorder();
          if (typeof p.value === 'number') {
            cell.numFmt = p.isPct ? '0.00%;[Red]-0.00%' : '#,##0.00;[Red](#,##0.00)';
            cell.alignment = { horizontal: 'right' };
          }
        });
      }

      ws.columns.forEach((col, i) => {
        const headerLen = String(table.columns[i] || '').length;
        const maxLen = table.rows.reduce((m, r) => Math.max(m, String(r[i] === undefined || r[i] === null ? '' : r[i]).length), headerLen);
        col.width = Math.min(Math.max(maxLen + 4, 12), 40);
      });
      ws.views = [{ state: 'frozen', ySplit: 4, showGridLines: false }];
    });

    // Fallback: if there was no Summary sheet to carry the logo (a report with
    // no kpis/charts/insights, just raw tables), put it on the first table sheet instead.
    if (!logoEmbedded) {
      try {
        const logoB64 = (reportData.company && reportData.company.logoDataUrl) || MENA_LOGO_B64;
        if (logoB64 && wb.worksheets[0]) {
          const imgId = wb.addImage({ buffer: base64ToUint8Array(logoB64), extension: 'png' });
          wb.worksheets[0].addImage(imgId, { tl: { col: 0.05, row: 0.05 }, ext: { width: 22, height: 22 } });
        }
      } catch (e) { /* non-fatal — export continues without the logo */ }
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const fileName = safeFileName(`${reportData.module || 'report'}_${reportData.period || ''}`) + '.xlsx';
    triggerDownload(blob, fileName);
    return fileName;
  }

  // ------------------------------------------------------------
  // PUBLIC: CSV GENERATION (new in v2)
  // ------------------------------------------------------------
  function csvEscape(v) {
    const s = v === null || v === undefined ? '' : String(v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function tableToCSV(table, opts) {
    const w = table.columns.length;
    // Every row is padded / trimmed to the header width so the file stays rectangular.
    const fit = r => { const c = (r || []).slice(0, w); while (c.length < w) c.push(''); return c; };
    const rows = [table.columns].concat(table.rows.slice());
    if (table.totalsRow && !(opts && opts.excludeTotals)) rows.push(table.totalsRow);
    return rows.map(r => fit(r).map(csvEscape).join(',')).join('\r\n');
  }

  // generateCSV(reportData)                       -> all tables, one file, blank-line separated
  // generateCSV(reportData, { tableIndex: 1 })     -> just tables[1]
  // generateCSV(reportData, { perTable: true })    -> one CSV file per table (structured,
  //                                                    better for automated processing than
  //                                                    the blank-line-separated all-in-one file)
  //                                                    RECOMMENDED for anything imported elsewhere;
  //                                                    add excludeTotals: true for pure data rows.
  // An empty report downloads a one-row "No data" CSV (same message as the PDF / Excel empty state).
  function generateCSV(reportData, options = {}) {
    validateReportData(reportData);
    reportData = normalizeReportData(reportData);
    const tables = exportTables(reportData);
    if (reportData.status === 'empty' || !tables.length) {
      const msg = reportData.emptyMessage || `There were no recorded transactions for ${reportData.period || 'this period'}.`;
      const csv = [['Report', 'Period', 'Status', 'Message'],
        [reportData.title || reportData.module || 'Report', reportData.period || '', 'No data', msg]]
        .map(r => r.map(csvEscape).join(',')).join('\r\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const fileName = safeFileName(`${reportData.module || 'report'}_no-data_${reportData.period || ''}`) + '.csv';
      triggerDownload(blob, fileName);
      return options.perTable ? [fileName] : fileName;
    }

    if (options.perTable) {
      return tables.map((t, idx) => {
        const csv = tableToCSV(t, options);
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const fileName = safeFileName(`${reportData.module || 'report'}_${t.title || `table${idx + 1}`}_${reportData.period || ''}`) + '.csv';
        triggerDownload(blob, fileName);
        return fileName;
      });
    }

    let csv, suffix;
    if (options.tableIndex !== undefined) {
      const t = tables[options.tableIndex];
      if (!t) throw new Error('ReportEngine.generateCSV: no table at index ' + options.tableIndex);
      csv = tableToCSV(t);
      suffix = t.title || `table${options.tableIndex + 1}`;
    } else {
      csv = tables.map(t => (t.title ? t.title + '\r\n' : '') + tableToCSV(t)).join('\r\n\r\n');
      suffix = 'all';
    }

    // UTF-8 BOM so Excel opens accented/ETB-adjacent text correctly
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const fileName = safeFileName(`${reportData.module || 'report'}_${suffix}_${reportData.period || ''}`) + '.csv';
    triggerDownload(blob, fileName);
    return fileName;
  }

  // ============================================================
  // MODULE PRESETS (v3.2)
  // ------------------------------------------------------------
  // One function per planned module design (see "Mena BMS — PDF Export Design Plan").
  // A preset takes the module's own already-computed figures and returns a complete
  // reportData object — it owns the design decisions (which KPIs, which charts, which
  // tables, titles, colours, row caps); the page owns the numbers.
  //
  //     const data = ReportEngine.presets.purchases({ period: 'September 2026', ... });
  //     await ReportEngine.generatePDF(data, { type: 'summary' });
  //
  // Every preset accepts the same common fields:
  //   period, currency ('ETB'), generatedBy, generatedRole, generatedAt, company,
  //   footer ({ notes, qrText, ... } merged over the default footer), insights (an array
  //   that replaces the auto-generated Key Insights), status:'empty' for no data.
  // Money is passed as plain numbers; the preset formats it.
  // ============================================================
  const fmt = {
    // 1234.5 -> "1,234.50"; negatives get a minus sign: -1,234.50 (never "-0" for a value that rounds to zero).
    n(v, d) {
      const dec = d === undefined ? 0 : d;
      const num = Number(v);
      if (!Number.isFinite(num)) return '—';
      const s = Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      return num < 0 && /[1-9]/.test(s) ? `-${s}` : s;
    },
    money(v) { return fmt.n(v, 0); },
    money2(v) { return fmt.n(v, 2); },
    pct(v, d) { const num = Number(v); return Number.isFinite(num) ? `${num.toFixed(d === undefined ? 1 : d)}%` : '—'; },
    signedPct(v, d) { const num = Number(v); return Number.isFinite(num) ? `${num > 0 ? '+' : ''}${num.toFixed(d === undefined ? 1 : d)}%` : '—'; },
    share(part, whole) { return whole ? (part / whole) * 100 : 0; }
  };

  const PALETTE = THEME.palette.concat(['#A3B18A', '#6B7280']);

  function presetBase(input, module, title) {
    const i = input || {};
    const footer = Object.assign({
      preparedBy: 'Business Management System',
      company: 'MENA Injera & Derkosh',
      notes: ['Negative values are shown with a minus sign.']
    }, i.footer || {});
    const base = {
      module,
      title: title || `${module} Report`,
      period: i.period || '',
      currency: i.currency || 'ETB',
      generatedBy: i.generatedBy,
      generatedRole: i.generatedRole,
      generatedAt: i.generatedAt,
      footer
    };
    if (i.company) base.company = i.company;
    if (i.status === 'empty') {
      base.status = 'empty';
      if (i.emptyMessage) base.emptyMessage = i.emptyMessage;
    }
    return base;
  }

  const sumBy = (arr, f) => (arr || []).reduce((a, x) => a + (Number(f(x)) || 0), 0);

  // Groups rows by a key and sums a value — returns [{ name, amount, count }] sorted desc.
  function groupSum(rows, keyFn, valFn) {
    const map = new Map();
    (rows || []).forEach(r => {
      const k = keyFn(r) || 'Other';
      const cur = map.get(k) || { name: k, amount: 0, count: 0 };
      cur.amount += Number(valFn(r)) || 0;
      cur.count += 1;
      map.set(k, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }

  // Sums values by day for an ISO-date field -> { labels: ['1','2',...], values: [...] }
  // Covers every day from the first to the last date seen, so a quiet day shows as 0
  // instead of being silently skipped (which would make a trend line lie).
  function dailySeries(rows, dateFn, valFn) {
    const byDay = new Map();
    (rows || []).forEach(r => {
      const d = String(dateFn(r) || '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
      byDay.set(d, (byDay.get(d) || 0) + (Number(valFn(r)) || 0));
    });
    const keys = Array.from(byDay.keys()).sort();
    if (!keys.length) return { labels: [], values: [] };
    const labels = [], values = [];
    const cur = new Date(keys[0] + 'T00:00:00Z');
    const end = new Date(keys[keys.length - 1] + 'T00:00:00Z');
    while (cur <= end) {
      const k = cur.toISOString().slice(0, 10);
      labels.push(String(cur.getUTCDate()));
      values.push(byDay.get(k) || 0);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return { labels, values };
  }

  function shortDate(iso) {
    const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return String(iso || '');
    const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m[2]) - 1];
    return `${Number(m[3])} ${mon}`;
  }

  const presets = {};

  // ---- shared helpers for the presets below ----
  const hasNum = v => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));
  // v3.30: a preset input that should be a list but arrives as anything else is treated as empty, never a crash
  const asArr = v => (Array.isArray(v) ? v : []);
  const avgOf = (arr, f) => {
    const vals = (arr || []).map(f).filter(hasNum).map(Number);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };
  // Keeps the biggest n groups and folds the rest into one "Other" slice, so a donut never
  // gets more slices than it can label legibly at summary-page size.
  function topWithOther(groups, n) {
    if (!groups || groups.length <= n) return groups || [];
    const head = groups.slice(0, n - 1);
    const rest = groups.slice(n - 1);
    return head.concat([{ name: 'Other', amount: sumBy(rest, g => g.amount), count: sumBy(rest, g => g.count) }]);
  }
  // Averages a value per ISO date -> { labels: ['3 Sep', ...], values: [...] }, in date order.
  // Unlike dailySeries it does NOT fill quiet days — right for averages/ratios (yield, cost
  // per unit) where a missing day means "no data", not zero.
  function dateAvgSeries(rows, dateFn, valFn) {
    const by = new Map();
    (rows || []).forEach(r => {
      const d = String(dateFn(r) || '').slice(0, 10);
      const v = valFn(r);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !hasNum(v)) return;
      const cur = by.get(d) || { sum: 0, n: 0 };
      cur.sum += Number(v); cur.n += 1; by.set(d, cur);
    });
    const keys = Array.from(by.keys()).sort();
    return { labels: keys.map(shortDate), values: keys.map(k => by.get(k).sum / by.get(k).n) };
  }


  // ---------------------------------------------------------------
  // 2. PURCHASES — "What are we spending money on, and is anything about to need
  //    approval or attention?"
  //
  // input: {
  //   ledger: [{ date:'2026-09-03', supplier, category, description?, cost,
  //              type?: 'raw'|'operating'|'other', status?: 'pending'|'approved'|..., large?: bool }],
  //   previousTotal?, previousLabel? ('Aug'),
  //   approvalThreshold?   // ETB — expenses at/above this are "large"
  //   totals?: { total, rawMaterials, operating, largePending }  // override derived figures
  // }
  // ---------------------------------------------------------------
  presets.purchases = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Purchases', 'Purchases Report');
    if (base.status === 'empty') return base;

    const ledger = asArr(i.ledger).slice();
    const kindOf = r => r.type || (/raw|teff|rice|blend|grain|flour|ingredient/i.test(r.category || '') ? 'raw'
      : /operat|transport|utilit|fuel|rent|repair|maint/i.test(r.category || '') ? 'operating' : 'other');
    const tot = Object.assign({}, i.totals);
    const total = tot.total !== undefined ? tot.total : sumBy(ledger, r => r.cost);
    const raw = tot.rawMaterials !== undefined ? tot.rawMaterials : sumBy(ledger.filter(r => kindOf(r) === 'raw'), r => r.cost);
    const oper = tot.operating !== undefined ? tot.operating : sumBy(ledger.filter(r => kindOf(r) === 'operating'), r => r.cost);
    const isLargePending = r => String(r.status || '').toLowerCase() === 'pending' &&
      (r.large || (i.approvalThreshold && Number(r.cost) >= i.approvalThreshold));
    const pendingRows = ledger.filter(isLargePending);
    const pendingAmt = tot.largePending !== undefined ? tot.largePending : sumBy(pendingRows, r => r.cost);
    const pendingCnt = tot.largePending !== undefined ? (i.largePendingCount || 0) : pendingRows.length;

    const prev = i.previousTotal;
    const change = prev ? ((total - prev) / prev) * 100 : null;

    const cats = groupSum(ledger, r => r.category, r => r.cost);
    const sups = groupSum(ledger, r => r.supplier, r => r.cost);
    const trend = (i.trend && i.trend.labels && i.trend.labels.length) ? i.trend : dailySeries(ledger, r => r.date, r => r.cost);

    base.kpis = [
      { label: 'Total Purchases (This Month)', value: fmt.money(total), unit: base.currency, color: '#1D5C38',
        delta: change === null ? undefined : `${fmt.signedPct(change)} vs ${i.previousLabel || 'last month'}` },
      { label: 'Raw Materials', value: fmt.money(raw), unit: base.currency, color: '#2E86DE',
        delta: total ? `${fmt.pct(fmt.share(raw, total), 0)} of purchases` : undefined },
      { label: 'Operating Expenses', value: fmt.money(oper), unit: base.currency, color: '#C89B3C',
        delta: total ? `${fmt.pct(fmt.share(oper, total), 0)} of purchases` : undefined },
      { label: 'Large Expenses Pending', value: fmt.money(pendingAmt), unit: base.currency, color: '#C0392B',
        delta: pendingCnt ? `${pendingCnt} awaiting approval` : 'Nothing pending', deltaTone: pendingCnt ? 'warn' : 'good' }
    ];

    base.charts = [];
    if (trend.labels && trend.labels.length) {
      base.charts.push({ type: 'line', title: 'Purchase Trend', subtitle: `${base.currency} per day`, labels: trend.labels, values: trend.values });
    }
    if (cats.length) {
      base.charts.push({ type: 'doughnut', title: 'Spend by Category', labels: cats.map(c => c.name), values: cats.map(c => c.amount),
        colors: PALETTE, centerLabel: { top: 'Total', value: fmt.money(total), bottom: base.currency } });
    }

    // Key Insights — generated from the figures above unless the page supplies its own.
    if (i.insights) {
      base.insights = i.insights;
    } else {
      const ins = [];
      if (change !== null) {
        ins.push({ label: change > 10 ? 'Watch' : 'Spend', color: change > 10 ? '#C89B3C' : '#1D5C38',
          text: `Purchases are ${change >= 0 ? 'up' : 'down'} ${fmt.pct(Math.abs(change))} versus ${i.previousLabel || 'last month'} (${fmt.money(total)} ${base.currency}).` });
      }
      if (cats.length) {
        ins.push({ label: 'Mix', color: '#2E86DE', text: `${cats[0].name} is the biggest category at ${fmt.pct(fmt.share(cats[0].amount, total), 0)} of spend.` });
      }
      if (pendingCnt) {
        ins.push({ label: 'Approval', color: '#C0392B', text: `${pendingCnt} large expense${pendingCnt > 1 ? 's' : ''} (${fmt.money(pendingAmt)} ${base.currency}) still await${pendingCnt > 1 ? '' : 's'} approval.` });
      }
      if (sups.length && fmt.share(sups[0].amount, total) >= 40) {
        ins.push({ label: 'Risk', color: '#8E44AD', text: `${sups[0].name} supplies ${fmt.pct(fmt.share(sups[0].amount, total), 0)} of purchases — a concentration worth watching.` });
      }
      base.insights = ins.slice(0, 4);
    }

    const byDateDesc = ledger.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    base.tables = [
      { title: 'Purchase Ledger', summaryMaxRows: 4,
        columns: ['Date', 'Supplier', 'Category', `Cost (${base.currency})`],
        rows: byDateDesc.map(r => [shortDate(r.date), r.supplier || '', r.category || '', fmt.money2(r.cost)]),
        columnAlign: [null, null, null, 'right'],
        totalsRow: ['TOTAL', '', '', fmt.money2(sumBy(ledger, r => r.cost))] },
      { title: 'Spend by Category', columns: ['Category', 'Purchases', `Spend (${base.currency})`, '% of Total'],
        rows: cats.map(c => [c.name, String(c.count), fmt.money2(c.amount), fmt.pct(fmt.share(c.amount, total))]),
        columnAlign: [null, 'right', 'right', 'right'],
        totalsRow: ['TOTAL', String(ledger.length), fmt.money2(total), '100.0%'] }
    ];
    base.rankedList = { title: 'Top Suppliers by Spend', maxRows: 4,
      items: sups.map((s, idx) => ({ rank: idx + 1, name: s.name, meta: `${s.count} purchase${s.count > 1 ? 's' : ''}`,
        value: `${fmt.money(s.amount)} ${base.currency}`, sub: `${fmt.pct(fmt.share(s.amount, total))} of spend` })) };

    // Detailed PDF / Excel only (v3.21). The Purchase Ledger and the full supplier list are already
    // printed in full by the detailed PDF; these tables add the breakdowns the plan asks for.
    const cur = base.currency;
    const rowCost = r => Number(r.cost) || 0;
    const dated = ledger.filter(r => /^\d{4}-\d{2}-\d{2}$/.test(String(r.date || '').slice(0, 10)));
    const notes = [];
    if (ledger.length) {
      // Spend by type — the three KPI figures plus whatever is left, so the table always foots to the total.
      const otherAmt = total - raw - oper;
      base.tables.push({ title: 'Spend by Type', sheetName: 'By Type',
        columns: ['Type', `Spend (${cur})`, '% of Total'],
        rows: [['Raw materials', raw], ['Operating expenses', oper], ['Other / unallocated', otherAmt]]
          .map(([n, v]) => [n, fmt.money2(v), total ? fmt.pct(fmt.share(v, total)) : '—']),
        columnAlign: [null, 'right', 'right'],
        totalsRow: ['TOTAL', fmt.money2(total), total ? '100.0%' : '—'] });
      base.checks = (base.checks || []).concat([{ label: 'Total purchases: summary vs. purchase ledger', expected: total, actual: sumBy(ledger, rowCost) }]);

      // Weekly trend (weeks start on Monday). Undated purchases cannot be placed on a week.
      const weeks = new Map();
      dated.forEach(r => {
        const d = new Date(String(r.date).slice(0, 10) + 'T00:00:00Z');
        d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
        const k = d.toISOString().slice(0, 10), w = weeks.get(k) || { n: 0, amt: 0 };
        w.n += 1; w.amt += rowCost(r); weeks.set(k, w);
      });
      if (weeks.size >= 2) {
        const wk = Array.from(weeks.keys()).sort(), datedTotal = sumBy(dated, rowCost);
        base.tables.push({ title: 'Purchase Trend by Week', sheetName: 'Weekly Trend',
          columns: ['Week Starting', 'Purchases', `Spend (${cur})`, '% of Dated Spend'],
          rows: wk.map(k => [shortDate(k), String(weeks.get(k).n), fmt.money2(weeks.get(k).amt), datedTotal ? fmt.pct(fmt.share(weeks.get(k).amt, datedTotal)) : '—']),
          columnAlign: [null, 'right', 'right', 'right'],
          totalsRow: ['TOTAL', String(dated.length), fmt.money2(datedTotal), datedTotal ? '100.0%' : '—'] });
      }
      if (dated.length < ledger.length) {
        notes.push(`${plural(ledger.length - dated.length, 'purchase has', 'purchases have')} no valid date and ${ledger.length - dated.length === 1 ? 'is' : 'are'} left out of the weekly trend.`);
      }

      // Items within each category, when purchases carry a description.
      if (ledger.some(r => r.description)) {
        const byCat = new Map();
        ledger.forEach(r => {
          const c = r.category || 'Other', it = String(r.description || '').trim() || '(no description)';
          const cg = byCat.get(c) || { name: c, amt: 0, items: new Map() };
          const x = cg.items.get(it) || { n: 0, amt: 0 };
          x.n += 1; x.amt += rowCost(r); cg.items.set(it, x); cg.amt += rowCost(r); byCat.set(c, cg);
        });
        const rowsI = [], kindsI = [];
        Array.from(byCat.values()).sort((a, b) => b.amt - a.amt).forEach(cg => {
          rowsI.push([cg.name, '', '', '']); kindsI.push('section');
          Array.from(cg.items.entries()).sort((a, b) => b[1].amt - a[1].amt).forEach(([it, x]) => {
            rowsI.push([it, String(x.n), fmt.money2(x.amt), total ? fmt.pct(fmt.share(x.amt, total)) : '—']); kindsI.push('line');
          });
          rowsI.push([`Subtotal — ${cg.name}`, String(sumBy(Array.from(cg.items.values()), x => x.n)), fmt.money2(cg.amt), total ? fmt.pct(fmt.share(cg.amt, total)) : '—']); kindsI.push('subtotal');
        });
        rowsI.push(['TOTAL', String(ledger.length), fmt.money2(sumBy(ledger, rowCost)), total ? fmt.pct(fmt.share(sumBy(ledger, rowCost), total)) : '—']); kindsI.push('total');
        base.tables.push({ title: 'Item Breakdown by Category', sheetName: 'Items', columns: ['Category / Item', 'Purchases', `Spend (${cur})`, '% of Total'],
          rows: rowsI, rowKinds: kindsI, columnAlign: [null, 'right', 'right', 'right'], statement: true });
      }

      // Approval status, and every purchase still awaiting approval.
      const statusOf = r => String(r.status || '').trim();
      if (ledger.some(r => statusOf(r))) {
        const byS = new Map();
        ledger.forEach(r => {
          const k = statusOf(r) || 'No status', x = byS.get(k) || { n: 0, amt: 0 };
          x.n += 1; x.amt += rowCost(r); byS.set(k, x);
        });
        const TONE = k => (/pend/i.test(k) ? 'warn' : /reject|cancel|void|declin/i.test(k) ? 'bad' : /approv|paid|complete/i.test(k) ? 'good' : 'muted');
        base.tables.push({ title: 'Approval Status', sheetName: 'Status',
          columns: ['Status', 'Purchases', `Amount (${cur})`, '% of Total'],
          rows: Array.from(byS.entries()).sort((a, b) => b[1].amt - a[1].amt).map(([k, x]) => [{ v: k, tone: TONE(k) }, String(x.n), fmt.money2(x.amt), total ? fmt.pct(fmt.share(x.amt, total)) : '—']),
          columnAlign: [null, 'right', 'right', 'right'],
          totalsRow: ['TOTAL', String(ledger.length), fmt.money2(sumBy(ledger, rowCost)), total ? fmt.pct(fmt.share(sumBy(ledger, rowCost), total)) : '—'] });
      }
      const pendAll = ledger.filter(r => /pend/i.test(statusOf(r)))
        .sort((a, b) => (isLargePending(b) ? 1 : 0) - (isLargePending(a) ? 1 : 0) || rowCost(b) - rowCost(a));
      if (pendAll.length) {
        const hasDesc = pendAll.some(r => r.description);
        base.tables.push({ title: 'Awaiting Approval', sheetName: 'Pending',
          columns: ['Date', 'Supplier', 'Category'].concat(hasDesc ? ['Description'] : [], [`Cost (${cur})`, 'Large']),
          rows: pendAll.map(r => [isoOk(r.date) ? shortDate(r.date) : (r.date ? String(r.date) : '—'), r.supplier || '—', r.category || '—']
            .concat(hasDesc ? [r.description || '—'] : [], [fmt.money2(rowCost(r)), isLargePending(r) ? { v: 'Large', tone: 'warn' } : '—'])),
          columnAlign: [null, null, null].concat(hasDesc ? [null] : [], ['right', null]),
          totalsRow: ['TOTAL', plural(pendAll.length, 'purchase'), ''].concat(hasDesc ? [''] : [], [fmt.money2(sumBy(pendAll, rowCost)), '']) });
      }
      if (tot.largePending !== undefined || pendingRows.length) {
        base.checks.push({ label: 'Large expenses pending: summary vs. purchase ledger', expected: pendingAmt, actual: sumBy(pendingRows, rowCost) });
      }
      if (i.approvalThreshold) {
        base.definitions = (base.definitions || []).concat([{ term: 'Large expense', text: `A pending purchase of ${fmt.money(i.approvalThreshold)} ${cur} or more, or one marked as large, which needs approval.` }]);
      }
    }
    if (notes.length) base.notes = (base.notes || []).concat(notes);
    return base;
  };

  // ---------------------------------------------------------------
  // 3. PRODUCTION — "Are we producing efficiently, and what is each batch actually
  //    costing us?"   (no donut by design — the cost breakdown is an exact-number table)
  //
  // input: {
  //   batches: [{ date:'2026-09-03', batchNo:'B-0412', type:'Injera',
  //               material, overhead, other?,      // ETB cost components
  //               cost?,                            // v3.9: the BMS-CALCULATED total cost of the batch
  //                                                 //   (incl. processing/delivery costs the BMS rolls in).
  //                                                 //   When given it is used as-is — the engine does not
  //                                                 //   recompute it from the components.
  //               units,                            // injera produced
  //               yieldPct, wac?,                   // wac = weighted-average cost (ETB), if tracked
  //               rejected? }],                     // v3.24: units rejected in the batch, if recorded
  //   targetYield?                // % — batches/averages below it are flagged
  //   previousCostPerUnit?, previousLabel?          // for the cost-creep insight
  //   unitLabel?                  // 'pcs' (default)
  //   totals?: { batches, units, cost, yieldRate }  // override derived figures; totals.cost is the
  //                                                 // BMS production cost for the period (preferred)
  //   avgPrice?                   // v3.37: the BMS average selling price per injera this period (ETB);
  //                               //   aliases sellingPrice / avgSellingPrice. Needed for Profit per Injera.
  //   injeraRevenue?, injeraSold? // v3.37: alternative to avgPrice — price = revenue / units sold
  // }
  // v3.37: Cost per Injera = production cost / injera produced. Profit per Injera = average selling price
  // less cost per injera; it is shown only when a selling price is supplied (never guessed).
  // Cost source, in order: totals.cost, else the sum of each batch's cost (BMS `cost` when given,
  // otherwise material + overhead + other). When no BMS cost was supplied the engine falls back
  // to the component sum and says so in the footer; when the BMS total is larger than the visible
  // components, the Cost Breakdown shows the difference as "Other / unallocated" so it still foots.
  // ---------------------------------------------------------------
  presets.production = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Production', 'Production Report');
    if (base.status === 'empty') return base;
    const cur = base.currency;
    const unit = i.unitLabel || 'pcs';
    const target = hasNum(i.targetYield) ? Number(i.targetYield) : null;

    const batches = asArr(i.batches).slice().sort((a, b) =>
      String(a.date).localeCompare(String(b.date)) || String(a.batchNo).localeCompare(String(b.batchNo)));
    const compOf = b => (Number(b.material) || 0) + (Number(b.overhead) || 0) + (Number(b.other) || 0);
    // v3.9: a batch's BMS-calculated cost wins over the component sum (no second accounting engine).
    const costOf = b => hasNum(b.cost) ? Number(b.cost) : compOf(b);
    const perUnit = b => (Number(b.units) ? costOf(b) / Number(b.units) : null);

    const tot = Object.assign({}, i.totals);
    const matT = sumBy(batches, b => b.material), ohT = sumBy(batches, b => b.overhead), otT = sumBy(batches, b => b.other);
    const nBatches = tot.batches !== undefined ? tot.batches : batches.length;
    const units = tot.units !== undefined ? tot.units : sumBy(batches, b => b.units);
    const totalCost = tot.cost !== undefined ? tot.cost : sumBy(batches, costOf);
    const bmsCost = tot.cost !== undefined || (batches.length > 0 && batches.every(b => hasNum(b.cost)));
    if (!bmsCost && batches.length) {
      base.footer.notes = (base.footer.notes || []).concat(['Cost = material + overhead + other as supplied; no BMS batch cost was provided.']);
    }
    const yieldRate = tot.yieldRate !== undefined ? tot.yieldRate : avgOf(batches, b => b.yieldPct);
    const costPerUnit = units ? totalCost / units : null;
    const belowTarget = target !== null && yieldRate !== null && yieldRate < target;

    // v3.37: profit per injera = average selling price less cost per injera. The price is the BMS figure
    // (input.avgPrice / sellingPrice / avgSellingPrice) or injeraRevenue / injeraSold; the engine never guesses one.
    const priceIn = [i.avgPrice, i.sellingPrice, i.avgSellingPrice].find(hasNum);
    const sellPrice = priceIn !== undefined ? Number(priceIn)
      : (hasNum(i.injeraRevenue) && hasNum(i.injeraSold) && Number(i.injeraSold) > 0 ? Number(i.injeraRevenue) / Number(i.injeraSold) : null);
    const profitPerUnit = sellPrice !== null && costPerUnit !== null ? sellPrice - costPerUnit : null;
    const unitMargin = profitPerUnit !== null && sellPrice > 0 ? (profitPerUnit / sellPrice) * 100 : null;
    const prevCostPU = hasNum(i.previousCostPerUnit) && Number(i.previousCostPerUnit) > 0 ? Number(i.previousCostPerUnit) : null;
    const costPUChg = prevCostPU !== null && costPerUnit !== null ? pctChg(costPerUnit, prevCostPU) : null;

    base.kpis = [
      { label: 'Total Batches', value: String(nBatches), unit: nBatches === 1 ? 'batch' : 'batches', color: '#1D5C38',
        delta: nBatches ? `${fmt.money(units / nBatches)} ${unit} per batch` : undefined },
      { label: 'Injera Produced', value: fmt.money(units), unit, color: '#2E86DE' },
      { label: 'Production Cost', value: fmt.money(totalCost), unit: cur, color: '#C89B3C',
        delta: nBatches ? `${fmt.money(totalCost / nBatches)} per batch` : undefined },
      { label: 'Yield Rate', value: yieldRate === null ? '—' : fmt.pct(yieldRate), color: belowTarget ? '#C0392B' : '#8E44AD',
        delta: target !== null ? (belowTarget ? `Below ${fmt.pct(target, 0)} target` : `On/above ${fmt.pct(target, 0)} target`) : undefined,
        deltaTone: target !== null ? (belowTarget ? 'warn' : 'good') : undefined }
    ];
    // v3.37: the two per-injera figures get their own cards (six cards in one row, like the Dashboard).
    if (costPerUnit !== null) {
      base.kpis.push({ label: 'Cost per Injera', value: fmt.n(costPerUnit, 2), unit: cur, color: '#E67E22',
        delta: costPUChg !== null ? `${fmt.signedPct(costPUChg)} vs ${i.previousLabel || 'last month'}`
          : (matT > 0 && totalCost > 0 ? `${fmt.pct(fmt.share(matT, totalCost), 0)} is material` : undefined),
        deltaTone: costPUChg !== null ? (costPUChg <= 0 ? 'good' : 'warn') : undefined });
      if (profitPerUnit !== null) {
        base.kpis.push({ label: 'Profit per Injera', value: fmt.n(profitPerUnit, 2), unit: cur, color: profitPerUnit < 0 ? '#C0392B' : '#1D5C38',
          delta: unitMargin !== null ? `${fmt.pct(unitMargin)} margin` : undefined, deltaTone: profitPerUnit < 0 ? 'warn' : 'good' });
      } else if (batches.length) {
        base.footer.notes = (base.footer.notes || []).concat(['Profit per injera is not shown: no average selling price was supplied for injera.']);
      }
    }

    // Row 2 left: yield over time (one point per production day).
    const yTrend = dateAvgSeries(batches, b => b.date, b => b.yieldPct);
    const uTrend = dailySeries(batches, b => b.date, b => b.units);
    base.charts = [];
    if (yTrend.labels.length) {
      const chart = { type: 'line', title: 'Production / Yield Trend', subtitle: 'Average yield (%) per production day', labels: yTrend.labels };
      if (target !== null) {
        chart.series = [
          { label: 'Yield %', values: yTrend.values, color: '#1D5C38', fill: true },
          { label: 'Target', values: yTrend.values.map(() => target), color: '#C89B3C' }
        ];
      } else {
        chart.values = yTrend.values;
      }
      base.charts.push(chart);
    } else if (uTrend.labels.length) {
      base.charts.push({ type: 'line', title: 'Production Trend', subtitle: `${unit} per day`, labels: uTrend.labels, values: uTrend.values });
    }

    // Row 2 middle: exact cost split (table, not a donut).
    const costRows = [['Material', matT], ['Overhead', ohT]];
    if (otT > 0) costRows.push(['Other', otT]);
    // Keeps the table footing to the BMS total when it carries cost beyond the listed components.
    const unallocated = totalCost - (matT + ohT + otT);
    if (Math.abs(unallocated) > 0.5) costRows.push(['Other / unallocated', unallocated]);
    base.panelTable = {
      title: 'Cost Breakdown', subtitle: `Exact ${cur} per cost type`,
      columns: ['Cost Type', `Amount (${cur})`, '% of Cost'],
      rows: costRows.map(([n, v]) => [n, fmt.money2(v), fmt.pct(fmt.share(v, totalCost))]),
      columnAlign: [null, 'right', 'right'],
      totalsRow: ['TOTAL', fmt.money2(totalCost), totalCost ? '100.0%' : '—']
    };

    // Key Insights
    if (i.insights) {
      base.insights = i.insights;
    } else {
      const ins = [];
      if (yieldRate !== null) {
        ins.push(belowTarget
          ? { label: 'Watch', color: '#C0392B', text: `Average yield is ${fmt.pct(yieldRate)}, ${fmt.pct(target - yieldRate)} below the ${fmt.pct(target, 0)} target.` }
          : { label: 'Yield', color: '#1D5C38', text: target !== null
              ? `Average yield is ${fmt.pct(yieldRate)}, at or above the ${fmt.pct(target, 0)} target.`
              : `Average yield across ${nBatches} batches is ${fmt.pct(yieldRate)}.` });
      }
      if (costPerUnit !== null) {
        const prevC = i.previousCostPerUnit;
        if (hasNum(prevC) && Number(prevC) > 0) {
          const ch = ((costPerUnit - prevC) / prevC) * 100;
          ins.push({ label: 'Cost', color: ch > 5 ? '#C89B3C' : '#2E86DE',
            text: `Cost per injera is ${fmt.n(costPerUnit, 2)} ${cur}, ${ch >= 0 ? 'up' : 'down'} ${fmt.pct(Math.abs(ch))} versus ${i.previousLabel || 'last month'}.` });
        } else {
          ins.push({ label: 'Cost', color: '#2E86DE', text: `Cost per injera averages ${fmt.n(costPerUnit, 2)} ${cur} — material is ${fmt.pct(fmt.share(matT, totalCost), 0)} of it.` });
        }
      }
      if (profitPerUnit !== null) {
        ins.push(profitPerUnit < 0
          ? { label: 'Loss', color: '#C0392B', text: `Each injera is sold at a loss of ${fmt.n(Math.abs(profitPerUnit), 2)} ${cur}: ${fmt.n(sellPrice, 2)} ${cur} price against ${fmt.n(costPerUnit, 2)} ${cur} cost.` }
          : { label: 'Profit', color: '#1D5C38', text: `Each injera earns ${fmt.n(profitPerUnit, 2)} ${cur}: ${fmt.n(sellPrice, 2)} ${cur} price less ${fmt.n(costPerUnit, 2)} ${cur} cost${unitMargin !== null ? ` (${fmt.pct(unitMargin, 0)} margin)` : ''}.` });
      }
      const priced = batches.filter(b => perUnit(b) !== null);
      if (priced.length > 1 && costPerUnit !== null) {
        const worst = priced.slice().sort((a, b) => perUnit(b) - perUnit(a))[0];
        if (perUnit(worst) > costPerUnit * 1.1) {
          ins.push({ label: 'Batch', color: '#C0392B', text: `Batch ${worst.batchNo || shortDate(worst.date)} cost ${fmt.n(perUnit(worst), 2)} ${cur} per injera — ${fmt.pct(((perUnit(worst) - costPerUnit) / costPerUnit) * 100, 0)} above the period average.` });
        }
      }
      const lowY = target !== null ? batches.filter(b => hasNum(b.yieldPct) && Number(b.yieldPct) < target) : [];
      if (lowY.length) {
        ins.push({ label: 'Yield', color: '#8E44AD', text: `${lowY.length} of ${batches.length} batches finished below the yield target.` });
      }
      base.insights = ins.slice(0, 4);
    }

    // Row 3: the batch ledger (newest first). Cells below target / well above average cost are toned.
    const desc = batches.slice().reverse();
    base.tables = [
      { title: 'Batch Ledger', summaryMaxRows: 5,
        columns: ['Batch No.', 'Type', `Material (${cur})`, `Overhead (${cur})`, `Cost / Injera (${cur})`, 'Yield', `WAC (${cur})`],
        rows: desc.map(b => {
          const pu = perUnit(b);
          const hot = pu !== null && costPerUnit !== null && pu > costPerUnit * 1.1;
          const lowY = target !== null && hasNum(b.yieldPct) && Number(b.yieldPct) < target;
          return [
            b.batchNo || shortDate(b.date), b.type || 'Injera',
            fmt.money2(b.material), fmt.money2(b.overhead),
            pu === null ? '—' : (hot ? { v: fmt.n(pu, 2), tone: 'bad' } : fmt.n(pu, 2)),
            hasNum(b.yieldPct) ? (lowY ? { v: fmt.pct(b.yieldPct), tone: 'warn' } : fmt.pct(b.yieldPct)) : '—',
            hasNum(b.wac) ? fmt.n(b.wac, 2) : '—'
          ];
        }),
        columnAlign: [null, null, 'right', 'right', 'right', 'right', 'right'],
        totalsRow: ['TOTAL', `${nBatches} batch${nBatches === 1 ? '' : 'es'}`, fmt.money2(matT), fmt.money2(ohT),
          costPerUnit === null ? '—' : fmt.n(costPerUnit, 2), yieldRate === null ? '—' : fmt.pct(yieldRate), ''] }
    ];

    // Detailed PDF / Excel only (v3.17): every cost component per batch, the batch's total cost
    // (BMS-calculated when supplied) and its cost per injera, so the Cost Breakdown can be traced.
    if (batches.length) {
      // v3.37: when a selling price is known each batch also shows its profit per injera (price less the batch's cost per injera).
      const showProfit = sellPrice !== null;
      const profCell = v => (v === null ? '—' : (v < 0 ? { v: fmt.n(v, 2), tone: 'bad' } : fmt.n(v, 2)));
      base.tables.push({ title: 'Cost Detail by Batch', sheetName: 'Cost Detail',
        columns: ['Date', 'Batch No.', `Units (${unit})`, `Material (${cur})`, `Overhead (${cur})`, `Other (${cur})`, `Total Cost (${cur})`, `Cost / Injera (${cur})`]
          .concat(showProfit ? [`Profit / Injera (${cur})`] : []),
        rows: desc.map(b => {
          const pu = perUnit(b);
          return [shortDate(b.date), b.batchNo || '—', hasNum(b.units) ? fmt.money(b.units) : '—',
            fmt.money2(b.material), fmt.money2(b.overhead), fmt.money2(b.other), fmt.money2(costOf(b)), pu === null ? '—' : fmt.n(pu, 2)]
            .concat(showProfit ? [profCell(pu === null ? null : sellPrice - pu)] : []);
        }),
        columnAlign: [null, null, 'right', 'right', 'right', 'right', 'right', 'right'].concat(showProfit ? ['right'] : []),
        totalsRow: ['TOTAL', plural(nBatches, 'batch', 'batches'), fmt.money(units), fmt.money2(matT), fmt.money2(ohT), fmt.money2(otT), fmt.money2(totalCost),
          costPerUnit === null ? '—' : fmt.n(costPerUnit, 2)].concat(showProfit ? [profCell(profitPerUnit)] : []) });

      // v3.37: Unit Economics per Injera — what one injera costs (by component) and, when a selling price is
      // known, what it earns. Component amounts are the Cost Breakdown figures divided by injera produced, so the
      // two tables always agree; anything the BMS total carries beyond the listed components shows as "Other / unallocated".
      if (units > 0) {
        const comps = [['Material', matT], ['Overhead', ohT]];
        if (otT > 0) comps.push(['Other', otT]);
        const unalloc = totalCost - (matT + ohT + otT);
        if (Math.abs(unalloc) > 0.5) comps.push(['Other / unallocated', unalloc]);
        const priceBase = showProfit && sellPrice > 0;
        const baseV = priceBase ? sellPrice : totalCost / units;
        const pc = v => (baseV ? fmt.pct(fmt.share(v, baseV)) : '—');
        const ueRows = [], ueKinds = [];
        if (showProfit) { ueRows.push(['Average selling price', fmt.n(sellPrice, 2), sellPrice > 0 ? '100.0%' : '—']); ueKinds.push('line'); }
        comps.forEach(([nm, v]) => { ueRows.push([`Cost: ${nm.toLowerCase()}`, fmt.n(v / units, 2), pc(v / units)]); ueKinds.push('line'); });
        ueRows.push(['Cost per injera', fmt.n(costPerUnit, 2), pc(costPerUnit)]); ueKinds.push(showProfit ? 'subtotal' : 'total');
        if (showProfit) {
          ueRows.push(['Profit per injera', profitPerUnit < 0 ? { v: fmt.n(profitPerUnit, 2), tone: 'bad' } : fmt.n(profitPerUnit, 2), unitMargin === null ? '—' : fmt.pct(unitMargin)]);
          ueKinds.push('total');
        }
        base.tables.push({ title: 'Unit Economics per Injera', sheetName: 'Unit Economics',
          columns: [`Per injera (${cur})`, `Amount (${cur})`, priceBase ? '% of Price' : '% of Cost'],
          rows: ueRows, rowKinds: ueKinds, statement: true, reconcile: false, columnAlign: [null, 'right', 'right'] });
        base.definitions = (base.definitions || []).concat([
          { term: 'Cost per injera', text: 'Production cost for the period divided by injera produced (the BMS batch cost when supplied, otherwise material + overhead + other).' }
        ].concat(showProfit ? [
          { term: 'Profit per injera', text: 'The average selling price per injera less the cost per injera. It is a gross figure per unit: it does not include selling or administrative costs the BMS does not allocate to batches.' }
        ] : []));
      }
    }

    // Detailed PDF / Excel only (v3.24): the day-by-day production record, then yield and rejects per batch.
    // Yield is the BMS figure for each batch; the engine displays it and never recalculates it.
    const rejOf = b => (hasNum(b.rejected) ? Number(b.rejected) : null);
    const hasRej = batches.some(b => rejOf(b) !== null);
    const hasYield = batches.some(b => hasNum(b.yieldPct));
    const dayLabel = d => (isoOk(d) ? `${shortDate(d)} ${String(d).slice(0, 4)}` : (d ? String(d) : '—'));
    if (batches.length) {
      const byDay = new Map();
      batches.forEach(b => {
        const k = isoOk(b.date) ? String(b.date).slice(0, 10) : String(b.date || '');
        const g = byDay.get(k) || { n: 0, units: 0, rej: 0, rejUnits: 0, rejN: 0, cost: 0, ys: [] };
        g.n += 1; g.units += Number(b.units) || 0; g.cost += costOf(b);
        if (rejOf(b) !== null) { g.rej += rejOf(b); g.rejUnits += Number(b.units) || 0; g.rejN += 1; }
        if (hasNum(b.yieldPct)) g.ys.push(Number(b.yieldPct));
        byDay.set(k, g);
      });
      const days = Array.from(byDay.keys()).sort();
      const avg = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
      const tgt = v => (target !== null && v !== null && v < target ? { v: fmt.pct(v), tone: 'warn' } : (v === null ? '—' : fmt.pct(v)));
      base.tables.push({ title: 'Production by Day', sheetName: 'By Day',
        columns: ['Date', 'Batches', `Units (${unit})`].concat(hasRej ? [`Rejected (${unit})`] : [], hasYield ? ['Avg Yield'] : [], [`Cost (${cur})`, `Cost / Injera (${cur})`]),
        rows: days.map(k => {
          const g = byDay.get(k);
          return [dayLabel(k), String(g.n), fmt.money(g.units)].concat(
            hasRej ? [g.rejN ? fmt.money(g.rej) : '—'] : [],
            hasYield ? [tgt(avg(g.ys))] : [],
            [fmt.money2(g.cost), g.units ? fmt.n(g.cost / g.units, 2) : '—']);
        }),
        columnAlign: [null, 'right', 'right'].concat(hasRej ? ['right'] : [], hasYield ? ['right'] : [], ['right', 'right']),
        totalsRow: ['TOTAL', String(batches.length), fmt.money(sumBy(batches, b => b.units))].concat(
          hasRej ? [fmt.money(sumBy(batches.filter(b => rejOf(b) !== null), b => rejOf(b)))] : [],
          hasYield ? [yieldRate === null ? '—' : fmt.pct(yieldRate)] : [],
          [fmt.money2(sumBy(batches, costOf)), sumBy(batches, b => b.units) ? fmt.n(sumBy(batches, costOf) / sumBy(batches, b => b.units), 2) : '—']) });

      if (hasRej || hasYield) {
        const recorded = batches.filter(b => rejOf(b) !== null);
        const recUnits = sumBy(recorded, b => b.units), recRej = sumBy(recorded, b => rejOf(b));
        const rate = (rej, u) => (u > 0 ? fmt.pct(fmt.share(rej, u)) : '—');
        base.tables.push({ title: hasRej ? 'Yield and Rejects by Batch' : 'Yield by Batch', sheetName: hasRej ? 'Yield and Rejects' : 'Yield',
          columns: ['Date', 'Batch No.', `Units (${unit})`].concat(hasRej ? [`Rejected (${unit})`, `Good Units (${unit})`, 'Reject Rate'] : [],
            hasYield ? ['Yield'].concat(target !== null ? ['vs. Target'] : []) : []),
          rows: desc.map(b => {
            const r = rejOf(b), u = Number(b.units) || 0, y = hasNum(b.yieldPct) ? Number(b.yieldPct) : null;
            const bad = r !== null && u > 0 && r > u;
            return [dayLabel(b.date), b.batchNo || '—', hasNum(b.units) ? fmt.money(b.units) : '—'].concat(
              hasRej ? [r === null ? '—' : (bad ? { v: fmt.money(r), tone: 'bad' } : fmt.money(r)), r === null ? '—' : fmt.money(u - r), r === null ? '—' : rate(r, u)] : [],
              hasYield ? [y === null ? '—' : (target !== null && y < target ? { v: fmt.pct(y), tone: 'warn' } : fmt.pct(y))].concat(
                target !== null ? [y === null ? '—' : { v: `${y - target >= 0 ? '+' : ''}${fmt.n(y - target, 1)} pts`, tone: y < target ? 'bad' : 'good' }] : []) : []);
          }),
          columnAlign: [null, null, 'right'].concat(hasRej ? ['right', 'right', 'right'] : [], hasYield ? ['right'].concat(target !== null ? ['right'] : []) : []),
          totalsRow: ['TOTAL', plural(batches.length, 'batch', 'batches'), fmt.money(sumBy(batches, b => b.units))].concat(
            hasRej ? [recorded.length ? fmt.money(recRej) : '—', recorded.length ? fmt.money(recUnits - recRej) : '—', recorded.length ? rate(recRej, recUnits) : '—'] : [],
            hasYield ? [yieldRate === null ? '—' : fmt.pct(yieldRate)].concat(target !== null ? [yieldRate === null ? '—' : `${yieldRate - target >= 0 ? '+' : ''}${fmt.n(yieldRate - target, 1)} pts`] : []) : []) });
        if (hasRej) {
          const missing = batches.length - recorded.length;
          if (missing) base.notes = (base.notes || []).concat([`${plural(missing, 'batch has', 'batches have')} no rejected quantity recorded; ${missing === 1 ? 'it is' : 'they are'} left out of the rejected, good-units and reject-rate totals.`]);
          const over = recorded.filter(b => rejOf(b) > (Number(b.units) || 0)).length;
          if (over) base.notes = (base.notes || []).concat([`${plural(over, 'batch records', 'batches record')} more rejected units than units produced; please check the entries.`]);
        }
        if (hasYield) {
          const noY = batches.filter(b => !hasNum(b.yieldPct)).length;
          if (noY) base.notes = (base.notes || []).concat([`${plural(noY, 'batch has', 'batches have')} no yield recorded and ${noY === 1 ? 'is' : 'are'} left out of the average yield.`]);
        }
        base.definitions = (base.definitions || []).concat([
          { term: 'Yield', text: 'The yield recorded in the BMS for each batch, shown as given. The period figure is the simple average of the batches that have one.' }
        ].concat(hasRej ? [
          { term: 'Rejected, good units and reject rate', text: 'Rejected units are those recorded against the batch. Good units are units produced less rejected. Reject rate is rejected as a percentage of units produced, for batches that record a rejected quantity only.' }
        ] : []));
      }

      base.checks = (base.checks || []).concat([{ label: 'Injera produced: summary vs. batch detail', expected: units, actual: sumBy(batches, b => b.units), tolerance: 0.5 }]);
      if (tot.cost !== undefined) {
        base.checks.push({ label: 'Production cost: summary vs. batch detail', expected: totalCost, actual: sumBy(batches, costOf) });
      }
    }
    return base;
  };

  // ---------------------------------------------------------------
  // 4. DERKOSH — "Are we producing more Derkosh than we're selling, and is it profitable?"
  //    (no donut by design — a single product line has no mix to show)
  //
  // input: {
  //   production: [{ date:'2026-09-03', batchNo?:'D-118', quantity, cost? }],   // ETB cost of the batch
  //   sales:      [{ date:'2026-09-04', customer, quantity, revenue, cogs? }],  // cogs = cost of those goods
  //   unitLabel?                  // 'kg' (default) — Derkosh is sold by weight
  //   openingStock?               // units on hand at period start (for the stock insight)
  //   previousRevenue?, previousLabel?
  //   unitCost?                   // v3.9: the BMS weighted-average Derkosh cost per unit (alias: wac)
  //   totals?: { produced, sold, revenue, cogs, grossProfit }   // override derived figures
  // }
  // Gross profit = revenue - cost of goods sold. The engine only DISPLAYS COGS — the BMS owns the
  // weighted-average costing. COGS source, in order: totals.cogs; the sales rows' own cogs; units
  // sold x the BMS unitCost (WAC). Only when none of those is supplied does it fall back to units
  // sold x this period's average production cost, and the footer then says the figure is an
  // estimate. totals.grossProfit, when given, overrides everything.
  // v3.37: Cost per kg and Profit per kg are per kg SOLD: profit per kg = gross profit / kg sold and
  // cost per kg = average price - profit per kg, so price - cost = profit always ties to the Gross Profit card.
  // ---------------------------------------------------------------
  presets.derkosh = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Derkosh', 'Derkosh Report');
    if (base.status === 'empty') return base;
    const cur = base.currency;
    const unit = i.unitLabel || 'kg';
    // Weights are often fractional (12.5 kg, 210.25 kg): show only the decimals a value really
    // has (0, 1 or 2) so nothing is rounded away and whole numbers stay clean.
    const qty = v => {
      const n = Number(v);
      if (!Number.isFinite(n)) return '—';
      const r = Math.round(n * 100) / 100;
      return fmt.n(r, Number.isInteger(r) ? 0 : (Math.round(r * 10) / 10 === r ? 1 : 2));
    };

    const prod = asArr(i.production).slice().sort((a, b) =>
      String(a.date).localeCompare(String(b.date)) || String(a.batchNo).localeCompare(String(b.batchNo)));
    const sales = asArr(i.sales).slice();
    const tot = Object.assign({}, i.totals);

    const produced = tot.produced !== undefined ? tot.produced : sumBy(prod, p => p.quantity);
    const sold = tot.sold !== undefined ? tot.sold : sumBy(sales, s => s.quantity);
    const revenue = tot.revenue !== undefined ? tot.revenue : sumBy(sales, s => s.revenue);
    const prodCost = sumBy(prod, p => p.cost);
    const unitCost = produced && prodCost ? prodCost / produced : null; // this period's average batch cost (display only)
    const wac = hasNum(i.unitCost) ? Number(i.unitCost) : (hasNum(i.wac) ? Number(i.wac) : null);
    let cogs = null, cogsEstimated = false;
    if (hasNum(tot.cogs)) {
      cogs = Number(tot.cogs);
    } else {
      const withCogs = sales.filter(s => hasNum(s.cogs));
      const knownCogs = sumBy(withCogs, s => s.cogs);
      const restQty = Math.max(sold - sumBy(withCogs, s => s.quantity), 0);
      if (withCogs.length && restQty <= 1e-9) {
        cogs = knownCogs;                       // every unit sold carries a BMS cogs
      } else if (wac !== null) {
        cogs = knownCogs + restQty * wac;       // BMS weighted-average cost for the rest
      } else if (unitCost !== null) {
        cogs = knownCogs + restQty * unitCost;  // fallback — estimate, disclosed below
        cogsEstimated = true;
      } else if (withCogs.length) {
        cogs = knownCogs;
        cogsEstimated = true;
      }
    }
    const grossProfit = tot.grossProfit !== undefined ? tot.grossProfit : (cogs === null ? null : revenue - cogs);
    const margin = grossProfit !== null && revenue ? (grossProfit / revenue) * 100 : null;
    if (cogsEstimated && tot.grossProfit === undefined && grossProfit !== null) {
      base.footer.notes = (base.footer.notes || []).concat(['Gross profit uses estimated COGS (units sold × avg production cost); no BMS WAC supplied.']);
    }
    const sellThrough = produced ? (sold / produced) * 100 : null;
    const avgPrice = sold ? revenue / sold : null;
    const net = produced - sold; // > 0 means stock built up this period
    // v3.37: per-kg economics on what was sold (see the input notes above).
    const profitPerUnit = grossProfit !== null && sold > 0 ? grossProfit / sold : null;
    const costPerUnitSold = profitPerUnit !== null && avgPrice !== null ? avgPrice - profitPerUnit : null;
    const costIsEstimate = cogsEstimated && tot.grossProfit === undefined;

    base.kpis = [
      { label: 'Derkosh Produced', value: qty(produced), unit, color: '#C89B3C',
        delta: prod.length ? `${prod.length} batch${prod.length > 1 ? 'es' : ''}` : undefined },
      { label: 'Derkosh Sold', value: qty(sold), unit, color: '#2E86DE',
        delta: sellThrough !== null ? `${fmt.pct(sellThrough, 0)} of production` : undefined },
      { label: 'Derkosh Revenue', value: fmt.money(revenue), unit: cur, color: '#1D5C38',
        delta: avgPrice !== null ? `${fmt.n(avgPrice, 2)} ${cur} per ${unit}` : undefined },
      { label: 'Gross Profit', value: grossProfit === null ? '—' : fmt.money(grossProfit), unit: grossProfit === null ? undefined : cur,
        color: grossProfit !== null && grossProfit < 0 ? '#C0392B' : '#8E44AD',
        delta: margin !== null ? `${fmt.pct(margin)} margin` : undefined,
        deltaTone: margin !== null ? (margin < 0 ? 'warn' : 'good') : undefined }
    ];
    // v3.37: the two per-kg figures get their own cards (six cards in one row, like the Dashboard).
    if (costPerUnitSold !== null) {
      base.kpis.push({ label: `Cost per ${unit}`, value: fmt.n(costPerUnitSold, 2), unit: cur, color: '#E67E22',
        delta: costIsEstimate ? 'Estimated cost' : (avgPrice ? `${fmt.pct(fmt.share(costPerUnitSold, avgPrice), 0)} of price` : undefined),
        deltaTone: costIsEstimate ? 'warn' : undefined });
      base.kpis.push({ label: `Profit per ${unit}`, value: fmt.n(profitPerUnit, 2), unit: cur, color: profitPerUnit < 0 ? '#C0392B' : '#1D5C38',
        delta: margin !== null ? `${fmt.pct(margin)} margin` : undefined, deltaTone: profitPerUnit < 0 ? 'warn' : 'good' });
    }

    // Row 2 left: production and sales on one shared day axis, so a widening gap between the
    // two lines (stock building up) or a narrowing one (stock selling through) is visible.
    const pBy = new Map(), sBy = new Map();
    const addTo = (m, d, v) => { const k = String(d || '').slice(0, 10); if (/^\d{4}-\d{2}-\d{2}$/.test(k)) m.set(k, (m.get(k) || 0) + (Number(v) || 0)); };
    prod.forEach(p => addTo(pBy, p.date, p.quantity));
    sales.forEach(s => addTo(sBy, s.date, s.quantity));
    const allKeys = Array.from(new Set(Array.from(pBy.keys()).concat(Array.from(sBy.keys())))).sort();
    base.charts = [];
    if (allKeys.length) {
      // Running totals, not daily values: Derkosh is made in batches every few days, so a daily
      // line would drop to zero between batches and say nothing. Cumulative lines make the
      // question visible — the gap between them IS the stock built up (or sold through).
      const labels = [], pv = [], sv = [];
      let pRun = 0, sRun = 0;
      const d = new Date(allKeys[0] + 'T00:00:00Z'), end = new Date(allKeys[allKeys.length - 1] + 'T00:00:00Z');
      while (d <= end) {
        const k = d.toISOString().slice(0, 10);
        pRun += pBy.get(k) || 0; sRun += sBy.get(k) || 0;
        labels.push(String(d.getUTCDate())); pv.push(pRun); sv.push(sRun);
        d.setUTCDate(d.getUTCDate() + 1);
      }
      base.charts.push({ type: 'line', title: 'Production vs. Sales Trend', subtitle: `Cumulative ${unit} — the gap is stock built up`, labels,
        series: [{ label: 'Produced', values: pv, color: '#C89B3C' }, { label: 'Sold', values: sv, color: '#1D5C38' }] });
    }

    const custs = groupSum(sales, s => s.customer, s => s.revenue);
    const custQty = new Map();
    sales.forEach(s => { const k = s.customer || 'Other'; custQty.set(k, (custQty.get(k) || 0) + (Number(s.quantity) || 0)); });

    if (i.insights) {
      base.insights = i.insights;
    } else {
      const ins = [];
      if (produced || sold) {
        const gap = Math.abs(net);
        if (net > 0 && sellThrough !== null && sellThrough < 85) {
          ins.push({ label: 'Stock', color: '#C89B3C', text: `Production exceeded sales by ${qty(gap)} ${unit} — only ${fmt.pct(sellThrough, 0)} of what was made was sold.` });
        } else if (net < 0) {
          ins.push({ label: 'Stock', color: '#C0392B', text: `Sales outran production by ${qty(gap)} ${unit}; the surplus came out of existing stock.` });
        } else {
          ins.push({ label: 'Stock', color: '#1D5C38', text: `Production and sales are closely matched — ${fmt.pct(sellThrough === null ? 0 : sellThrough, 0)} of output was sold.` });
        }
      }
      if (margin !== null) {
        ins.push({ label: 'Profit', color: margin < 0 ? '#C0392B' : '#8E44AD',
          text: grossProfit < 0 ? `Derkosh sold at a gross loss of ${fmt.money(Math.abs(grossProfit))} ${cur} (${fmt.pct(margin)} margin).`
            : `Gross profit is ${fmt.money(grossProfit)} ${cur} — a ${fmt.pct(margin)} margin on ${fmt.money(revenue)} ${cur} of revenue${profitPerUnit !== null ? `, about ${fmt.n(profitPerUnit, 2)} ${cur} per ${unit}` : ''}.` });
      }
      if (hasNum(i.previousRevenue) && Number(i.previousRevenue) > 0) {
        const ch = ((revenue - i.previousRevenue) / i.previousRevenue) * 100;
        ins.push({ label: ch < -10 ? 'Watch' : 'Revenue', color: ch < -10 ? '#C0392B' : '#2E86DE',
          text: `Derkosh revenue is ${ch >= 0 ? 'up' : 'down'} ${fmt.pct(Math.abs(ch))} versus ${i.previousLabel || 'last month'}.` });
      }
      if (custs.length > 1 && fmt.share(custs[0].amount, revenue) >= 40) {
        ins.push({ label: 'Risk', color: '#8E44AD', text: `${custs[0].name} buys ${fmt.pct(fmt.share(custs[0].amount, revenue), 0)} of Derkosh revenue — a concentration worth watching.` });
      }
      base.insights = ins.slice(0, 4);
    }

    // Row 3: production records (newest first) + sales by customer
    const costTot = prodCost;
    base.tables = [
      { title: 'Production Records', summaryMaxRows: 4,
        columns: ['Date', 'Batch No.', `Quantity (${unit})`, `Cost (${cur})`, `Cost / ${unit} (${cur})`],
        rows: prod.slice().reverse().map(p => [
          shortDate(p.date), p.batchNo || '—', qty(p.quantity),
          hasNum(p.cost) ? fmt.money2(p.cost) : '—',
          hasNum(p.cost) && Number(p.quantity) ? fmt.n(p.cost / p.quantity, 2) : '—'
        ]),
        columnAlign: [null, null, 'right', 'right', 'right'],
        totalsRow: ['TOTAL', `${prod.length} batch${prod.length === 1 ? '' : 'es'}`, qty(produced), costTot ? fmt.money2(costTot) : '—', unitCost === null ? '—' : fmt.n(unitCost, 2)] }
    ];
    if (custs.length) base.rankedList = { title: 'Sales by Customer', maxRows: 4,
      items: custs.map((c, idx) => ({ rank: idx + 1, name: c.name,
        meta: `${c.count} order${c.count > 1 ? 's' : ''} · ${qty(custQty.get(c.name) || 0)} ${unit}`,
        value: `${fmt.money(c.amount)} ${cur}`, sub: `${fmt.pct(fmt.share(c.amount, revenue))} of revenue` })) };

    // Detailed PDF / Excel only (v3.19): revenue and gross profit, by customer and sale by sale.
    // Cost per sale follows the Summary's order: the sale's own BMS cogs, else units x the BMS WAC,
    // else units x this period's average production cost (the Summary footer already says when
    // that estimate is in use). A sale with no cost at all shows "—", never a guessed profit.
    if (sales.length) {
      const saleCogs = s => {
        if (hasNum(s.cogs)) return Number(s.cogs);
        const q = Number(s.quantity);
        if (!hasNum(s.quantity) || !Number.isFinite(q)) return null;
        if (wac !== null) return q * wac;
        if (unitCost !== null) return q * unitCost;
        return null;
      };
      const revOf = s => (hasNum(s.revenue) ? Number(s.revenue) : null);
      const gpTone = g => (g < 0 ? { v: fmt.money2(g), tone: 'bad' } : fmt.money2(g));
      const margTone = m => (m < 0 ? { v: fmt.pct(m), tone: 'bad' } : fmt.pct(m));

      const byC = new Map();
      sales.forEach(s => {
        const k = s.customer || 'Other';
        const c = byC.get(k) || { name: k, n: 0, q: 0, rev: 0, revKnown: true, cogs: 0, cogsKnown: true };
        c.n += 1; c.q += Number(s.quantity) || 0;
        if (revOf(s) === null) c.revKnown = false; else c.rev += revOf(s);
        const cg = saleCogs(s);
        if (cg === null) c.cogsKnown = false; else c.cogs += cg;
        byC.set(k, c);
      });
      const custRows = Array.from(byC.values()).sort((a, b) => b.rev - a.rev || String(a.name).localeCompare(String(b.name)));
      base.tables.push({ title: 'Revenue and Gross Profit by Customer', sheetName: 'GP by Customer',
        columns: ['Customer', 'Orders', `Quantity (${unit})`, `Revenue (${cur})`, '% of Revenue', `COGS (${cur})`, `Gross Profit (${cur})`, 'Margin'],
        rows: custRows.map(c => {
          const gp = c.revKnown && c.cogsKnown ? c.rev - c.cogs : null;
          return [c.name, String(c.n), qty(c.q), c.revKnown ? fmt.money2(c.rev) : '—', c.revKnown ? fmt.pct(fmt.share(c.rev, revenue)) : '—',
            c.cogsKnown ? fmt.money2(c.cogs) : '—', gp === null ? '—' : gpTone(gp), gp !== null && c.rev ? margTone((gp / c.rev) * 100) : '—'];
        }),
        columnAlign: [null, 'right', 'right', 'right', 'right', 'right', 'right', 'right'],
        totalsRow: ['TOTAL', String(sales.length), qty(sold), fmt.money2(revenue), revenue ? '100.0%' : '—', cogs === null ? '—' : fmt.money2(cogs),
          grossProfit === null ? '—' : fmt.money2(grossProfit), margin === null ? '—' : fmt.pct(margin)] });

      const ledger = sales.slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.customer || '').localeCompare(String(b.customer || '')));
      base.tables.push({ title: 'Sales Ledger with Gross Profit', sheetName: 'Sales Ledger',
        columns: ['Date', 'Customer', `Qty (${unit})`, `Price (${cur}/${unit})`, `Revenue (${cur})`, `COGS (${cur})`, `Gross Profit (${cur})`, 'Margin'],
        rows: ledger.map(s => {
          const rv = revOf(s), cg = saleCogs(s), gp = rv !== null && cg !== null ? rv - cg : null, q = Number(s.quantity);
          return [isoOk(s.date) ? shortDate(s.date) : (s.date ? String(s.date) : '—'), s.customer || '—', hasNum(s.quantity) ? qty(q) : '—',
            rv !== null && hasNum(s.quantity) && q ? fmt.n(rv / q, 2) : '—', rv === null ? '—' : fmt.money2(rv), cg === null ? '—' : fmt.money2(cg),
            gp === null ? '—' : gpTone(gp), gp !== null && rv ? margTone((gp / rv) * 100) : '—'];
        }),
        columnAlign: [null, null, 'right', 'right', 'right', 'right', 'right', 'right'],
        totalsRow: ['TOTAL', plural(sales.length, 'sale'), qty(sold), avgPrice === null ? '—' : fmt.n(avgPrice, 2), fmt.money2(revenue),
          cogs === null ? '—' : fmt.money2(cogs), grossProfit === null ? '—' : fmt.money2(grossProfit), margin === null ? '—' : fmt.pct(margin)] });

      const revSum = sumBy(ledger.filter(s => revOf(s) !== null), s => s.revenue);
      base.checks = (base.checks || []).concat([{ label: 'Derkosh revenue: summary vs. sales ledger', expected: revenue, actual: revSum }]);
      const costed = ledger.filter(s => revOf(s) !== null && saleCogs(s) !== null);
      if (grossProfit !== null && costed.length === ledger.length) {
        base.checks.push({ label: 'Derkosh gross profit: summary vs. sales ledger', expected: grossProfit, actual: sumBy(costed, s => revOf(s) - saleCogs(s)) });
      }
      const noCost = ledger.length - ledger.filter(s => saleCogs(s) !== null).length;
      if (noCost) {
        base.footer.notes = (base.footer.notes || []).concat([`${plural(noCost, 'sale has', 'sales have')} no cost figure, so ${noCost === 1 ? 'its' : 'their'} gross profit is shown as "—".`]);
      }
    }

    // Detailed PDF / Excel only (v3.19): production and sales quantities, day by day. The chart on
    // the Summary shows the gap as a shape; this shows it as exact quantities. Only days with
    // production or sales are listed. "Running Net" is the cumulative gap (positive = stock built
    // up this period, negative = sales came out of existing stock).
    if (allKeys.length) {
      let run = 0;
      const netCell = v => (v < 0 ? { v: qty(v), tone: 'bad' } : qty(v));
      const rowsQ = allKeys.map(k => {
        const pq = pBy.get(k) || 0, sq = sBy.get(k) || 0;
        run += pq - sq;
        return [shortDate(k), pq ? qty(pq) : '—', sq ? qty(sq) : '—', netCell(pq - sq), netCell(run)];
      });
      const pSum = sumBy(prod, p => p.quantity), sSum = sumBy(sales, s => s.quantity);
      base.tables.push({ title: 'Production vs. Sales Quantity', sheetName: 'Production vs Sales',
        columns: ['Date', `Produced (${unit})`, `Sold (${unit})`, `Net (${unit})`, `Running Net (${unit})`],
        rows: rowsQ, columnAlign: [null, 'right', 'right', 'right', 'right'],
        totalsRow: ['TOTAL', qty(produced), qty(sold), netCell(produced - sold), ''] });
      base.checks = (base.checks || []).concat([
        { label: 'Derkosh produced: summary vs. daily production', expected: produced, actual: pSum, tolerance: 0.01 },
        { label: 'Derkosh sold: summary vs. daily sales', expected: sold, actual: sSum, tolerance: 0.01 }
      ]);
      const undated = prod.concat(sales).filter(r => !/^\d{4}-\d{2}-\d{2}$/.test(String(r.date || '').slice(0, 10))).length;
      if (undated) {
        base.footer.notes = (base.footer.notes || []).concat([`${plural(undated, 'record has', 'records have')} no valid date and ${undated === 1 ? 'is' : 'are'} left out of the day-by-day quantity table.`]);
      }
      // Opening stock is optional input; the closing figure is plain arithmetic on supplied numbers.
      if (hasNum(i.openingStock)) {
        const open = Number(i.openingStock), close = open + produced - sold;
        base.tables.push({ title: 'Stock Movement', sheetName: 'Stock Movement',
          columns: ['Step', `Quantity (${unit})`], columnAlign: [null, 'right'], statement: true,
          rowKinds: ['line', 'line', 'line', 'total'],
          rows: [['Opening stock', qty(open)], ['Add: produced', qty(produced)], ['Less: sold', qty(-sold)],
            ['Closing stock (calculated)', close < 0 ? { v: qty(close), tone: 'bad' } : qty(close)]] });
        if (close < 0) {
          base.footer.notes = (base.footer.notes || []).concat(['Calculated closing Derkosh stock is negative; check the opening stock and the recorded sales.']);
        }
      }
    }

    // Detailed PDF / Excel only (v3.37): price, cost and profit for ONE kg sold, so the per-kg cards can be traced.
    // Cost is cost of goods sold per kg (the same COGS as the Summary); the memo lines show what this period's batches
    // cost per kg and the BMS weighted-average cost when supplied, for comparison. Placed first among the detail tables.
    if (costPerUnitSold !== null && avgPrice !== null && avgPrice > 0) {
      const ueRows = [
        ['Average selling price', fmt.n(avgPrice, 2), '100.0%'],
        [costIsEstimate ? 'Cost of goods sold (estimated)' : 'Cost of goods sold', fmt.n(costPerUnitSold, 2), fmt.pct(fmt.share(costPerUnitSold, avgPrice))],
        [`Profit per ${unit}`, profitPerUnit < 0 ? { v: fmt.n(profitPerUnit, 2), tone: 'bad' } : fmt.n(profitPerUnit, 2), fmt.pct(fmt.share(profitPerUnit, avgPrice))]
      ];
      const ueKinds = ['line', 'line', 'total'];
      if (unitCost !== null) { ueRows.push([`Memo: production cost per ${unit}, this period's batches`, fmt.n(unitCost, 2), '']); ueKinds.push('pct'); }
      if (wac !== null) { ueRows.push([`Memo: BMS weighted-average cost per ${unit}`, fmt.n(wac, 2), '']); ueKinds.push('pct'); }
      base.tables.splice(1, 0, { title: `Unit Economics per ${unit}`, sheetName: 'Unit Economics',
        columns: [`Per ${unit} sold`, `Amount (${cur})`, '% of Price'],
        rows: ueRows, rowKinds: ueKinds, statement: true, reconcile: false, columnAlign: [null, 'right', 'right'] });
      base.definitions = (base.definitions || []).concat([
        { term: `Cost and profit per ${unit}`, text: `Per ${unit} sold: the average selling price (revenue divided by ${unit} sold), the cost of goods sold per ${unit} (the same cost of goods sold as the Summary, divided by ${unit} sold) and the gross profit per ${unit} (price less cost). It does not include operating expenses.` }
      ]);
    }
    return base;
  };

  // ---------------------------------------------------------------
  // 5. MILLING — "Is our blend conversion cost creeping up, and what did each run
  //    actually cost?"   (no donut by design — one input becomes one output, there is
  //    no mix to show; the real content is the cost trend and the exact run ledger)
  //
  // input: {
  //   runs: [{ date:'2026-09-03', batchNo:'M-021',
  //            teffKg?, riceKg?,          // inputs consumed (give both, or just inputKg)
  //            inputKg?,                  // total input, if the page doesn't split teff / rice
  //            blendKg,                   // blend produced
  //            cost?, costPerKg?,         // ETB total cost of the run, or per kg (one is enough)
  //            status?: 'Completed' | 'In Progress' | 'Pending' | 'Rejected' ... }],
  //   previousCostPerKg?, previousLabel?   // ('Aug') — enables the month-over-month insight
  //   unitLabel?                           // 'kg' (default)
  //   totals?: { blend, costPerKg, runs, inventoryValue }   // override derived figures
  // }
  // Average cost / kg is weighted (total cost ÷ total blend), not an average of the run
  // averages, so one small expensive run can't distort it. Inventory value generated is the
  // total cost of the blend produced — what the runs add to inventory at cost.
  // ---------------------------------------------------------------
  presets.milling = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Milling', 'Milling Report');
    if (base.status === 'empty') return base;
    const cur = base.currency;
    const unit = i.unitLabel || 'kg';
    // Weights are often fractional: show only the decimals a value really has (0, 1 or 2).
    const qty = v => {
      const n = Number(v);
      if (!Number.isFinite(n)) return '—';
      const r = Math.round(n * 100) / 100;
      return fmt.n(r, Number.isInteger(r) ? 0 : (Math.round(r * 10) / 10 === r ? 1 : 2));
    };

    const runs = asArr(i.runs).slice().sort((a, b) =>
      String(a.date).localeCompare(String(b.date)) || String(a.batchNo).localeCompare(String(b.batchNo)));
    const blendOf = r => Number(r.blendKg) || 0;
    const costOf = r => hasNum(r.cost) ? Number(r.cost)
      : (hasNum(r.costPerKg) ? Number(r.costPerKg) * blendOf(r) : null);
    const perKg = r => {
      if (hasNum(r.cost) && blendOf(r) > 0) return Number(r.cost) / blendOf(r);
      return hasNum(r.costPerKg) ? Number(r.costPerKg) : null;
    };
    const inputOf = r => hasNum(r.inputKg) ? Number(r.inputKg)
      : ((hasNum(r.teffKg) || hasNum(r.riceKg)) ? (Number(r.teffKg) || 0) + (Number(r.riceKg) || 0) : null);
    const yieldOf = r => { const inp = inputOf(r); return inp && blendOf(r) ? (blendOf(r) / inp) * 100 : null; };

    const tot = Object.assign({}, i.totals);
    const nRuns = tot.runs !== undefined ? tot.runs : runs.length;
    const blend = tot.blend !== undefined ? tot.blend : sumBy(runs, blendOf);
    const costed = runs.filter(r => costOf(r) !== null);
    const costSum = sumBy(costed, costOf);
    const costedBlend = sumBy(costed, blendOf);
    const avgCost = tot.costPerKg !== undefined ? Number(tot.costPerKg) : (costedBlend ? costSum / costedBlend : null);
    const invValue = tot.inventoryValue !== undefined ? tot.inventoryValue : (costed.length ? costSum : null);
    const withInput = runs.filter(r => inputOf(r) !== null);
    const inputTotal = withInput.length ? sumBy(withInput, inputOf) : null;
    const yieldRate = inputTotal ? (sumBy(withInput, blendOf) / inputTotal) * 100 : null;

    const prevC = i.previousCostPerKg;
    const momChange = avgCost !== null && hasNum(prevC) && Number(prevC) > 0 ? ((avgCost - prevC) / prevC) * 100 : null;

    base.kpis = [
      { label: 'Total Blend Produced', value: qty(blend), unit, color: '#1D5C38',
        delta: nRuns ? `${qty(blend / nRuns)} ${unit} per run` : undefined },
      { label: `Average Cost / ${unit}`, value: avgCost === null ? '—' : fmt.n(avgCost, 2),
        unit: avgCost === null ? undefined : `${cur} / ${unit}`,
        color: momChange !== null && momChange > 5 ? '#C0392B' : '#C89B3C',
        delta: momChange !== null ? `${fmt.signedPct(momChange)} vs ${i.previousLabel || 'last month'}` : undefined,
        deltaTone: momChange === null ? undefined : (momChange > 5 ? 'warn' : (momChange <= 0 ? 'good' : undefined)) },
      { label: 'Conversion Runs This Month', value: String(nRuns), unit: nRuns === 1 ? 'run' : 'runs', color: '#2E86DE',
        delta: inputTotal !== null ? `${qty(inputTotal)} ${unit} teff + rice used` : undefined },
      { label: 'Inventory Value Generated', value: invValue === null ? '—' : fmt.money(invValue),
        unit: invValue === null ? undefined : cur, color: '#8E44AD',
        delta: invValue === null ? undefined : 'Added to inventory at cost' }
    ];

    // Row 2 left: cost per kg by run day. A day with two runs is cost-weighted (total cost /
    // total blend), and a dashed-style average line makes any creep above the norm visible.
    const byDay = new Map();
    costed.forEach(r => {
      const d = String(r.date || '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !blendOf(r)) return;
      const slot = byDay.get(d) || { c: 0, k: 0 };
      slot.c += costOf(r); slot.k += blendOf(r); byDay.set(d, slot);
    });
    const dayKeys = Array.from(byDay.keys()).sort();
    base.charts = [];
    if (dayKeys.length) {
      const vals = dayKeys.map(k => byDay.get(k).c / byDay.get(k).k);
      const chart = { type: 'line', title: 'Cost per kg Trend', subtitle: `${cur} per ${unit}, by run day`, labels: dayKeys.map(shortDate) };
      if (dayKeys.length > 1 && avgCost !== null && Number.isFinite(avgCost)) {
        chart.series = [
          { label: `Cost / ${unit}`, values: vals, color: '#1D5C38', fill: true },
          { label: 'Period average', values: vals.map(() => avgCost), color: '#C89B3C' }
        ];
      } else {
        chart.values = vals;
      }
      base.charts.push(chart);
    }

    // Key Insights — warnings first, so the four slots never bury a real problem.
    if (i.insights) {
      base.insights = i.insights;
    } else {
      const warns = [], infos = [];
      const wAvg = list => {
        const k = sumBy(list, blendOf);
        return k ? sumBy(list, r => costOf(r)) / k : null;
      };
      const pk = costed.filter(r => blendOf(r) > 0);

      if (momChange !== null) {
        (momChange > 5 ? warns : infos).push({ label: momChange > 5 ? 'Watch' : 'Cost', color: momChange > 5 ? '#C0392B' : '#1D5C38',
          text: `Average blend cost is ${fmt.n(avgCost, 2)} ${cur} per ${unit}, ${momChange >= 0 ? 'up' : 'down'} ${fmt.pct(Math.abs(momChange))} versus ${i.previousLabel || 'last month'}.` });
      }
      // Creep inside the period: first half of the runs vs the second half.
      if (pk.length >= 4) {
        const mid = Math.floor(pk.length / 2);
        const a = wAvg(pk.slice(0, mid)), b = wAvg(pk.slice(mid));
        if (a && b) {
          const ch = ((b - a) / a) * 100;
          if (ch >= 5) warns.push({ label: 'Creep', color: '#C89B3C', text: `Cost per ${unit} rose from ${fmt.n(a, 2)} to ${fmt.n(b, 2)} ${cur} across the month (${fmt.signedPct(ch)}).` });
          else if (ch <= -5) infos.push({ label: 'Cost', color: '#1D5C38', text: `Cost per ${unit} eased from ${fmt.n(a, 2)} to ${fmt.n(b, 2)} ${cur} across the month (${fmt.signedPct(ch)}).` });
          else if (momChange === null) infos.push({ label: 'Cost', color: '#2E86DE', text: `Cost per ${unit} is steady across the month, within ${fmt.n(Math.max(Math.abs(ch), 0.1), 1)}% from first half to second.` });
        }
      }
      // Latest run vs the recent average of up to five runs before it.
      let latestFlagged = false;
      if (pk.length >= 3) {
        const latest = pk[pk.length - 1];
        const recent = wAvg(pk.slice(Math.max(0, pk.length - 6), pk.length - 1));
        if (recent) {
          const ch = ((perKg(latest) - recent) / recent) * 100;
          if (ch >= 5) {
            latestFlagged = true;
            warns.push({ label: 'Latest run', color: '#C0392B', text: `Run ${latest.batchNo || shortDate(latest.date)} cost ${fmt.n(perKg(latest), 2)} ${cur} per ${unit} — ${fmt.pct(ch, 0)} above the recent average of ${fmt.n(recent, 2)}.` });
          }
        }
      }
      // An unusually low-yield run (more than 3 points under the period yield).
      if (yieldRate !== null) {
        const lows = withInput.filter(r => yieldOf(r) !== null && yieldOf(r) < yieldRate - 3)
          .sort((x, y) => yieldOf(x) - yieldOf(y));
        if (lows.length) {
          const w = lows[0];
          warns.push({ label: 'Yield', color: '#8E44AD', text: `Run ${w.batchNo || shortDate(w.date)} turned ${fmt.pct(yieldOf(w))} of its input into blend, ${fmt.n(yieldRate - yieldOf(w), 1)} points below the ${fmt.pct(yieldRate)} average${lows.length > 1 ? ` (${lows.length} runs were low)` : ''}.` });
        }
      }
      // The single most expensive run, unless the latest-run warning already covers it.
      if (pk.length > 1 && avgCost) {
        const worst = pk.slice().sort((x, y) => perKg(y) - perKg(x))[0];
        if (perKg(worst) > avgCost * 1.1 && !(latestFlagged && worst === pk[pk.length - 1])) {
          warns.push({ label: 'Run', color: '#C0392B', text: `Run ${worst.batchNo || shortDate(worst.date)} cost ${fmt.n(perKg(worst), 2)} ${cur} per ${unit} — ${fmt.pct(((perKg(worst) - avgCost) / avgCost) * 100, 0)} above the period average.` });
        }
      }
      if (momChange === null && avgCost !== null && nRuns) {
        infos.push({ label: 'Output', color: '#1D5C38', text: `${qty(blend)} ${unit} of blend from ${nRuns} run${nRuns === 1 ? '' : 's'} at an average ${fmt.n(avgCost, 2)} ${cur} per ${unit}.` });
      }
      base.insights = warns.concat(infos).slice(0, 4);
    }

    // Row 3: the conversion run ledger (newest first). A run well above the average cost is toned.
    const hotCut = avgCost !== null && Number.isFinite(avgCost) ? avgCost * 1.1 : null;
    const statusTone = s => /reject|fail|cancel|void/i.test(s) ? 'bad'
      : /complete|done|finish|approv|stock/i.test(s) ? 'good'
      : /progress|pending|draft|running|partial|queue/i.test(s) ? 'warn' : 'muted';
    const allSplit = runs.length > 0 && runs.every(r => hasNum(r.teffKg) && hasNum(r.riceKg));
    const usedTotal = allSplit ? `${qty(sumBy(runs, r => r.teffKg))} + ${qty(sumBy(runs, r => r.riceKg))}`
      : (inputTotal === null ? '—' : qty(inputTotal));
    base.tables = [
      { title: 'Conversion Run Ledger', summaryMaxRows: 5,
        columns: ['Batch', `Teff + Rice Used (${unit})`, `Blend Produced (${unit})`, `Cost / ${unit} (${cur})`, 'Status'],
        rows: runs.slice().reverse().map(r => {
          const c = perKg(r);
          const inp = inputOf(r);
          const used = hasNum(r.teffKg) && hasNum(r.riceKg) ? `${qty(r.teffKg)} + ${qty(r.riceKg)}` : (inp === null ? '—' : qty(inp));
          const st = r.status ? String(r.status) : '';
          return [
            r.batchNo ? (r.date ? `${r.batchNo} (${shortDate(r.date)})` : String(r.batchNo)) : shortDate(r.date),
            used,
            hasNum(r.blendKg) ? qty(r.blendKg) : '—',
            c === null ? '—' : (hotCut !== null && c > hotCut ? { v: fmt.n(c, 2), tone: 'bad' } : fmt.n(c, 2)),
            st ? { v: st, tone: statusTone(st) } : '—'
          ];
        }),
        columnAlign: [null, 'right', 'right', 'right', null],
        totalsRow: ['TOTAL', usedTotal, qty(blend), avgCost === null ? '—' : fmt.n(avgCost, 2), `${nRuns} run${nRuns === 1 ? '' : 's'}`] }
    ];

    // Detailed PDF / Excel only (v3.20): every run with its inputs, yield and cost, the teff / rice
    // split, and how the inventory value generated is made up. The BMS owns the costing; every cost
    // shown is the run's own cost (or cost per kg x blend). A run with no cost shows "—".
    if (runs.length) {
      const hasTeff = runs.some(r => hasNum(r.teffKg)), hasRice = runs.some(r => hasNum(r.riceKg));
      const hasInput = runs.some(r => inputOf(r) !== null);
      const hasYield = runs.some(r => yieldOf(r) !== null);
      const hasStatus = runs.some(r => r.status);
      const cols = ['Date', 'Batch'].concat(hasTeff ? [`Teff (${unit})`] : [], hasRice ? [`Rice (${unit})`] : [],
        hasInput ? [`Total Input (${unit})`] : [], [`Blend (${unit})`], hasYield ? ['Yield'] : [], [`Total Cost (${cur})`, `Cost / ${unit} (${cur})`], hasStatus ? ['Status'] : []);
      const align = [null, null].concat(hasTeff ? ['right'] : [], hasRice ? ['right'] : [], hasInput ? ['right'] : [], ['right'], hasYield ? ['right'] : [], ['right', 'right'], hasStatus ? [null] : []);
      const lowYield = yieldRate !== null ? yieldRate - 3 : null;
      const rowsD = runs.map(r => {
        const c = costOf(r), pk = perKg(r), yv = yieldOf(r), st = r.status ? String(r.status) : '';
        return [isoOk(r.date) ? shortDate(r.date) : (r.date ? String(r.date) : '—'), r.batchNo || '—']
          .concat(hasTeff ? [hasNum(r.teffKg) ? qty(r.teffKg) : '—'] : [], hasRice ? [hasNum(r.riceKg) ? qty(r.riceKg) : '—'] : [],
            hasInput ? [inputOf(r) === null ? '—' : qty(inputOf(r))] : [], [hasNum(r.blendKg) ? qty(r.blendKg) : '—'],
            hasYield ? [yv === null ? '—' : (lowYield !== null && yv < lowYield ? { v: fmt.pct(yv), tone: 'warn' } : fmt.pct(yv))] : [],
            [c === null ? '—' : fmt.money2(c), pk === null ? '—' : (hotCut !== null && pk > hotCut ? { v: fmt.n(pk, 2), tone: 'bad' } : fmt.n(pk, 2))],
            hasStatus ? [st ? { v: st, tone: statusTone(st) } : '—'] : []);
      });
      const totRow = ['TOTAL', plural(runs.length, 'run')].concat(
        hasTeff ? [qty(sumBy(runs, r => r.teffKg))] : [], hasRice ? [qty(sumBy(runs, r => r.riceKg))] : [],
        hasInput ? [inputTotal === null ? '—' : qty(sumBy(runs.filter(r => inputOf(r) !== null), inputOf))] : [], [qty(blend)],
        hasYield ? [yieldRate === null ? '—' : fmt.pct(yieldRate)] : [],
        [costed.length ? fmt.money2(costSum) : '—', avgCost === null ? '—' : fmt.n(avgCost, 2)], hasStatus ? [''] : []);
      base.tables.push({ title: 'Conversion Detail by Run', sheetName: 'Run Detail', columns: cols, rows: rowsD, columnAlign: align, totalsRow: totRow });

      // Inputs used: teff vs. rice, over the runs that record both.
      const split = runs.filter(r => hasNum(r.teffKg) || hasNum(r.riceKg));
      if (split.length) {
        const tK = sumBy(split, r => r.teffKg), rK = sumBy(split, r => r.riceKg), allK = tK + rK;
        base.tables.push({ title: 'Inputs Used', sheetName: 'Inputs',
          columns: ['Input', `Quantity (${unit})`, '% of Input'],
          rows: [['Teff', qty(tK), allK ? fmt.pct(fmt.share(tK, allK)) : '—'], ['Rice', qty(rK), allK ? fmt.pct(fmt.share(rK, allK)) : '—']],
          columnAlign: [null, 'right', 'right'], totalsRow: ['TOTAL INPUT', qty(allK), allK ? '100.0%' : '—'] });
        if (split.length < runs.length) {
          base.notes = (base.notes || []).concat([`${plural(runs.length - split.length, 'run has', 'runs have')} no teff / rice split, so ${runs.length - split.length === 1 ? 'it is' : 'they are'} left out of the Inputs Used table.`]);
        }
      }

      // How the headline cost figures are made up.
      const rowsC = [['Conversion runs', String(nRuns)], [`Blend produced (${unit})`, qty(blend)],
        [`Blend from runs with a cost (${unit})`, costed.length ? qty(costedBlend) : '—'],
        [`Total conversion cost (${cur})`, costed.length ? fmt.money2(costSum) : '—'],
        [`Average cost per ${unit} (${cur})`, avgCost === null ? '—' : fmt.n(avgCost, 2)],
        [`Inventory value generated (${cur})`, invValue === null ? '—' : fmt.money2(invValue)]];
      const kindsC = ['line', 'line', 'line', 'line', 'line', 'total'];
      base.tables.push({ title: 'Cost and Inventory Value', sheetName: 'Cost Summary', columns: ['Figure', 'Value'], rows: rowsC, rowKinds: kindsC,
        columnAlign: [null, 'right'], statement: true });

      const uncosted = runs.length - costed.length;
      if (uncosted) {
        base.notes = (base.notes || []).concat([`${plural(uncosted, 'run has', 'runs have')} no cost figure and ${uncosted === 1 ? 'is' : 'are'} left out of the average cost and the inventory value generated.`]);
      }
      base.checks = (base.checks || []).concat([{ label: 'Blend produced: summary vs. run detail', expected: blend, actual: sumBy(runs, blendOf), tolerance: 0.01 }]);
      if (invValue !== null && costed.length) {
        base.checks.push({ label: 'Inventory value generated: summary vs. run costs', expected: invValue, actual: costSum });
      }
      base.definitions = (base.definitions || []).concat([
        { term: 'Cost per kg', text: 'Total conversion cost divided by total blend produced, so a small expensive run cannot distort the average.' },
        { term: 'Yield', text: 'Blend produced as a percentage of total teff and rice used in the run.' },
        { term: 'Inventory value generated', text: 'Total cost of the blend produced in the period, which is what the runs add to inventory at cost.' }
      ]);
    }
    return base;
  };

  // ---- shared helpers for the v3.3 presets (Inventory onward) ----
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const isoOk = s => /^\d{4}-\d{2}-\d{2}/.test(String(s || ''));
  // Whole days from one ISO date to another (negative when `toISO` is earlier).
  const dayDiff = (fromISO, toISO) =>
    Math.round((Date.parse(String(toISO).slice(0, 10) + 'T00:00:00Z') - Date.parse(String(fromISO).slice(0, 10) + 'T00:00:00Z')) / 86400000);
  // Quantities are often fractional: show only the decimals a value really has (0, 1 or 2).
  const qtyFmt = v => {
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    const r = Math.round(n * 100) / 100;
    return fmt.n(r, Number.isInteger(r) ? 0 : (Math.round(r * 10) / 10 === r ? 1 : 2));
  };
  const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + 's')}`;
  // Percent change from `before` to `now`, or null when it can't be computed honestly.
  const pctChg = (now, before) =>
    hasNum(now) && hasNum(before) && Number(before) !== 0 ? ((Number(now) - Number(before)) / Math.abs(Number(before))) * 100 : null;

  // ---------------------------------------------------------------
  // 6. INVENTORY — "What needs attention right now, and is anything getting more
  //    expensive?"   (no stock-aging or value donuts by design — stock status is urgent and
  //    exact, so it is a table and a Reorder Now list)
  //
  // input: {
  //   items: [{ name, unit?:'kg', category?,
  //             closing,                 // closing stock on hand
  //             reorderLevel?,           // at or below this => Reorder Now
  //             daysOfSupply?,           // or give dailyUsage and it is closing / dailyUsage
  //             dailyUsage?,
  //             expiryDate?:'2026-10-20', expiringSoon?: bool,
  //             unitCost?, value?,       // optional — only used for the "stock value" note
  //             status?: 'Out of Stock'|'Reorder Now'|'Low Stock'|'OK' }],   // optional override
  //   priceHistory?: [{ date:'2026-09-03', item:'Teff', price }],   // purchase / WAC price points
  //   trendItems?: ['Teff', 'Rice'],  // which items to plot (default: up to 3 biggest movers)
  //   asOf?: '2026-09-30',            // "today" for expiry maths (default: the current date)
  //   expiringDays?: 30,              // expiry window for the Expiring Soon KPI
  //   lowStockBuffer?: 0.25,          // Low Stock = above reorder level but within +25% of it
  //   totals?: { items, low, reorder, expiring }      // override derived counts
  //   // v3.23 (detailed PDF / Excel only, each optional):
  //   // items[].opening?, items[].received?, items[].used?, items[].adjustments? (signed)
  //   movements?: [{ date:'2026-09-03', item:'Teff', type?:'Received'|'Used'|'Adjustment'|..., qty,
  //                  direction?:'in'|'out', reference?, balanceAfter? }]
  // }
  // Status rules: closing <= 0 => Out of Stock; <= reorder level => Reorder Now; within the
  // buffer above it => Low Stock; otherwise OK. Reorder Now KPI counts Out of Stock too.
  // The price chart plots one item as an actual price; with several items it plots % change
  // since each item's first record, so a spike on a cheap input is as visible as on a dear one.
  // ---------------------------------------------------------------
  presets.inventory = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Inventory', 'Inventory Report');
    if (base.status === 'empty') return base;
    const cur = base.currency;
    const asOf = isoOk(i.asOf) ? String(i.asOf).slice(0, 10) : todayISO();
    const buffer = hasNum(i.lowStockBuffer) ? Number(i.lowStockBuffer) : 0.25;
    const expiryWindow = hasNum(i.expiringDays) ? Number(i.expiringDays) : 30;
    const STATE_LABEL = { out: 'Out of Stock', reorder: 'Reorder Now', low: 'Low Stock', ok: 'OK' };
    const STATE_TONE = { out: 'bad', reorder: 'bad', low: 'warn', ok: 'good' };
    const STATE_RANK = { out: 0, reorder: 1, low: 2, ok: 3 };

    const items = asArr(i.items).map(it => {
      const closing = Number(it.closing) || 0;
      const rl = hasNum(it.reorderLevel) ? Number(it.reorderLevel) : null;
      const usage = hasNum(it.dailyUsage) ? Number(it.dailyUsage) : null;
      const dos = hasNum(it.daysOfSupply) ? Number(it.daysOfSupply) : (usage && usage > 0 ? closing / usage : null);
      const said = String(it.status || '');
      let state = /out of stock|empty|nil/i.test(said) ? 'out' : /reorder/i.test(said) ? 'reorder'
        : /low/i.test(said) ? 'low' : /^(ok|good|healthy|adequate|in stock)$/i.test(said.trim()) ? 'ok' : null;
      if (!state) {
        state = closing <= 0 ? 'out' : (rl !== null && closing <= rl) ? 'reorder'
          : (rl !== null && closing <= rl * (1 + buffer)) ? 'low' : 'ok';
      }
      const left = isoOk(it.expiryDate) ? dayDiff(asOf, it.expiryDate) : null;
      const expiring = it.expiringSoon !== undefined ? !!it.expiringSoon : (left !== null && left <= expiryWindow);
      const value = hasNum(it.value) ? Number(it.value) : (hasNum(it.unitCost) ? closing * Number(it.unitCost) : null);
      return { name: it.name || 'Item', unit: it.unit || '', category: it.category, closing, rl, dos, state, left, expiring, expiry: it.expiryDate, value,
        opening: hasNum(it.opening) ? Number(it.opening) : null, received: hasNum(it.received) ? Number(it.received) : null,
        used: hasNum(it.used) ? Number(it.used) : null, adj: hasNum(it.adjustments) ? Number(it.adjustments) : null };
    });

    const tot = Object.assign({}, i.totals);
    const nItems = tot.items !== undefined ? tot.items : items.length;
    const lowN = tot.low !== undefined ? tot.low : items.filter(x => x.state === 'low').length;
    const needNow = items.filter(x => x.state === 'out' || x.state === 'reorder');
    const reorderN = tot.reorder !== undefined ? tot.reorder : needNow.length;
    const outN = items.filter(x => x.state === 'out').length;
    const expItems = items.filter(x => x.expiring).sort((a, b) => (a.left === null ? 1e9 : a.left) - (b.left === null ? 1e9 : b.left));
    const expN = tot.expiring !== undefined ? tot.expiring : expItems.length;
    const expired = expItems.filter(x => x.left !== null && x.left < 0).length;
    const hasExpiryData = items.some(x => x.left !== null);
    const cats = new Set(items.map(x => x.category).filter(Boolean));
    const valued = items.filter(x => x.value !== null);
    const stockValue = valued.length ? sumBy(valued, x => x.value) : null;
    const unitOf = x => x.unit ? ` ${x.unit}` : '';
    const dosFmt = d => d === 0 ? '0' : fmt.n(d, d < 10 ? 1 : 0);

    base.kpis = [
      { label: 'Total Items', value: String(nItems), unit: nItems === 1 ? 'item' : 'items', color: '#1D5C38',
        delta: stockValue !== null ? `Stock value ${fmt.money(stockValue)} ${cur}` : (cats.size > 1 ? `${cats.size} categories` : undefined) },
      { label: 'Low Stock Items', value: String(lowN), unit: lowN === 1 ? 'item' : 'items', color: '#C89B3C',
        delta: lowN ? 'Running down toward reorder level' : 'Nothing running low', deltaTone: lowN ? 'warn' : 'good' },
      { label: 'Reorder Now Items', value: String(reorderN), unit: reorderN === 1 ? 'item' : 'items', color: reorderN ? '#C0392B' : '#2E86DE',
        delta: reorderN ? (outN ? `${outN} out of stock` : 'At or below reorder level') : 'Nothing to reorder', deltaTone: reorderN ? 'warn' : 'good' },
      { label: 'Expiring Soon', value: String(expN), unit: expN === 1 ? 'item' : 'items', color: '#8E44AD',
        delta: expN ? (expired ? `${expired} already expired` : `Within ${expiryWindow} days`) : (hasExpiryData ? `None within ${expiryWindow} days` : 'No expiry dates tracked'),
        deltaTone: expN ? 'warn' : undefined }
    ];

    // ---- Row 2 left: price trend ----
    const byItem = new Map();
    asArr(i.priceHistory).forEach(p => {
      if (!p || !p.item || !isoOk(p.date) || !hasNum(p.price)) return;
      const m = byItem.get(p.item) || new Map();
      m.set(String(p.date).slice(0, 10), Number(p.price)); // same day twice: the later entry wins
      byItem.set(p.item, m);
    });
    const series = new Map(); // name -> sorted [[date, price], ...]
    byItem.forEach((m, name) => series.set(name, Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]))));
    const moves = [];
    series.forEach((pts, name) => {
      if (pts.length < 2) return;
      const ch = pctChg(pts[pts.length - 1][1], pts[0][1]);
      if (ch !== null) moves.push({ name, ch, pts });
    });
    moves.sort((a, b) => Math.abs(b.ch) - Math.abs(a.ch) || b.pts.length - a.pts.length);

    let picked = [];
    if (Array.isArray(i.trendItems) && i.trendItems.length) {
      const lc = new Map(Array.from(series.keys()).map(k => [k.toLowerCase(), k]));
      picked = i.trendItems.map(n => lc.get(String(n).toLowerCase())).filter(Boolean);
    } else {
      picked = moves.slice(0, 3).map(m => m.name);
    }
    base.charts = [];
    if (picked.length) {
      const sel = picked.map(n => ({ name: n, pts: series.get(n) }));
      const dates = Array.from(new Set([].concat(...sel.map(s => s.pts.map(p => p[0]))))).sort();
      // Start where every plotted item has a record, so no line is drawn from data that is not there;
      // only when that leaves a single point do we start earlier and hold each first price flat.
      const firstShared = sel.map(s => s.pts[0][0]).sort().pop();
      let start = dates.filter(d => d >= firstShared);
      if (start.length < 2) start = dates;
      const priceAt = (pts, d) => { let v = pts[0][1]; for (const p of pts) { if (p[0] <= d) v = p[1]; else break; } return v; };
      if (sel.length === 1) {
        const vals = start.map(d => priceAt(sel[0].pts, d));
        base.charts.push({ type: 'line', title: 'Price Trend', subtitle: `${sel[0].name} — ${cur} per unit`, labels: start.map(shortDate), values: vals });
      } else {
        base.charts.push({ type: 'line', title: 'Price Trend', subtitle: '% change since first record in view', labels: start.map(shortDate),
          series: sel.map((s, idx) => {
            const first = priceAt(s.pts, start[0]);
            return { label: s.name, color: PALETTE[idx % PALETTE.length], fill: false,
              values: start.map(d => first ? Math.round(((priceAt(s.pts, d) - first) / first) * 10000) / 100 : 0) };
          }) });
      }
    }

    // ---- Key Insights — warnings first ----
    if (i.insights) {
      base.insights = i.insights;
    } else {
      const warns = [], infos = [];
      const outs = items.filter(x => x.state === 'out');
      if (outs.length) {
        warns.push({ label: 'Out of stock', color: '#C0392B', text: `${plural(outs.length, 'item is', 'items are')} out of stock: ${outs.slice(0, 3).map(x => x.name).join(', ')}${outs.length > 3 ? ` and ${outs.length - 3} more` : ''}.` });
      }
      const reorderOnly = items.filter(x => x.state === 'reorder').sort((a, b) => (a.dos === null ? 1e9 : a.dos) - (b.dos === null ? 1e9 : b.dos));
      if (reorderOnly.length) {
        const t = reorderOnly[0];
        warns.push({ label: 'Reorder', color: '#C0392B', text: `${plural(reorderOnly.length, 'item is', 'items are')} at or below reorder level${reorderOnly.length > 1 ? ' — ' : ': '}${reorderOnly.length > 1 ? 'most urgent is ' : ''}${t.name} (${qtyFmt(t.closing)}${unitOf(t)} left${t.dos !== null ? `, about ${dosFmt(t.dos)} days of supply` : ''}).` });
      }
      if (moves.length && Math.abs(moves[0].ch) >= 5) {
        const m = moves[0], a = m.pts[0], b = m.pts[m.pts.length - 1];
        const up = m.ch > 0;
        (up ? warns : infos).push({ label: 'Price', color: up ? (m.ch >= 10 ? '#C0392B' : '#C89B3C') : '#1D5C38',
          text: `${m.name} price ${up ? 'rose' : 'fell'} ${fmt.pct(Math.abs(m.ch))} — from ${fmt.n(a[1], 2)} to ${fmt.n(b[1], 2)} ${cur} since ${shortDate(a[0])}.` });
      }
      if (expItems.length) {
        const e = expItems[0];
        const when = e.left === null ? '' : e.left < 0 ? ` (expired ${shortDate(e.expiry)})` : ` (${shortDate(e.expiry)})`;
        warns.push({ label: 'Expiry', color: '#8E44AD', text: `${expired ? plural(expItems.length, 'item is', 'items are') + ` expired or expire${expItems.length === 1 ? 's' : ''}` : plural(expItems.length, 'item expires', 'items expire')} within ${expiryWindow} days — first is ${e.name}${when}.` });
      }
      if (lowN && !warns.length) {
        infos.push({ label: 'Low stock', color: '#C89B3C', text: `${plural(lowN, 'item is', 'items are')} running low but still above reorder level.` });
      }
      if (!warns.length) {
        infos.push({ label: 'Stock', color: '#1D5C38', text: `${nItems === 1 ? 'The only item is' : `All ${nItems} items are`} above reorder level${expN ? '' : ' and nothing is close to expiry'}.` });
      }
      base.insights = warns.concat(infos).slice(0, 4);
    }

    // ---- Row 3: stock status table (most urgent first) + Reorder Now list ----
    const sorted = items.slice().sort((a, b) => STATE_RANK[a.state] - STATE_RANK[b.state]
      || (a.dos === null ? 1e9 : a.dos) - (b.dos === null ? 1e9 : b.dos) || String(a.name).localeCompare(String(b.name)));
    base.tables = [
      { title: 'Stock Status', summaryMaxRows: 5,
        columns: ['Item', 'Closing', 'Reorder Level', 'Days of Supply', 'Status'],
        rows: sorted.map(x => [
          x.unit ? `${x.name} (${x.unit})` : x.name,
          qtyFmt(x.closing),
          x.rl === null ? '—' : qtyFmt(x.rl),
          x.dos === null ? '—' : dosFmt(x.dos),
          { v: STATE_LABEL[x.state], tone: STATE_TONE[x.state] }
        ]),
        columnAlign: [null, 'right', 'right', 'right', null],
        totalsRow: ['TOTAL', '', '', '', plural(nItems, 'item')] }
    ];
    if (expItems.length) {
      base.tables.push({ title: 'Expiring Soon', columns: ['Item', 'Expiry Date', 'Days Left', 'Closing'],
        rows: expItems.map(x => [
          x.unit ? `${x.name} (${x.unit})` : x.name,
          isoOk(x.expiry) ? shortDate(x.expiry) : '—',
          x.left === null ? '—' : (x.left < 0 ? { v: 'Expired', tone: 'bad' } : { v: String(x.left), tone: x.left <= 7 ? 'bad' : 'warn' }),
          qtyFmt(x.closing)
        ]),
        columnAlign: [null, null, 'right', 'right'] });
    }
    // Detailed PDF / Excel only (v3.18): how each material's price moved over the period.
    if (series.size) {
      const rowsP = Array.from(series.entries()).map(([name, pts]) => {
        const a = pts[0], b = pts[pts.length - 1];
        const ch = pts.length > 1 ? pctChg(b[1], a[1]) : null;
        return { name, n: pts.length, a, b, ch };
      }).sort((x, y) => Math.abs(y.ch === null ? 0 : y.ch) - Math.abs(x.ch === null ? 0 : x.ch) || x.name.localeCompare(y.name));
      base.tables.push({ title: 'Price Movement by Item', sheetName: 'Prices',
        columns: ['Item', 'Records', `First Price (${cur})`, `Latest Price (${cur})`, 'Change'],
        rows: rowsP.map(r => [r.name, String(r.n), `${fmt.n(r.a[1], 2)} (${shortDate(r.a[0])})`, `${fmt.n(r.b[1], 2)} (${shortDate(r.b[0])})`,
          r.ch === null ? '—' : (r.ch >= 10 ? { v: fmt.signedPct(r.ch), tone: 'bad' } : fmt.signedPct(r.ch))]),
        columnAlign: [null, 'right', 'right', 'right', 'right'] });
    }
    // Detailed PDF / Excel only (v3.23): how stock moved, how far short of the reorder level each tight
    // item is, and the movement records behind the figures. Nothing is drawn for data the page did not pass.
    const dateFull = iso => isoOk(iso) ? `${shortDate(iso)} ${String(iso).slice(0, 4)}` : '—';
    const keyOf = v => String(v || '').trim().toLowerCase();
    const nameCell = x => x.unit ? `${x.name} (${x.unit})` : x.name;
    const sgn = v => (v > 0 ? '+' : '') + qtyFmt(v);
    const byKey = new Map(items.map(x => [keyOf(x.name), x]));
    const IN_RX = /receiv|purchase|production|produced|opening|transfer in|\bin\b|\badd/i;
    const OUT_RX = /\bused?\b|usage|issue|consum|\bsales?\b|\bsold\b|waste|damage|spoil|expired|transfer out|\bout\b|write.?off/i;
    const mv = [];
    (Array.isArray(i.movements) ? i.movements : []).forEach(m => {
      if (!m || !m.item || !hasNum(m.qty)) return;
      const q = Number(m.qty), type = String(m.type || ''), said = String(m.direction || '');
      let kind;
      if (/^in/i.test(said)) kind = 'in';
      else if (/^out/i.test(said)) kind = 'out';
      else if (/adjust|correction|stock.?take|recount/i.test(type)) kind = 'adj';
      else if (OUT_RX.test(type)) kind = 'out';
      else if (IN_RX.test(type)) kind = 'in';
      else kind = q < 0 ? 'out' : 'in';
      mv.push({ date: isoOk(m.date) ? String(m.date).slice(0, 10) : null, item: String(m.item), kind,
        type: type || (kind === 'in' ? 'Received' : kind === 'out' ? 'Used' : 'Adjustment'),
        signed: kind === 'adj' ? q : (kind === 'in' ? Math.abs(q) : -Math.abs(q)),
        ref: m.reference ? String(m.reference) : '', bal: hasNum(m.balanceAfter) ? Number(m.balanceAfter) : null });
    });
    const mvBy = new Map();
    mv.forEach(m => {
      const k = keyOf(m.item), a = mvBy.get(k) || { inn: 0, out: 0, adj: 0 };
      if (m.kind === 'in') a.inn += m.signed; else if (m.kind === 'out') a.out += -m.signed; else a.adj += m.signed;
      mvBy.set(k, a);
    });

    // Opening + received - used (+ adjustments) = calculated closing, beside the reported closing.
    const flow = items.map(x => {
      const d = mvBy.get(keyOf(x.name));
      const received = x.received !== null ? x.received : (mv.length ? (d ? d.inn : 0) : null);
      const used = x.used !== null ? x.used : (mv.length ? (d ? d.out : 0) : null);
      const adj = x.adj !== null ? x.adj : (mv.length ? (d ? d.adj : 0) : null);
      const calc = x.opening !== null && received !== null && used !== null ? x.opening + received - used + (adj || 0) : null;
      return { x, received, used, adj, calc, diff: calc === null ? null : x.closing - calc };
    }).sort((a, b) => String(a.x.name).localeCompare(String(b.x.name)));
    if (flow.some(f => f.x.opening !== null || f.received !== null || f.used !== null)) {
      const showAdj = flow.some(f => f.adj !== null && Math.abs(f.adj) > 0.005);
      const showCalc = flow.some(f => f.calc !== null);
      const q = v => v === null ? '—' : qtyFmt(v);
      base.tables.push({ title: 'Stock Movement by Item', sheetName: 'Stock Movement',
        columns: ['Item', 'Opening', 'Received', 'Used'].concat(showAdj ? ['Adjustments'] : [], showCalc ? ['Calculated Closing'] : [], ['Reported Closing'], showCalc ? ['Difference'] : []),
        rows: flow.map(f => [nameCell(f.x), q(f.x.opening), q(f.received), q(f.used)].concat(
          showAdj ? [f.adj === null ? '—' : sgn(f.adj)] : [],
          showCalc ? [q(f.calc)] : [],
          [qtyFmt(f.x.closing)],
          showCalc ? [f.diff === null ? '—' : (Math.abs(f.diff) < 0.005 ? '0' : { v: sgn(f.diff), tone: 'bad' })] : [])),
        columnAlign: [null].concat(['right', 'right', 'right'], showAdj ? ['right'] : [], showCalc ? ['right'] : [], ['right'], showCalc ? ['right'] : []) });
      const rebuilt = flow.filter(f => f.calc !== null);
      if (rebuilt.length) {
        base.checks = (base.checks || []).concat([{ label: 'Stock movement: items whose calculated closing differs from the reported closing',
          expected: 0, actual: rebuilt.filter(f => Math.abs(f.diff) >= 0.005).length, tolerance: 0 }]);
      }
      const noRebuild = flow.length - rebuilt.length;
      if (noRebuild) {
        base.notes = (base.notes || []).concat([`${plural(noRebuild, 'item has', 'items have')} no opening, received or used figure, so ${noRebuild === 1 ? 'its' : 'their'} closing stock could not be rebuilt from movements.`]);
      }
      // When both the item figures and the movement records were supplied, they should agree.
      const both = flow.filter(f => f.x.received !== null && f.x.used !== null && mvBy.has(keyOf(f.x.name)));
      if (both.length) {
        const off = both.filter(f => { const d = mvBy.get(keyOf(f.x.name)); return Math.abs(f.x.received - d.inn) >= 0.005 || Math.abs(f.x.used - d.out) >= 0.005; }).length;
        base.checks = (base.checks || []).concat([{ label: 'Received and used: item figures vs. movement records (items that differ)', expected: 0, actual: off, tolerance: 0 }]);
      }
      base.definitions = (base.definitions || []).concat([
        { term: 'Calculated closing', text: 'Opening stock plus received, less used, plus adjustments. A difference from the reported closing means the records do not fully explain the stock on hand, for example wastage, a missing record or an uncounted adjustment.' },
        { term: 'Received and used', text: 'Taken from each item\'s own figures when given, otherwise added up from the movement records. A record with no stated direction or recognised type is read as stock in when positive and stock out when negative.' }
      ]);
    }

    // Items at, below or close to the reorder level: how far, how long the stock lasts, last receipt.
    const tight = items.filter(x => x.state !== 'ok').sort((a, b) => STATE_RANK[a.state] - STATE_RANK[b.state]
      || (a.dos === null ? 1e9 : a.dos) - (b.dos === null ? 1e9 : b.dos) || String(a.name).localeCompare(String(b.name)));
    const lastIn = new Map();
    mv.filter(m => m.kind === 'in' && m.date).forEach(m => { const k = keyOf(m.item); if (!lastIn.has(k) || m.date > lastIn.get(k)) lastIn.set(k, m.date); });
    // Without receipt dates this would only repeat the Stock Status table, so it is drawn only when it adds the last receipt.
    if (tight.length && lastIn.size) {
      const showCat = tight.some(x => x.category), showLast = true;
      base.tables.push({ title: 'Low Stock and Reorder Detail', sheetName: 'Low Stock',
        columns: ['Item'].concat(showCat ? ['Category'] : [], ['Closing', 'Reorder Level', 'vs. Reorder Level', 'Days of Supply'], showLast ? ['Last Received'] : [], ['Status']),
        rows: tight.map(x => {
          const gap = x.rl === null ? null : x.closing - x.rl;
          return [nameCell(x)].concat(showCat ? [x.category || '—'] : [], [qtyFmt(x.closing), x.rl === null ? '—' : qtyFmt(x.rl),
            gap === null ? '—' : { v: sgn(gap), tone: gap <= 0 ? 'bad' : 'warn' }, x.dos === null ? '—' : dosFmt(x.dos)],
            showLast ? [lastIn.has(keyOf(x.name)) ? dateFull(lastIn.get(keyOf(x.name))) : '—'] : [], [{ v: STATE_LABEL[x.state], tone: STATE_TONE[x.state] }]);
        }),
        columnAlign: [null].concat(showCat ? [null] : [], ['right', 'right', 'right', 'right'], showLast ? ['right'] : [], [null]) });
      base.definitions = (base.definitions || []).concat([
        { term: 'vs. reorder level', text: 'Closing stock minus the reorder level. Negative (red) means the item is below the level at which it should be reordered.' }
      ]);
    }

    // Every movement, oldest first, so a figure above can be traced to its records.
    if (mv.length) {
      const ledger = mv.slice().sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || a.item.localeCompare(b.item));
      const showRef = ledger.some(m => m.ref), showBal = ledger.some(m => m.bal !== null);
      const unitOf2 = n => { const x = byKey.get(keyOf(n)); return x && x.unit ? ` ${x.unit}` : ''; };
      const cols = ['Date', 'Item', 'Type', 'Quantity'].concat(showRef ? ['Reference'] : [], showBal ? ['Balance After'] : []);
      base.tables.push({ title: 'Inventory Movement Records', sheetName: 'Movements', columns: cols,
        rows: ledger.map(m => {
          const qv = `${sgn(m.signed)}${unitOf2(m.item)}`;
          return [m.date ? dateFull(m.date) : '—', m.item, m.type, m.kind === 'in' ? { v: qv, tone: 'good' } : qv]
            .concat(showRef ? [m.ref || '—'] : [], showBal ? [m.bal === null ? '—' : qtyFmt(m.bal)] : []);
        }),
        columnAlign: [null, null, null, 'right'].concat(showRef ? [null] : [], showBal ? ['right'] : []),
        totalsRow: ['TOTAL', '', '', plural(ledger.length, 'record')].concat(showRef ? [''] : [], showBal ? [''] : []) });
      const stray = Array.from(new Set(ledger.filter(m => !byKey.has(keyOf(m.item))).map(m => m.item)));
      if (stray.length) {
        base.notes = (base.notes || []).concat([`${plural(stray.length, 'item')} in the movement records ${stray.length === 1 ? 'is' : 'are'} not in the stock list: ${stray.slice(0, 3).join(', ')}${stray.length > 3 ? ` and ${stray.length - 3} more` : ''}.`]);
      }
      const undated = ledger.filter(m => !m.date).length;
      if (undated) base.notes = (base.notes || []).concat([`${plural(undated, 'movement record has', 'movement records have')} no valid date and ${undated === 1 ? 'is' : 'are'} listed last.`]);
    }
    const urgent = needNow.slice().sort((a, b) => STATE_RANK[a.state] - STATE_RANK[b.state]
      || (a.dos === null ? 1e9 : a.dos) - (b.dos === null ? 1e9 : b.dos)
      || (a.rl ? a.closing / a.rl : 0) - (b.rl ? b.closing / b.rl : 0));
    if (urgent.length) {
      base.rankedList = { title: 'Reorder Now', maxRows: 4,
        items: urgent.map((x, idx) => ({ rank: idx + 1, name: x.name,
          meta: x.rl === null ? 'No reorder level set' : `Reorder level ${qtyFmt(x.rl)}${unitOf(x)}`,
          value: `${qtyFmt(x.closing)}${unitOf(x)}`,
          sub: x.state === 'out' ? 'Out of stock' : (x.dos !== null ? `${dosFmt(x.dos)} days of supply` : 'Below reorder level') })) };
    }
    return base;
  };

  // ---------------------------------------------------------------
  // 7. OVERHEAD — "Is our overhead cost under control, and what is it made up of?"
  //    (no donut by design — the labor / non-labor split is a small exact-number table)
  //
  // input: {
  //   entries: [{ date?, name,            // employee, or the payee for a non-wage cost
  //               role?,                  // job title (wage rows)
  //               category,               // 'Wages', 'Rent', 'Electricity', ...
  //               channel,                // 'Cash' | 'Bank' | 'Mobile' ...
  //               amount,                 // what the entry costs the business (ETB)
  //               grossPay?,              // gross pay before deductions; falls back to amount on wage rows
  //               kind?: 'labor'|'other' }],   // else guessed from the category (wage, salary, payroll ...)
  //   monthly?: [{ label:'Jul', total, labor? }],   // oldest first, INCLUDING the current month last
  //   days?,                              // days the daily rate is spread over (production or calendar days)
  //   previousTotal?, previousLabel?,     // else taken from the month before the last in `monthly`
  //   productionUnits?, previousUnits?, unitLabel?   // enables the "overhead vs. output" insight
  //   totals?: { total, labor, grossPay, dailyRate }  // override derived figures
  // }
  // ---------------------------------------------------------------
  presets.overhead = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Overhead', 'Overhead Report');
    if (base.status === 'empty') return base;
    const cur = base.currency;
    const unit = i.unitLabel || 'injera';

    const LABOR_RE = /wage|salar|payroll|labou?r|overtime|bonus|allowance|pension|staff/i;
    const entries = asArr(i.entries).map(e => Object.assign({}, e, {
      isLabor: e.kind ? e.kind === 'labor' : LABOR_RE.test(e.category || ''),
      amt: Number(e.amount) || 0
    }));
    const laborRows = entries.filter(e => e.isLabor);
    const otherRows = entries.filter(e => !e.isLabor);

    const tot = Object.assign({}, i.totals);
    const total = tot.total !== undefined ? tot.total : sumBy(entries, e => e.amt);
    const labor = tot.labor !== undefined ? tot.labor : sumBy(laborRows, e => e.amt);
    const nonLabor = total - labor;
    const grossPay = tot.grossPay !== undefined ? tot.grossPay : sumBy(laborRows, e => hasNum(e.grossPay) ? e.grossPay : e.amt);
    const days = hasNum(i.days) && Number(i.days) > 0 ? Number(i.days) : null;
    const dailyRate = tot.dailyRate !== undefined ? Number(tot.dailyRate) : (days ? total / days : null);
    const people = new Set(laborRows.map(e => String(e.name || '').trim().toLowerCase()).filter(Boolean)).size;

    const monthly = asArr(i.monthly).filter(m => m && m.label !== undefined && hasNum(m.total));
    const prevTotal = hasNum(i.previousTotal) ? Number(i.previousTotal)
      : (monthly.length >= 2 ? Number(monthly[monthly.length - 2].total) : null);
    const prevLabel = i.previousLabel || (monthly.length >= 2 ? String(monthly[monthly.length - 2].label) : 'last month');
    const change = prevTotal ? pctChg(total, prevTotal) : null;

    base.kpis = [
      { label: 'Total Monthly Overhead', value: fmt.money(total), unit: cur, color: '#1D5C38',
        delta: change === null ? undefined : `${fmt.signedPct(change)} vs ${prevLabel}`,
        deltaTone: change === null ? undefined : (change > 5 ? 'warn' : (change <= 0 ? 'good' : undefined)) },
      { label: 'Labor (Wages) Cost', value: fmt.money(labor), unit: cur, color: '#2E86DE',
        delta: total ? `${fmt.pct(fmt.share(labor, total), 0)} of overhead` : undefined },
      { label: 'Daily Overhead Rate', value: dailyRate === null ? '—' : fmt.n(dailyRate, dailyRate < 100 ? 2 : 0),
        unit: dailyRate === null ? undefined : `${cur} / day`, color: '#C89B3C',
        delta: dailyRate === null ? 'Number of days not provided'
          : (hasNum(i.productionUnits) && Number(i.productionUnits) > 0 ? `${fmt.n(total / Number(i.productionUnits), 2)} ${cur} per ${unit}` : (days ? `Spread over ${plural(days, 'day')}` : undefined)) },
      { label: 'Total Gross Pay', value: fmt.money(grossPay), unit: cur, color: '#8E44AD',
        delta: people ? plural(people, 'employee') : undefined }
    ];

    // ---- Row 2 left: month-over-month trend ----
    base.charts = [];
    if (monthly.length >= 2) {
      const withLabor = monthly.every(m => hasNum(m.labor));
      const chart = { type: 'line', title: 'Overhead Trend', subtitle: `${cur} per month`, labels: monthly.map(m => String(m.label)) };
      if (withLabor) {
        chart.series = [
          { label: 'Total overhead', values: monthly.map(m => Number(m.total)), color: '#1D5C38', fill: true },
          { label: 'Labor', values: monthly.map(m => Number(m.labor)), color: '#C89B3C' }
        ];
      } else {
        chart.values = monthly.map(m => Number(m.total));
      }
      base.charts.push(chart);
    }

    // ---- Row 2 middle: labor vs. non-labor split, as an exact table ----
    const otherCats = groupSum(otherRows, e => e.category, e => e.amt);
    const catRows = topWithOther(otherCats, 3);
    const panelRows = [['Labor (Wages)', fmt.money2(labor), fmt.pct(fmt.share(labor, total))],
      ['Non-Labor', fmt.money2(nonLabor), fmt.pct(fmt.share(nonLabor, total))]];
    const panelKinds = ['subtotal', 'subtotal'];
    catRows.forEach(c => { panelRows.push([c.name, fmt.money2(c.amount), fmt.pct(fmt.share(c.amount, total))]); panelKinds.push('line'); });
    base.panelTable = {
      title: 'Labor vs. Non-Labor Split', subtitle: `Exact ${cur} per cost type`,
      columns: ['Cost Type', `Amount (${cur})`, '% of Overhead'],
      rows: panelRows, rowKinds: panelKinds, summaryMaxRows: 7,
      columnAlign: [null, 'right', 'right'],
      totalsRow: ['TOTAL', fmt.money2(total), total ? '100.0%' : '—']
    };

    // ---- Key Insights — warnings first ----
    if (i.insights) {
      base.insights = i.insights;
    } else {
      const warns = [], infos = [];
      if (change !== null) {
        (change > 5 ? warns : infos).push({ label: change > 5 ? 'Watch' : 'Overhead', color: change > 5 ? '#C0392B' : '#1D5C38',
          text: `Overhead is ${fmt.money(total)} ${cur}, ${change >= 0 ? 'up' : 'down'} ${fmt.pct(Math.abs(change))} versus ${prevLabel}.` });
      }
      if (hasNum(i.productionUnits) && hasNum(i.previousUnits) && Number(i.productionUnits) > 0 && Number(i.previousUnits) > 0 && prevTotal) {
        const perNow = total / Number(i.productionUnits), perBefore = prevTotal / Number(i.previousUnits);
        const rateCh = pctChg(perNow, perBefore), volCh = pctChg(i.productionUnits, i.previousUnits);
        if (rateCh !== null && volCh !== null) {
          if (rateCh > 3 && rateCh > volCh + 3) {
            warns.push({ label: 'Rate', color: '#C89B3C', text: `Overhead per ${unit} rose ${fmt.pct(rateCh)} to ${fmt.n(perNow, 2)} ${cur} — output moved ${fmt.signedPct(volCh)}, so overhead is growing faster than production.` });
          } else {
            infos.push({ label: 'Rate', color: '#2E86DE', text: `Overhead per ${unit} is ${fmt.n(perNow, 2)} ${cur} (${fmt.signedPct(rateCh)} vs ${prevLabel}), with output ${fmt.signedPct(volCh)}.` });
          }
        }
      }
      if (monthly.length >= 4) {
        const last3 = monthly.slice(-3).map(m => Number(m.total));
        if (last3[0] < last3[1] && last3[1] < last3[2]) {
          warns.push({ label: 'Trend', color: '#C89B3C', text: `Overhead has risen every month since ${monthly[monthly.length - 3].label}: ${last3.map(v => fmt.money(v)).join(', ')} ${cur}.` });
        }
      }
      if (total && labor) {
        infos.push({ label: 'Labor', color: '#2E86DE', text: `Labor is ${fmt.pct(fmt.share(labor, total), 0)} of overhead (${fmt.money(labor)} ${cur})${people ? ` across ${plural(people, 'employee')}` : ''}.` });
      }
      if (otherCats.length && total) {
        infos.push({ label: 'Largest', color: '#8E44AD', text: `${otherCats[0].name} is the biggest non-labor cost at ${fmt.money(otherCats[0].amount)} ${cur} (${fmt.pct(fmt.share(otherCats[0].amount, total), 0)} of overhead).` });
      }
      base.insights = warns.concat(infos).slice(0, 4);
    }

    // ---- Row 3: payroll / overhead ledger (wages first, biggest first) ----
    const ordered = laborRows.slice().sort((a, b) => b.amt - a.amt).concat(otherRows.slice().sort((a, b) => b.amt - a.amt));
    base.tables = [
      { title: 'Payroll / Overhead Ledger', summaryMaxRows: 6,
        columns: ['Employee / Payee', 'Role', 'Category', 'Channel', `Amount (${cur})`],
        rows: ordered.map(e => [e.name || '—', e.role || '—', e.category || '—', e.channel || '—', fmt.money2(e.amt)]),
        columnAlign: [null, null, null, null, 'right'],
        totalsRow: ['TOTAL', plural(entries.length, 'entry', 'entries'), '', '', fmt.money2(sumBy(entries, e => e.amt))] }
    ];

    // Detailed PDF / Excel only (v3.17): every category with its share, and the month-by-month history.
    const entriesTotal = sumBy(entries, e => e.amt);
    const allCats = groupSum(entries, e => e.category, e => e.amt);
    if (allCats.length) {
      const laborCats = new Set(laborRows.map(e => e.category || 'Other'));
      base.tables.push({ title: 'Overhead by Category', sheetName: 'By Category',
        columns: ['Category', 'Type', 'Entries', `Amount (${cur})`, '% of Overhead'],
        rows: allCats.map(c => [c.name, laborCats.has(c.name) ? 'Labor' : 'Non-labor', String(c.count), fmt.money2(c.amount), fmt.pct(fmt.share(c.amount, entriesTotal))]),
        columnAlign: [null, null, 'right', 'right', 'right'],
        totalsRow: ['TOTAL', '', String(entries.length), fmt.money2(entriesTotal), entriesTotal ? '100.0%' : '—'] });
    }
    if (monthly.length >= 2) {
      base.tables.push({ title: 'Monthly Overhead', sheetName: 'Monthly',
        columns: ['Month', `Total (${cur})`, `Labor (${cur})`, `Non-Labor (${cur})`, 'Change vs Prior'],
        rows: monthly.map((m, k) => {
          const t = Number(m.total), prev = k ? Number(monthly[k - 1].total) : null;
          const ch = prev ? pctChg(t, prev) : null;
          return [String(m.label), fmt.money2(t), hasNum(m.labor) ? fmt.money2(m.labor) : '—', hasNum(m.labor) ? fmt.money2(t - Number(m.labor)) : '—',
            ch === null ? '—' : (ch > 5 ? { v: fmt.signedPct(ch), tone: 'warn' } : fmt.signedPct(ch))];
        }),
        columnAlign: [null, 'right', 'right', 'right', 'right'] });
    }

    // Detailed PDF / Excel only (v3.27): payroll person by person, spending by payment channel, and checks.
    if (laborRows.length) {
      const pe = new Map();
      laborRows.forEach(e => {
        const nm = String(e.name || '').trim() || 'Unnamed', k = nm.toLowerCase();
        const g = pe.get(k) || { name: nm, role: '', n: 0, gross: 0, cost: 0 };
        g.n += 1; g.gross += hasNum(e.grossPay) ? Number(e.grossPay) : e.amt; g.cost += e.amt;
        if (!g.role && String(e.role || '').trim()) g.role = String(e.role).trim();
        pe.set(k, g);
      });
      const people2 = Array.from(pe.values()).sort((a, b) => b.cost - a.cost || a.name.localeCompare(b.name));
      const laborRowsTotal = sumBy(laborRows, e => e.amt);
      base.tables.push({ title: 'Labor Cost by Employee', sheetName: 'By Employee',
        columns: ['Employee', 'Role', 'Entries', `Gross Pay (${cur})`, `Cost to Business (${cur})`, '% of Labor'],
        rows: people2.map(g => [g.name, g.role || '—', String(g.n), fmt.money2(g.gross), fmt.money2(g.cost), laborRowsTotal ? fmt.pct(fmt.share(g.cost, laborRowsTotal)) : '—']),
        columnAlign: [null, null, 'right', 'right', 'right', 'right'],
        totalsRow: ['TOTAL', plural(people2.length, 'employee'), String(laborRows.length), fmt.money2(sumBy(people2, g => g.gross)), fmt.money2(laborRowsTotal), laborRowsTotal ? '100.0%' : '—'] });
      const unnamed = laborRows.filter(e => !String(e.name || '').trim()).length;
      if (unnamed) base.notes = (base.notes || []).concat([`${plural(unnamed, 'labor entry has', 'labor entries have')} no employee name and ${unnamed === 1 ? 'is' : 'are'} grouped as "Unnamed".`]);
      base.definitions = (base.definitions || []).concat([
        { term: 'Gross pay and cost to business', text: 'Gross pay is the pay before deductions where it was supplied, otherwise the cost of the entry. Cost to business is what the entry costs the business and is the amount used in every overhead total.' }
      ]);
    }
    if (entries.some(e => String(e.channel || '').trim())) {
      const chs = new Map();
      entries.forEach(e => {
        const k = String(e.channel || '').trim() || 'Not stated', g = chs.get(k) || { name: k, n: 0, labor: 0, other: 0 };
        g.n += 1; if (e.isLabor) g.labor += e.amt; else g.other += e.amt; chs.set(k, g);
      });
      const chList = Array.from(chs.values()).sort((a, b) => (b.labor + b.other) - (a.labor + a.other) || a.name.localeCompare(b.name));
      base.tables.push({ title: 'Overhead by Payment Channel', sheetName: 'By Channel',
        columns: ['Channel', 'Entries', `Labor (${cur})`, `Non-Labor (${cur})`, `Total (${cur})`, '% of Overhead'],
        rows: chList.map(g => [g.name, String(g.n), fmt.money2(g.labor), fmt.money2(g.other), fmt.money2(g.labor + g.other), entriesTotal ? fmt.pct(fmt.share(g.labor + g.other, entriesTotal)) : '—']),
        columnAlign: [null, 'right', 'right', 'right', 'right', 'right'],
        totalsRow: ['TOTAL', String(entries.length), fmt.money2(sumBy(chList, g => g.labor)), fmt.money2(sumBy(chList, g => g.other)), fmt.money2(entriesTotal), entriesTotal ? '100.0%' : '—'] });
      const ns = entries.filter(e => !String(e.channel || '').trim()).length;
      if (ns) base.notes = (base.notes || []).concat([`${plural(ns, 'entry has', 'entries have')} no payment channel and ${ns === 1 ? 'is' : 'are'} shown as "Not stated".`]);
    }
    if (entries.length) {
      if (tot.total !== undefined) base.checks = (base.checks || []).concat([{ label: 'Total overhead: summary vs. entry detail', expected: total, actual: entriesTotal }]);
      if (tot.labor !== undefined) base.checks = (base.checks || []).concat([{ label: 'Labor cost: summary vs. entry detail', expected: labor, actual: sumBy(laborRows, e => e.amt) }]);
    }
    if (monthly.length >= 2 && entries.length) {
      base.checks = (base.checks || []).concat([{ label: 'Total overhead: entry detail vs. current month in the monthly history', expected: Number(monthly[monthly.length - 1].total), actual: entriesTotal }]);
    }
    return base;
  };

  // ---------------------------------------------------------------
  // 8. PETTY CASH — "Where is the day-to-day cash going, and is it in line with what we
  //    expect?"   (BOTH charts kept: pace of spending is a trend question and "where is it
  //    leaking" is a genuine proportion question over a handful of categories)
  //
  // input: {
  //   transactions: [{ date:'2026-09-03', description, amount, category?, channel?:'Cash',
  //                    receiptRef? }],
  //   remaining?,                     // cash left at the end of the period (best: the page's own figure)
  //   openingBalance?, replenishments?,   // else remaining = opening + replenishments - spent
  //   days?,                          // days the daily average is spread over; default = first to
  //                                   //   last transaction date, inclusive (pass it for a full month)
  //   previousSpent?, previousLabel?,
  //   totals?: { spent, remaining }   // override derived figures
  // }
  // ---------------------------------------------------------------
  presets.pettycash = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Petty Cash', 'Petty Cash Report');
    if (base.status === 'empty') return base;
    const cur = base.currency;

    const tx = asArr(i.transactions).map(t => Object.assign({}, t, { amt: Number(t.amount) || 0 }));
    const tot = Object.assign({}, i.totals);
    const spent = tot.spent !== undefined ? tot.spent : sumBy(tx, t => t.amt);
    const fund = hasNum(i.openingBalance) ? Number(i.openingBalance) + (Number(i.replenishments) || 0) : null;
    const remaining = tot.remaining !== undefined ? Number(tot.remaining)
      : hasNum(i.remaining) ? Number(i.remaining) : (fund !== null ? fund - spent : null);
    const dated = tx.filter(t => isoOk(t.date)).map(t => String(t.date).slice(0, 10)).sort();
    const days = hasNum(i.days) && Number(i.days) > 0 ? Number(i.days)
      : (dated.length ? dayDiff(dated[0], dated[dated.length - 1]) + 1 : null);
    const dailyAvg = days ? spent / days : null;
    const biggest = tx.slice().sort((a, b) => b.amt - a.amt)[0] || null;
    const leftPct = fund ? (remaining / fund) * 100 : null;
    const prev = hasNum(i.previousSpent) ? Number(i.previousSpent) : null;
    const change = prev ? pctChg(spent, prev) : null;
    const shorten = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 3).trimEnd() + '...' : s; };

    base.kpis = [
      { label: 'Petty Cash Spent', value: fmt.money(spent), unit: cur, color: '#C89B3C',
        delta: change === null ? plural(tx.length, 'transaction') : `${fmt.signedPct(change)} vs ${i.previousLabel || 'last month'}`,
        deltaTone: change === null ? undefined : (change > 10 ? 'warn' : (change <= 0 ? 'good' : undefined)) },
      { label: 'Remaining Cash', value: remaining === null ? '—' : fmt.money(remaining), unit: remaining === null ? undefined : cur,
        color: remaining !== null && remaining < 0 ? '#C0392B' : '#1D5C38',
        delta: leftPct !== null ? `${fmt.pct(leftPct, 0)} of ${fmt.money(fund)} ${cur} float` : undefined,
        deltaTone: leftPct === null ? undefined : (leftPct < 20 ? 'warn' : 'good') },
      { label: 'Daily Avg. Spent', value: dailyAvg === null ? '—' : fmt.money(dailyAvg), unit: dailyAvg === null ? undefined : `${cur} / day`,
        color: '#2E86DE', delta: days ? `Over ${plural(days, 'day')}` : undefined },
      { label: 'Largest Expense', value: biggest ? fmt.money(biggest.amt) : '—', unit: biggest ? cur : undefined, color: '#8E44AD',
        delta: biggest ? `${shorten(biggest.description || biggest.category || 'Expense', 26)}${isoOk(biggest.date) ? ` · ${shortDate(biggest.date)}` : ''}` : undefined }
    ];

    // ---- Row 2: daily spending (bar, the peak day highlighted) + top categories (donut) ----
    base.charts = [];
    const daily = dailySeries(tx, t => t.date, t => t.amt);
    if (daily.labels.length) {
      const peak = daily.values.indexOf(Math.max.apply(null, daily.values));
      const chart = { type: 'bar', title: 'Daily Spending Trend', subtitle: `${cur} per day`, labels: daily.labels, values: daily.values, barColor: '#1D5C38' };
      if (daily.values.length > 1 && daily.values[peak] > 0) { chart.highlightIndex = peak; chart.highlightColor = '#C89B3C'; }
      base.charts.push(chart);
    }
    const cats = groupSum(tx, t => t.category, t => t.amt);
    if (cats.length >= 2) {
      const shown = topWithOther(cats, 6);
      base.charts.push({ type: 'doughnut', title: 'Top Spending Categories', labels: shown.map(c => c.name), values: shown.map(c => c.amount),
        colors: PALETTE, centerLabel: { top: 'Total', value: fmt.money(spent), bottom: cur } });
    }

    // ---- Key Insights — warnings first ----
    if (i.insights) {
      base.insights = i.insights;
    } else {
      const warns = [], infos = [];
      if (remaining !== null && remaining < 0) {
        warns.push({ label: 'Overspent', color: '#C0392B', text: `Petty cash is overdrawn by ${fmt.money(Math.abs(remaining))} ${cur}.` });
      } else if (leftPct !== null && leftPct < 20) {
        warns.push({ label: 'Low cash', color: '#C0392B', text: `Only ${fmt.money(remaining)} ${cur} (${fmt.pct(leftPct, 0)} of the float) is left.` });
      }
      if (cats.length >= 2 && fmt.share(cats[0].amount, spent) >= 40) {
        warns.push({ label: 'Category', color: '#C89B3C', text: `${cats[0].name} takes ${fmt.pct(fmt.share(cats[0].amount, spent), 0)} of petty cash spending (${fmt.money(cats[0].amount)} ${cur}).` });
      }
      // Skipped when the category warning above already is this one expense (same amount, same share).
      const sameAsCategory = cats.length >= 2 && fmt.share(cats[0].amount, spent) >= 40 && cats[0].count === 1;
      if (biggest && tx.length >= 4 && spent && fmt.share(biggest.amt, spent) >= 25 && !sameAsCategory) {
        warns.push({ label: 'Large', color: '#8E44AD', text: `One expense — ${shorten(biggest.description || 'unnamed', 40)} — is ${fmt.pct(fmt.share(biggest.amt, spent), 0)} of everything spent (${fmt.money(biggest.amt)} ${cur}).` });
      }
      const noRef = tx.filter(t => !String(t.receiptRef || '').trim());
      if (tx.length && noRef.length) {
        warns.push({ label: 'Receipts', color: '#C0392B', text: `${noRef.length} of ${tx.length} transactions (${fmt.money(sumBy(noRef, t => t.amt))} ${cur}) have no receipt reference.` });
      }
      if (change !== null) {
        (change > 10 ? warns : infos).push({ label: change > 10 ? 'Watch' : 'Spend', color: change > 10 ? '#C89B3C' : '#1D5C38',
          text: `Spending is ${change >= 0 ? 'up' : 'down'} ${fmt.pct(Math.abs(change))} versus ${i.previousLabel || 'last month'}.` });
      }
      if (dailyAvg !== null && daily.labels.length > 1) {
        infos.push({ label: 'Pace', color: '#2E86DE', text: `Spending averages ${fmt.money(dailyAvg)} ${cur} a day; the busiest day was ${fmt.money(Math.max.apply(null, daily.values))} ${cur}.` });
      }
      base.insights = warns.concat(infos).slice(0, 4);
    }

    // ---- Row 3: the auditable transaction ledger (newest first) ----
    const desc = tx.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    base.tables = [
      { title: 'Transaction Ledger', summaryMaxRows: 6,
        columns: ['Date', 'Description', `Amount (${cur})`, 'Channel', 'Receipt Ref.'],
        rows: desc.map(t => [
          isoOk(t.date) ? shortDate(t.date) : '—', t.description || '—', fmt.money2(t.amt), t.channel || '—',
          String(t.receiptRef || '').trim() ? String(t.receiptRef).trim() : { v: 'Missing', tone: 'warn' }
        ]),
        columnAlign: [null, null, 'right', null, null],
        totalsRow: ['TOTAL', plural(tx.length, 'transaction'), fmt.money2(sumBy(tx, t => t.amt)), '', ''] }
    ];

    // Detailed PDF / Excel only (v3.18): every category, and the ten largest single expenses.
    if (cats.length) {
      const catTotal = sumBy(tx, t => t.amt);
      base.tables.push({ title: 'Spending by Category', sheetName: 'By Category',
        columns: ['Category', 'Transactions', `Amount (${cur})`, '% of Spending'],
        rows: cats.map(c => [c.name, String(c.count), fmt.money2(c.amount), fmt.pct(fmt.share(c.amount, catTotal))]),
        columnAlign: [null, 'right', 'right', 'right'],
        totalsRow: ['TOTAL', String(tx.length), fmt.money2(catTotal), catTotal ? '100.0%' : '—'] });
    }
    if (tx.length > 1) {
      const big = tx.slice().sort((a, b) => b.amt - a.amt).slice(0, 10);
      base.tables.push({ title: 'Largest Expenses', sheetName: 'Largest',
        columns: ['Date', 'Description', 'Category', `Amount (${cur})`, '% of Spending'],
        rows: big.map(t => [isoOk(t.date) ? shortDate(t.date) : '—', t.description || '—', t.category || '—', fmt.money2(t.amt), fmt.pct(fmt.share(t.amt, sumBy(tx, x => x.amt)))]),
        columnAlign: [null, null, null, 'right', 'right'] });
    }

    // Detailed PDF / Excel only (v3.26): how the remaining cash is reached, day-by-day and channel spending,
    // and receipt coverage. Each table appears only when the page supplied what it needs.
    const reported = tot.remaining !== undefined ? Number(tot.remaining) : (hasNum(i.remaining) ? Number(i.remaining) : null);
    if (fund !== null) {
      const calc = fund - spent;
      const rowsP = [['Opening balance', fmt.money2(Number(i.openingBalance))], ['Add: replenishments', fmt.money2(Number(i.replenishments) || 0)],
        ['Funds available', fmt.money2(fund)], ['Less: petty cash spent', fmt.money2(spent)], ['Calculated remaining cash', fmt.money2(calc)]];
      const kindsP = ['line', 'line', 'subtotal', 'line', 'total'];
      if (reported !== null) {
        rowsP.push(['Remaining cash reported', fmt.money2(reported)], ['Difference (reported less calculated)', Math.abs(reported - calc) < 0.005 ? fmt.money2(0) : { v: fmt.money2(reported - calc), tone: 'bad' }]);
        kindsP.push('line', 'line');
        base.checks = (base.checks || []).concat([{ label: 'Remaining cash: reported vs. opening + replenishments - spent', expected: reported, actual: calc }]);
      }
      base.tables.push({ title: 'Cash Position Calculation', sheetName: 'Cash Position', columns: ['Figure', `Amount (${cur})`], rows: rowsP, rowKinds: kindsP,
        columnAlign: [null, 'right'], statement: true });
    } else if (reported !== null) {
      base.notes = (base.notes || []).concat(['No opening balance was supplied, so the remaining cash is shown as reported and could not be rebuilt from the opening balance, replenishments and spending.']);
    }
    if (tot.spent !== undefined && tx.length) {
      base.checks = (base.checks || []).concat([{ label: 'Petty cash spent: summary vs. transaction ledger', expected: spent, actual: sumBy(tx, t => t.amt) }]);
    }

    if (tx.length) {
      const byDay = new Map();
      tx.forEach(t => { const k = isoOk(t.date) ? String(t.date).slice(0, 10) : ''; const g = byDay.get(k) || { n: 0, amt: 0 }; g.n += 1; g.amt += t.amt; byDay.set(k, g); });
      const dayKeys = Array.from(byDay.keys()).filter(k => k).sort().concat(byDay.has('') ? [''] : []);
      let run = 0;
      const showLeft = fund !== null;
      base.tables.push({ title: 'Spending by Day', sheetName: 'By Day',
        columns: ['Date', 'Transactions', `Amount (${cur})`, `Running Total (${cur})`].concat(showLeft ? [`Cash Left (${cur})`] : []),
        rows: dayKeys.map(k => {
          const g = byDay.get(k); run += g.amt;
          return [k ? `${shortDate(k)} ${k.slice(0, 4)}` : 'No date', String(g.n), fmt.money2(g.amt), fmt.money2(run)].concat(showLeft ? [fund - run < 0 ? { v: fmt.money2(fund - run), tone: 'bad' } : fmt.money2(fund - run)] : []);
        }),
        columnAlign: [null, 'right', 'right', 'right'].concat(showLeft ? ['right'] : []),
        totalsRow: ['TOTAL', String(tx.length), fmt.money2(sumBy(tx, t => t.amt)), ''].concat(showLeft ? [''] : []) });
      if (byDay.has('')) base.notes = (base.notes || []).concat([`${plural(byDay.get('').n, 'transaction has', 'transactions have')} no valid date and ${byDay.get('').n === 1 ? 'is' : 'are'} listed last.`]);

      if (tx.some(t => String(t.channel || '').trim())) {
        const ch = groupSum(tx, t => String(t.channel || '').trim() || 'Not stated', t => t.amt);
        base.tables.push({ title: 'Spending by Channel', sheetName: 'By Channel',
          columns: ['Channel', 'Transactions', `Amount (${cur})`, '% of Spending'],
          rows: ch.map(c => [c.name, String(c.count), fmt.money2(c.amount), fmt.pct(fmt.share(c.amount, sumBy(tx, t => t.amt)))]),
          columnAlign: [null, 'right', 'right', 'right'],
          totalsRow: ['TOTAL', String(tx.length), fmt.money2(sumBy(tx, t => t.amt)), sumBy(tx, t => t.amt) ? '100.0%' : '—'] });
      }

      const hasRef = t => !!String(t.receiptRef || '').trim();
      const withR = tx.filter(hasRef), without = tx.filter(t => !hasRef(t)), allAmt = sumBy(tx, t => t.amt);
      base.tables.push({ title: 'Receipt Coverage', sheetName: 'Receipts',
        columns: ['Receipt Reference', 'Transactions', `Amount (${cur})`, '% of Spending'],
        rows: [['Recorded', String(withR.length), fmt.money2(sumBy(withR, t => t.amt)), allAmt ? fmt.pct(fmt.share(sumBy(withR, t => t.amt), allAmt)) : '—'],
          [without.length ? { v: 'Missing', tone: 'warn' } : 'Missing', String(without.length), fmt.money2(sumBy(without, t => t.amt)), allAmt ? fmt.pct(fmt.share(sumBy(without, t => t.amt), allAmt)) : '—']],
        columnAlign: [null, 'right', 'right', 'right'],
        totalsRow: ['TOTAL', String(tx.length), fmt.money2(allAmt), allAmt ? '100.0%' : '—'] });
      if (without.length) {
        const wo = without.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)) || b.amt - a.amt);
        base.tables.push({ title: 'Transactions Without Receipt Reference', sheetName: 'No Receipt',
          columns: ['Date', 'Description', 'Category', `Amount (${cur})`],
          rows: wo.map(t => [isoOk(t.date) ? `${shortDate(t.date)} ${String(t.date).slice(0, 4)}` : '—', t.description || '—', t.category || '—', fmt.money2(t.amt)]),
          columnAlign: [null, null, null, 'right'],
          totalsRow: ['TOTAL', plural(wo.length, 'transaction'), '', fmt.money2(sumBy(wo, t => t.amt))] });
        base.checks = (base.checks || []).concat([{ label: 'Missing receipts: coverage table vs. listed transactions', expected: sumBy(without, t => t.amt), actual: sumBy(wo, t => t.amt) }]);
      }
    }
    return base;
  };

  // ---------------------------------------------------------------
  // 9. CUSTOMERS — "Who owes us money, how overdue is it, and who should we be worried
  //    about?"   (one chart only: A/R aging is a bucketed comparison, which a bar shows
  //    better than a table; everything else is exact numbers or a ranking)
  //
  // input: {
  //   customers: [{ name,
  //                 revenue?, creditSales?,     // this period, ETB
  //                 outstanding,                // A/R balance now, ETB
  //                 terms?: 'Net 30' | 'Cash',  // payment terms
  //                 daysToPay?,                 // how many days this customer typically takes to pay
  //                 status?: 'Current'|'Overdue'|'At Risk'|...,   // optional override
  //                 buckets?: { current, d30, d60, d90 },         // this customer's A/R by age
  //                 orders?, lastOrder?: '2026-09-21',            // v3.37: how many orders, and the date of the last one
  //                 previousRevenue? }],                          // v3.37: this customer's revenue last period (growth / lapsed buyers)
  //   invoices?: [{ customer, amount, days? | invoiceDate?, reference? }],   // open invoices — the aging is
  //                                                                //   built from these (or from buckets)
  //   aging?: { current, d30, d60, d90 },         // override the chart's bucket totals
  //   previousAging?: { current, d30, d60, d90 }, // last month's, enables "bucket growing" insight
  //   previousOutstanding?, previousRevenue?, previousLabel?,
  //   asOf?: '2026-09-30',                        // for invoiceDate -> days
  //   totals?: { customers, revenue, credit, outstanding }
  // }
  // Aging buckets are days since the invoice date: Current = under 30 days, then 30+, 60+, 90+.
  // Status when not supplied: from the customer's oldest open invoice against their terms
  // (30 days when no terms are given) — Current, Overdue (<30 days past terms) or At Risk.
  // ---------------------------------------------------------------
  presets.customers = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Customers', 'Customers Report');
    if (base.status === 'empty') return base;
    const cur = base.currency;
    const asOf = isoOk(i.asOf) ? String(i.asOf).slice(0, 10) : todayISO();
    const BUCKETS = ['current', 'd30', 'd60', 'd90'];
    const BUCKET_LABELS = ['Current', '30+ days', '60+ days', '90+ days'];
    const BUCKET_COLORS = ['#1D5C38', '#C89B3C', '#E67E22', '#C0392B'];
    const bucketOf = d => d >= 90 ? 'd90' : d >= 60 ? 'd60' : d >= 30 ? 'd30' : 'current';
    const emptyB = () => ({ current: 0, d30: 0, d60: 0, d90: 0 });
    const termsDays = t => {
      const s = String(t || '');
      if (/cash|prepaid|immediate|cod/i.test(s)) return 0;
      const m = s.match(/(\d+)/);
      return m ? Number(m[1]) : null;
    };
    const toneOf = s => /risk|critical|default|bad|doubtful|90/i.test(s) ? 'bad'
      : /overdue|slow|late|watch|warn|60|30/i.test(s) ? 'warn'
      : /current|good|paid|settled|ok|on time|clear/i.test(s) ? 'good' : 'muted';

    // ---- per-customer figures + aging ----
    const key = n => String(n || '').trim().toLowerCase();
    const inv = asArr(i.invoices).map(v => {
      const days = hasNum(v.days) ? Number(v.days) : (isoOk(v.invoiceDate) ? dayDiff(v.invoiceDate, asOf) : null);
      return { customer: v.customer, amt: Number(v.amount) || 0, days };
    });
    const custs = asArr(i.customers).map(c => {
      const mine = inv.filter(v => key(v.customer) === key(c.name) && v.days !== null);
      const b = emptyB();
      if (c.buckets) BUCKETS.forEach(k => { b[k] = Number(c.buckets[k]) || 0; });
      else mine.forEach(v => { b[bucketOf(v.days)] += v.amt; });
      const oldest = mine.length ? Math.max.apply(null, mine.map(v => v.days))
        : (c.buckets ? (b.d90 > 0 ? 90 : b.d60 > 0 ? 60 : b.d30 > 0 ? 30 : (sumBy(BUCKETS, k => b[k]) > 0 ? 0 : null)) : null);
      const ordersIn = [c.orders, c.orderCount].find(hasNum);
      const lastIn = [c.lastOrder, c.lastPurchase, c.lastOrderDate].find(isoOk);
      return { name: c.name || 'Customer', revenue: Number(c.revenue) || 0, credit: Number(c.creditSales) || 0, out: Number(c.outstanding) || 0,
        terms: c.terms, daysToPay: hasNum(c.daysToPay) ? Number(c.daysToPay) : null, status: c.status, b, oldest,
        orders: ordersIn !== undefined ? Number(ordersIn) : null, last: lastIn ? String(lastIn).slice(0, 10) : null,
        prevRev: hasNum(c.previousRevenue) ? Number(c.previousRevenue) : null };
    });

    const tot = Object.assign({}, i.totals);
    const nCust = tot.customers !== undefined ? tot.customers : custs.length;
    const revenue = tot.revenue !== undefined ? tot.revenue : sumBy(custs, c => c.revenue);
    const credit = tot.credit !== undefined ? tot.credit : sumBy(custs, c => c.credit);
    const outstanding = tot.outstanding !== undefined ? tot.outstanding : sumBy(custs, c => c.out);
    const buying = custs.filter(c => c.revenue > 0).length;

    // Aging totals: explicit override, else the sum of per-customer buckets.
    let aging = null;
    if (i.aging) { aging = emptyB(); BUCKETS.forEach(k => { aging[k] = Number(i.aging[k]) || 0; }); }
    else if (custs.some(c => BUCKETS.some(k => c.b[k] > 0))) {
      aging = emptyB();
      custs.forEach(c => BUCKETS.forEach(k => { aging[k] += c.b[k]; }));
      // Invoices for customers that are not in the customers list still belong in the aging.
      const known = new Set(custs.map(c => key(c.name)));
      inv.filter(v => v.days !== null && !known.has(key(v.customer))).forEach(v => { aging[bucketOf(v.days)] += v.amt; });
    }
    const agedTotal = aging ? sumBy(BUCKETS, k => aging[k]) : 0;
    const aged30 = aging ? aging.d30 + aging.d60 + aging.d90 : 0;
    const aged60 = aging ? aging.d60 + aging.d90 : 0;
    if (aging && outstanding - agedTotal > 1 && !i.aging) {
      base.footer.notes = (base.footer.notes || []).concat([
        `${fmt.money(outstanding - agedTotal)} ${cur} of receivables has no invoice age and is not in the aging chart.`]);
    }

    const prevOut = hasNum(i.previousOutstanding) ? Number(i.previousOutstanding) : null;
    const outCh = prevOut ? pctChg(outstanding, prevOut) : null;
    const revCh = hasNum(i.previousRevenue) && Number(i.previousRevenue) > 0 ? pctChg(revenue, i.previousRevenue) : null;
    const prevLabel = i.previousLabel || 'last month';

    base.kpis = [
      { label: 'Total Customers', value: String(nCust), unit: nCust === 1 ? 'customer' : 'customers', color: '#1D5C38',
        delta: buying ? `${buying} bought this month` : undefined },
      { label: 'Total Revenue', value: fmt.money(revenue), unit: cur, color: '#2E86DE',
        delta: revCh === null ? undefined : `${fmt.signedPct(revCh)} vs ${prevLabel}`,
        deltaTone: revCh === null ? undefined : (revCh < -10 ? 'warn' : (revCh >= 0 ? 'good' : undefined)) },
      { label: 'Credit Sales', value: fmt.money(credit), unit: cur, color: '#C89B3C',
        delta: revenue ? `${fmt.pct(fmt.share(credit, revenue), 0)} of revenue` : undefined },
      { label: 'Outstanding A/R', value: fmt.money(outstanding), unit: cur, color: outstanding && aged60 > 0 ? '#C0392B' : '#8E44AD',
        delta: outCh !== null ? `${fmt.signedPct(outCh)} vs ${prevLabel}`
          : (aging && agedTotal ? `${fmt.money(aged30)} ${cur} is 30+ days old` : undefined),
        deltaTone: outCh !== null ? (outCh > 10 ? 'warn' : (outCh <= 0 ? 'good' : undefined))
          : (aging && agedTotal ? (aged30 / agedTotal >= 0.25 ? 'warn' : 'good') : undefined) }
    ];

    // ---- Row 2 left: A/R aging by bucket ----
    base.charts = [];
    if (aging && agedTotal > 0) {
      base.charts.push({ type: 'bar', title: 'A/R Aging by Bucket', subtitle: `${cur} outstanding, by days since invoice`,
        labels: BUCKET_LABELS, values: BUCKETS.map(k => aging[k]), colors: BUCKET_COLORS });
    }

    // ---- Debtors ----
    const termsOf = c => termsDays(c.terms);
    const statusOf = c => {
      if (c.status) return { text: String(c.status), tone: toneOf(String(c.status)) };
      if (c.out <= 0) return { text: 'Settled', tone: 'good' };
      const td = termsOf(c) === null ? 30 : termsOf(c);
      if (c.oldest !== null) {
        const over = c.oldest - td;
        return over <= 0 ? { text: 'Current', tone: 'good' } : over < 30 ? { text: 'Overdue', tone: 'warn' } : { text: 'At Risk', tone: 'bad' };
      }
      if (c.daysToPay !== null && termsOf(c) !== null && c.daysToPay > termsOf(c)) return { text: 'Slow Payer', tone: 'warn' };
      return { text: 'Open', tone: 'muted' };
    };
    const debtors = custs.filter(c => c.out > 0).sort((a, b) => b.out - a.out);

    // ---- Buyers (v3.37): who buys the most, how concentrated revenue is, who has stopped buying ----
    // The report used to look at customers only as debtors. These answer the other half: the biggest buyers (by revenue
    // this period), the top-3 share, buyers who also owe, customers who bought last period but not this one, and
    // (when the page gives orders / last order / previous revenue) order counts, last purchase and growth.
    const buyers = custs.filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue || String(a.name).localeCompare(String(b.name)));
    const buyersTotal = sumBy(buyers, c => c.revenue);
    const buyBase = revenue > 0 ? revenue : buyersTotal;
    const topN = k => sumBy(buyers.slice(0, k), c => c.revenue);
    const lapsed = custs.filter(c => c.revenue <= 0 && c.prevRev !== null && c.prevRev > 0).sort((a, b) => b.prevRev - a.prevRev);
    const buyerIns = [];
    if (buyers.length && buyBase > 0) {
      const t1 = buyers[0], s1 = fmt.share(t1.revenue, buyBase);
      buyerIns.push({ label: s1 >= 40 && buyers.length > 1 ? 'Dependence' : 'Top buyer', color: s1 >= 40 && buyers.length > 1 ? '#8E44AD' : '#1D5C38',
        text: `${t1.name} is the top buyer: ${fmt.money(t1.revenue)} ${cur}, ${fmt.pct(s1, 0)} of revenue${s1 >= 40 && buyers.length > 1 ? ' — a heavy reliance on one customer' : ''}${t1.out > 0 ? `; still owes ${fmt.money(t1.out)} ${cur}` : ''}.` });
      if (lapsed.length) {
        buyerIns.push({ label: 'Lapsed', color: '#C89B3C', text: `${lapsed[0].name}${lapsed.length > 1 ? ` and ${plural(lapsed.length - 1, 'other')}` : ''} bought in ${prevLabel} (${fmt.money(sumBy(lapsed, c => c.prevRev))} ${cur}) but not this period.` });
      }
      const movers = custs.filter(c => c.revenue > 0 && c.prevRev !== null && c.prevRev > 0).map(c => ({ name: c.name, was: c.prevRev, now: c.revenue, ch: pctChg(c.revenue, c.prevRev), diff: c.revenue - c.prevRev }));
      const drop = movers.filter(m => m.ch <= -25).sort((a, b) => a.diff - b.diff)[0];
      const rise = movers.filter(m => m.ch >= 25).sort((a, b) => b.diff - a.diff)[0];
      if (drop) buyerIns.push({ label: 'Buying less', color: '#E67E22', text: `${drop.name} bought ${fmt.pct(Math.abs(drop.ch), 0)} less than in ${prevLabel} (${fmt.money(drop.was)} to ${fmt.money(drop.now)} ${cur}).` });
      if (buyers.length >= 4) {
        buyerIns.push({ label: 'Buyers', color: '#2E86DE', text: `The top 3 buyers bring ${fmt.pct(fmt.share(topN(3), buyBase), 0)} of revenue; ${buyers.length} customers bought in total.` });
      }
      if (rise) buyerIns.push({ label: 'Growing', color: '#1D5C38', text: `${rise.name} is growing: ${fmt.pct(rise.ch, 0)} more than in ${prevLabel} (${fmt.money(rise.was)} to ${fmt.money(rise.now)} ${cur}).` });
      if (!lapsed.length && nCust > buyers.length && buyers.length > 0) {
        buyerIns.push({ label: 'Inactive', color: '#6B7280', text: `${nCust - buyers.length} of ${nCust} customers did not buy this period.` });
      }
    }

    // ---- Key Insights — warnings first ----
    if (i.insights) {
      base.insights = i.insights;
    } else {
      const warns = [], infos = [];
      if (aging && agedTotal > 0 && aged60 > 0) {
        warns.push({ label: aging.d90 > 0 ? 'Overdue' : 'Aging', color: aging.d90 > 0 ? '#C0392B' : '#C89B3C',
          text: `${fmt.money(aged60)} ${cur} (${fmt.pct(fmt.share(aged60, agedTotal), 0)} of A/R) is 60+ days old${aging.d90 > 0 ? `, ${fmt.money(aging.d90)} of it past 90 days` : ''}.` });
      } else if (aging && agedTotal > 0 && aged30 > 0) {
        infos.push({ label: 'Aging', color: '#C89B3C', text: `${fmt.money(aged30)} ${cur} (${fmt.pct(fmt.share(aged30, agedTotal), 0)} of A/R) is 30+ days old; nothing is past 60 days.` });
      }
      if (aging && i.previousAging) {
        const grow = BUCKETS.map((k, idx) => ({ k, idx, now: aging[k], was: Number(i.previousAging[k]) || 0 }))
          .filter(g => g.k !== 'current' && g.was > 0 && g.now > g.was && g.now >= agedTotal * 0.05)
          .map(g => Object.assign(g, { ch: pctChg(g.now, g.was) })).sort((a, b) => b.ch - a.ch)[0];
        if (grow && grow.ch >= 25) {
          warns.push({ label: 'Bucket', color: '#E67E22', text: `The ${BUCKET_LABELS[grow.idx]} bucket grew ${fmt.pct(grow.ch, 0)} versus ${prevLabel} (${fmt.money(grow.was)} to ${fmt.money(grow.now)} ${cur}).` });
        }
      }
      if (outCh !== null) {
        (outCh > 10 ? warns : infos).push({ label: outCh > 10 ? 'Watch' : 'A/R', color: outCh > 10 ? '#C89B3C' : '#1D5C38',
          text: `Outstanding A/R is ${fmt.money(outstanding)} ${cur}, ${outCh >= 0 ? 'up' : 'down'} ${fmt.pct(Math.abs(outCh))} versus ${prevLabel}.` });
      }
      if (debtors.length > 1 && outstanding && fmt.share(debtors[0].out, outstanding) >= 40) {
        warns.push({ label: 'Risk', color: '#8E44AD', text: `${debtors[0].name} owes ${fmt.pct(fmt.share(debtors[0].out, outstanding), 0)} of all receivables (${fmt.money(debtors[0].out)} ${cur}).` });
      }
      const slow = custs.filter(c => c.out > 0 && c.daysToPay !== null && termsOf(c) !== null && c.daysToPay > termsOf(c));
      if (slow.length) {
        warns.push({ label: 'Slow', color: '#C89B3C', text: `${plural(slow.length, 'customer pays', 'customers pay')} later than their terms${slow.length === 1 ? ` (${slow[0].name}: ${fmt.n(slow[0].daysToPay, 0)} days vs ${termsOf(slow[0])})` : ''}.` });
      }
      if (debtors.length) {
        infos.push({ label: 'Owing', color: '#2E86DE', text: `${plural(debtors.length, 'customer has', 'customers have')} an open balance, out of ${nCust} in total${credit && revenue ? `; credit is ${fmt.pct(fmt.share(credit, revenue), 0)} of sales` : ''}.` });
      }
      // v3.37: the page used to be all about debtors. Receivables keep their warnings first, but buyers always get
      // at least two of the four slots (more when there are few receivable flags).
      const arIns = warns.concat(infos);
      const takeB = Math.min(buyerIns.length, Math.max(2, 4 - arIns.length));
      base.insights = arIns.slice(0, 4 - takeB).concat(buyerIns.slice(0, takeB));
    }

    // ---- Row 3: aging detail table (biggest balance first) + Top Debtors ----
    base.tables = [
      { title: 'Aging Detail', summaryMaxRows: 5,
        columns: ['Customer', `Outstanding (${cur})`, 'Days to Pay', 'Status', 'Terms'],
        rows: debtors.map(c => {
          const st = statusOf(c);
          return [c.name, fmt.money2(c.out), c.daysToPay === null ? '—' : fmt.n(c.daysToPay, 0), { v: st.text, tone: st.tone }, c.terms || '—'];
        }),
        columnAlign: [null, 'right', 'right', null, null],
        totalsRow: ['TOTAL', fmt.money2(sumBy(debtors, c => c.out)), '', plural(debtors.length, 'customer'), ''] }
    ];
    // Detailed PDF / Excel only (v3.18): the aging buckets as exact figures (the chart shows only shape).
    if (aging && agedTotal > 0) {
      base.tables.push({ title: 'A/R Aging by Bucket', sheetName: 'Aging Buckets',
        columns: ['Age', `Amount (${cur})`, '% of Aged A/R'],
        rows: BUCKETS.map((k, n) => [BUCKET_LABELS[n], fmt.money2(aging[k]), fmt.pct(fmt.share(aging[k], agedTotal))]),
        columnAlign: [null, 'right', 'right'],
        totalsRow: ['TOTAL', fmt.money2(agedTotal), '100.0%'] });
    }
    // Detailed PDF / Excel only (v3.25): the aging per customer, payment terms against actual behaviour,
    // revenue and credit sales per customer, and each open invoice. Each appears only when the page passed its data.
    const dFull = iso => (isoOk(iso) ? `${shortDate(iso)} ${String(iso).slice(0, 4)}` : '—');
    const agedOf = b => sumBy(BUCKETS, k => b[k]);
    const known = new Set(custs.map(c => key(c.name)));
    const ageRows = custs.filter(c => agedOf(c.b) > 0 || c.out > 0).map(c => ({ name: c.name, b: c.b, out: c.out }));
    const extra = new Map();
    inv.filter(v => v.days !== null && !known.has(key(v.customer))).forEach(v => {
      const nm = String(v.customer || 'Unknown customer'), r = extra.get(nm) || { name: nm, b: emptyB(), out: 0 };
      r.b[bucketOf(v.days)] += v.amt; r.out += v.amt; extra.set(nm, r);
    });
    extra.forEach(r => ageRows.push(r));
    ageRows.sort((a, b) => b.out - a.out || String(a.name).localeCompare(String(b.name)));
    if (ageRows.some(r => agedOf(r.b) > 0)) {
      const noAge = ageRows.map(r => Math.max(r.out - agedOf(r.b), 0));
      const showNoAge = noAge.some(v => v > 1);
      base.tables.push({ title: 'Customer Aging Detail', sheetName: 'Customer Aging',
        columns: ['Customer'].concat(BUCKET_LABELS.map(l => `${l} (${cur})`), [`Total (${cur})`], showNoAge ? [`No Invoice Age (${cur})`] : []),
        rows: ageRows.map((r, n) => {
          const cells = BUCKETS.map(k => (r.b[k] > 0 ? (k === 'd90' ? { v: fmt.money2(r.b[k]), tone: 'bad' } : (k === 'd60' ? { v: fmt.money2(r.b[k]), tone: 'warn' } : fmt.money2(r.b[k]))) : fmt.money2(0)));
          return [r.name].concat(cells, [fmt.money2(agedOf(r.b) + (showNoAge ? noAge[n] : 0))], showNoAge ? [fmt.money2(noAge[n])] : []);
        }),
        columnAlign: [null, 'right', 'right', 'right', 'right', 'right'].concat(showNoAge ? ['right'] : []),
        totalsRow: ['TOTAL'].concat(BUCKETS.map(k => fmt.money2(sumBy(ageRows, r => r.b[k]))),
          [fmt.money2(sumBy(ageRows, r => agedOf(r.b)) + (showNoAge ? sumBy(noAge, v => v) : 0))], showNoAge ? [fmt.money2(sumBy(noAge, v => v))] : []) });
      if (i.aging) {
        base.checks = (base.checks || []).concat([{ label: 'Aged A/R: summary vs. customer aging detail', expected: agedTotal, actual: sumBy(ageRows, r => agedOf(r.b)) }]);
      }
    }

    const behave = custs.filter(c => c.terms || c.daysToPay !== null);
    if (behave.length) {
      const lateOf = c => (c.daysToPay !== null && termsOf(c) !== null ? c.daysToPay - termsOf(c) : null);
      const showOld = behave.some(c => c.oldest !== null);
      const sortedB = behave.slice().sort((a, b) => (lateOf(b) === null ? -1e9 : lateOf(b)) - (lateOf(a) === null ? -1e9 : lateOf(a)) || b.out - a.out || String(a.name).localeCompare(String(b.name)));
      const paying = behave.filter(c => c.daysToPay !== null);
      base.tables.push({ title: 'Payment Terms and Behaviour', sheetName: 'Payment Behaviour',
        columns: ['Customer', 'Terms', 'Typical Days to Pay', 'Days Late vs. Terms'].concat(showOld ? ['Oldest Open Invoice (days)'] : [], [`Outstanding (${cur})`, 'Status']),
        rows: sortedB.map(c => {
          const l = lateOf(c), st = statusOf(c);
          return [c.name, c.terms || '—', c.daysToPay === null ? '—' : fmt.n(c.daysToPay, 0),
            l === null ? '—' : (l > 0 ? { v: `${fmt.n(l, 0)} late`, tone: l >= 15 ? 'bad' : 'warn' } : (l < 0 ? { v: `${fmt.n(Math.abs(l), 0)} early`, tone: 'good' } : 'On time'))]
            .concat(showOld ? [c.oldest === null ? '—' : String(c.oldest)] : [], [fmt.money2(c.out), { v: st.text, tone: st.tone }]);
        }),
        columnAlign: [null, null, 'right', 'right'].concat(showOld ? ['right'] : [], ['right', null]),
        totalsRow: ['AVERAGE / TOTAL', '', paying.length ? fmt.n(avgOf(paying, c => c.daysToPay), 1) : '—', ''].concat(showOld ? [''] : [], [fmt.money2(sumBy(sortedB, c => c.out)), '']) });
      base.definitions = (base.definitions || []).concat([
        { term: 'Days late vs. terms', text: 'The customer\'s typical days to pay less the days allowed by their terms (Cash counts as 0 days). Shown only when both are known. The average in the totals row is the simple average of the customers that have a days-to-pay figure.' }
      ]);
    }

    const sellers = custs.filter(c => c.revenue > 0 || c.credit > 0).sort((a, b) => b.revenue - a.revenue || b.credit - a.credit || String(a.name).localeCompare(String(b.name)));
    if (sellers.length) {
      const revRows = sumBy(sellers, c => c.revenue);
      base.tables.push({ title: 'Customer Revenue and Credit Sales', sheetName: 'Revenue and Credit',
        columns: ['Customer', `Revenue (${cur})`, '% of Revenue', `Credit Sales (${cur})`, 'Credit % of Sales', `Outstanding A/R (${cur})`],
        rows: sellers.map(c => [c.name, fmt.money2(c.revenue), revRows ? fmt.pct(fmt.share(c.revenue, revRows)) : '—', fmt.money2(c.credit),
          c.revenue > 0 ? fmt.pct(Math.min(fmt.share(c.credit, c.revenue), 100), 0) : '—', c.out > 0 ? fmt.money2(c.out) : fmt.money2(0)]),
        columnAlign: [null, 'right', 'right', 'right', 'right', 'right'],
        totalsRow: ['TOTAL', fmt.money2(revRows), revRows ? '100.0%' : '—', fmt.money2(sumBy(sellers, c => c.credit)),
          revRows ? fmt.pct(Math.min(fmt.share(sumBy(sellers, c => c.credit), revRows), 100), 0) : '—', fmt.money2(sumBy(sellers, c => c.out))] });
      if (tot.revenue !== undefined) base.checks = (base.checks || []).concat([{ label: 'Revenue: summary vs. customer detail', expected: revenue, actual: revRows }]);
      if (tot.credit !== undefined) base.checks = (base.checks || []).concat([{ label: 'Credit sales: summary vs. customer detail', expected: credit, actual: sumBy(sellers, c => c.credit) }]);
    }

    const invDetail = asArr(i.invoices).map(v => {
      const days = hasNum(v.days) ? Number(v.days) : (isoOk(v.invoiceDate) ? dayDiff(v.invoiceDate, asOf) : null);
      const c = custs.find(x => key(x.name) === key(v.customer));
      const td = c ? termsOf(c) : null;
      return { customer: v.customer || '—', amt: Number(v.amount) || 0, days, date: isoOk(v.invoiceDate) ? String(v.invoiceDate).slice(0, 10) : null,
        ref: v.reference || v.invoiceNo || v.number || '', past: days !== null && td !== null ? days - td : null };
    }).filter(v => v.days !== null && v.amt !== 0).sort((a, b) => b.days - a.days || b.amt - a.amt);
    if (invDetail.length) {
      const showDate = invDetail.some(v => v.date), showRef = invDetail.some(v => v.ref), showPast = invDetail.some(v => v.past !== null);
      base.tables.push({ title: 'Open Invoices', sheetName: 'Open Invoices',
        columns: [].concat(showDate ? ['Invoice Date'] : [], showRef ? ['Reference'] : [], ['Customer', 'Age (days)', 'Bucket'], showPast ? ['Past Terms By (days)'] : [], [`Amount (${cur})`]),
        rows: invDetail.map(v => [].concat(showDate ? [dFull(v.date)] : [], showRef ? [String(v.ref || '—')] : [], [v.customer,
          v.days >= 60 ? { v: String(v.days), tone: 'bad' } : (v.days >= 30 ? { v: String(v.days), tone: 'warn' } : String(v.days)), BUCKET_LABELS[BUCKETS.indexOf(bucketOf(v.days))]],
          showPast ? [v.past === null ? '—' : (v.past > 0 ? { v: String(v.past), tone: 'warn' } : '0')] : [], [fmt.money2(v.amt)])),
        columnAlign: [].concat(showDate ? [null] : [], showRef ? [null] : [], [null, 'right', null], showPast ? ['right'] : [], ['right']),
        totalsRow: ['TOTAL', plural(invDetail.length, 'invoice')].concat(
          new Array([].concat(showDate ? [1] : [], showRef ? [1] : [], [1, 1, 1], showPast ? [1] : []).length - 2).fill(''), [fmt.money2(sumBy(invDetail, v => v.amt))]) });
      base.checks = (base.checks || []).concat([{ label: 'Outstanding A/R: summary vs. open invoices', expected: outstanding, actual: sumBy(invDetail, v => v.amt) }]);
      base.definitions = (base.definitions || []).concat([
        { term: 'Aging buckets', text: 'Days since the invoice date: Current is under 30 days, then 30+, 60+ and 90+ days. "Past terms by" is the invoice age less the days allowed by the customer\'s terms.' }
      ]);
    }
    if (debtors.length) {
      base.rankedList = { title: 'Top Debtors', maxRows: 4,
        items: debtors.map((c, idx) => ({ rank: idx + 1, name: c.name,
          meta: [c.terms, c.oldest !== null ? `oldest ${c.oldest} days` : null].filter(Boolean).join(' · ') || undefined,
          value: `${fmt.money(c.out)} ${cur}`, sub: `${fmt.pct(fmt.share(c.out, outstanding))} of A/R` })) };
    }

    // ---- Top Buyers (v3.37) ----
    // Summary page: a compact ranking in the Row-2 middle slot (shown when there is no second chart). Detailed PDF / Excel:
    // the full ranking, the revenue concentration and the customers with no purchases, placed first among the detail tables.
    if (buyers.length) {
      base.panelTable = { title: 'Top Buyers', sheetName: 'Top Buyers (Summary)', subtitle: 'Who buys the most this period', summaryMaxRows: 5,
        columns: ['Customer', `Revenue (${cur})`, '% of Rev.'],
        rows: buyers.map((c, idx) => [idx === 0 ? { v: c.name, bold: true } : c.name, fmt.money(c.revenue), fmt.pct(fmt.share(c.revenue, buyBase))]),
        columnAlign: [null, 'right', 'right'] };

      const newTables = [];
      const showOrders = buyers.some(c => c.orders !== null && c.orders > 0);
      const showLast = buyers.some(c => c.last);
      const showChg = buyers.some(c => c.prevRev !== null);
      const showDays = buyers.some(c => c.daysToPay !== null);
      const cols = ['#', 'Customer', `Revenue (${cur})`, '% of Revenue', 'Cumulative %']
        .concat(showOrders ? ['Orders', `Avg Order (${cur})`] : [], showChg ? [`vs. ${prevLabel}`] : [], showLast ? ['Last Order'] : [], [`Owes (${cur})`], showDays ? ['Typical Days to Pay'] : []);
      const owesIdx = cols.indexOf(`Owes (${cur})`);
      let cum = 0;
      const withOrders = buyers.filter(c => c.orders !== null && c.orders > 0);
      newTables.push({ title: 'Top Buyers — Full Ranking', sheetName: 'Top Buyers', additive: [2, owesIdx],
        columns: cols,
        rows: buyers.map((c, idx) => {
          cum += fmt.share(c.revenue, buyBase);
          const ch = c.prevRev !== null ? (c.prevRev > 0 ? pctChg(c.revenue, c.prevRev) : null) : undefined;
          const chgCell = c.prevRev === null ? '—' : (c.prevRev === 0 ? { v: 'New', tone: 'good' }
            : { v: fmt.signedPct(ch, 0), tone: ch <= -25 ? 'bad' : (ch >= 25 ? 'good' : 'muted') });
          return [String(idx + 1), idx === 0 ? { v: c.name, bold: true } : c.name, fmt.money2(c.revenue), fmt.pct(fmt.share(c.revenue, buyBase)), fmt.pct(Math.min(cum, 100))]
            .concat(showOrders ? [c.orders !== null && c.orders > 0 ? String(c.orders) : '—', c.orders !== null && c.orders > 0 ? fmt.money2(c.revenue / c.orders) : '—'] : [],
              showChg ? [chgCell] : [], showLast ? [c.last ? `${shortDate(c.last)} ${c.last.slice(0, 4)}` : '—'] : [],
              [c.out > 0 ? fmt.money2(c.out) : fmt.money2(0)], showDays ? [c.daysToPay === null ? '—' : fmt.n(c.daysToPay, 0)] : []);
        }),
        columnAlign: [null, null, 'right', 'right', 'right'].concat(showOrders ? ['right', 'right'] : [], showChg ? ['right'] : [], showLast ? ['right'] : [], ['right'], showDays ? ['right'] : []),
        totalsRow: ['', 'TOTAL', fmt.money2(buyersTotal), fmt.pct(fmt.share(buyersTotal, buyBase)), '']
          .concat(showOrders ? [withOrders.length ? String(sumBy(withOrders, c => c.orders)) : '—', withOrders.length ? fmt.money2(sumBy(withOrders, c => c.revenue) / sumBy(withOrders, c => c.orders)) : '—'] : [],
            showChg ? [''] : [], showLast ? [''] : [], [fmt.money2(sumBy(buyers, c => c.out))], showDays ? [''] : []) });
      if (showOrders && withOrders.length < buyers.length) {
        base.notes = (base.notes || []).concat([`${plural(buyers.length - withOrders.length, 'buyer has', 'buyers have')} no order count recorded; ${buyers.length - withOrders.length === 1 ? 'it is' : 'they are'} left out of the orders totals.`]);
      }

      if (buyers.length >= 2) {
        const steps = [1, 3, 5, 10].filter(k => k < buyers.length);
        newTables.push({ title: 'Revenue Concentration', sheetName: 'Concentration',
          columns: ['Group', 'Customers', `Revenue (${cur})`, '% of Revenue'],
          rows: steps.map(k => [k === 1 ? 'Top buyer' : `Top ${k} buyers`, String(k), fmt.money2(topN(k)), fmt.pct(fmt.share(topN(k), buyBase))])
            .concat([['All buyers', String(buyers.length), fmt.money2(buyersTotal), fmt.pct(fmt.share(buyersTotal, buyBase))],
              ['Average per buying customer', '', fmt.money2(buyersTotal / buyers.length), '']]),
          columnAlign: [null, 'right', 'right', 'right'], reconcile: false });
      }

      const idle = custs.filter(c => c.revenue <= 0).sort((a, b) => (b.prevRev || 0) - (a.prevRev || 0) || b.out - a.out || String(a.name).localeCompare(String(b.name)));
      if (idle.length) {
        const showPrev = idle.some(c => c.prevRev !== null), showLastI = idle.some(c => c.last);
        const idleCols = ['Customer'].concat(showPrev ? [`${prevLabel} Revenue (${cur})`] : [], showLastI ? ['Last Order'] : [], [`Owes (${cur})`]);
        newTables.push({ title: 'Customers With No Purchases This Period', sheetName: 'No Purchases', additive: [idleCols.length - 1],
          columns: idleCols,
          rows: idle.map(c => [c.name].concat(showPrev ? [c.prevRev === null ? '—' : fmt.money2(c.prevRev)] : [],
            showLastI ? [c.last ? `${shortDate(c.last)} ${c.last.slice(0, 4)}` : '—'] : [], [c.out > 0 ? fmt.money2(c.out) : fmt.money2(0)])),
          columnAlign: [null].concat(showPrev ? ['right'] : [], showLastI ? ['right'] : [], ['right']),
          totalsRow: [plural(idle.length, 'customer')].concat(showPrev ? [''] : [], showLastI ? [''] : [], [fmt.money2(sumBy(idle, c => c.out))]) });
      }
      base.tables.splice(1, 0, ...newTables);
      base.definitions = (base.definitions || []).concat([
        { term: 'Top buyers', text: 'Customers ranked by revenue in the period. The share is of the period\'s total revenue; Cumulative % adds the shares down the ranking, so the row for the third buyer shows what the top three bring together.' },
        { term: 'Owes', text: 'The customer\'s outstanding A/R balance today, shown beside what they bought so the biggest buyers who also owe money are easy to see.' }
      ]);
    }
    return base;
  };

  // ---------------------------------------------------------------
  // 10. SUPPLIERS — "Are our suppliers' prices fair, and who are we most dependent on?"
  //     (no donut by design — supplier comparison needs exact numbers: price vs. market,
  //     on-time %, not a proportion chart)
  //
  // input: {
  //   purchases: [{ date:'2026-09-03', supplier, quantity, unitPrice?, amount?,   // amount wins
  //                 item?, ref?,                // v3.19: shown in the detailed purchase table when present
  //                 paid?,                      // ETB paid so far on this purchase (or status:'Paid')
  //                 onTime?: bool, delayDays? }],   // delivery record (delayDays <= 0 counts as on time)
  //   suppliers?: [{ name, onTimePct?, avgPrice?, spend?, quantity?, purchases? }],   // extra detail / overrides
  //   totalSuppliers?,              // all registered suppliers (default: distinct names seen)
  //   marketAvg?,                   // ETB per unit; default = weighted average over every supplier
  //   priceHistory?: [{ date, supplier, price }],   // default: unit prices taken from `purchases`
  //   unitLabel?: 'kg', product?: 'Blend',
  //   previousTotal?, previousAvgPrice?, previousLabel?,
  //   totals?: { suppliers, total, avgPrice, paid }   // override derived figures
  // }
  // When no marketAvg is given the "market" is this period's weighted average across all
  // suppliers, and a footer note says so.
  // ---------------------------------------------------------------
  presets.suppliers = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Suppliers', 'Suppliers Report');
    if (base.status === 'empty') return base;
    const cur = base.currency;
    const unit = i.unitLabel || 'kg';
    const product = i.product || 'Blend';
    const prevLabel = i.previousLabel || 'last month';

    const sup = new Map();
    const slot = n => {
      const k = n || 'Unknown';
      if (!sup.has(k)) sup.set(k, { name: k, spend: 0, qty: 0, pSpend: 0, pQty: 0, count: 0, paid: 0, otYes: 0, otN: 0, pts: new Map(), rows: [] });
      return sup.get(k);
    };
    const purchases = i.purchases || [];
    let paidKnown = i.paid !== undefined || (i.totals && i.totals.paid !== undefined);
    purchases.forEach(p => {
      const s = slot(p.supplier);
      const q = Number(p.quantity) || 0;
      const amt = hasNum(p.amount) ? Number(p.amount) : (hasNum(p.unitPrice) ? q * Number(p.unitPrice) : 0);
      s.spend += amt; s.qty += q; s.count += 1;
      if (q > 0) { s.pSpend += amt; s.pQty += q; }
      if (hasNum(p.paid)) { s.paid += Number(p.paid); paidKnown = true; }
      else if (/^paid$/i.test(String(p.status || ''))) { s.paid += amt; paidKnown = true; }
      const ot = p.onTime !== undefined ? !!p.onTime : (hasNum(p.delayDays) ? Number(p.delayDays) <= 0 : null);
      if (ot !== null) { s.otN += 1; if (ot) s.otYes += 1; }
      const price = hasNum(p.unitPrice) ? Number(p.unitPrice) : (q > 0 ? amt / q : null);
      // v3.19: keep the purchase itself for the detailed supplier tables.
      s.rows.push({ date: p.date, item: p.item || p.description || '', ref: p.ref || p.reference || p.invoice || p.id || '',
        q, price, amt, paid: hasNum(p.paid) ? Number(p.paid) : (/^paid$/i.test(String(p.status || '')) ? amt : 0),
        ot, delay: hasNum(p.delayDays) ? Number(p.delayDays) : null });
      if (price !== null && isoOk(p.date)) {
        const d = String(p.date).slice(0, 10), cur_ = s.pts.get(d) || { v: 0, w: 0 };
        const w = q > 0 ? q : 1; cur_.v += price * w; cur_.w += w; s.pts.set(d, cur_);
      }
    });
    asArr(i.suppliers).forEach(x => {
      if (!x || !x.name) return;
      const s = slot(x.name);
      if (hasNum(x.spend) && !s.count) { s.spend = Number(x.spend); s.count = Number(x.purchases) || 0; s.qty = Number(x.quantity) || 0; }
      if (hasNum(x.avgPrice)) s.avgOverride = Number(x.avgPrice);
      if (hasNum(x.onTimePct)) s.onTimeOverride = Number(x.onTimePct);
    });
    // Manual price history replaces the points taken from the purchases.
    if (Array.isArray(i.priceHistory) && i.priceHistory.length) {
      sup.forEach(s => s.pts = new Map());
      i.priceHistory.forEach(p => {
        if (!p || !p.supplier || !isoOk(p.date) || !hasNum(p.price)) return;
        slot(p.supplier).pts.set(String(p.date).slice(0, 10), { v: Number(p.price), w: 1 });
      });
    }

    const list = Array.from(sup.values()).map(s => Object.assign(s, {
      avg: s.avgOverride !== undefined ? s.avgOverride : (s.pQty > 0 ? s.pSpend / s.pQty : null),
      onTime: s.onTimeOverride !== undefined ? s.onTimeOverride : (s.otN ? (s.otYes / s.otN) * 100 : null)
    })).sort((a, b) => b.spend - a.spend || String(a.name).localeCompare(String(b.name)));
    const active = list.filter(s => s.spend > 0 || s.count > 0);

    const tot = Object.assign({}, i.totals);
    const total = tot.total !== undefined ? tot.total : sumBy(list, s => s.spend);
    const pSpendAll = sumBy(list, s => s.pSpend), pQtyAll = sumBy(list, s => s.pQty);
    const avgPrice = tot.avgPrice !== undefined ? Number(tot.avgPrice) : (pQtyAll > 0 ? pSpendAll / pQtyAll : null);
    const paid = tot.paid !== undefined ? tot.paid : (i.paid !== undefined ? Number(i.paid) : (paidKnown ? sumBy(list, s => s.paid) : null));
    const nSuppliers = tot.suppliers !== undefined ? tot.suppliers : (hasNum(i.totalSuppliers) ? Number(i.totalSuppliers) : list.length);
    const market = hasNum(i.marketAvg) ? Number(i.marketAvg) : avgPrice;
    const marketDerived = !hasNum(i.marketAvg);
    const vsMarket = s => (s.avg !== null && market) ? pctChg(s.avg, market) : null;
    const prevTotal = hasNum(i.previousTotal) ? Number(i.previousTotal) : null;
    const totalCh = prevTotal ? pctChg(total, prevTotal) : null;
    const priceCh = hasNum(i.previousAvgPrice) && avgPrice !== null ? pctChg(avgPrice, i.previousAvgPrice) : null;
    const owed = paid !== null ? Math.max(total - paid, 0) : null;
    const allOt = sumBy(list, s => s.otN) ? (sumBy(list, s => s.otYes) / sumBy(list, s => s.otN)) * 100 : null;
    if (marketDerived && list.filter(s => s.avg !== null).length > 1) {
      base.footer.notes = (base.footer.notes || []).concat(['"Market avg." is this period\'s weighted average price across all suppliers.']);
    }

    base.kpis = [
      { label: 'Total Suppliers', value: String(nSuppliers), unit: nSuppliers === 1 ? 'supplier' : 'suppliers', color: '#1D5C38',
        delta: active.length ? `${active.length} supplied this month` : undefined },
      { label: 'Total Purchases (This Month)', value: fmt.money(total), unit: cur, color: '#2E86DE',
        delta: totalCh === null ? undefined : `${fmt.signedPct(totalCh)} vs ${prevLabel}` },
      { label: `Avg. Purchase Price (${product})`, value: avgPrice === null ? '—' : fmt.n(avgPrice, 2), unit: avgPrice === null ? undefined : `${cur} / ${unit}`,
        color: priceCh !== null && priceCh > 3 ? '#C0392B' : '#C89B3C',
        delta: priceCh === null ? undefined : `${fmt.signedPct(priceCh)} vs ${prevLabel}`,
        deltaTone: priceCh === null ? undefined : (priceCh > 3 ? 'warn' : (priceCh <= 0 ? 'good' : undefined)) },
      { label: 'Amount Paid', value: paid === null ? '—' : fmt.money(paid), unit: paid === null ? undefined : cur, color: '#8E44AD',
        delta: owed === null ? undefined : (owed > 0.5 ? `${fmt.money(owed)} ${cur} still owed` : 'Fully paid'), deltaTone: owed === null ? undefined : (owed > 0.5 ? 'warn' : 'good') }
    ];

    // ---- Row 2 left: price trend (the biggest suppliers by spend that have >= 2 price dates) ----
    const priced = list.filter(s => s.pts.size >= 2).slice(0, 3);
    base.charts = [];
    if (priced.length) {
      const sel = priced.map(s => ({ name: s.name, pts: Array.from(s.pts.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([d, o]) => [d, o.v / o.w]) }));
      const dates = Array.from(new Set([].concat(...sel.map(s => s.pts.map(p => p[0]))))).sort();
      const firstShared = sel.map(s => s.pts[0][0]).sort().pop();
      let start = dates.filter(d => d >= firstShared);
      if (start.length < 2) start = dates;
      const priceAt = (pts, d) => { let v = pts[0][1]; for (const p of pts) { if (p[0] <= d) v = p[1]; else break; } return v; };
      const round2 = v => Math.round(v * 100) / 100;
      const series = sel.map((s, idx) => ({ label: s.name, color: PALETTE[idx % PALETTE.length], fill: sel.length === 1, values: start.map(d => round2(priceAt(s.pts, d))) }));
      if (hasNum(i.marketAvg)) series.push({ label: 'Market avg.', color: '#C89B3C', values: start.map(() => round2(Number(i.marketAvg))) });
      base.charts.push({ type: 'line', title: 'Price Trend', subtitle: `${cur} per ${unit}, by purchase date`, labels: start.map(shortDate), series });
    }

    // ---- Key Insights — warnings first ----
    if (i.insights) {
      base.insights = i.insights;
    } else {
      const warns = [], infos = [];
      const above = active.filter(s => vsMarket(s) !== null && vsMarket(s) >= 5 && s.spend > 0).sort((a, b) => vsMarket(b) - vsMarket(a));
      if (above.length && (!marketDerived || list.filter(s => s.avg !== null).length > 1)) {
        const s = above[0];
        warns.push({ label: 'Price', color: '#C0392B', text: `${s.name} averages ${fmt.n(s.avg, 2)} ${cur} per ${unit}, ${fmt.pct(vsMarket(s))} above the ${marketDerived ? 'all-supplier' : 'market'} average of ${fmt.n(market, 2)}${above.length > 1 ? ` (${above.length - 1} more supplier${above.length > 2 ? 's' : ''} also above)` : ''}.` });
      }
      const hikes = list.map(s => {
        const pts = Array.from(s.pts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        return pts.length >= 2 ? { s, a: pts[0], b: pts[pts.length - 1], ch: pctChg(pts[pts.length - 1][1].v / pts[pts.length - 1][1].w, pts[0][1].v / pts[0][1].w) } : null;
      }).filter(h => h && h.ch !== null && h.ch >= 5).sort((x, y) => y.ch - x.ch);
      if (hikes.length) {
        const h = hikes[0];
        warns.push({ label: 'Hike', color: '#C89B3C', text: `${h.s.name} raised its price ${fmt.pct(h.ch)} between ${shortDate(h.a[0])} and ${shortDate(h.b[0])} (${fmt.n(h.a[1].v / h.a[1].w, 2)} to ${fmt.n(h.b[1].v / h.b[1].w, 2)} ${cur} per ${unit}).` });
      }
      if (active.length > 1 && total && fmt.share(active[0].spend, total) >= 40) {
        warns.push({ label: 'Risk', color: '#8E44AD', text: `${active[0].name} supplies ${fmt.pct(fmt.share(active[0].spend, total), 0)} of purchases (${fmt.money(active[0].spend)} ${cur}) — a dependency worth managing.` });
      }
      const late = active.filter(s => s.onTime !== null && s.onTime < 80).sort((a, b) => a.onTime - b.onTime);
      if (late.length) {
        warns.push({ label: 'Delivery', color: '#C0392B', text: `${late[0].name} delivered on time only ${fmt.pct(late[0].onTime, 0)} of the time${late.length > 1 ? ` (${late.length - 1} more supplier${late.length > 2 ? 's are' : ' is'} below 80%)` : ''}.` });
      }
      if (priceCh !== null && Math.abs(priceCh) >= 1) {
        (priceCh > 3 ? warns : infos).push({ label: priceCh > 3 ? 'Watch' : 'Price', color: priceCh > 3 ? '#C89B3C' : '#1D5C38',
          text: `The average ${product.toLowerCase()} price is ${fmt.n(avgPrice, 2)} ${cur} per ${unit}, ${priceCh >= 0 ? 'up' : 'down'} ${fmt.pct(Math.abs(priceCh))} versus ${prevLabel}.` });
      }
      if (owed !== null && owed > 0.5) {
        infos.push({ label: 'Unpaid', color: '#2E86DE', text: `${fmt.money(owed)} ${cur} of this month's purchases is still unpaid (${fmt.pct(fmt.share(owed, total), 0)}).` });
      }
      if (!warns.length && !infos.length && active.length) {
        infos.push({ label: 'Suppliers', color: '#1D5C38', text: `${plural(active.length, 'supplier')} supplied ${fmt.money(total)} ${cur} this month; no price or delivery concerns stand out.` });
      }
      base.insights = warns.concat(infos).slice(0, 4);
    }

    // ---- Row 3: supplier comparison (by spend) + Top Suppliers by Spend ----
    const vsCell = s => {
      const v = vsMarket(s);
      if (v === null) return '—';
      return { v: fmt.signedPct(v), tone: v >= 5 ? 'bad' : v >= 2 ? 'warn' : v <= -2 ? 'good' : undefined };
    };
    const otCell = s => s.onTime === null ? '—' : { v: fmt.pct(s.onTime, 0), tone: s.onTime < 80 ? 'bad' : s.onTime < 90 ? 'warn' : 'good' };
    base.tables = [
      { title: 'Supplier Comparison', summaryMaxRows: 5,
        columns: ['Supplier', `Avg Price (${cur}/${unit})`, 'vs. Market Avg.', 'On-Time Delivery'],
        rows: list.map(s => [s.name, s.avg === null ? '—' : fmt.n(s.avg, 2), vsCell(s), otCell(s)]),
        columnAlign: [null, 'right', 'right', 'right'],
        totalsRow: ['ALL SUPPLIERS', avgPrice === null ? '—' : fmt.n(avgPrice, 2), hasNum(i.marketAvg) && avgPrice !== null ? fmt.signedPct(pctChg(avgPrice, market)) : '—', allOt === null ? '—' : fmt.pct(allOt, 0)] }
    ];
    if (active.length) {
      base.rankedList = { title: 'Top Suppliers by Spend', maxRows: 4,
        items: active.map((s, idx) => ({ rank: idx + 1, name: s.name,
          meta: `${plural(s.count, 'purchase')}${s.qty ? ` · ${qtyFmt(s.qty)} ${unit}` : ''}`,
          value: `${fmt.money(s.spend)} ${cur}`, sub: `${fmt.pct(fmt.share(s.spend, total))} of spend` })) };
    }

    // Detailed PDF / Excel only (v3.19): purchases grouped by supplier.
    // Per-purchase payment columns appear only when at least one purchase carries a payment record
    // (a bare totals.paid has no per-supplier split to show).
    const perPaid = purchases.some(p => p && (hasNum(p.paid) || /^paid$/i.test(String(p.status || ''))));
    if (active.length) {
      const qtyOf = s => (s.qty > 0 ? qtyFmt(s.qty) : '—');
      const owedOf = s => Math.max(s.spend - s.paid, 0);
      base.tables.push({ title: 'Purchases by Supplier', sheetName: 'By Supplier',
        columns: ['Supplier', 'Purchases', `Quantity (${unit})`, `Total (${cur})`, '% of Spend', `Avg Price (${cur}/${unit})`]
          .concat(perPaid ? [`Paid (${cur})`, `Owed (${cur})`] : [], ['On-Time Delivery']),
        rows: active.map(s => [s.name, String(s.count), qtyOf(s), fmt.money2(s.spend), fmt.pct(fmt.share(s.spend, total)), s.avg === null ? '—' : fmt.n(s.avg, 2)]
          .concat(perPaid ? [fmt.money2(s.paid), owedOf(s) > 0.5 ? { v: fmt.money2(owedOf(s)), tone: 'warn' } : fmt.money2(owedOf(s))] : [], [otCell(s)])),
        columnAlign: [null, 'right', 'right', 'right', 'right', 'right'].concat(perPaid ? ['right', 'right'] : [], ['right']),
        totalsRow: ['ALL SUPPLIERS', String(sumBy(active, s => s.count)), sumBy(active, s => s.qty) > 0 ? qtyFmt(sumBy(active, s => s.qty)) : '—',
          fmt.money2(total), total ? '100.0%' : '—', avgPrice === null ? '—' : fmt.n(avgPrice, 2)]
          .concat(perPaid ? [paid === null ? '—' : fmt.money2(paid), owed === null ? '—' : fmt.money2(owed)] : [], [allOt === null ? '—' : fmt.pct(allOt, 0)]) });
    }

    // Every purchase, grouped under its supplier (biggest spender first), subtotal per supplier.
    const withRows = active.filter(s => s.rows.length);
    if (withRows.length) {
      const hasItem = withRows.some(s => s.rows.some(r => r.item));
      const hasRef = withRows.some(s => s.rows.some(r => r.ref));
      const hasDeliv = withRows.some(s => s.otN > 0 || s.rows.some(r => r.ot !== null));
      const cols = ['Date'].concat(hasItem ? ['Item'] : [], hasRef ? ['Reference'] : [],
        [`Qty (${unit})`, `Unit Price (${cur}/${unit})`, `Amount (${cur})`], perPaid ? [`Paid (${cur})`] : [], hasDeliv ? ['Delivery'] : []);
      const align = [null].concat(hasItem ? [null] : [], hasRef ? [null] : [], ['right', 'right', 'right'], perPaid ? ['right'] : [], hasDeliv ? [null] : []);
      const mk = (c0, item, ref, q, pr, amt, pd, dl) => [c0].concat(hasItem ? [item] : [], hasRef ? [ref] : [], [q, pr, amt], perPaid ? [pd] : [], hasDeliv ? [dl] : []);
      const dlOf = r => (r.ot === null ? '—' : (r.ot ? { v: 'On time', tone: 'good' }
        : { v: r.delay !== null && r.delay > 0 ? `${fmt.n(r.delay, 0)} d late` : 'Late', tone: 'bad' }));
      const avgOf_ = rows => {
        const wq = sumBy(rows.filter(r => r.q > 0), r => r.q), wa = sumBy(rows.filter(r => r.q > 0), r => r.amt);
        return wq > 0 ? fmt.n(wa / wq, 2) : '—';
      };
      const rowsOut = [], kinds = [];
      let allRows = [];
      withRows.forEach(s => {
        const rs = s.rows.slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || b.amt - a.amt);
        allRows = allRows.concat(rs);
        rowsOut.push(mk(`${s.name} (${plural(rs.length, 'purchase')})`, '', '', '', '', '', '', '')); kinds.push('section');
        rs.forEach(r => {
          rowsOut.push(mk(isoOk(r.date) ? shortDate(r.date) : (r.date ? String(r.date) : '—'), r.item || '—', r.ref || '—',
            r.q > 0 ? qtyFmt(r.q) : '—', r.price === null ? '—' : fmt.n(r.price, 2), fmt.money2(r.amt), fmt.money2(r.paid), dlOf(r)));
          kinds.push('line');
        });
        const sq = sumBy(rs, r => r.q);
        rowsOut.push(mk('Subtotal', '', '', sq > 0 ? qtyFmt(sq) : '—', avgOf_(rs), fmt.money2(sumBy(rs, r => r.amt)), fmt.money2(sumBy(rs, r => r.paid)),
          s.onTime === null ? '' : `${fmt.pct(s.onTime, 0)} on time`)); kinds.push('subtotal');
      });
      const gq = sumBy(allRows, r => r.q), gAmt = sumBy(allRows, r => r.amt);
      rowsOut.push(mk('TOTAL', '', '', gq > 0 ? qtyFmt(gq) : '—', avgOf_(allRows), fmt.money2(gAmt), fmt.money2(sumBy(allRows, r => r.paid)),
        allOt === null ? '' : `${fmt.pct(allOt, 0)} on time`)); kinds.push('total');
      base.tables.push({ title: 'Purchase Detail by Supplier', sheetName: 'Supplier Detail', columns: cols, rows: rowsOut, rowKinds: kinds, columnAlign: align });
      base.checks = (base.checks || []).concat([{ label: 'Total purchases: summary vs. purchase detail by supplier', expected: total, actual: gAmt }]);
      if (perPaid && paid !== null) {
        base.checks.push({ label: 'Amount paid: summary vs. purchase detail by supplier', expected: paid, actual: sumBy(allRows, r => r.paid) });
      }
    }
    return base;
  };

  // ---------------------------------------------------------------
  // 11. LOANS — "What do we owe, when is it due, and are we on track?"
  //     (NO chart, by design: a loan has a known payoff curve and the repayment schedule shows
  //     it exactly. Row 2 is Key Insights at full width; Row 3 is two tables side by side — the
  //     loan register and the repayment schedule — via reportData.summaryTables = 2)
  //
  // input: {
  //   loans: [{ lender, principal, rate,            // rate = annual interest, in %
  //             termMonths, outstanding,
  //             interestPaid? }],                   // interest paid to date on this loan
  //   schedule: [{ lender?, dueDate:'2026-10-12', principal, interest,   // the instalment's two parts
  //                balanceAfter?,                    // balance after this payment is made
  //                paid?: bool, paidDate?,
  //                status?: 'Paid'|'Overdue'|'Due Soon'|'Upcoming' }],    // else derived from the dates
  //   asOf?: '2026-09-30',          // "today" (default: the current date)
  //   dueSoonDays?: 7,              // a payment this close is "Due Soon"
  //   totals?: { outstanding, interestPaid }   // override derived figures
  // }
  // Schedule order: payments still to be made, earliest first (overdue ones therefore lead),
  // then the paid ones, most recent first — so the summary page's first rows are the ones a
  // person needs before paying. The detailed PDF and Excel carry every row in that order.
  // When the schedule covers more than one lender, a "Loan" column is added.
  // ---------------------------------------------------------------
  presets.loans = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Loans', 'Loans Report');
    if (base.status === 'empty') return base;
    const cur = base.currency;
    const asOf = isoOk(i.asOf) ? String(i.asOf).slice(0, 10) : todayISO();
    const soon = hasNum(i.dueSoonDays) ? Number(i.dueSoonDays) : 7;
    const dateFull = iso => isoOk(iso) ? `${shortDate(iso)} ${String(iso).slice(0, 4)}` : '—';
    const termText = m => !hasNum(m) ? '—' : (Number(m) >= 24 && Number(m) % 12 === 0 ? `${Number(m) / 12} yrs` : `${Number(m)} mo`);
    const TONE = { Paid: 'good', Overdue: 'bad', 'Due Soon': 'warn', Upcoming: 'muted' };

    const loans = asArr(i.loans).map(l => ({ lender: l.lender || 'Lender', principal: Number(l.principal) || 0, rate: hasNum(l.rate) ? Number(l.rate) : null,
      term: l.termMonths, out: Number(l.outstanding) || 0, interestPaid: hasNum(l.interestPaid) ? Number(l.interestPaid) : null }));

    const sched = asArr(i.schedule).filter(r => r && isoOk(r.dueDate)).map(r => {
      const p = Number(r.principal) || 0, n = Number(r.interest) || 0;
      const due = String(r.dueDate).slice(0, 10);
      const said = String(r.status || '');
      let status = /paid/i.test(said) && !/unpaid/i.test(said) ? 'Paid' : /overdue|late/i.test(said) ? 'Overdue'
        : /soon/i.test(said) ? 'Due Soon' : /upcoming|pending|scheduled/i.test(said) ? null : null;
      if (!status) {
        if (r.paid || isoOk(r.paidDate)) status = 'Paid';
        else {
          const left = dayDiff(asOf, due);
          status = left < 0 ? 'Overdue' : left <= soon ? 'Due Soon' : 'Upcoming';
        }
      }
      return { lender: r.lender, due, p, n, pay: hasNum(r.payment) ? Number(r.payment) : p + n, bal: hasNum(r.balanceAfter) ? Number(r.balanceAfter) : null, status, left: dayDiff(asOf, due),
        paidOn: isoOk(r.paidDate) ? String(r.paidDate).slice(0, 10) : null };
    });
    const unpaid = sched.filter(r => r.status !== 'Paid').sort((a, b) => a.due.localeCompare(b.due));
    const paidRows = sched.filter(r => r.status === 'Paid').sort((a, b) => b.due.localeCompare(a.due));
    const ordered = unpaid.concat(paidRows);
    const overdue = sched.filter(r => r.status === 'Overdue').sort((a, b) => a.due.localeCompare(b.due));

    const tot = Object.assign({}, i.totals);
    const outstanding = tot.outstanding !== undefined ? tot.outstanding : sumBy(loans, l => l.out);
    const principalAll = sumBy(loans, l => l.principal);
    // Interest paid to date: the loans' own figures where given; for a loan without one, the interest
    // on that lender's paid instalments (all paid instalments when no loan gives a figure at all).
    const keyOf = v => String(v || '').trim().toLowerCase();
    const fromLoans = loans.some(l => l.interestPaid !== null);
    const interestPaid = tot.interestPaid !== undefined ? tot.interestPaid
      : (fromLoans ? sumBy(loans, l => l.interestPaid !== null ? l.interestPaid
          : sumBy(paidRows.filter(r => keyOf(r.lender) === keyOf(l.lender) || (!r.lender && loans.length === 1)), r => r.n))
        : sumBy(paidRows, r => r.n));
    const repaidPct = principalAll > 0 ? Math.min(Math.max((1 - outstanding / principalAll) * 100, 0), 100) : null;

    // Next payment: the earliest not-yet-due instalment (all loans falling on that date are added up).
    const upcoming = unpaid.filter(r => r.left >= 0);
    const nextDate = upcoming.length ? upcoming[0].due : null;
    const nextRows = nextDate ? upcoming.filter(r => r.due === nextDate) : [];
    const nextAmt = sumBy(nextRows, r => r.pay);
    const nextLeft = nextRows.length ? nextRows[0].left : null;
    const nextWho = nextRows.length > 1 ? plural(nextRows.length, 'loan') : (nextRows.length ? (nextRows[0].lender || (loans.length === 1 ? loans[0].lender : '')) : '');
    const overdueAmt = sumBy(overdue, r => r.pay);

    base.kpis = [
      { label: 'Total Outstanding Balance', value: fmt.money(outstanding), unit: cur, color: '#1D5C38',
        delta: repaidPct !== null ? `${fmt.pct(repaidPct, 0)} of principal repaid` : (loans.length ? plural(loans.length, 'loan') : undefined) },
      { label: 'Total Interest Paid (To Date)', value: fmt.money(interestPaid), unit: cur, color: '#C89B3C',
        delta: !fromLoans && tot.interestPaid === undefined && paidRows.length ? `Across ${plural(paidRows.length, 'payment')}` : undefined },
      { label: 'Next Payment Due', value: nextDate ? shortDate(nextDate) : '—', unit: nextDate ? `${fmt.money(nextAmt)} ${cur}` : undefined,
        color: nextLeft !== null && nextLeft <= soon ? '#C0392B' : '#2E86DE',
        delta: nextDate ? `${nextLeft === 0 ? 'Due today' : `In ${plural(nextLeft, 'day')}`}${nextWho ? ` · ${nextWho}` : ''}` : 'No payments scheduled',
        deltaTone: nextLeft !== null && nextLeft <= soon ? 'warn' : undefined },
      { label: 'Overdue Payments', value: String(overdue.length), unit: overdue.length === 1 ? 'payment' : 'payments', color: overdue.length ? '#C0392B' : '#1D5C38',
        delta: overdue.length ? `${fmt.money(overdueAmt)} ${cur} overdue` : 'All payments on track', deltaTone: overdue.length ? 'warn' : 'good' }
    ];

    base.charts = [];   // none, by design

    // ---- Key Insights (full width) — warnings first ----
    if (i.insights) {
      base.insights = i.insights;
    } else {
      const warns = [], infos = [];
      const who = r => r.lender ? ` to ${r.lender}` : '';
      if (overdue.length) {
        const o = overdue[0];
        warns.push({ label: 'Overdue', color: '#C0392B', text: `${plural(overdue.length, 'payment is', 'payments are')} overdue (${fmt.money(overdueAmt)} ${cur}) — the oldest, ${fmt.money(o.pay)} ${cur}${who(o)}, was due ${dateFull(o.due)}, ${plural(Math.abs(o.left), 'day')} ago.` });
      }
      if (nextDate) {
        (nextLeft <= soon ? warns : infos).push({ label: 'Next payment', color: nextLeft <= soon ? '#C89B3C' : '#2E86DE',
          text: `${fmt.money(nextAmt)} ${cur} falls due on ${dateFull(nextDate)} (${nextLeft === 0 ? 'today' : `in ${plural(nextLeft, 'day')}`})${nextRows.length === 1 ? who(nextRows[0]) : ` across ${plural(nextRows.length, 'loan')}`}.` });
        const in30 = upcoming.filter(r => r.left <= 30);
        if (in30.length > nextRows.length) {
          infos.push({ label: 'Next 30 days', color: '#8E44AD', text: `${fmt.money(sumBy(in30, r => r.pay))} ${cur} is due over the next 30 days across ${plural(in30.length, 'payment')}.` });
        }
      }
      if (repaidPct !== null && loans.length) {
        infos.push({ label: 'Progress', color: '#1D5C38', text: `${fmt.pct(repaidPct, 0)} of the ${fmt.money(principalAll)} ${cur} borrowed has been repaid; ${fmt.money(outstanding)} ${cur} remains${interestPaid ? `, with ${fmt.money(interestPaid)} ${cur} paid in interest so far` : ''}.` });
      }
      if (unpaid.length) {
        const last = unpaid[unpaid.length - 1];
        const months = Math.max(Math.round(dayDiff(asOf, last.due) / 30.4), 0);
        if (months > 0) infos.push({ label: 'Payoff', color: '#2E86DE', text: `The schedule runs to ${dateFull(last.due)} — about ${plural(months, 'month')} from now${loans.length === 1 ? '' : ' for the longest loan'}.` });
      }
      if (loans.length > 1) {
        const hi = loans.filter(l => l.rate !== null).sort((a, b) => b.rate - a.rate)[0];
        if (hi) infos.push({ label: 'Rate', color: '#C89B3C', text: `The highest rate is ${hi.lender} at ${fmt.pct(hi.rate)}, with ${fmt.money(hi.out)} ${cur} outstanding.` });
      }
      base.insights = warns.concat(infos).slice(0, 4);
    }

    // ---- Row 3: register | schedule (two tables, no ranked list) ----
    base.summaryTables = 2;
    base.summaryTableSplit = 0.46;
    base.tables = [
      { title: 'Loan Register', summaryMaxRows: 5,
        columns: ['Lender', `Principal (${cur})`, 'Interest Rate', 'Term', `Outstanding Balance (${cur})`],
        rows: loans.map(l => [l.lender, fmt.money2(l.principal), l.rate === null ? '—' : fmt.pct(l.rate), termText(l.term), fmt.money2(l.out)]),
        columnAlign: [null, 'right', 'right', 'right', 'right'],
        totalsRow: ['TOTAL', fmt.money2(principalAll), '', '', fmt.money2(outstanding)],
        additive: [1, 4] } // principal and outstanding balance both add up across loans
    ];
    const multi = new Set(sched.map(r => r.lender).filter(Boolean)).size > 1;
    const rowOf = r => {
      const cells = [dateFull(r.due)];
      if (multi) cells.push(r.lender || '—');
      cells.push(fmt.money2(r.p), fmt.money2(r.n), r.bal === null ? '—' : fmt.money2(r.bal), { v: r.status, tone: TONE[r.status] });
      return cells;
    };
    base.tables.push({ title: 'Repayment Schedule', summaryMaxRows: 6,
      columns: multi ? ['Due Date', 'Loan', `Principal Portion (${cur})`, `Interest Portion (${cur})`, `Balance After Payment (${cur})`, 'Status']
        : ['Due Date', `Principal Portion (${cur})`, `Interest Portion (${cur})`, `Balance After Payment (${cur})`, 'Status'],
      rows: ordered.map(rowOf),
      columnAlign: multi ? [null, null, 'right', 'right', 'right', null] : [null, 'right', 'right', 'right', null],
      totalsRow: multi ? ['TOTAL', '', fmt.money2(sumBy(ordered, r => r.p)), fmt.money2(sumBy(ordered, r => r.n)), '', plural(ordered.length, 'payment')]
        : ['TOTAL', fmt.money2(sumBy(ordered, r => r.p)), fmt.money2(sumBy(ordered, r => r.n)), '', plural(ordered.length, 'payment')] });

    // Detailed PDF / Excel only (v3.22). The register and the full schedule are printed above; these
    // tables add the per-loan position, the overdue and paid detail, and the forward view.
    const belongs = (r, l) => keyOf(r.lender) === keyOf(l.lender) || (!r.lender && loans.length === 1);
    const lenderCell = r => r.lender || (loans.length === 1 ? loans[0].lender : '—');
    if (loans.length) {
      const pos = loans.map(l => {
        const mine = sched.filter(r => belongs(r, l));
        const repaid = Math.max(l.principal - l.out, 0);
        const intPaid = l.interestPaid !== null ? l.interestPaid : sumBy(mine.filter(r => r.status === 'Paid'), r => r.n);
        const nxt = mine.filter(r => r.status !== 'Paid' && r.left >= 0).sort((a, b) => a.due.localeCompare(b.due))[0];
        const od = mine.filter(r => r.status === 'Overdue');
        return { l, repaid, intPaid, nxt, odAmt: sumBy(od, r => r.pay), odN: od.length };
      });
      const knownInt = pos.every(x => x.l.interestPaid !== null || sched.length);
      base.tables.push({ title: 'Loan Position by Loan', sheetName: 'Loan Position',
        columns: ['Lender', `Principal (${cur})`, `Principal Repaid (${cur})`, '% Repaid', `Outstanding (${cur})`, `Interest Paid (${cur})`, 'Next Due', `Overdue (${cur})`],
        rows: pos.map(x => [x.l.lender, fmt.money2(x.l.principal), fmt.money2(x.repaid), x.l.principal > 0 ? fmt.pct(Math.min(fmt.share(x.repaid, x.l.principal), 100), 0) : '—',
          fmt.money2(x.l.out), (x.l.interestPaid !== null || sched.length) ? fmt.money2(x.intPaid) : '—', x.nxt ? `${shortDate(x.nxt.due)} (${fmt.money(x.nxt.pay)})` : '—',
          x.odAmt > 0 ? { v: `${fmt.money2(x.odAmt)} (${x.odN})`, tone: 'bad' } : fmt.money2(0)]),
        columnAlign: [null, 'right', 'right', 'right', 'right', 'right', 'right', 'right'],
        totalsRow: ['TOTAL', fmt.money2(principalAll), fmt.money2(sumBy(pos, x => x.repaid)), principalAll > 0 ? fmt.pct(Math.min(fmt.share(sumBy(pos, x => x.repaid), principalAll), 100), 0) : '—',
          fmt.money2(sumBy(loans, l => l.out)), knownInt ? fmt.money2(sumBy(pos, x => x.intPaid)) : '—', '', fmt.money2(overdueAmt)] });
      if (knownInt) {
        base.checks = (base.checks || []).concat([{ label: 'Interest paid: summary vs. per-loan detail', expected: interestPaid, actual: sumBy(pos, x => x.intPaid) }]);
      }
      if (sched.length) {
        base.checks = (base.checks || []).concat([{ label: 'Outstanding balance: summary vs. principal still to pay in the schedule', expected: outstanding, actual: sumBy(unpaid, r => r.p) }]);
      }
    }

    if (overdue.length) {
      base.tables.push({ title: 'Overdue Payments', sheetName: 'Overdue',
        columns: ['Due Date'].concat(multi ? ['Loan'] : [], [`Principal (${cur})`, `Interest (${cur})`, `Total Due (${cur})`, 'Days Overdue']),
        rows: overdue.map(r => [dateFull(r.due)].concat(multi ? [lenderCell(r)] : [], [fmt.money2(r.p), fmt.money2(r.n), fmt.money2(r.pay), { v: String(Math.abs(r.left)), tone: 'bad' }])),
        columnAlign: [null].concat(multi ? [null] : [], ['right', 'right', 'right', 'right']),
        totalsRow: ['TOTAL'].concat(multi ? [plural(overdue.length, 'payment')] : [], [fmt.money2(sumBy(overdue, r => r.p)), fmt.money2(sumBy(overdue, r => r.n)), fmt.money2(overdueAmt), multi ? '' : plural(overdue.length, 'payment')]) });
      base.checks = (base.checks || []).concat([{ label: 'Overdue amount: summary vs. overdue payments table', expected: overdueAmt, actual: sumBy(overdue, r => r.pay) }]);
    }

    if (paidRows.length) {
      const hasPaidOn = paidRows.some(r => r.paidOn);
      const late = r => (r.paidOn ? dayDiff(r.due, r.paidOn) : null);
      const lateCell = r => {
        const d = late(r);
        return d === null ? '—' : (d > 0 ? { v: `${d} late`, tone: 'bad' } : (d < 0 ? { v: `${Math.abs(d)} early`, tone: 'good' } : 'On time'));
      };
      const pm = paidRows.slice().sort((a, b) => a.due.localeCompare(b.due));
      base.tables.push({ title: 'Payments Made', sheetName: 'Payments Made',
        columns: ['Due Date'].concat(hasPaidOn ? ['Paid On'] : [], multi ? ['Loan'] : [], [`Principal (${cur})`, `Interest (${cur})`, `Total Paid (${cur})`], hasPaidOn ? ['Days (early / late)'] : []),
        rows: pm.map(r => [dateFull(r.due)].concat(hasPaidOn ? [r.paidOn ? dateFull(r.paidOn) : '—'] : [], multi ? [lenderCell(r)] : [],
          [fmt.money2(r.p), fmt.money2(r.n), fmt.money2(r.pay)], hasPaidOn ? [lateCell(r)] : [])),
        columnAlign: [null].concat(hasPaidOn ? [null] : [], multi ? [null] : [], ['right', 'right', 'right'], hasPaidOn ? ['right'] : []),
        totalsRow: ['TOTAL'].concat(hasPaidOn ? [''] : [], multi ? [plural(pm.length, 'payment')] : [], [fmt.money2(sumBy(pm, r => r.p)), fmt.money2(sumBy(pm, r => r.n)), fmt.money2(sumBy(pm, r => r.pay))], hasPaidOn ? [multi ? '' : plural(pm.length, 'payment')] : []) });
    }

    if (unpaid.length) {
      const byM = new Map();
      unpaid.forEach(r => {
        const k = r.due.slice(0, 7), m = byM.get(k) || { n: 0, p: 0, i: 0, od: 0 };
        m.n += 1; m.p += r.p; m.i += r.n; if (r.status === 'Overdue') m.od += r.pay; byM.set(k, m);
      });
      const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const hasOd = Array.from(byM.values()).some(m => m.od > 0);
      base.tables.push({ title: 'Still to Pay by Month', sheetName: 'Still to Pay',
        columns: ['Month', 'Payments', `Principal (${cur})`, `Interest (${cur})`, `Total (${cur})`].concat(hasOd ? [`Of Which Overdue (${cur})`] : []),
        rows: Array.from(byM.keys()).sort().map(k => {
          const m = byM.get(k);
          return [`${MON[Number(k.slice(5, 7)) - 1]} ${k.slice(0, 4)}`, String(m.n), fmt.money2(m.p), fmt.money2(m.i), fmt.money2(m.p + m.i)]
            .concat(hasOd ? [m.od > 0 ? { v: fmt.money2(m.od), tone: 'bad' } : fmt.money2(0)] : []);
        }),
        columnAlign: ['', 'right', 'right', 'right', 'right'].map(a => a || null).concat(hasOd ? ['right'] : []),
        totalsRow: ['TOTAL', String(unpaid.length), fmt.money2(sumBy(unpaid, r => r.p)), fmt.money2(sumBy(unpaid, r => r.n)), fmt.money2(sumBy(unpaid, r => r.pay))].concat(hasOd ? [fmt.money2(overdueAmt)] : []) });
      base.definitions = (base.definitions || []).concat([
        { term: 'Overdue', text: `An unpaid instalment whose due date is before ${dateFull(asOf)}.` },
        { term: 'Due soon', text: `An unpaid instalment due within ${plural(soon, 'day')} of ${dateFull(asOf)}.` }
      ]);
    }
    return base;
  };

  // ---------------------------------------------------------------
  // 12. PROFIT DISTRIBUTION — "How much cash can we actually distribute, and how is it
  //     split between owners?"   (both charts kept by design: the cash in/out trend is a real
  //     trend question, and the shareholder split is a real, fixed-ratio proportion — the
  //     80/20 ownership — not decoration)
  //
  // input: {
  //   trend?: [{ label:'Jun', cashIn, cashOut }],        // cash in vs. cash out per period
  //   daily?: [{ date:'2026-09-03', cashIn, cashOut }],   // ...or per-day rows (quiet days = 0)
  //   netCashProfit?,            // else total cash in - total cash out from trend / daily
  //   distributable?,            // the amount the page says can be paid out
  //   closingCash?,
  //   ownerInjections?,          // else the sum of `injections`
  //   injections?: [{ date, owner, amount }],
  //   previousDistributable?, previousInjections?, previousLabel?,   // for the "vs. last month" notes
  //   shareholders: [{ name, sharePct }],                 // ownership split, e.g. 80 / 20
  //   distributions: [{ date, shareholder, pct?, amount,  // the distribution record
  //                     status?: 'Paid'|'Approved'|'Pending'|'Cancelled' }],
  //   calculation?: [{ label, amount?, note?,             // v3.19: the BMS's own steps for the
  //                    kind?: 'line'|'subtotal'|'total'|'section'|'note'|'pct' }],   // distributable amount
  //   closingCashByChannel?: [{ channel, amount }],       // v3.19: Cash / Bank / Mobile ...
  //   totals?: { netCashProfit, distributable, closingCash, ownerInjections }   // override
  // }
  // v3.19 (detailed PDF / Excel only): the BMS owns the distributable-amount logic. When it passes
  // `calculation`, the engine prints those steps as given. Without it the engine only lays out the
  // figures it was handed (cash in, cash out, net cash profit, distributable, closing cash) and
  // never invents an intermediate step.
  // A figure the page does not supply shows as "—" rather than being guessed. The donut uses
  // the shareholders' ownership shares; without them it falls back to each shareholder's
  // distributed amount. Cancelled distributions stay in the history table (marked) but are not
  // counted in its total.
  // ---------------------------------------------------------------
  presets.profit = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Profit Distribution', 'Profit Distribution Report');
    if (base.status === 'empty') return base;
    const cur = base.currency;
    const num = v => (hasNum(v) ? Number(v) : null);
    const lower = s => String(s || '').trim().toLowerCase();
    const dateFull = iso => isoOk(iso) ? `${shortDate(iso)} ${String(iso).slice(0, 4)}` : '—';
    const pctText = p => p === null ? '—' : fmt.pct(p, Number.isInteger(p) ? 0 : 1);
    const prevLabel = i.previousLabel || 'last month';

    // ---- cash in vs. cash out, per period ----
    let periods = [];
    if (Array.isArray(i.trend) && i.trend.length) {
      periods = i.trend.map((p, idx) => ({ label: String(p.label !== undefined && p.label !== null ? p.label : idx + 1),
        cashIn: Number(p.cashIn) || 0, cashOut: Number(p.cashOut) || 0 }));
    } else if (Array.isArray(i.daily) && i.daily.length) {
      const ins = dailySeries(i.daily, r => r.date, r => r.cashIn);
      const outs = dailySeries(i.daily, r => r.date, r => r.cashOut);
      periods = ins.labels.map((l, k) => ({ label: l, cashIn: ins.values[k], cashOut: outs.values[k] }));
    }
    const totalIn = sumBy(periods, p => p.cashIn);
    const totalOut = sumBy(periods, p => p.cashOut);

    // ---- the four headline figures ----
    const tot = Object.assign({}, i.totals);
    const injections = asArr(i.injections).filter(x => x && hasNum(x.amount)).map(x => ({ date: x.date, owner: x.owner, amt: Number(x.amount) }));
    const netProfit = tot.netCashProfit !== undefined ? num(tot.netCashProfit)
      : hasNum(i.netCashProfit) ? Number(i.netCashProfit) : (periods.length ? totalIn - totalOut : null);
    const distributable = tot.distributable !== undefined ? num(tot.distributable) : num(i.distributable);
    const closing = tot.closingCash !== undefined ? num(tot.closingCash) : num(i.closingCash);
    const injected = tot.ownerInjections !== undefined ? num(tot.ownerInjections)
      : hasNum(i.ownerInjections) ? Number(i.ownerInjections) : (injections.length ? sumBy(injections, x => x.amt) : null);
    const prevDist = num(i.previousDistributable);
    const prevInj = num(i.previousInjections);
    const distChange = distributable !== null && prevDist !== null ? pctChg(distributable, prevDist) : null;

    // ---- the distribution record ----
    const shareholders = asArr(i.shareholders).filter(s => s && s.name).map(s => ({ name: String(s.name), pct: num(s.sharePct) }));
    const normStatus = s => {
      const t = String(s || '').trim();
      if (!t) return '';
      if (/cancel|reject|void/i.test(t)) return 'Cancelled';
      if (/unpaid|pend|draft|open|due/i.test(t)) return 'Pending';
      if (/paid|complete|distributed|done|settled/i.test(t)) return 'Paid';
      if (/approv|schedul/i.test(t)) return 'Approved';
      return t;
    };
    const TONE = { Paid: 'good', Approved: 'info', Pending: 'warn', Cancelled: 'muted' };
    const dists = asArr(i.distributions).map(d => {
      const who = d.shareholder || d.shareholderName || 'Shareholder';
      const owner = shareholders.find(s => lower(s.name) === lower(who));
      return { date: d.date, who, amt: Number(d.amount) || 0, status: normStatus(d.status),
        pct: hasNum(d.pct) ? Number(d.pct) : (owner ? owner.pct : null) };
    });
    const live = dists.filter(d => d.status !== 'Cancelled');
    const cancelled = dists.length - live.length;
    const pending = dists.filter(d => d.status === 'Pending');

    base.kpis = [
      { label: 'Net Cash Profit', value: netProfit === null ? '—' : fmt.money(netProfit), unit: netProfit === null ? undefined : cur,
        color: netProfit !== null && netProfit < 0 ? '#C0392B' : '#1D5C38',
        delta: periods.length ? `${fmt.money(totalIn)} in · ${fmt.money(totalOut)} out` : undefined },
      { label: 'Distributable Amount', value: distributable === null ? '—' : fmt.money(distributable), unit: distributable === null ? undefined : cur,
        color: '#C89B3C',
        delta: distChange !== null ? `${fmt.signedPct(distChange)} vs ${prevLabel}`
          : (distributable !== null && netProfit > 0 ? `${fmt.pct(fmt.share(distributable, netProfit), 0)} of net cash profit` : undefined),
        deltaTone: distChange === null ? undefined : (distChange >= 0 ? 'good' : 'warn') },
      { label: 'Closing Cash', value: closing === null ? '—' : fmt.money(closing), unit: closing === null ? undefined : cur,
        color: closing !== null && closing < 0 ? '#C0392B' : '#2E86DE',
        delta: closing !== null && distributable !== null
          ? (closing >= distributable ? 'Covers the distributable amount' : `${fmt.money(distributable - closing)} ${cur} short of distributable`) : undefined,
        deltaTone: closing !== null && distributable !== null ? (closing >= distributable ? 'good' : 'warn') : undefined },
      { label: 'Owner Injections', value: injected === null ? '—' : fmt.money(injected), unit: injected === null ? undefined : cur,
        color: '#8E44AD',
        delta: injections.length ? plural(injections.length, 'injection') : undefined }
    ];

    // ---- Row 2: cash in vs. out (line; bars when there is only one period) + shareholder split (donut) ----
    base.charts = [];
    if (periods.length) {
      const series = [
        { label: 'Cash In', values: periods.map(p => p.cashIn), color: '#1D5C38' },
        { label: 'Cash Out', values: periods.map(p => p.cashOut), color: '#C0392B' }
      ];
      base.charts.push({ type: periods.length >= 2 ? 'line' : 'bar', title: 'Cash In vs. Cash Out Trend', subtitle: `${cur} per period`,
        labels: periods.map(p => p.label), series });
    }
    let slices = [];
    if (shareholders.length >= 2 && shareholders.every(s => s.pct !== null && s.pct > 0)) {
      slices = shareholders.map(s => ({ name: `${s.name} (${pctText(s.pct)})`, value: s.pct }));
    } else {
      const byOwner = groupSum(live.filter(d => d.amt > 0), d => d.who, d => d.amt);
      if (byOwner.length >= 2) slices = byOwner.map(o => ({ name: o.name, value: o.amount }));
    }
    if (slices.length >= 2) {
      const ratio = shareholders.length >= 2 && shareholders.every(s => s.pct !== null) ? shareholders.map(s => pctText(s.pct).replace('%', '')).join(' / ') : null;
      base.charts.push({ type: 'doughnut', title: 'Distribution Split by Shareholder', labels: slices.map(s => s.name), values: slices.map(s => s.value),
        colors: PALETTE,
        centerLabel: distributable !== null ? { top: 'Distributable', value: fmt.money(distributable), bottom: cur }
          : (ratio ? { top: 'Ownership', value: ratio, bottom: '%' } : undefined) });
    }

    // ---- Key Insights — warnings first ----
    if (i.insights) {
      base.insights = i.insights;
    } else {
      const warns = [], infos = [];
      if (netProfit !== null && netProfit <= 0) {
        warns.push({ label: 'No profit', color: '#C0392B', text: `Cash going out exceeded cash coming in by ${fmt.money(Math.abs(netProfit))} ${cur}, so there is no cash profit to distribute this period.` });
      }
      if (distributable !== null && closing !== null && distributable > closing) {
        warns.push({ label: 'Cash short', color: '#C0392B', text: `The distributable amount (${fmt.money(distributable)} ${cur}) is more than the cash on hand (${fmt.money(closing)} ${cur}) — paying it all out would overdraw the business.` });
      }
      if (distChange !== null && distChange <= -10) {
        warns.push({ label: 'Down', color: '#C89B3C', text: `The distributable amount is down ${fmt.pct(Math.abs(distChange))} from ${prevLabel} (${fmt.money(prevDist)} to ${fmt.money(distributable)} ${cur}).` });
      } else if (distChange !== null && distChange >= 10) {
        infos.push({ label: 'Up', color: '#1D5C38', text: `The distributable amount is up ${fmt.pct(distChange)} on ${prevLabel} (${fmt.money(prevDist)} to ${fmt.money(distributable)} ${cur}).` });
      }
      if (injected !== null && injected > 0) {
        const bigInj = injections.slice().sort((a, b) => b.amt - a.amt)[0];
        const whoDid = bigInj && bigInj.owner ? `, the largest from ${bigInj.owner}${isoOk(bigInj.date) ? ` on ${dateFull(bigInj.date)}` : ''}` : '';
        if (prevInj !== null && injected > prevInj * 1.5) {
          warns.push({ label: 'Injection', color: '#8E44AD', text: `Owner injections are ${fmt.money(injected)} ${cur}, up from ${fmt.money(prevInj)} ${cur} in ${prevLabel}${whoDid}.` });
        } else if (totalIn > 0 && fmt.share(injected, totalIn) >= 20) {
          warns.push({ label: 'Injection', color: '#8E44AD', text: `Owner injections of ${fmt.money(injected)} ${cur} equal ${fmt.pct(fmt.share(injected, totalIn), 0)} of this period's cash in${whoDid}.` });
        } else {
          infos.push({ label: 'Injection', color: '#8E44AD', text: `Owners put in ${fmt.money(injected)} ${cur} this period${whoDid}.` });
        }
      }
      if (pending.length) {
        warns.push({ label: 'Pending', color: '#C89B3C', text: `${plural(pending.length, 'distribution is', 'distributions are')} still pending (${fmt.money(sumBy(pending, d => d.amt))} ${cur}).` });
      }
      if (distributable !== null && distributable > 0 && shareholders.length >= 2 && shareholders.every(s => s.pct !== null)) {
        infos.push({ label: 'Split', color: '#2E86DE', text: `At the current ownership split, ${fmt.money(distributable)} ${cur} divides as ${shareholders.slice(0, 3).map(s => `${s.name} ${pctText(s.pct)} (${fmt.money(distributable * s.pct / 100)} ${cur})`).join(', ')}.` });
      }
      const lossPeriods = periods.filter(p => p.cashOut > p.cashIn).length;
      if (periods.length >= 3 && lossPeriods > 0 && !(netProfit !== null && netProfit <= 0)) {
        infos.push({ label: 'Trend', color: '#2E86DE', text: `Cash out was higher than cash in in ${lossPeriods} of ${periods.length} periods.` });
      }
      base.insights = warns.concat(infos).slice(0, 4);
    }

    // ---- Row 3: the exact distribution record (newest first) ----
    const hist = dists.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    base.tables = [
      { title: 'Distribution History', summaryMaxRows: 6,
        columns: ['Date', 'Shareholder', 'Distribution %', `Amount (${cur})`, 'Status'],
        rows: hist.map(d => [dateFull(d.date), d.who, pctText(d.pct), fmt.money2(d.amt),
          d.status ? { v: d.status, tone: TONE[d.status] } : '—']),
        columnAlign: [null, null, 'right', 'right', null],
        totalsRow: ['TOTAL', plural(live.length, 'distribution'), '', fmt.money2(sumBy(live, d => d.amt)), ''],
        reconcile: false // the total leaves out cancelled rows that the table still lists, so rows != total by design
      }
    ];
    if (cancelled) {
      base.footer.notes = (base.footer.notes || []).concat([`${plural(cancelled, 'cancelled distribution is', 'cancelled distributions are')} listed but not counted in the total.`]);
    }

    // ---- Detailed PDF / Excel only (v3.19) ----
    // 1) How the distributable amount comes about.
    const calcRows = [], calcKinds = [];
    const addCalc = (kind, label, amount, basis) => {
      calcRows.push([label, amount === null ? (kind === 'section' || kind === 'note' ? '' : '—') : fmt.money2(amount), basis || '']);
      calcKinds.push(kind);
    };
    if (Array.isArray(i.calculation) && i.calculation.length) {
      const KINDS = ['line', 'subtotal', 'total', 'section', 'note', 'pct'];
      i.calculation.forEach(st => {
        if (!st || !st.label) return;
        addCalc(KINDS.indexOf(st.kind) >= 0 ? st.kind : 'line', String(st.label), hasNum(st.amount) ? Number(st.amount) : null, st.note ? String(st.note) : '');
      });
    } else if (netProfit !== null || distributable !== null || closing !== null || periods.length) {
      if (periods.length) {
        addCalc('line', 'Total cash in', totalIn, plural(periods.length, 'period') + ' of cash movements');
        addCalc('line', 'Less: total cash out', -totalOut, '');
      }
      const netDerived = periods.length && netProfit !== null && Math.abs(netProfit - (totalIn - totalOut)) <= 1;
      addCalc('subtotal', 'Net cash profit', netProfit,
        netProfit === null ? 'Not supplied' : (netDerived ? 'Cash in less cash out'
          : (periods.length ? 'As reported by the BMS (differs from cash in less cash out)' : 'As reported by the BMS')));
      addCalc('total', 'Distributable amount', distributable,
        distributable === null ? 'Not supplied'
          : `As reported by the BMS${netProfit !== null && netProfit > 0 ? ` (${fmt.pct(fmt.share(distributable, netProfit), 0)} of net cash profit)` : ''}`);
      addCalc('line', 'Closing cash', closing, closing === null ? 'Not supplied' : '');
      if (closing !== null && distributable !== null) {
        addCalc('subtotal', 'Closing cash less distributable amount', closing - distributable,
          closing >= distributable ? 'Cash covers the distributable amount' : 'Cash does not cover the distributable amount');
      }
      if (injected !== null) addCalc('line', 'Owner injections in the period (for reference)', injected, 'Shown separately; not added or subtracted in this table');
      if (dists.length) {
        addCalc('line', 'Distributions recorded (cancelled excluded)', sumBy(live, d => d.amt), plural(live.length, 'distribution'));
        if (pending.length) addCalc('line', 'of which still pending', sumBy(pending, d => d.amt), plural(pending.length, 'distribution'));
      }
    }
    base.tables = base.tables || [];
    if (calcRows.length) {
      base.tables.push({ title: 'Distributable Amount Calculation', sheetName: 'Calculation',
        columns: ['Step', `Amount (${cur})`, 'Basis'], rows: calcRows, rowKinds: calcKinds,
        columnAlign: [null, 'right', null], statement: true });
    }

    // 2) The ownership split against what has actually been recorded.
    if (shareholders.length) {
      const allPct = shareholders.every(s => s.pct !== null);
      const pctSum = sumBy(shareholders, s => s.pct);
      const known = new Set(shareholders.map(s => lower(s.name)));
      const stray = live.filter(d => !known.has(lower(d.who)));
      base.tables.push({ title: 'Shareholder Split', sheetName: 'Shareholders',
        columns: ['Shareholder', 'Ownership %', `Share of Distributable (${cur})`, `Recorded Distributions (${cur})`, `Of Which Pending (${cur})`],
        rows: shareholders.map(s => {
          const mine = live.filter(d => lower(d.who) === lower(s.name));
          return [s.name, pctText(s.pct), distributable !== null && s.pct !== null ? fmt.money2(distributable * s.pct / 100) : '—',
            fmt.money2(sumBy(mine, d => d.amt)), fmt.money2(sumBy(mine.filter(d => d.status === 'Pending'), d => d.amt))];
        }),
        columnAlign: [null, 'right', 'right', 'right', 'right'],
        totalsRow: ['TOTAL', allPct ? pctText(pctSum) : '—', distributable !== null && allPct ? fmt.money2(distributable * pctSum / 100) : '—',
          fmt.money2(sumBy(live, d => d.amt)), fmt.money2(sumBy(pending, d => d.amt))] });
      const notes = [];
      if (allPct && Math.abs(pctSum - 100) > 0.01) notes.push(`Ownership shares add up to ${pctText(pctSum)}, not 100%.`);
      if (stray.length) notes.push(`${plural(stray.length, 'distribution is', 'distributions are')} recorded for a shareholder who is not in the ownership list (${fmt.money2(sumBy(stray, d => d.amt))} ${cur}).`);
      if (notes.length) base.footer.notes = (base.footer.notes || []).concat(notes);
    }

    // 3) Cash in vs. cash out as exact figures (the chart shows only the shape).
    if (periods.length) {
      let labels = periods.map(p => p.label);
      if (!(Array.isArray(i.trend) && i.trend.length)) {
        const ds = asArr(i.daily).map(r => String((r && r.date) || '').slice(0, 10)).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
        if (ds.length) {
          const out = [], d = new Date(ds[0] + 'T00:00:00Z'), end = new Date(ds[ds.length - 1] + 'T00:00:00Z');
          while (d <= end) { out.push(shortDate(d.toISOString().slice(0, 10))); d.setUTCDate(d.getUTCDate() + 1); }
          if (out.length === periods.length) labels = out;
        }
      }
      const netCell = v => (v < 0 ? { v: fmt.money2(v), tone: 'bad' } : fmt.money2(v));
      base.tables.push({ title: 'Cash In vs. Cash Out by Period', sheetName: 'Cash In-Out',
        columns: ['Period', `Cash In (${cur})`, `Cash Out (${cur})`, `Net (${cur})`],
        rows: periods.map((p, k) => [labels[k], fmt.money2(p.cashIn), fmt.money2(p.cashOut), netCell(p.cashIn - p.cashOut)]),
        columnAlign: [null, 'right', 'right', 'right'],
        totalsRow: ['TOTAL', fmt.money2(totalIn), fmt.money2(totalOut), netCell(totalIn - totalOut)],
        additive: [1, 2, 3] });
      if (tot.netCashProfit !== undefined || hasNum(i.netCashProfit)) {
        base.checks = (base.checks || []).concat([{ label: 'Net cash profit: summary vs. cash in less cash out', expected: netProfit, actual: totalIn - totalOut }]);
      }
    }

    // 4) Owner injections, one line each.
    if (injections.length) {
      const inj = injections.slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
      base.tables.push({ title: 'Owner Injections', sheetName: 'Injections',
        columns: ['Date', 'Owner', `Amount (${cur})`],
        rows: inj.map(x => [dateFull(x.date), x.owner || '—', fmt.money2(x.amt)]),
        columnAlign: [null, null, 'right'],
        totalsRow: ['TOTAL', plural(inj.length, 'injection'), injected === null ? '—' : fmt.money2(injected)] });
    }

    // 5) Closing cash by channel — only when the page supplies it.
    const chan = (Array.isArray(i.closingCashByChannel) ? i.closingCashByChannel : []).filter(c => c && c.channel && hasNum(c.amount));
    if (chan.length) {
      base.tables.push({ title: 'Closing Cash by Channel', sheetName: 'Closing Cash',
        columns: ['Channel', `Closing Cash (${cur})`],
        rows: chan.map(c => [String(c.channel), Number(c.amount) < 0 ? { v: fmt.money2(c.amount), tone: 'bad' } : fmt.money2(c.amount)]),
        columnAlign: [null, 'right'],
        totalsRow: ['TOTAL', closing !== null ? fmt.money2(closing) : fmt.money2(sumBy(chan, c => c.amount))] });
      if (closing !== null) {
        base.checks = (base.checks || []).concat([{ label: 'Closing cash: summary vs. channel detail', expected: closing, actual: sumBy(chan, c => c.amount) }]);
      }
    }
    return base;
  };

  // ---------------------------------------------------------------
  // 13. DASHBOARD — "How is the whole business doing right now, across every module at
  //     once?"   Six KPIs (breadth, not depth) drawn as one tight row of six cards; a
  //     whole-business revenue trend, an expense-split donut (a real "where does our money
  //     go" question at business level), cross-module Key Insights, and a one-row-per-module
  //     summary table.
  //
  // input: {
  //   totals: { revenue, netProfit, grossProfit, cashBalance, outstanding, derkoshStock },
  //   previous?: { revenue, netProfit, grossProfit, cashBalance, outstanding, derkoshStock },
  //   previousLabel?: 'Aug',              // default 'last month'
  //   derkoshUnit?: 'pcs',                // unit shown on the Derkosh stock card
  //   derkoshDailySales?,                 // units sold per day -> "days of cover" insight
  //   revenueTrend?: [{ label:'Apr', amount }],           // revenue per period, or
  //   revenue?: [{ date:'2026-09-03', amount }],          // revenue per day (quiet days = 0)
  //   expenses?: [{ name:'Raw materials', amount }],      // where the money went (the donut)
  //   modules?: [{ name:'Sales', metric:'Total Revenue',  // one row per module, headline number
  //                value,                                   // a number, or text such as '12 items'
  //                unit?,                                   // default: the currency; '' for none
  //                previous?, lowerIsBetter?,               // drives the "vs. Prior" column
  //                status?: 'OK'|'Watch'|'Alert' | { text, tone } }],
  //   summaryRows?: 8                     // module rows on the summary page (rest: detailed PDF)
  //   expenseTrend?: [{ label, amount }]  // v3.29: expenses per period, matched to revenueTrend by label
  //   alerts?: [{ module, issue, detail, tone?:'bad'|'warn' }]   // v3.29: extra rows for Items Needing Attention
  //   totals.expenses?                    // v3.29: checked against the expense split
  //   productMix?: [{ name:'Injera', revenue, previousRevenue?, grossProfit? }, ...]   // v3.37: revenue by product, or the
  //   injeraRevenue?, derkoshRevenue?     //   shortcut for the two products (+ previousInjeraRevenue / previousDerkoshRevenue,
  //                                       //   injeraGrossProfit / derkoshGrossProfit). Gives the "Product mix" insight
  //                                       //   (e.g. Injera 78% · Derkosh 22%) and the detailed "Product Mix" table and chart.
  // }
  // Without `modules`, a short table is built from the six headline totals. A figure that is
  // not supplied shows as "—" rather than being guessed. Totals fall back to the revenue series
  // for revenue only.
  // ---------------------------------------------------------------
  presets.dashboard = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Dashboard', 'Business Dashboard');
    if (base.status === 'empty') return base;
    const cur = base.currency;
    const num = v => (hasNum(v) ? Number(v) : null);
    const T = i.totals || {};
    const P = i.previous || {};
    const prevLabel = i.previousLabel || 'last month';
    const unitD = i.derkoshUnit || 'pcs';
    // Large figures are shortened (12.5M) so six cards stay legible; everything else is exact.
    const big = v => (Math.abs(v) >= 10000000 ? `${fmt.n(v / 1000000, 1)}M` : fmt.money(v));

    // ---- revenue over time ----
    let tr = { labels: [], values: [] };
    if (Array.isArray(i.revenueTrend) && i.revenueTrend.length) {
      tr.labels = i.revenueTrend.map((p, k) => String(p.label !== undefined && p.label !== null ? p.label : k + 1));
      tr.values = i.revenueTrend.map(p => Number(p.amount !== undefined ? p.amount : p.value) || 0);
    } else if (Array.isArray(i.revenue) && i.revenue.length) {
      tr = dailySeries(i.revenue, r => r.date, r => r.amount);
    }

    const revenue = num(T.revenue) !== null ? num(T.revenue) : (tr.values.length ? sumBy(tr.values, v => v) : null);
    const net = num(T.netProfit), gross = num(T.grossProfit), cash = num(T.cashBalance);
    const ar = num(T.outstanding), stock = num(T.derkoshStock);
    const chg = (now, before) => (now !== null && num(before) !== null ? pctChg(now, num(before)) : null);
    const revChg = chg(revenue, P.revenue), netChg = chg(net, P.netProfit), grossChg = chg(gross, P.grossProfit);
    const cashChg = chg(cash, P.cashBalance), arChg = chg(ar, P.outstanding), stockChg = chg(stock, P.derkoshStock);
    const netMargin = net !== null && revenue ? fmt.share(net, revenue) : null;
    const grossMargin = gross !== null && revenue ? fmt.share(gross, revenue) : null;
    const arShare = ar !== null && revenue ? fmt.share(ar, revenue) : null;
    const vs = c => `${fmt.signedPct(c)} vs ${prevLabel}`;
    const up = c => (c === null ? undefined : (c >= 0 ? 'good' : 'warn'));
    const downIsGood = c => (c === null ? undefined : (c <= 0 ? 'good' : 'warn'));

    base.kpis = [
      { label: 'Total Revenue', value: revenue === null ? '—' : big(revenue), unit: revenue === null ? undefined : cur, color: '#1D5C38',
        delta: revChg !== null ? vs(revChg) : undefined, deltaTone: up(revChg) },
      { label: 'Net Profit', value: net === null ? '—' : big(net), unit: net === null ? undefined : cur, color: net !== null && net < 0 ? '#C0392B' : '#2E86DE',
        delta: netChg !== null ? vs(netChg) : (netMargin !== null ? `${fmt.pct(netMargin)} net margin` : undefined),
        deltaTone: netChg !== null ? up(netChg) : (netMargin !== null ? (netMargin >= 0 ? 'good' : 'warn') : undefined) },
      { label: 'Gross Profit', value: gross === null ? '—' : big(gross), unit: gross === null ? undefined : cur, color: '#C89B3C',
        delta: grossChg !== null ? vs(grossChg) : (grossMargin !== null ? `${fmt.pct(grossMargin)} gross margin` : undefined),
        deltaTone: grossChg !== null ? up(grossChg) : undefined },
      { label: 'Cash Balance', value: cash === null ? '—' : big(cash), unit: cash === null ? undefined : cur, color: cash !== null && cash < 0 ? '#C0392B' : '#1D5C38',
        delta: cashChg !== null ? vs(cashChg) : undefined, deltaTone: up(cashChg) },
      { label: 'Outstanding A/R', value: ar === null ? '—' : big(ar), unit: ar === null ? undefined : cur, color: '#8E44AD',
        delta: arChg !== null ? vs(arChg) : (arShare !== null ? `${fmt.pct(arShare, 0)} of revenue` : undefined),
        deltaTone: arChg !== null ? downIsGood(arChg) : undefined },
      { label: 'Derkosh Stock', value: stock === null ? '—' : qtyFmt(stock), unit: stock === null ? undefined : unitD, color: '#E67E22',
        delta: stockChg !== null ? vs(stockChg) : undefined }
    ];

    // ---- Row 2: revenue trend + expense split ----
    base.charts = [];
    if (tr.labels.length) {
      base.charts.push({ type: tr.labels.length >= 3 ? 'line' : 'bar', title: 'Revenue Trend',
        subtitle: `${cur} per ${Array.isArray(i.revenueTrend) && i.revenueTrend.length ? 'period' : 'day'}`,
        labels: tr.labels, values: tr.values, barColor: '#1D5C38' });
    }
    const spend = asArr(i.expenses).filter(e => e && Number(e.amount) > 0).map(e => ({ name: String(e.name || 'Other'), amount: Number(e.amount), count: 1 }))
      .sort((a, b) => b.amount - a.amount);
    const spendTotal = sumBy(spend, e => e.amount);
    if (spend.length >= 2) {
      const shown = topWithOther(spend, 6);
      base.charts.push({ type: 'doughnut', title: 'Expense Split', labels: shown.map(e => e.name), values: shown.map(e => e.amount),
        colors: PALETTE, centerLabel: { top: 'Total', value: big(spendTotal), bottom: cur } });
    }

    // ---- the module table ----
    const TONE_WORDS = [[/alert|bad|overdue|loss|critical|short|reorder|out of|over budget|miss/i, 'bad'],
      [/watch|warn|low|due|pending|rising|expiring|behind|at risk|under/i, 'warn'],
      [/ok|good|on track|healthy|profit|clear|paid|beat|on target|current/i, 'good']];
    const toneOfText = t => { const hit = TONE_WORDS.find(w => w[0].test(t)); return hit ? hit[1] : undefined; };
    let mods = asArr(i.modules).filter(m => m && m.name);
    if (!mods.length) {
      const auto = [
        ['Sales', 'Total Revenue', revenue, P.revenue, false],
        ['Profit & Loss', 'Net Profit', net, P.netProfit, false],
        ['Cash Flow', 'Cash Balance', cash, P.cashBalance, false],
        ['Customers', 'Outstanding A/R', ar, P.outstanding, true],
        ['Derkosh', 'Stock on Hand', stock, P.derkoshStock, false]
      ];
      mods = auto.filter(a => a[2] !== null).map(a => ({ name: a[0], metric: a[1], value: a[2], previous: a[3], lowerIsBetter: a[4],
        unit: a[0] === 'Derkosh' ? unitD : undefined }));
    }
    const modRows = mods.map(m => {
      const isNum = hasNum(m.value);
      const unit = m.unit === undefined ? cur : m.unit;
      const c = isNum && hasNum(m.previous) ? pctChg(Number(m.value), Number(m.previous)) : null;
      let vsCell = '—';
      if (c !== null) {
        const better = m.lowerIsBetter ? c < 0 : c > 0;
        vsCell = Math.abs(c) < 0.05 ? { v: fmt.signedPct(0), tone: 'muted' } : { v: fmt.signedPct(c), tone: better ? 'good' : 'warn' };
      }
      let st = '—';
      if (m.status && typeof m.status === 'object') st = { v: m.status.text, tone: m.status.tone };
      else if (m.status) st = { v: String(m.status), tone: toneOfText(String(m.status)) };
      return { name: m.name, tone: st && st.tone, row: [m.name, m.metric || '—', isNum ? (Number.isInteger(Number(m.value)) ? fmt.money(m.value) : fmt.n(m.value, 2)) : String(m.value === undefined || m.value === null ? '—' : m.value),
        unit || '', vsCell, st] };
    });

    // ---- Product mix (v3.37): revenue by product, as supplied by the page. Nothing is guessed. ----
    let mixRows = asArr(i.productMix).filter(p => p && p.name && hasNum(p.revenue) && Number(p.revenue) >= 0)
      .map(p => ({ name: String(p.name), rev: Number(p.revenue), prev: hasNum(p.previousRevenue) ? Number(p.previousRevenue) : null, gp: hasNum(p.grossProfit) ? Number(p.grossProfit) : null }));
    if (!mixRows.length) {
      mixRows = [['Injera', i.injeraRevenue, i.previousInjeraRevenue, i.injeraGrossProfit], ['Derkosh', i.derkoshRevenue, i.previousDerkoshRevenue, i.derkoshGrossProfit]]
        .filter(r => hasNum(r[1]) && Number(r[1]) >= 0)
        .map(r => ({ name: r[0], rev: Number(r[1]), prev: hasNum(r[2]) ? Number(r[2]) : null, gp: hasNum(r[3]) ? Number(r[3]) : null }));
    }
    mixRows.sort((a, b) => b.rev - a.rev || String(a.name).localeCompare(String(b.name)));
    const mixSum = sumBy(mixRows, r => r.rev);
    // When the total revenue is larger than the products listed, the rest is shown as "Other revenue" so shares foot to 100%.
    const mixOther = revenue !== null && revenue - mixSum > 1 ? revenue - mixSum : 0;
    const mixBase = mixSum + mixOther;
    const mixPrevAll = mixRows.length && mixRows.every(r => r.prev !== null) ? sumBy(mixRows, r => r.prev) : 0;
    const mixPrevBase = mixPrevAll > 0 && num(P.revenue) !== null && num(P.revenue) > mixPrevAll ? num(P.revenue) : mixPrevAll;
    const mixIns = (() => {
      const live = mixRows.filter(r => r.rev > 0);
      if (!live.length || !mixBase) return null;
      const parts = live.slice(0, 3).map(r => `${r.name} ${fmt.pct(fmt.share(r.rev, mixBase), 0)}`).join(' · ');
      let tail = '';
      if (mixPrevAll > 0) {
        const mv = mixRows.map(r => ({ name: r.name, d: fmt.share(r.rev, mixBase) - fmt.share(r.prev, mixPrevBase) }))
          .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))[0];
        if (mv && Math.abs(mv.d) >= 1) tail = ` ${mv.name} is ${mv.d > 0 ? 'up' : 'down'} ${fmt.n(Math.abs(mv.d), 1)} points on ${prevLabel}.`;
      }
      return { label: 'Mix', color: '#2E86DE', text: `Product mix: ${parts} of revenue${mixOther > 0 ? ' (the rest is other revenue)' : ''}.${tail}` };
    })();

    // ---- Key Insights — cross-module flags, warnings first ----
    if (i.insights) {
      base.insights = i.insights;
    } else {
      const warns = [], infos = [];
      if (arChg !== null && cashChg !== null && arChg > 0 && cashChg < 0) {
        warns.push({ label: 'Collections', color: '#C0392B', text: `Outstanding A/R is up ${fmt.pct(arChg)} while the cash balance is down ${fmt.pct(Math.abs(cashChg))} versus ${prevLabel} — money is being earned faster than it is collected.` });
      }
      if (net !== null && net < 0) {
        warns.push({ label: 'Loss', color: '#C0392B', text: `The business made a net loss of ${fmt.money(Math.abs(net))} ${cur} this period${revenue ? ` (${fmt.pct(Math.abs(netMargin))} of revenue)` : ''}.` });
      }
      if (arShare !== null && arShare >= 25 && !(arChg !== null && cashChg !== null && arChg > 0 && cashChg < 0)) {
        warns.push({ label: 'A/R', color: '#8E44AD', text: `Customers owe ${fmt.money(ar)} ${cur} — ${fmt.pct(arShare, 0)} of this period's revenue is still uncollected.` });
      }
      if (revChg !== null && revChg <= -10) {
        warns.push({ label: 'Revenue', color: '#C89B3C', text: `Revenue is down ${fmt.pct(Math.abs(revChg))} on ${prevLabel} (${fmt.money(P.revenue)} to ${fmt.money(revenue)} ${cur}).` });
      } else if (revChg !== null && revChg >= 10) {
        infos.push({ label: 'Revenue', color: '#1D5C38', text: `Revenue is up ${fmt.pct(revChg)} on ${prevLabel} (${fmt.money(P.revenue)} to ${fmt.money(revenue)} ${cur}).` });
      }
      const flagged = modRows.filter(m => m.tone === 'bad' || m.tone === 'warn');
      if (flagged.length) {
        const worst = flagged.filter(m => m.tone === 'bad').concat(flagged.filter(m => m.tone === 'warn'));
        warns.push({ label: 'Attention', color: '#C89B3C', text: `${plural(flagged.length, 'module needs', 'modules need')} attention: ${worst.slice(0, 3).map(m => m.name).join(', ')}${worst.length > 3 ? ` and ${worst.length - 3} more` : ''}.` });
      }
      if (hasNum(i.derkoshDailySales) && Number(i.derkoshDailySales) > 0 && stock !== null) {
        const cover = stock / Number(i.derkoshDailySales);
        if (cover < 7) warns.push({ label: 'Derkosh', color: '#E67E22', text: `Derkosh stock covers only about ${plural(Math.round(cover), 'day')} of sales at the current pace.` });
        else if (cover > 60) infos.push({ label: 'Derkosh', color: '#E67E22', text: `Derkosh stock is about ${Math.round(cover)} days of sales — production is running ahead of demand.` });
      }
      if (grossMargin !== null && netMargin !== null) {
        infos.push({ label: 'Margins', color: '#2E86DE', text: `Gross margin is ${fmt.pct(grossMargin)} and net margin ${fmt.pct(netMargin)} on ${fmt.money(revenue)} ${cur} of revenue.` });
      }
      if (spend.length >= 2 && fmt.share(spend[0].amount, spendTotal) >= 50) {
        infos.push({ label: 'Spending', color: '#2E86DE', text: `${spend[0].name} is ${fmt.pct(fmt.share(spend[0].amount, spendTotal), 0)} of all expenses (${fmt.money(spend[0].amount)} of ${fmt.money(spendTotal)} ${cur}).` });
      }
      // v3.37: the product mix always keeps one of the four slots (warnings still come first).
      const restIns = warns.concat(infos);
      base.insights = mixIns ? restIns.slice(0, 3).concat([mixIns]) : restIns.slice(0, 4);
    }

    // ---- Row 3: cross-module summary, one row per module ----
    base.tables = [
      { title: 'Cross-Module Summary', summaryMaxRows: hasNum(i.summaryRows) ? Number(i.summaryRows) : 8,
        columns: ['Module', 'Headline Metric', 'Value', 'Unit', 'vs. Prior', 'Status'],
        rows: modRows.map(m => m.row),
        columnAlign: [null, null, 'right', null, 'right', null] }
    ];

    // Detailed PDF / Excel only (v3.29): the headline figures against the prior period, exact expense
    // shares, revenue against expenses per period, and the items behind each cross-module flag.
    const fv = (v, unit) => (unit === cur ? fmt.n(v, 2) : qtyFmt(v));
    const heads = [['Total Revenue', revenue, P.revenue, cur, false], ['Net Profit', net, P.netProfit, cur, false],
      ['Gross Profit', gross, P.grossProfit, cur, false], ['Cash Balance', cash, P.cashBalance, cur, false],
      ['Outstanding A/R', ar, P.outstanding, cur, true], ['Derkosh Stock', stock, P.derkoshStock, unitD, false]].filter(h => h[1] !== null);
    if (heads.some(h => num(h[2]) !== null)) {
      base.tables.push({ title: `Headline Figures vs. ${prevLabel}`, sheetName: 'Headline Figures',
        columns: ['Figure', 'This Period', prevLabel, 'Change', 'Change %'],
        rows: heads.map(h => {
          const now = h[1], was = num(h[2]), unit = h[3];
          if (was === null) return [`${h[0]} (${unit})`, fv(now, unit), '—', '—', '—'];
          const d = now - was, ch = pctChg(now, was), better = h[4] ? d < 0 : d > 0, flat = Math.abs(d) < 0.005;
          return [`${h[0]} (${unit})`, fv(now, unit), fv(was, unit), flat ? fv(0, unit) : { v: `${d > 0 ? '+' : ''}${fv(d, unit)}`, tone: better ? 'good' : 'warn' },
            ch === null ? '—' : (flat ? fmt.signedPct(0) : { v: fmt.signedPct(ch), tone: better ? 'good' : 'warn' })];
        }),
        columnAlign: [null, 'right', 'right', 'right', 'right'] });
    }
    if (spend.length) {
      base.tables.push({ title: 'Expense Split', sheetName: 'Expense Split',
        columns: ['Expense', `Amount (${cur})`, '% of Expenses'],
        rows: spend.map(e => [e.name, fmt.money2(e.amount), fmt.pct(fmt.share(e.amount, spendTotal))]),
        columnAlign: [null, 'right', 'right'],
        totalsRow: ['TOTAL', fmt.money2(spendTotal), '100.0%'] });
      if (num(T.expenses) !== null) base.checks = (base.checks || []).concat([{ label: 'Total expenses: summary vs. expense split', expected: num(T.expenses), actual: spendTotal }]);
    }
    const expT = Array.isArray(i.expenseTrend) ? i.expenseTrend.filter(p => p && hasNum(p.amount !== undefined ? p.amount : p.value)) : [];
    if (expT.length && Array.isArray(i.revenueTrend) && i.revenueTrend.length) {
      const lab = (p, k) => String(p.label !== undefined && p.label !== null ? p.label : k + 1);
      const rv = new Map(), ex = new Map(), order = [];
      i.revenueTrend.forEach((p, k) => { const l = lab(p, k); if (!rv.has(l)) order.push(l); rv.set(l, (rv.get(l) || 0) + (Number(p.amount !== undefined ? p.amount : p.value) || 0)); });
      expT.forEach((p, k) => { const l = lab(p, k); if (!rv.has(l) && !ex.has(l)) order.push(l); ex.set(l, (ex.get(l) || 0) + Number(p.amount !== undefined ? p.amount : p.value)); });
      const both = order.filter(l => rv.has(l) && ex.has(l));
      base.tables.push({ title: 'Revenue vs. Expenses by Period', sheetName: 'Revenue vs Expenses',
        columns: ['Period', `Revenue (${cur})`, `Expenses (${cur})`, `Result (${cur})`, 'Result % of Revenue'],
        rows: order.map(l => {
          const r = rv.has(l) ? rv.get(l) : null, e = ex.has(l) ? ex.get(l) : null, d = r !== null && e !== null ? r - e : null;
          return [l, r === null ? '—' : fmt.money2(r), e === null ? '—' : fmt.money2(e),
            d === null ? '—' : (d < 0 ? { v: fmt.money2(d), tone: 'bad' } : fmt.money2(d)),
            d === null || !r ? '—' : fmt.pct(fmt.share(d, r))];
        }),
        columnAlign: [null, 'right', 'right', 'right', 'right'],
        totalsRow: ['TOTAL (periods with both)', fmt.money2(sumBy(both, l => rv.get(l))), fmt.money2(sumBy(both, l => ex.get(l))),
          fmt.money2(sumBy(both, l => rv.get(l) - ex.get(l))), sumBy(both, l => rv.get(l)) ? fmt.pct(fmt.share(sumBy(both, l => rv.get(l) - ex.get(l)), sumBy(both, l => rv.get(l)))) : '—'] });
      if (both.length >= 2) {
        base.charts.push({ type: 'bar', detailOnly: true, title: 'Revenue vs. Expenses', subtitle: `${cur} per period`, labels: both,
          series: [{ label: 'Revenue', values: both.map(l => rv.get(l)), color: '#1D5C38' }, { label: 'Expenses', values: both.map(l => ex.get(l)), color: '#C89B3C' }] });
      }
      if (both.length < order.length) {
        base.notes = (base.notes || []).concat([`${plural(order.length - both.length, 'period appears', 'periods appear')} in only one of the revenue and expense series and ${order.length - both.length === 1 ? 'is' : 'are'} left out of the totals and the chart.`]);
      }
    }

    // Items needing attention: every flagged module, the cross-module alerts with their figures, and the page's own alerts.
    const attn = [];
    modRows.filter(m => m.tone === 'bad' || m.tone === 'warn').sort((a, b) => (a.tone === 'bad' ? 0 : 1) - (b.tone === 'bad' ? 0 : 1)).forEach(m => {
      const val = m.row[2] + (m.row[3] && /^[\d,.\-]+$/.test(String(m.row[2])) ? ` ${m.row[3]}` : ''), vsT = m.row[4] && m.row[4].v ? ` (${m.row[4].v} vs. prior)` : '';
      attn.push([m.name, m.row[1], `${val}${vsT}`, m.row[5]]);
    });
    if (arChg !== null && cashChg !== null && arChg > 0 && cashChg < 0) {
      attn.push(['Customers / Cash Flow', 'Collections', `A/R ${fmt.money(P.outstanding)} to ${fmt.money(ar)} ${cur} (${fmt.signedPct(arChg)}); cash ${fmt.money(P.cashBalance)} to ${fmt.money(cash)} ${cur} (${fmt.signedPct(cashChg)})`, { v: 'Alert', tone: 'bad' }]);
    }
    if (net !== null && net < 0) attn.push(['Profit & Loss', 'Net loss', `${fmt.money(Math.abs(net))} ${cur}${revenue ? ` (${fmt.pct(Math.abs(netMargin))} of revenue)` : ''}`, { v: 'Alert', tone: 'bad' }]);
    if (revChg !== null && revChg <= -10 && !modRows.some(m => /^sales$/i.test(String(m.name)) && (m.tone === 'bad' || m.tone === 'warn'))) attn.push(['Sales', 'Revenue down', `${fmt.money(P.revenue)} to ${fmt.money(revenue)} ${cur} (${fmt.signedPct(revChg)})`, { v: 'Watch', tone: 'warn' }]);
    (Array.isArray(i.alerts) ? i.alerts : []).filter(a => a && (a.issue || a.detail)).forEach(a => {
      attn.push([String(a.module || '—'), String(a.issue || '—'), String(a.detail || '—'), a.tone === 'bad' ? { v: 'Alert', tone: 'bad' } : (a.tone === 'warn' ? { v: 'Watch', tone: 'warn' } : { v: 'Note', tone: 'muted' })]);
    });
    if (attn.length) {
      base.tables.push({ title: 'Items Needing Attention', sheetName: 'Attention', columns: ['Module', 'Item', 'Detail', 'Status'], rows: attn, columnAlign: [null, null, null, null] });
    }

    // Detailed PDF / Excel only (v3.37): the product mix as exact figures and a donut. Placed first among the detail tables.
    // Columns for the prior period and for gross profit appear only when every product carries them.
    if (mixRows.length && mixBase > 0) {
      const hasPrev = mixPrevAll > 0, hasGP = mixRows.every(r => r.gp !== null);
      const rowsMix = mixRows.map(r => ({ name: r.name, rev: r.rev, prev: r.prev, gp: r.gp }));
      if (mixOther > 0) rowsMix.push({ name: 'Other revenue', rev: mixOther, prev: null, gp: null });
      const mixTotal = sumBy(rowsMix, r => r.rev);
      const chgCell = d => (Math.abs(d) < 0.05 ? { v: '0.0 pts', tone: 'muted' } : { v: `${d > 0 ? '+' : ''}${fmt.n(d, 1)} pts`, tone: d > 0 ? 'good' : 'warn' });
      base.tables.splice(1, 0, { title: 'Product Mix', sheetName: 'Product Mix',
        columns: ['Product', `Revenue (${cur})`, '% of Revenue']
          .concat(hasPrev ? [`${prevLabel} Revenue (${cur})`, `${prevLabel} Share`, 'Share Change'] : [], hasGP ? [`Gross Profit (${cur})`, 'Margin'] : []),
        rows: rowsMix.map(r => [r.name, fmt.money2(r.rev), fmt.pct(fmt.share(r.rev, mixBase))].concat(
          hasPrev ? (r.prev === null ? ['—', '—', '—'] : [fmt.money2(r.prev), fmt.pct(fmt.share(r.prev, mixPrevBase)), chgCell(fmt.share(r.rev, mixBase) - fmt.share(r.prev, mixPrevBase))]) : [],
          hasGP ? (r.gp === null ? ['—', '—'] : [r.gp < 0 ? { v: fmt.money2(r.gp), tone: 'bad' } : fmt.money2(r.gp), r.rev > 0 ? fmt.pct(fmt.share(r.gp, r.rev)) : '—']) : [])),
        columnAlign: [null, 'right', 'right'].concat(hasPrev ? ['right', 'right', 'right'] : [], hasGP ? ['right', 'right'] : []),
        additive: [1],
        totalsRow: ['TOTAL', fmt.money2(mixTotal), '100.0%'].concat(
          hasPrev ? [mixOther > 0 ? '—' : fmt.money2(mixPrevAll), mixOther > 0 ? '—' : '100.0%', ''] : [],
          hasGP ? [mixOther > 0 ? '—' : fmt.money2(sumBy(rowsMix, r => r.gp)), mixOther > 0 ? '—' : (mixTotal ? fmt.pct(fmt.share(sumBy(rowsMix, r => r.gp), mixTotal)) : '—')] : []) });
      if (rowsMix.filter(r => r.rev > 0).length >= 2) {
        base.charts.push({ type: 'doughnut', detailOnly: true, title: 'Product Mix', subtitle: 'Share of revenue', labels: rowsMix.map(r => r.name), values: rowsMix.map(r => r.rev),
          colors: PALETTE, centerLabel: { top: 'Revenue', value: big(mixTotal), bottom: cur } });
      }
      if (revenue !== null) base.checks = (base.checks || []).concat([{ label: 'Total revenue: summary vs. product mix', expected: revenue, actual: mixTotal }]);
      if (mixOther > 0) {
        base.notes = (base.notes || []).concat([`${fmt.money(mixOther)} ${cur} of total revenue is not assigned to a product in the mix and is shown as "Other revenue".`]);
      }
    }
    return base;
  };

  // ===============================================================
  // STATEMENT-SHAPED MODULES (v3.5 onward) — Cash Flow, Profit & Loss, Budget
  // ---------------------------------------------------------------
  // v3.9: these three keep their formal statement (IAS 7 / IAS 2 / line-by-line variance) intact
  // but now follow the same page as every other module — KPI cards, one main chart, Key
  // Insights and a compact table on the summary page — and the detailed PDF opens with the
  // full statement, then trends, breakdowns, transactions and exceptions. Pass
  // layout:'statement' to any of them to get the old statement-only page (v3.5-v3.8).
  // The page supplies the figures; the preset owns the layout, subtotals, percentages and notes.
  // ===============================================================

  // In a statement a zero is an en dash (easier to scan than a column of 0.00); negatives go
  // with a minus sign, and the engine paints negative values red on statement tables.
  const stm = (v, d) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    if (Math.abs(n) < 0.005) return '–';
    return fmt.n(n, d === undefined ? 2 : d);
  };
  const sumVec = v => v.reduce((a, b) => a + b, 0);
  // Percentages follow the same rule as amounts: a minus sign for a negative (never "-0.0%").
  const stmPct = v => {
    const n = Number(v);
    if (!Number.isFinite(n)) return '—';
    const r = Number(n.toFixed(1));
    return r < 0 ? `-${Math.abs(r).toFixed(1)}%` : `${r.toFixed(1)}%`;
  };
  // Profit is green and loss is red: wraps a cell's text in a toned cell by the sign of `n`
  // (zero stays neutral). The engine turns it into coloured bold text; Excel/CSV get the text.
  const tc = (text, n) => (n > 0.004 ? { v: text, tone: 'good' } : (n < -0.004 ? { v: text, tone: 'bad' } : text));

  // ---------------------------------------------------------------
  // CASH FLOW — "Where did our cash actually come from and go, by channel, this month?"
  //   v3.9 summary page: Row 1 five KPI cards (Opening, Total Inflow, Total Outflow, Net Cash
  //   Flow, Closing); Row 2 an Inflow vs. Outflow chart by channel + Key Insights; Row 3 the
  //   channel table (Opening / Inflow / Outflow / Closing). The detailed PDF then prints the
  //   full IAS 7 Direct Method statement (opening -> operating / investing / financing ->
  //   closing, by channel), the trend charts, the inflow and outflow transaction tables, the
  //   opening-balance reconciliation and an exceptions table.
  //
  // input: {
  //   opening:   { cash, bank, mobile },              // this month's opening balance per channel
  //   operating: [{ label, cash, bank, mobile }],     // direct-method lines: receipts are POSITIVE,
  //   investing: [{ label, cash, bank, mobile }],     //   payments are NEGATIVE. A channel left out
  //   financing: [{ label, cash, bank, mobile }],     //   of a line counts as 0.
  //   previousClosing?: { cash, bank, mobile },       // last month's COMPUTED closing — enables the
  //                                                   //   reconciliation table
  //   closing?: { cash, bank, mobile },               // the page's own closing figure, cross-checked
  //                                                   //   against the statement's computed one
  //   previousLabel?: 'Aug',  tolerance?: 0.01        // ETB difference still counted as reconciled
  //   -- new in v3.9 (all optional; anything left out is simply not drawn) --
  //   previous?: { inflow, outflow }                  // last month's totals: adds "vs Aug" to those cards
  //   history?: [{ label:'Apr', inflow, outflow }]    // EARLIER months, oldest first (this month is added
  //                                                   //   automatically) -> detailed-PDF trend charts
  //   monthLabel?: 'Sep'                              // short name of this month on the trend charts
  //   inflows?:  [{ date, description, channel, amount, activity?, reference? }]   // transactions behind
  //   outflows?: [{ date, description, channel, amount, activity?, reference? }]   //   the statement
  //                                                   //   (amounts as positive numbers; activity is
  //                                                   //   'operating' | 'investing' | 'financing' and
  //                                                   //   adds the v3.30 "Cash Movements by Activity")
  //   largeThreshold?: 50000                          // one movement at/above this is listed as large
  //                                                   //   (default: 25% of that side's total)
  //   layout?: 'statement'                            // the old statement-only page (v3.5-v3.8)
  //   transfers?: [{ label, cash, bank, mobile }]     // v3.40: moves between the business's own channels
  //                                                   //   (money out of one pool is NEGATIVE, into the other
  //                                                   //   POSITIVE). Shown as section D, kept out of inflow /
  //                                                   //   outflow, and counted in each channel's closing balance.
  // }
  // The closing balance is always computed (opening + net movement) so the statement foots; if
  // the page supplies its own `closing` and it disagrees, a note says so rather than hiding it.
  // ---------------------------------------------------------------
  const CF_CHANNELS = [['cash', 'Cash'], ['bank', 'Bank'], ['mobile', 'Mobile']];

  presets.cashflow = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Cash Flow', 'Cash Flow Statement');
    if (base.status === 'empty') return base;
    const legacy = i.layout === 'statement';
    const cur = base.currency;
    const prevLabel = i.previousLabel || 'last month';
    const tol = hasNum(i.tolerance) ? Math.abs(Number(i.tolerance)) : 0.01;
    const chv = (o, k) => (o && hasNum(o[k]) ? Number(o[k]) : 0);
    const vec = o => CF_CHANNELS.map(([k]) => chv(o, k));
    const colSum = rows => CF_CHANNELS.map(([k]) => sumBy(rows, r => chv(r, k)));
    const listOf = a => (Array.isArray(a) ? a : []).filter(r => r && r.label);
    const money = v => fmt.n(v, 0);

    const opening = vec(i.opening);
    const rows = [], kinds = [];
    const push = (label, vals, kind, toned) => {
      const cell = v => (toned ? tc(stm(v), v) : stm(v));
      rows.push([label].concat(vals.map(cell), [cell(sumVec(vals))]));
      kinds.push(kind);
    };
    const section = label => { rows.push([label, '', '', '', '']); kinds.push('section'); };
    const noteRow = text => { rows.push([text, '', '', '', '']); kinds.push('note'); };

    push('Opening cash balance', opening, 'subtotal');
    const activities = [
      ['A. Operating activities', 'operating', 'Net cash from operating activities', 'No operating activity recorded this month'],
      ['B. Investing activities', 'investing', 'Net cash from investing activities', 'No investing activity recorded this month'],
      ['C. Financing activities', 'financing', 'Net cash from financing activities', 'No financing activity recorded this month']
    ];
    const nets = {};
    const allLines = [];
    activities.forEach(([title, key, netLabel, emptyText]) => {
      const list = listOf(i[key]);
      section(title);
      if (list.length) list.forEach(r => push(r.label, vec(r), 'line')); else noteRow(emptyText);
      nets[key] = colSum(list);
      push(netLabel, nets[key], 'subtotal');
      list.forEach(r => allLines.push(r));
    });
    // v3.40: moves between the business's own cash / bank / mobile pools. Not an activity under IAS 7:
    // they net to zero in total and only change which channel holds the cash, so they are shown in
    // their own section after C and are left out of inflow / outflow / the activity totals.
    const xferList = listOf(i.transfers);
    const xferNet = colSum(xferList);
    if (xferList.length) {
      section('D. Transfers between accounts');
      xferList.forEach(r => push(r.label, vec(r), 'line'));
      push('Net transfers between accounts', xferNet, 'subtotal');
    }
    const net = CF_CHANNELS.map((_, c) => nets.operating[c] + nets.investing[c] + nets.financing[c] + (xferList.length ? xferNet[c] : 0));
    const closing = CF_CHANNELS.map((_, c) => opening[c] + net[c]);
    push('Net change in cash', net, 'subtotal', true);
    push('CLOSING CASH BALANCE', closing, 'total');

    const head = ['Particulars'].concat(CF_CHANNELS.map(([, l]) => `${l} (${cur})`), [`Total (${cur})`]);
    const mainTable = { title: 'Cash Flow Statement', columns: head, rows, rowKinds: kinds,
      columnAlign: [null, 'right', 'right', 'right', 'right'] };

    // ---- per-channel reconciliation of the opening balance ----
    const pc = i.previousClosing && typeof i.previousClosing === 'object' ? i.previousClosing : null;
    let recon = null, reconTable = null;
    if (pc) {
      const per = CF_CHANNELS.map(([k, label], c) => {
        const have = hasNum(pc[k]);
        const diff = have ? opening[c] - Number(pc[k]) : null;
        return { label, have, prev: have ? Number(pc[k]) : null, open: opening[c], diff, ok: have && Math.abs(diff) <= tol };
      });
      const status = p => (!p.have ? { v: 'No prior data', tone: 'muted' } : (p.ok ? { v: 'Reconciled', tone: 'good' } : { v: 'Difference', tone: 'bad' }));
      const allHave = per.every(p => p.have);
      const sumPrev = sumBy(per, p => p.prev || 0);
      const sumDiff = sumBy(per, p => p.diff || 0);
      const allOk = allHave && per.every(p => p.ok);
      reconTable = {
        title: `Channel Reconciliation — Opening Balance vs. ${prevLabel} Closing`, sheetName: 'Reconciliation',
        columns: ['Channel', `Opening Balance (${cur})`, `${prevLabel} Closing (${cur})`, `Difference (${cur})`, 'Status'],
        rows: per.map(p => [p.label, stm(p.open), p.have ? stm(p.prev) : '—', p.have ? stm(p.diff) : '—', status(p)]),
        columnAlign: [null, 'right', 'right', 'right', null],
        totalsRow: ['TOTAL', stm(sumVec(opening)), allHave ? stm(sumPrev) : '—', allHave ? stm(sumDiff) : '—',
          allOk ? { v: 'Reconciled', tone: 'good' } : (allHave ? { v: 'Difference', tone: 'bad' } : { v: 'Incomplete', tone: 'muted' })]
      };
      recon = per;
    }

    // ---- totals used by the cards, the chart and the channel table ----
    const inflowBy = CF_CHANNELS.map(([k]) => sumBy(allLines, r => Math.max(chv(r, k), 0)));
    const outflowBy = CF_CHANNELS.map(([k]) => sumBy(allLines, r => Math.max(-chv(r, k), 0)));
    const inflowT = sumVec(inflowBy), outflowT = sumVec(outflowBy);
    const openT = sumVec(opening), closeT = sumVec(closing), netT = sumVec(net);
    const opTotal = sumVec(nets.operating);
    const chg = pctChg(closeT, openT);

    // ---- notes shared by both layouts ----
    const checks = [];
    CF_CHANNELS.forEach(([, label], c) => {
      if (closing[c] < -tol) checks.push({ label: 'Alert', color: '#C0392B',
        text: `${label} closing balance is negative (${fmt.n(closing[c], 2)} ${cur}) — check for an unrecorded receipt or a transfer between channels.` });
    });
    let reconOk = null;
    if (recon) {
      const off = recon.filter(p => p.have && !p.ok);
      if (off.length) {
        checks.push({ label: 'Check', color: '#C0392B',
          text: `Opening balance does not match ${prevLabel}'s closing for ${off.map(p => `${p.label} (${fmt.n(p.diff, 2)} ${cur})`).join(', ')}.` });
        reconOk = false;
      } else if (recon.every(p => p.have)) {
        reconOk = true;
      }
    }
    let closingBad = [];
    if (i.closing && typeof i.closing === 'object') {
      closingBad = CF_CHANNELS.map(([k, label], c) => ({ label, d: hasNum(i.closing[k]) ? Number(i.closing[k]) - closing[c] : 0 }))
        .filter(x => Math.abs(x.d) > tol);
      if (closingBad.length) checks.push({ label: 'Check', color: '#C0392B',
        text: `The closing balance reported for ${closingBad.map(x => `${x.label} (${fmt.n(x.d, 2)} ${cur})`).join(', ')} differs from the statement's computed closing balance.` });
    }
    const movement = Math.abs(closeT - openT) > tol
      ? { label: closeT < openT ? 'Cash' : 'Growth', color: closeT < openT ? '#C89B3C' : '#1D5C38',
          text: `Total cash ${closeT < openT ? 'fell' : 'rose'}${chg === null ? '' : ' ' + fmt.pct(Math.abs(chg))} over the month, from ${fmt.n(openT, 2)} to ${fmt.n(closeT, 2)} ${cur}.` }
      : null;
    const operating = opTotal < -tol
      ? { label: 'Watch', color: '#C89B3C', text: `Operating activities used ${fmt.n(Math.abs(opTotal), 2)} ${cur} of cash this month.` }
      : (opTotal > tol ? { label: 'Operating', color: '#1D5C38', text: `Operating activities generated ${fmt.n(opTotal, 2)} ${cur} of cash this month.` } : null);
    const topCh = closeT > tol ? CF_CHANNELS.map(([, label], c) => ({ label, v: closing[c] })).sort((a, b) => b.v - a.v)[0] : null;

    if (legacy) {
      // ---- the v3.5-v3.8 statement-only page ----
      base.tables = [mainTable];
      if (reconTable) base.tables.push(reconTable);
      base.layout = 'statement';
      base.statementTitle = 'Cash Flow Statement';
      base.statementBasis = `IAS 7 — Direct Method · ${base.period || 'this period'} · Amounts in ${cur}`;
      base.insightsTitle = 'Notes';
      if (i.insights) {
        base.insights = i.insights;
      } else {
        const notes = checks.slice();
        if (reconOk) notes.splice(checks.filter(n => /negative/.test(n.text)).length, 0, { label: 'Reconciled', color: '#1D5C38', text: `Opening balances for all three channels match ${prevLabel}'s computed closing balances.` });
        if (operating) notes.push(operating);
        if (movement) notes.push(movement);
        if (topCh && fmt.share(topCh.v, closeT) >= 60) notes.push({ label: 'Mix', color: '#2E86DE', text: `${topCh.label} holds ${fmt.pct(fmt.share(topCh.v, closeT), 0)} of closing cash.` });
        base.insights = notes.slice(0, 4);
      }
      base.footer.notes = (base.footer.notes || []).concat([
        'Receipts are positive amounts and payments are negative amounts (minus sign, shown in red). A dash means no movement.'
      ]);
      return base;
    }

    // ================= v3.9 layout =================
    const dateCell = d => (isoOk(d) ? shortDate(d) : (d ? String(d) : '—'));
    const chanLabel = s => {
      const t = String(s || '').trim().toLowerCase();
      if (/^cash|petty/.test(t)) return 'Cash';
      if (/bank|transfer|cheque|check|cbe|abyssinia|awash|dashen/.test(t)) return 'Bank';
      if (/mobile|telebirr|birr|wallet|momo|pesa/.test(t)) return 'Mobile';
      return null;
    };
    const actOf = s => {
      const t = String(s || '').trim().toLowerCase();
      return /^oper/.test(t) ? 'operating' : (/^inv/.test(t) ? 'investing' : (/^fin/.test(t) ? 'financing' : null));
    };
    const txOf = list => (Array.isArray(list) ? list : []).filter(r => r && hasNum(r.amount)).map(r => ({
      date: r.date, desc: String(r.description || r.label || '').trim(), ch: chanLabel(r.channel), rawCh: r.channel, amt: Math.abs(Number(r.amount)),
      act: actOf(r.activity), ref: r.reference ? String(r.reference) : ''
    })).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || b.amt - a.amt);
    const txIn = txOf(i.inflows), txOut = txOf(i.outflows);

    // ---- Row 1: five cards ----
    const prevIn = i.previous && hasNum(i.previous.inflow) ? Number(i.previous.inflow) : null;
    const prevOut = i.previous && hasNum(i.previous.outflow) ? Number(i.previous.outflow) : null;
    const vs = (now, was, upGood) => {
      const c = pctChg(now, was);
      return c === null ? {} : { delta: `${fmt.signedPct(c)} vs ${prevLabel}`, deltaTone: (upGood ? c >= 0 : c <= 0) ? 'good' : 'warn' };
    };
    base.kpis = [
      Object.assign({ label: 'Opening Cash Balance', value: money(openT), unit: cur, color: '#2D6A4F' },
        reconOk === true ? { delta: `Matches ${prevLabel} closing`, deltaTone: 'good' }
          : (reconOk === false ? { delta: `Differs from ${prevLabel} closing`, deltaTone: 'warn' } : {})),
      Object.assign({ label: 'Total Cash Inflow', value: money(inflowT), unit: cur, color: '#2E86DE' }, vs(inflowT, prevIn, true)),
      Object.assign({ label: 'Total Cash Outflow', value: money(outflowT), unit: cur, color: '#C0392B' }, vs(outflowT, prevOut, false)),
      { label: 'Net Cash Flow', value: money(netT), unit: cur, color: netT < 0 ? '#C0392B' : '#E67E22',
        delta: Math.abs(netT) <= tol ? 'No net movement' : (netT > 0 ? 'Cash increased' : 'Cash decreased'), deltaTone: netT >= 0 ? 'good' : 'warn' },
      { label: 'Closing Cash Balance', value: money(closeT), unit: cur, color: closeT < 0 ? '#C0392B' : '#2D6A4F',
        delta: chg === null ? undefined : `${fmt.signedPct(chg)} vs opening`, deltaTone: closeT >= openT ? 'good' : 'warn' }
    ];

    // ---- Row 2: chart + Key Insights ----
    // the story of the month in one picture: opening cash, then what operating, investing and
    // financing each added or took away, ending at closing cash (the same order as the IAS 7 statement)
    const invT = sumVec(nets.investing), finT = sumVec(nets.financing);
    const s1 = openT + opTotal, s2 = s1 + invT;
    const span = (a, b) => [Math.min(a, b), Math.max(a, b)];
    const sg = v => (Math.abs(v) < 0.005 ? '0' : (v > 0 ? '+' : '') + abbrNum(v, true));
    base.charts = [{ type: 'bar', style: 'clean', minimal: true, precise: true, title: 'From Opening to Closing Cash', subtitle: `${cur}, ${base.period || 'this period'}`,
      labels: ['Opening', 'Operating', 'Investing', 'Financing', 'Closing'],
      values: [openT, opTotal, invT, finT, closeT],
      ranges: [span(0, openT), span(openT, s1), span(s1, s2), span(s2, closeT), span(0, closeT)],
      labelTexts: [abbrNum(openT, true), sg(opTotal), sg(invT), sg(finT), abbrNum(closeT, true)],
      connectors: [openT, s1, s2, closeT],
      colors: ['#A9CDB9', opTotal >= 0 ? '#3FA37A' : '#E0634D', invT >= 0 ? '#3FA37A' : '#E0634D', finT >= 0 ? '#3FA37A' : '#E0634D', closeT < 0 ? '#C0392B' : '#14532D'] }];

    // detailed-only trend charts
    const hist = (Array.isArray(i.history) ? i.history : []).filter(h => h && hasNum(h.inflow) && hasNum(h.outflow));
    if (hist.length) {
      const m = String(base.period || '').match(/^[A-Za-z]{3}/);
      const curLabel = i.monthLabel || (m ? m[0] : 'This month');
      const labels = hist.map(h => String(h.label)).concat([curLabel]);
      const ins = hist.map(h => Number(h.inflow)).concat([inflowT]);
      const outs = hist.map(h => Number(h.outflow)).concat([outflowT]);
      // inflow rises above the baseline, outflow hangs below it, and the dark line is what was left
      const netBy = ins.map((v, k) => v - outs[k]);
      base.charts.push({ type: 'bar', style: 'clean', minimal: true, precise: true, stacked: true, detailOnly: true, title: 'Monthly Cash Flow',
        subtitle: `${cur} per month — inflow above the line, outflow below it, net cash flow written under each month`,
        labels: labels.map((l, k) => [l, (netBy[k] > 0 ? '+' : '') + abbrNum(netBy[k], true)]),
        series: [{ label: 'Inflow', values: ins, color: '#3FA37A' }, { label: 'Outflow', values: outs.map(v => -v), color: '#E0634D' }] });
    }
    base.charts.push({ type: 'bar', style: 'clean', minimal: true, precise: true, horizontal: true, detailOnly: true, title: 'Opening vs. Closing Cash by Channel',
      subtitle: cur, labels: CF_CHANNELS.map(([, l]) => l),
      series: [{ label: 'Opening', values: opening, color: '#BFD8C9' }, { label: 'Closing', values: closing, color: '#14532D' }] });
    base.detailChartsTitle = 'Trends';

    if (i.insights) {
      base.insights = i.insights;
    } else {
      const notes = checks.slice();
      if (movement) notes.push(movement);
      if (topCh) notes.push({ label: 'Channel', color: '#2E86DE',
        text: `${topCh.label} holds the most cash at the close: ${fmt.n(topCh.v, 2)} ${cur} (${fmt.pct(fmt.share(topCh.v, closeT), 0)} of the total).` });
      if (operating) notes.push(operating);
      if (reconOk) notes.push({ label: 'Reconciled', color: '#1D5C38', text: `Opening balances for all three channels match ${prevLabel}'s computed closing balances.` });
      base.insights = notes.slice(0, 4);
    }

    // ---- Row 3: the channel table ----
    const hasX = xferList.length > 0;
    const channelTable = {
      title: 'Cash Position by Channel', sheetName: 'Channel Summary',
      columns: ['Channel', `Opening (${cur})`, `Inflow (${cur})`, `Outflow (${cur})`].concat(hasX ? [`Transfers (${cur})`] : [], [`Closing (${cur})`]),
      rows: CF_CHANNELS.map(([, label], c) => [label, stm(opening[c]), stm(inflowBy[c]), stm(outflowBy[c])].concat(hasX ? [tc(stm(xferNet[c]), xferNet[c])] : [], [stm(closing[c])])),
      totalsRow: ['Total', stm(openT), stm(inflowT), stm(outflowT)].concat(hasX ? [stm(sumVec(xferNet))] : [], [stm(closeT)]),
      columnAlign: hasX ? [null, 'right', 'right', 'right', 'right', 'right'] : [null, 'right', 'right', 'right', 'right'],
      statement: true,
      additive: hasX ? [1, 2, 3, 4, 5] : [1, 2, 3, 4] // opening, inflow, outflow, transfers and closing all add up across channels
    };

    // ---- detailed PDF + Excel ----
    const fullStatement = Object.assign({}, mainTable, { title: 'Cash Flow Statement — IAS 7 Direct Method', sheetName: 'Cash Flow Statement', statement: true, beforeCharts: true });
    base.tables = [channelTable, fullStatement];

    const txTable = (title, list, what) => ({
      title, sheetName: what === 'Source' ? 'Inflows' : 'Outflows', columns: ['Date', `Description / ${what}`, 'Channel', `Amount (${cur})`],
      rows: list.map(t => [dateCell(t.date), t.desc || '—', t.ch || (t.rawCh ? String(t.rawCh) : '—'), stm(t.amt)]),
      totalsRow: ['TOTAL', '', '', stm(sumBy(list, t => t.amt))],
      columnAlign: [null, null, null, 'right']
    });
    // ---- v3.30: movement by date and channel, channel tie-out, and activity detail ----
    const allTx = txIn.map(t => Object.assign({ dir: 1 }, t)).concat(txOut.map(t => Object.assign({ dir: -1 }, t)));
    const chNames = CF_CHANNELS.map(([, l]) => l);
    const dayKey = t => (isoOk(t.date) ? String(t.date).slice(0, 10) : '');
    if (allTx.length) {
      // (a) every day with cash movement: net by channel, inflow, outflow, net and the running balance
      const days = Array.from(new Set(allTx.map(dayKey))).sort((a, b) => (a === '' ? 1 : (b === '' ? -1 : a.localeCompare(b))));
      const hasOther = allTx.some(t => !t.ch);
      let run = openT;
      const dRows = days.map(d => {
        const list = allTx.filter(t => dayKey(t) === d);
        const per = chNames.map(n => sumBy(list.filter(t => t.ch === n), t => t.dir * t.amt));
        const other = sumBy(list.filter(t => !t.ch), t => t.dir * t.amt);
        const dIn = sumBy(list.filter(t => t.dir > 0), t => t.amt), dOut = sumBy(list.filter(t => t.dir < 0), t => t.amt);
        run += dIn - dOut;
        return [d ? dateCell(d) : 'No date'].concat(per.map(v => tc(stm(v), v)), hasOther ? [tc(stm(other), other)] : [],
          [stm(dIn), stm(dOut), tc(stm(dIn - dOut), dIn - dOut), stm(run)]);
      });
      const perTot = chNames.map(n => sumBy(allTx.filter(t => t.ch === n), t => t.dir * t.amt));
      const otherTot = sumBy(allTx.filter(t => !t.ch), t => t.dir * t.amt);
      const tIn = sumBy(txIn, t => t.amt), tOut = sumBy(txOut, t => t.amt);
      base.tables.push({
        title: 'Cash Movement by Date and Channel', sheetName: 'Movement by Date',
        columns: ['Date'].concat(chNames.map(n => `${n} Net (${cur})`), hasOther ? [`Unassigned Net (${cur})`] : [], [`Inflow (${cur})`, `Outflow (${cur})`, `Net (${cur})`, `Running Balance (${cur})`]),
        rows: dRows,
        totalsRow: ['TOTAL'].concat(perTot.map(v => stm(v)), hasOther ? [stm(otherTot)] : [], [stm(tIn), stm(tOut), stm(tIn - tOut), '']),
        columnAlign: [null].concat(new Array(dRows[0].length - 1).fill('right'))
      });
      const undatedN = allTx.filter(t => !dayKey(t)).length;
      if (undatedN) base.notes = (base.notes || []).concat([`${plural(undatedN, 'cash movement has', 'cash movements have')} no valid date and ${undatedN === 1 ? 'is' : 'are'} listed last in the movement by date.`]);
      if (txIn.length && txOut.length) {
        base.checks = (base.checks || []).concat([{ label: 'Closing cash: opening + all dated movements vs. statement closing', expected: closeT, actual: openT + tIn - tOut }]);
      }
      if (hasOther) base.notes = (base.notes || []).concat([`${plural(allTx.filter(t => !t.ch).length, 'cash movement has', 'cash movements have')} no recognised channel and ${allTx.filter(t => !t.ch).length === 1 ? 'is' : 'are'} shown as Unassigned.`]);
      base.definitions = (base.definitions || []).concat([
        { term: 'Running balance', text: 'The opening cash balance plus every inflow and minus every outflow up to and including that day, across all channels.' }
      ]);

      // (b) the transaction lists tied back to each channel's inflow and outflow on the statement
      const hasIn = txIn.length > 0, hasOut = txOut.length > 0;
      const tie = [];
      chNames.forEach((n, c) => {
        const ti = sumBy(txIn.filter(t => t.ch === n), t => t.amt), to = sumBy(txOut.filter(t => t.ch === n), t => t.amt);
        tie.push({ n, ti, si: inflowBy[c], to, so: outflowBy[c] });
        if (hasIn) base.checks = (base.checks || []).concat([{ label: `${n} inflow: statement vs. transaction detail`, expected: inflowBy[c], actual: ti }]);
        if (hasOut) base.checks = (base.checks || []).concat([{ label: `${n} outflow: statement vs. transaction detail`, expected: outflowBy[c], actual: to }]);
      });
      const unIn = sumBy(txIn.filter(t => !t.ch), t => t.amt), unOut = sumBy(txOut.filter(t => !t.ch), t => t.amt);
      const tieRow = (n, ti, si, to, so, unknownStmt) => {
        const dI = hasIn && !unknownStmt ? ti - si : 0, dO = hasOut && !unknownStmt ? to - so : 0;
        const diff = unknownStmt ? null : dI - dO;
        return [n, hasIn ? stm(ti) : '—', hasIn && !unknownStmt ? stm(si) : '—', hasOut ? stm(to) : '—', hasOut && !unknownStmt ? stm(so) : '—',
          diff === null ? { v: 'Not on statement', tone: 'warn' } : (Math.abs(dI) <= 0.5 && Math.abs(dO) <= 0.5 ? { v: 'Matches', tone: 'good' } : { v: 'Differs', tone: 'bad' })];
      };
      const tieRows = tie.map(t => tieRow(t.n, t.ti, t.si, t.to, t.so, false));
      if (unIn || unOut) tieRows.push(tieRow('No recognised channel', unIn, 0, unOut, 0, true));
      base.tables.push({
        title: 'Transaction Detail vs. Statement by Channel', sheetName: 'Channel Tie-out',
        columns: ['Channel', `Inflow: Transactions (${cur})`, `Inflow: Statement (${cur})`, `Outflow: Transactions (${cur})`, `Outflow: Statement (${cur})`, 'Status'],
        rows: tieRows,
        columnAlign: [null, 'right', 'right', 'right', 'right', null]
      });

      // (c) the same movements grouped by activity, when the page marks each one
      if (allTx.some(t => t.act)) {
        const aRows = [], aKinds = [];
        const pad4 = label => [label, '', '', ''];
        let grand = 0, grandN = 0;
        activities.concat([['Not classified', null, null, null]]).forEach(([title, key]) => {
          const list = allTx.filter(t => (key ? t.act === key : !t.act))
            .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || b.amt - a.amt);
          if (!list.length) return;
          const sub = sumBy(list, t => t.dir * t.amt);
          aRows.push(pad4(title)); aKinds.push('section');
          list.forEach(t => {
            aRows.push([dateCell(t.date), (t.desc || '—') + (t.ref ? ` (${t.ref})` : ''), t.ch || (t.rawCh ? String(t.rawCh) : '—'), tc(stm(t.dir * t.amt), t.dir * t.amt)]);
            aKinds.push('line');
          });
          aRows.push(['Net ' + (key ? title.replace(/^[A-C]\. /, '').toLowerCase() : 'unclassified movements'), '', '', tc(stm(sub), sub)]); aKinds.push('subtotal');
          grand += sub; grandN += list.length;
          if (key) base.checks = (base.checks || []).concat([{ label: `${title.replace(/^[A-C]\. /, '')}: statement vs. transaction detail`, expected: sumVec(nets[key]), actual: sub }]);
        });
        aRows.push([`Net movement (${plural(grandN, 'record')})`, '', '', tc(stm(grand), grand)]); aKinds.push('total');
        base.tables.push({
          title: 'Cash Movements by Activity', sheetName: 'By Activity',
          columns: ['Date', 'Description / Source or Category', 'Channel', `Receipt / (Payment) (${cur})`],
          rows: aRows, rowKinds: aKinds, columnAlign: [null, null, null, 'right'], statement: true
        });
        const unc = allTx.filter(t => !t.act).length;
        if (unc) base.notes = (base.notes || []).concat([`${plural(unc, 'cash movement is', 'cash movements are')} not marked operating, investing or financing and ${unc === 1 ? 'is' : 'are'} listed as Not classified.`]);
      }
    }

    if (txIn.length) base.tables.push(txTable('Cash Inflows — Detail', txIn, 'Source'));
    if (txOut.length) base.tables.push(txTable('Cash Outflows — Detail', txOut, 'Category'));
    if (reconTable) base.tables.push(reconTable);

    // exceptions
    const exc = [];
    CF_CHANNELS.forEach(([, label], c) => {
      if (closing[c] < -tol) exc.push(['Negative balance', `${label} closing balance is below zero.`, stm(closing[c]), 'bad']);
    });
    if (recon) recon.filter(p => p.have && !p.ok).forEach(p =>
      exc.push(['Opening mismatch', `${p.label} opening balance differs from ${prevLabel}'s computed closing.`, stm(p.diff), 'bad']));
    closingBad.forEach(x => exc.push(['Closing mismatch', `Reported ${x.label} closing differs from the computed statement.`, stm(x.d), 'bad']));
    if (txIn.length && Math.abs(sumBy(txIn, t => t.amt) - inflowT) > Math.max(tol, 0.5)) {
      exc.push(['Detail mismatch', `Inflow transactions total ${fmt.n(sumBy(txIn, t => t.amt), 2)} but the statement shows ${fmt.n(inflowT, 2)}.`, stm(sumBy(txIn, t => t.amt) - inflowT), 'warn']);
    }
    if (txOut.length && Math.abs(sumBy(txOut, t => t.amt) - outflowT) > Math.max(tol, 0.5)) {
      exc.push(['Detail mismatch', `Outflow transactions total ${fmt.n(sumBy(txOut, t => t.amt), 2)} but the statement shows ${fmt.n(outflowT, 2)}.`, stm(sumBy(txOut, t => t.amt) - outflowT), 'warn']);
    }
    const incomplete = txIn.concat(txOut).filter(t => !t.ch || !t.desc).length;
    if (incomplete) exc.push(['Incomplete record', `${plural(incomplete, 'transaction')} ${incomplete === 1 ? 'has' : 'have'} no recognised channel or no description.`, '', 'warn']);
    [['Large inflow', txIn, inflowT], ['Large outflow', txOut, outflowT]].forEach(([type, list, total]) => {
      const limit = hasNum(i.largeThreshold) ? Number(i.largeThreshold) : (list.length >= 4 ? total * 0.25 : Infinity);
      list.filter(t => t.amt >= limit).sort((a, b) => b.amt - a.amt).slice(0, 3).forEach(t =>
        exc.push([type, `${t.desc || 'Unnamed movement'} (${t.ch || 'channel not set'}, ${dateCell(t.date)})`, stm(t.amt), 'info']));
    });
    base.tables.push({
      title: 'Exceptions and Unusual Movements', sheetName: 'Exceptions',
      columns: ['Type', 'Detail', `Amount (${cur})`],
      rows: exc.length ? exc.map(e => [{ v: e[0], tone: e[3] }, e[1], e[2]]) : [[{ v: 'None', tone: 'good' }, 'Nothing unusual was found for this period.', '']],
      columnAlign: [null, null, 'right']
    });

    base.footer.notes = (base.footer.notes || []).concat([
      'Cash flow counts money actually received and paid: a credit sale is not an inflow until it is collected. Loan principal is a financing outflow; loan interest is a P&L expense.'
    ]);
    return base;
  };

  // ---------------------------------------------------------------
  // PROFIT & LOSS — "Are we actually profitable this month, and where does the margin go?"
  //   v3.9 summary page: Row 1 six cards (Revenue, Cost of Goods Sold, Gross Profit, Operating
  //   Expenses, Net Profit, Net Margin); Row 2 a Revenue / Costs / Net Profit chart + Key
  //   Insights; Row 3 a compact P&L table (This Month, % of Revenue, Year-to-Date). The detailed
  //   PDF then prints the full statement, a period comparison, the trend and expense charts,
  //   the revenue breakdown by product, the expense breakdown and data notes.
  //   IAS 2 basis throughout: production overhead lives in cost of goods sold, never in
  //   operating expenses.
  //
  // input: {
  //   revenue: [{ label, month, ytd? }],    // e.g. Injera sales, Derkosh sales
  //   cogs:    [{ label, month, ytd? }],    // materials, direct labour AND production overhead
  //   opex:    [{ label, month, ytd? }],    // selling / admin / finance — NOT production overhead
  //   previous?: { revenue, grossProfit, netProfit },   // last month's totals — enables comparisons
  //   previousLabel?: 'Aug',  monthLabel?: 'This Month',  ytdLabel?: 'Year-to-Date'
  //   -- new in v3.9 (all optional; anything left out is simply not drawn) --
  //   history?: [{ label:'Apr', revenue, netProfit, grossProfit? }]   // EARLIER months, oldest first
  //                                          // (this month is added automatically) -> trend charts
  //   monthShort?: 'Sep'                     // short name of this month on the trend charts
  //   products?: [{ name:'Injera', revenue?, quantity?, unit?:'pcs', cogs? }]
  //                                          // revenue breakdown; quantity adds Quantity + Avg. Price,
  //                                          // cogs (on EVERY product) adds product gross profit
  //   transactions?: [{ line, section?:'revenue'|'cogs'|'opex', date, description, amount, reference? }]
  //                                          // v3.28: the records behind each statement line (detailed PDF / Excel)
  //   layout?: 'statement'                   // the old statement-only page (v3.5-v3.8)
  // }
  // Costs are entered and shown as positive amounts and deducted in the subtotals. The
  // Year-to-Date columns appear only when EVERY line carries a `ytd` figure — a half-filled
  // column would silently understate the totals, so it is left out (and a footer note says so).
  // An opex line whose label contains "overhead" is flagged: under IAS 2 it belongs in COGS.
  // Nothing is shown as zero when it is really unknown: no previous period -> no comparison,
  // no product costs -> no product margin, and the Data Notes table says so.
  // ---------------------------------------------------------------
  presets.pl = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Profit & Loss', 'Profit & Loss Statement');
    if (base.status === 'empty') return base;
    const legacy = i.layout === 'statement';
    const cur = base.currency;
    const prevLabel = i.previousLabel || 'last month';
    const mOf = r => (hasNum(r.month) ? Number(r.month) : (hasNum(r.amount) ? Number(r.amount) : 0));
    const yOf = r => (hasNum(r.ytd) ? Number(r.ytd) : 0);
    const lines = k => (Array.isArray(i[k]) ? i[k] : []).filter(r => r && r.label);
    const rev = lines('revenue'), cogs = lines('cogs'), opex = lines('opex');
    const everyLine = rev.concat(cogs, opex);
    const hasYtd = everyLine.length > 0 && everyLine.every(r => hasNum(r.ytd));
    const partialYtd = !hasYtd && everyLine.some(r => hasNum(r.ytd));

    const revM = sumBy(rev, mOf), revY = sumBy(rev, yOf);
    const cogsM = sumBy(cogs, mOf), cogsY = sumBy(cogs, yOf);
    const opexM = sumBy(opex, mOf), opexY = sumBy(opex, yOf);
    const gpM = revM - cogsM, gpY = revY - cogsY;
    const npM = gpM - opexM, npY = gpY - opexY;
    const pc = (v, whole) => (whole ? stmPct(fmt.share(v, whole)) : '—');

    const rows = [], kinds = [];
    // `toned` colours the row green (profit) or red (loss) — used for gross and net profit only
    const add = (label, m, y, kind, toned, sink) => {
      const t = (text, n) => (toned ? tc(text, n) : text);
      const r = [t(label, m), t(stm(m), m), t(pc(m, revM), m), hasYtd ? t(stm(y), y) : '', hasYtd ? t(pc(y, revY), y) : ''];
      if (sink) { sink.rows.push(r); sink.kinds.push(kind); } else { rows.push(r); kinds.push(kind); }
    };
    const section = label => { rows.push([label, '', '', '', '']); kinds.push('section'); };
    const noteRow = text => { rows.push([text, '', '', '', '']); kinds.push('note'); };
    const margin = (label, m, y) => {
      rows.push([label, tc(pc(m, revM), revM ? m : 0), '', hasYtd ? tc(pc(y, revY), revY ? y : 0) : '', '']);
      kinds.push('pct');
    };
    const block = (title, list, totalLabel, totM, totY, emptyText) => {
      section(title);
      if (list.length) list.forEach(r => add(r.label, mOf(r), yOf(r), 'line')); else noteRow(emptyText);
      add(totalLabel, totM, totY, 'subtotal');
    };

    block('Revenue', rev, 'Total revenue', revM, revY, 'No revenue recorded this month');
    block('Cost of goods sold (IAS 2 — includes production overhead)', cogs, 'Total cost of goods sold', cogsM, cogsY, 'No cost of goods sold recorded this month');
    add(gpM < 0 ? 'GROSS LOSS' : 'GROSS PROFIT', gpM, gpY, 'subtotal', true);
    margin('Gross profit margin', gpM, gpY);
    block('Operating expenses', opex, 'Total operating expenses', opexM, opexY, 'No operating expenses recorded this month');
    add(npM < 0 ? 'NET LOSS' : 'NET PROFIT', npM, npY, 'total', true);
    margin('Net profit margin', npM, npY);
    rows.push(['IAS 2 basis: overhead is in COGS, not OpEx.', '', '', '', '']);
    kinds.push('note');

    const head = ['Particulars', `${i.monthLabel || 'This Month'} (${cur})`, '% of Revenue'];
    if (hasYtd) head.push(`${i.ytdLabel || 'Year-to-Date'} (${cur})`, '% of Revenue');
    const cut = r => (hasYtd ? r : r.slice(0, 3));
    const align = hasYtd ? [null, 'right', 'right', 'right', 'right'] : [null, 'right', 'right'];
    const fullTable = { title: 'Profit & Loss Statement', columns: head, rows: rows.map(cut), rowKinds: kinds, columnAlign: align };

    // ---- previous period (totals only; costs are derived from them) ----
    const pv = i.previous && typeof i.previous === 'object' ? i.previous : null;
    const pRev = pv && hasNum(pv.revenue) ? Number(pv.revenue) : null;
    const pGp = pv && hasNum(pv.grossProfit) ? Number(pv.grossProfit) : null;
    const pNp = pv && hasNum(pv.netProfit) ? Number(pv.netProfit) : null;
    const pCogs = pRev !== null && pGp !== null ? pRev - pGp : null;
    const pOpex = pGp !== null && pNp !== null ? pGp - pNp : null;
    const gmNow = revM > 0 ? fmt.share(gpM, revM) : null, nmNow = revM > 0 ? fmt.share(npM, revM) : null;
    const gmWas = pRev ? fmt.share(pGp, pRev) : null, nmWas = pRev && pNp !== null ? fmt.share(pNp, pRev) : null;

    // ---- notes ----
    const ohd = opex.find(r => /overhead/i.test(r.label));
    const costs = cogs.map(r => ({ label: r.label, v: mOf(r) })).concat(opex.map(r => ({ label: r.label, v: mOf(r) }))).sort((a, b) => b.v - a.v);
    const checkNote = ohd ? { label: 'Check', color: '#C0392B',
      text: `"${ohd.label}" is listed under operating expenses. Under IAS 2, production overhead belongs in cost of goods sold, so gross profit may be overstated.` } : null;
    const profitNote = (revM > 0 || npM !== 0)
      ? (npM < 0 ? { label: 'Loss', color: '#C0392B',
          text: `The business made a net loss of ${fmt.n(Math.abs(npM), 2)} ${cur} this month${revM ? ` (${fmt.pct(Math.abs(fmt.share(npM, revM)))} of revenue)` : ''}.` }
        : { label: 'Profit', color: '#1D5C38',
          text: `Net profit is ${fmt.n(npM, 2)} ${cur}${revM ? `, ${fmt.pct(fmt.share(npM, revM))} of revenue` : ''}.` })
      : null;
    const costNote = (revM > 0 && costs.length && costs[0].v > 0)
      ? { label: 'Cost', color: '#2E86DE', text: `${costs[0].label} is the largest cost at ${fmt.pct(fmt.share(costs[0].v, revM))} of revenue.` } : null;
    const ytdNote = (hasYtd && revY > 0)
      ? { label: 'YTD', color: '#8E44AD', text: `Year to date, ${npY < 0 ? 'the net loss is ' + fmt.n(Math.abs(npY), 2) : 'net profit is ' + fmt.n(npY, 2)} ${cur} (${fmt.pct(fmt.share(npY, revY))} of revenue).` } : null;
    const rc = pctChg(revM, pRev);
    const npc = pNp !== null && pNp > 0 ? pctChg(npM, pNp) : null;
    const marginNote = (gmNow !== null && gmWas !== null && Math.abs(gmNow - gmWas) >= 0.1)
      ? { label: gmNow < gmWas ? 'Margin' : 'Growth', color: gmNow < gmWas ? '#C89B3C' : '#1D5C38',
          text: `Gross margin is ${fmt.pct(gmNow)}, ${gmNow < gmWas ? 'down' : 'up'} ${Math.abs(gmNow - gmWas).toFixed(1)} points from ${fmt.pct(gmWas)} in ${prevLabel}.` } : null;

    if (legacy) {
      base.tables = [fullTable];
      base.layout = 'statement';
      base.statementTitle = 'Profit & Loss Statement';
      base.statementBasis = `IAS 2 basis — overhead is part of cost of goods sold · ${base.period || 'this period'} · Amounts in ${cur}`;
      base.insightsTitle = 'Notes';
      if (i.insights) {
        base.insights = i.insights;
      } else {
        const notes = [];
        if (checkNote) notes.push(checkNote);
        if (profitNote) notes.push(profitNote);
        if (rc !== null) notes.push({ label: rc < 0 ? 'Watch' : 'Revenue', color: rc < 0 ? '#C89B3C' : '#1D5C38',
          text: `Revenue is ${rc >= 0 ? 'up' : 'down'} ${fmt.pct(Math.abs(rc))} versus ${prevLabel} (${fmt.n(revM, 2)} ${cur}).` });
        if (marginNote) notes.push(marginNote);
        if (costNote) notes.push(costNote);
        if (ytdNote) notes.push(ytdNote);
        base.insights = notes.slice(0, 4);
      }
      base.footer.notes = (base.footer.notes || []).concat([
        'Costs are shown as positive amounts and deducted in the subtotals. Percentages are of total revenue. Profit is green and loss is red.'
      ].concat(partialYtd ? ['Year-to-Date columns are omitted because not every line had a year-to-date figure.'] : []));
      return base;
    }

    // ================= v3.9 layout =================
    const money = v => fmt.n(v, 0);
    const lossGood = (v) => (v < 0 ? '#C0392B' : '#1D5C38');
    const vsPrev = (now, was, upGood) => {
      const c = pctChg(now, was);
      return c === null ? null : { delta: `${fmt.signedPct(c)} vs ${prevLabel}`, deltaTone: (upGood ? c >= 0 : c <= 0) ? 'good' : 'warn' };
    };
    const ofRev = v => (revM > 0 ? { delta: `${fmt.pct(fmt.share(v, revM))} of revenue` } : {});
    base.kpis = [
      Object.assign({ label: 'Revenue', value: money(revM), unit: cur, color: '#2D6A4F' }, vsPrev(revM, pRev, true) || {}),
      Object.assign({ label: 'Cost of Goods Sold', value: money(cogsM), unit: cur, color: '#C89B3C' }, vsPrev(cogsM, pCogs, false) || ofRev(cogsM)),
      Object.assign({ label: gpM < 0 ? 'Gross Loss' : 'Gross Profit', value: money(gpM), unit: cur, color: lossGood(gpM) },
        gmNow !== null ? { delta: `${fmt.pct(gmNow)} gross margin`, deltaTone: gpM >= 0 ? 'good' : 'warn' } : {}),
      Object.assign({ label: 'Operating Expenses', value: money(opexM), unit: cur, color: '#E67E22' }, vsPrev(opexM, pOpex, false) || ofRev(opexM)),
      Object.assign({ label: npM < 0 ? 'Net Loss' : 'Net Profit', value: money(npM), unit: cur, color: lossGood(npM) },
        vsPrev(npM, pNp !== null && pNp > 0 ? pNp : null, true) || (nmNow !== null ? { delta: `${fmt.pct(nmNow)} of revenue`, deltaTone: npM >= 0 ? 'good' : 'warn' } : {})),
      Object.assign({ label: 'Net Margin', value: nmNow === null ? '—' : fmt.pct(nmNow), color: '#8E44AD' },
        nmNow !== null && nmWas !== null ? { delta: `${nmNow - nmWas >= 0 ? '+' : '-'}${Math.abs(nmNow - nmWas).toFixed(1)} pts vs ${prevLabel}`, deltaTone: nmNow >= nmWas ? 'good' : 'warn' } : {})
    ];

    // a waterfall: revenue steps down through costs to gross profit, then through operating
    // expenses to net profit — shows where the money went instead of five unrelated bars
    const span = (a, b) => [Math.min(a, b), Math.max(a, b)];
    base.charts = [{ type: 'bar', style: 'clean', minimal: true, precise: true, title: 'Revenue, Costs and Net Profit', subtitle: `${cur}, ${base.period || 'this period'}`,
      labels: ['Revenue', 'Cost of goods sold', gpM < 0 ? 'Gross loss' : 'Gross profit', 'Operating expenses', npM < 0 ? 'Net loss' : 'Net profit'],
      values: [revM, -cogsM, gpM, -opexM, npM],
      ranges: [span(0, revM), span(revM, gpM), span(0, gpM), span(gpM, npM), span(0, npM)],
      labelValues: [revM, -cogsM, gpM, -opexM, npM],
      connectors: [revM, gpM, gpM, npM],
      colors: ['#14532D', '#E2A93B', gpM < 0 ? '#C0392B' : '#3FA37A', '#E8825F', npM < 0 ? '#C0392B' : '#14532D'] }];

    // detailed-only charts: monthly trend, gross vs net, expense split
    const hist = (Array.isArray(i.history) ? i.history : []).filter(h => h && hasNum(h.revenue) && hasNum(h.netProfit));
    const mm = String(base.period || '').match(/^[A-Za-z]{3}/);
    const curShort = i.monthShort || (mm ? mm[0] : 'This month');
    if (hist.length) {
      const labels = hist.map(h => String(h.label)).concat([curShort]);
      // revenue as bars (left axis) with net profit as a line on its own right-hand axis, because
      // profit is a fraction of revenue and would otherwise be squashed flat along the bottom
      base.charts.push({ type: 'bar', style: 'clean', detailOnly: true, title: 'Revenue and Net Profit Trend', subtitle: `${cur} per month — revenue (bars, left axis), net profit (line, right axis)`, labels,
        labelSeries: [1],
        series: [{ label: 'Revenue', type: 'bar', values: hist.map(h => Number(h.revenue)).concat([revM]), color: '#A9D6BC' },
                 { label: 'Net profit', type: 'line', axis: 'right', values: hist.map(h => Number(h.netProfit)).concat([npM]), color: '#1B4332' }] });
      if (hist.every(h => hasNum(h.grossProfit))) {
        base.charts.push({ type: 'bar', style: 'clean', minimal: true, precise: true, detailOnly: true, title: 'Gross Profit vs. Net Profit', subtitle: `${cur} per month`, labels,
          series: [{ label: 'Gross profit', values: hist.map(h => Number(h.grossProfit)).concat([gpM]), color: '#A9CDB9' },
                   { label: 'Net profit', values: hist.map(h => Number(h.netProfit)).concat([npM]), color: '#14532D' }] });
      }
    }
    const costGroups = costs.filter(c => c.v > 0).map(c => ({ name: c.label, amount: c.v, count: 1 }));
    if (costGroups.length >= 2) {
      const shown = topWithOther(costGroups, 6);
      const costTotal = sumBy(shown, c => c.amount);
      base.charts.push({ type: 'doughnut', style: 'clean', detailOnly: true, title: 'Where the Money Went', subtitle: 'Share of total costs',
        labels: shown.map(c => `${c.name} · ${fmt.pct(fmt.share(c.amount, costTotal), 0)}`), values: shown.map(c => c.amount),
        colors: ['#14532D', '#3FA37A', '#A9CDB9', '#E2A93B', '#E8825F', '#8FB8A0'], centerLabel: { top: 'Total costs', value: money(cogsM + opexM), bottom: cur } });
    }
    base.detailChartsTitle = 'Trends and Breakdowns';

    // Key Insights
    if (i.insights) {
      base.insights = i.insights;
    } else {
      const notes = [];
      if (checkNote) notes.push(checkNote);
      if (profitNote) notes.push(profitNote);
      if (rc !== null || npc !== null) {
        const parts = [];
        if (rc !== null) parts.push(`Revenue is ${rc >= 0 ? 'up' : 'down'} ${fmt.pct(Math.abs(rc))}`);
        if (npc !== null) parts.push(`${rc !== null ? 'net profit' : 'Net profit'} is ${npc >= 0 ? 'up' : 'down'} ${fmt.pct(Math.abs(npc))}`);
        const bad = (rc !== null && rc < 0) || (npc !== null && npc < 0);
        notes.push({ label: bad ? 'Watch' : 'Revenue', color: bad ? '#C89B3C' : '#1D5C38', text: `${parts.join(' and ')} versus ${prevLabel}.` });
      }
      if (costNote) notes.push(costNote);
      if (marginNote) notes.push(marginNote);
      if (ytdNote) notes.push(ytdNote);
      base.insights = notes.slice(0, 4);
    }

    // Row 3: compact table
    const compact = { rows: [], kinds: [] };
    add('Revenue', revM, revY, 'line', false, compact);
    add('Cost of goods sold', cogsM, cogsY, 'line', false, compact);
    add(gpM < 0 ? 'GROSS LOSS' : 'GROSS PROFIT', gpM, gpY, 'subtotal', true, compact);
    add('Operating expenses', opexM, opexY, 'line', false, compact);
    add(npM < 0 ? 'NET LOSS' : 'NET PROFIT', npM, npY, 'total', true, compact);
    const compactTable = { title: 'Key Lines', columns: head, rows: compact.rows.map(cut), rowKinds: compact.kinds, columnAlign: align, statement: true };

    // ---- detailed tables ----
    const full = Object.assign({}, fullTable, { title: 'Profit & Loss Statement — IAS 2 Basis', sheetName: 'P&L Statement', statement: true, beforeCharts: true });
    base.tables = [compactTable, full];

    // period comparison
    if (pRev !== null && pGp !== null && pNp !== null) {
      const cmp = [], ck = [];
      const chgCell = (now, was, kind) => {
        const d = now - was;
        const good = kind === 'cost' ? d <= 0 : d >= 0;
        const text = stm(d);
        return Math.abs(d) < 0.005 ? text : { v: text, tone: good ? 'good' : 'bad' };
      };
      const pcell = (now, was, kind) => {
        const c = pctChg(now, was);
        if (c === null) return 'n/a';
        const text = fmt.signedPct(c);
        return Math.abs(now - was) < 0.005 ? text : { v: text, tone: (kind === 'cost' ? now - was <= 0 : now - was >= 0) ? 'good' : 'bad' };
      };
      const line = (label, now, was, kind, rowKind) => { cmp.push([label, stm(now), stm(was), chgCell(now, was, kind), pcell(now, was, kind)]); ck.push(rowKind || 'line'); };
      line('Revenue', revM, pRev, 'profit');
      line('Cost of goods sold', cogsM, pCogs, 'cost');
      line(gpM < 0 ? 'Gross loss' : 'Gross profit', gpM, pGp, 'profit', 'subtotal');
      line('Operating expenses', opexM, pOpex, 'cost');
      line(npM < 0 ? 'Net loss' : 'Net profit', npM, pNp, 'profit', 'total');
      if (gmNow !== null && gmWas !== null) { cmp.push(['Gross margin', fmt.pct(gmNow), fmt.pct(gmWas), `${gmNow - gmWas >= 0 ? '+' : '-'}${Math.abs(gmNow - gmWas).toFixed(1)} pts`, '']); ck.push('pct'); }
      if (nmNow !== null && nmWas !== null) { cmp.push(['Net margin', fmt.pct(nmNow), fmt.pct(nmWas), `${nmNow - nmWas >= 0 ? '+' : '-'}${Math.abs(nmNow - nmWas).toFixed(1)} pts`, '']); ck.push('pct'); }
      base.tables.push({ title: `Period Comparison — vs. ${prevLabel}`, columns: ['Item', `This Month (${cur})`, `${prevLabel} (${cur})`, `Change (${cur})`, 'Change %'],
        rows: cmp, rowKinds: ck, columnAlign: [null, 'right', 'right', 'right', 'right'], statement: true });
    }

    // revenue breakdown
    const prodIn = Array.isArray(i.products) ? i.products.filter(p => p && p.name) : [];
    const prods = (prodIn.length ? prodIn : rev.map(r => ({ name: r.label, revenue: mOf(r) }))).map(p => {
      const line = rev.find(r => String(r.label).toLowerCase().startsWith(String(p.name).toLowerCase()));
      return { name: String(p.name), revenue: hasNum(p.revenue) ? Number(p.revenue) : (line ? mOf(line) : null),
        qty: hasNum(p.quantity) ? Number(p.quantity) : null, unit: p.unit ? String(p.unit) : '', cogs: hasNum(p.cogs) ? Number(p.cogs) : null };
    }).filter(p => p.revenue !== null);
    let productCostMissing = false;
    if (prods.length) {
      const withQty = prods.every(p => p.qty !== null && p.qty > 0);
      const withCost = prods.every(p => p.cogs !== null);
      productCostMissing = !withCost;
      const totRev = sumBy(prods, p => p.revenue);
      const cols = ['Product', `Revenue (${cur})`, 'Share'];
      if (withQty) cols.push('Quantity Sold', `Avg. Price (${cur})`);
      if (withCost) cols.push(`COGS (${cur})`, `Gross Profit (${cur})`, 'Margin');
      const mk = p => {
        const r = [p.name, stm(p.revenue), stmPct(fmt.share(p.revenue, totRev))];
        if (withQty) r.push(`${qtyFmt(p.qty)}${p.unit ? ' ' + p.unit : ''}`, `${fmt.n(p.revenue / p.qty, 2)}${p.unit ? ' / ' + p.unit : ''}`);
        if (withCost) { const g = p.revenue - p.cogs; r.push(stm(p.cogs), tc(stm(g), g), p.revenue ? tc(stmPct(fmt.share(g, p.revenue)), g) : '—'); }
        return r;
      };
      const tot = ['TOTAL', stm(totRev), '100.0%'];
      if (withQty) tot.push('', '');
      if (withCost) { const c = sumBy(prods, p => p.cogs), g = totRev - c; tot.push(stm(c), stm(g), totRev ? stmPct(fmt.share(g, totRev)) : '—'); }
      base.tables.push({ title: 'Revenue Breakdown by Product', columns: cols, rows: prods.map(mk), totalsRow: tot,
        columnAlign: [null].concat(cols.slice(1).map(() => 'right')), statement: true });
    }

    // expense breakdown
    if (cogs.length || opex.length) {
      const totC = cogsM + opexM;
      const erow = (type, r) => [r.label, type, stm(mOf(r)), pc(mOf(r), revM), totC ? stmPct(fmt.share(mOf(r), totC)) : '—'];
      base.tables.push({ title: 'Expense Breakdown',
        columns: ['Expense', 'Type', `Amount (${cur})`, '% of Revenue', '% of Total Costs'],
        rows: cogs.map(r => erow('Cost of goods sold', r)).concat(opex.map(r => erow('Operating', r))),
        totalsRow: ['TOTAL COSTS', '', stm(totC), pc(totC, revM), totC ? '100.0%' : '—'],
        columnAlign: [null, null, 'right', 'right', 'right'], statement: true });
    }

    // supporting transactions behind each statement line (v3.28; detailed PDF / Excel only)
    const txIn = Array.isArray(i.transactions) ? i.transactions.filter(t => t && t.line && hasNum(t.amount)) : [];
    if (txIn.length) {
      const SECS = [['revenue', 'Revenue', rev], ['cogs', 'Cost of goods sold', cogs], ['opex', 'Operating expenses', opex]];
      const norm = v => String(v).trim().toLowerCase();
      const used = new Set(), prRows = [], prKinds = [], unmatchedLines = [];
      const hasRef = txIn.some(t => t.reference), cols = ['Date', 'Description'].concat(hasRef ? ['Reference'] : [], [`Amount (${cur})`]);
      const pad = (first, last) => [first].concat(new Array(cols.length - 2).fill(''), [last]);
      let shown = 0;
      const sectionOf = t => (['revenue', 'cogs', 'opex'].includes(norm(t.section || '')) ? norm(t.section) : null);
      SECS.forEach(([sk, secTitle, list]) => {
        let secSum = 0, secN = 0;
        list.forEach(l => {
          const mine = txIn.filter((t, idx) => !used.has(idx) && norm(t.line) === norm(l.label) && (!sectionOf(t) || sectionOf(t) === sk));
          if (!mine.length) { unmatchedLines.push(l.label); return; }
          mine.forEach(t => used.add(txIn.indexOf(t)));
          const sorted = mine.slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
          const sub = sumBy(sorted, t => t.amount);
          prRows.push(pad(`${l.label} (${secTitle})`, '')); prKinds.push('section');
          sorted.forEach(t => {
            prRows.push([isoOk(t.date) ? `${shortDate(t.date)} ${String(t.date).slice(0, 4)}` : (t.date ? String(t.date) : '—'), String(t.description || '—')].concat(hasRef ? [String(t.reference || '—')] : [], [stm(t.amount)]));
            prKinds.push('line');
          });
          prRows.push(pad(`Total ${l.label}`, stm(sub))); prKinds.push('subtotal');
          shown += sorted.length; secSum += sub; secN += sorted.length;
          base.checks = (base.checks || []).concat([{ label: `${l.label}: statement vs. supporting transactions`, expected: mOf(l), actual: sub }]);
        });
        if (secN) { prRows.push(pad(`Total ${secTitle.toLowerCase()} transactions (${plural(secN, 'record')})`, stm(secSum))); prKinds.push('total'); }
      });
      const strays = txIn.filter((t, idx) => !used.has(idx));
      if (prRows.length) {
        base.tables.push({ title: 'Supporting Transactions by Line', sheetName: 'Transactions', columns: cols, rows: prRows, rowKinds: prKinds,
          columnAlign: [null, null].concat(hasRef ? [null] : [], ['right']), statement: true });
      }
      if (unmatchedLines.length) {
        base.notes = (base.notes || []).concat([`${plural(unmatchedLines.length, 'statement line has', 'statement lines have')} no supporting transactions: ${unmatchedLines.slice(0, 4).join(', ')}${unmatchedLines.length > 4 ? ` and ${unmatchedLines.length - 4} more` : ''}.`]);
      }
      if (strays.length) {
        const names = Array.from(new Set(strays.map(t => String(t.line)))).slice(0, 3).join(', ');
        base.notes = (base.notes || []).concat([`${plural(strays.length, 'transaction')} did not match any statement line and ${strays.length === 1 ? 'is' : 'are'} not listed: ${names}.`]);
      }
    }

    // data notes
    const dn = [];
    const addNote = (type, text, tone) => dn.push([{ v: type, tone: tone || 'muted' }, text]);
    if (!pv || pRev === null || pGp === null || pNp === null) addNote('Comparison', `No complete ${prevLabel} figures were supplied, so period comparisons are unavailable (shown as unavailable, not zero).`, 'warn');
    if (checkNote) addNote('Basis', checkNote.text, 'bad');
    if (!rev.length) addNote('Missing', 'No revenue was recorded for this period.', 'warn');
    if (!cogs.length) addNote('Missing', 'No cost of goods sold was recorded, so gross profit equals revenue.', 'warn');
    if (!opex.length) addNote('Missing', 'No operating expenses were recorded for this period.', 'warn');
    if (partialYtd) addNote('Year to date', 'Year-to-Date columns are omitted because not every line had a year-to-date figure.', 'warn');
    if (prods.length && productCostMissing) addNote('Product cost', 'Product-level profit is not shown: product costs are not available or not reliably attributed to each product.', 'muted');
    if (rc !== null && Math.abs(rc) >= 20) addNote('Unusual change', `Revenue moved ${fmt.signedPct(rc)} versus ${prevLabel} — worth confirming that all sales were recorded in the right month.`, 'warn');
    if (npc !== null && Math.abs(npc) >= 30) addNote('Unusual change', `Net profit moved ${fmt.signedPct(npc)} versus ${prevLabel}.`, 'warn');
    if (!dn.length) addNote('All clear', 'No missing data or unusual changes were found.', 'good');
    base.tables.push({ title: 'Data Notes', columns: ['Type', 'Note'], rows: dn });

    base.footer.notes = (base.footer.notes || []).concat([
      'Costs are shown as positive amounts and deducted in the subtotals. Percentages are of total revenue. Expenses are those incurred in the period (IAS 2 basis), not simply cash paid.'
    ].concat(partialYtd ? ['Year-to-Date columns are omitted because not every line had a year-to-date figure.'] : []));
    return base;
  };

  // ---------------------------------------------------------------
  // BUDGET — "Where did we beat, miss, or stay on budget this month, and is it getting
  //   better or worse?"
  //   v3.9 summary page: Row 1 five cards (Revenue vs Budget, Expenses vs Budget, Net Result vs
  //   Budget, Lines Over Budget, Largest Gap); Row 2 a Budget vs. Actual chart by section + Key
  //   Insights; Row 3 a compact table of section totals with the net result. The detailed PDF
  //   then prints the full line-by-line table (with the Trend column), variance and utilization
  //   charts, a monthly comparison, a Variance Explanation and the transactions behind the
  //   significant variances.
  //
  // input: {
  //   sections: [{ title: 'Revenue', type?: 'income' | 'expense',     // else guessed from the title
  //                lines: [{ label, budget, actual,
  //                          previousBudget?, previousActual? }] }],   // last month's, for the Trend column
  //   tolerancePct?: 2,          // within +/- this % of budget counts as On Target
  //   previousLabel?: 'Aug',     // names the Trend column; default 'Prior Month'
  //   varianceSign?: 'favourable' | 'raw',  // default 'favourable' (see below)
  //   netLabel?: overrides the net line's label (default NET PROFIT, or NET LOSS when actual is negative)
  //   -- new in v3.9 (all optional; anything left out is simply not drawn) --
  //   monthly?: [{ label:'Jul', budget, actual }],   // month-by-month totals for the monthly chart + table
  //   monthlyKind?: 'expense' | 'income',            // how to read monthly variance (default 'expense')
  //   monthlyTitle?: 'Total expenses',               // what the monthly rows add up
  //   transactions?: [{ line, section?, date, description, amount, reference? }]  // v3.30: the records
  //                                                  //   behind EVERY line (checked against its actual)
  //   layout?: 'statement'                           // the old statement-only page (v3.5-v3.8)
  // }
  // Variance is FAVOURABLE-POSITIVE by default: income above budget and expense below budget
  // are positive; the opposite is a red negative — so red always means "worse than
  // plan", for income and expense lines alike. Pass varianceSign:'raw' for Actual - Budget.
  // Status: income lines are Beat / On Target / Miss; expense lines are Under / On Target / Over.
  // Trend compares how far each line was from budget this month against last month, in
  // percentage points (Better by / Steady / Worse by); it needs previousBudget and previousActual.
  // The net line (income minus expense) is added when both kinds of section are present.
  // Revenue and expenses are never added together into one "total variance": they are read
  // separately, and only the net result combines them.
  // ---------------------------------------------------------------
  presets.budget = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Budget', 'Budget vs. Actual');
    if (base.status === 'empty') return base;
    const legacy = i.layout === 'statement';
    const cur = base.currency;
    const tol = hasNum(i.tolerancePct) ? Math.abs(Number(i.tolerancePct)) : 2;
    const raw = i.varianceSign === 'raw';
    const trendName = i.previousLabel || 'Prior Month';
    const N = v => (hasNum(v) ? Number(v) : 0);
    const money = v => fmt.n(v, 0);
    const kindOf = s => (s.type === 'expense' || s.type === 'income' ? s.type
      : (/expens|cost|spend|purchase|overhead|wage|payroll/i.test(s.title || '') ? 'expense' : 'income'));

    // favourable variance of one figure pair (net / income lines: higher is better)
    const fav = (kind, budget, actual) => (kind === 'expense' ? budget - actual : actual - budget);
    const pctOf = (v, budget) => (budget ? (v / Math.abs(budget)) * 100 : null);
    const statusOf = (kind, budget, actual) => {
      const f = fav(kind, budget, actual), p = pctOf(f, budget);
      if (budget ? Math.abs(p) <= tol : Math.abs(f) < 0.005) return 'On Target';
      if (f > 0) return kind === 'expense' ? 'Under' : 'Beat';
      return kind === 'expense' ? 'Over' : 'Miss';
    };
    const TONE = { 'Beat': 'good', 'Under': 'good', 'On Target': 'info', 'Over': 'bad', 'Miss': 'bad' };
    // trend: change in favourable variance %, this month minus last month, in points
    const trendOf = (kind, budget, actual, pb, pa) => {
      if (!hasNum(pb) || !hasNum(pa) || !Number(pb) || !budget) return null;
      return pctOf(fav(kind, budget, actual), budget) - pctOf(fav(kind, Number(pb), Number(pa)), Number(pb));
    };
    const trendCell = d => (d === null ? '—'
      : (d >= 0.5 ? { v: `Better by ${d.toFixed(1)} pts`, tone: 'good' }
        : (d <= -0.5 ? { v: `Worse by ${Math.abs(d).toFixed(1)} pts`, tone: 'bad' } : { v: 'Steady', tone: 'muted' })));

    const rows = [], kinds = [], scored = [], secTotals = [], dataGaps = [];
    const figures = (kind, label, budget, actual, trend, rowKind) => {
      const f = fav(kind, budget, actual);
      const shown = raw ? actual - budget : f;
      const p = pctOf(shown, budget);
      const st = statusOf(kind, budget, actual);
      rows.push([label, stm(budget), stm(actual), stm(shown), p === null ? '—' : stmPct(p), trendCell(trend), { v: st, tone: TONE[st] }]);
      kinds.push(rowKind);
      return { label, kind, budget, actual, fav: f, favPct: pctOf(f, budget), status: st, trend };
    };
    const section = title => { rows.push([title, '', '', '', '', '', '']); kinds.push('section'); };
    const noteRow = text => { rows.push([text, '', '', '', '', '', '']); kinds.push('note'); };

    const sections = (Array.isArray(i.sections) ? i.sections : []).filter(s => s && s.title);
    const tot = { income: { b: 0, a: 0, pb: 0, pa: 0, prev: true, n: 0 }, expense: { b: 0, a: 0, pb: 0, pa: 0, prev: true, n: 0 } };
    sections.forEach(s => {
      const kind = kindOf(s);
      const lines = (Array.isArray(s.lines) ? s.lines : []).filter(l => l && l.label);
      section(s.title);
      let b = 0, a = 0, pb = 0, pa = 0, prev = lines.length > 0;
      if (!lines.length) noteRow('No lines recorded');
      lines.forEach(l => {
        const lb = N(l.budget), la = N(l.actual);
        if (!hasNum(l.budget) || (Number(l.budget) === 0 && la !== 0)) dataGaps.push({ line: l.label, what: 'No budget set' });
        else if (!hasNum(l.actual)) dataGaps.push({ line: l.label, what: 'Actual not recorded' });
        const tr = trendOf(kind, lb, la, l.previousBudget, l.previousActual);
        scored.push(figures(kind, l.label, lb, la, tr, 'line'));
        b += lb; a += la;
        if (hasNum(l.previousBudget) && hasNum(l.previousActual)) { pb += Number(l.previousBudget); pa += Number(l.previousActual); } else prev = false;
      });
      figures(kind, `Total ${s.title.toLowerCase()}`, b, a, prev ? trendOf(kind, b, a, pb, pa) : null, 'subtotal');
      secTotals.push({ title: s.title, kind, b, a });
      const T = tot[kind]; T.b += b; T.a += a; T.n += lines.length;
      if (prev) { T.pb += pb; T.pa += pa; } else T.prev = false;
    });

    let net = null;
    if (tot.income.n && tot.expense.n) {
      const nb = tot.income.b - tot.expense.b, na = tot.income.a - tot.expense.a;
      const hasPrev = tot.income.prev && tot.expense.prev;
      net = figures('income', i.netLabel || (na < 0 ? 'NET LOSS' : 'NET PROFIT'), nb, na,
        hasPrev ? trendOf('income', nb, na, tot.income.pb - tot.expense.pb, tot.income.pa - tot.expense.pa) : null, 'total');
      // profit green, loss red: colour the label and the actual figure of the net row
      const last = rows[rows.length - 1];
      last[0] = tc(last[0], na); last[2] = tc(last[2], na);
    }

    const fullTable = { title: 'Budget vs. Actual', rowKinds: kinds, rows,
      columns: ['Particulars', `Budget (${cur})`, `Actual (${cur})`, `Variance (${cur})`, 'Variance %', `Trend vs. ${trendName}`, 'Status'],
      columnAlign: [null, 'right', 'right', 'right', 'right', null, null] };

    // ---- findings used by the notes, cards and explanation ----
    const good = scored.filter(l => l.status === 'Beat' || l.status === 'Under' || l.status === 'On Target').length;
    const badL = scored.filter(l => l.status === 'Over' || l.status === 'Miss');
    const worst = scored.filter(l => l.fav < 0 && l.status !== 'On Target').sort((a, b) => a.fav - b.fav)[0];
    const bestL = scored.filter(l => l.fav > 0 && (l.status === 'Beat' || l.status === 'Under')).sort((a, b) => b.fav - a.fav)[0];
    const gapNote = worst ? { label: 'Biggest gap', color: '#C0392B',
      text: `${worst.label} is ${worst.kind === 'expense' ? 'over budget' : 'below target'} by ${fmt.n(Math.abs(worst.fav), 2)} ${cur}${worst.favPct === null ? '' : ' (' + fmt.pct(Math.abs(worst.favPct)) + ')'}.` } : null;
    const resultNote = net ? { label: 'Result', color: net.fav < 0 ? '#C0392B' : '#1D5C38',
      text: `Net result is ${fmt.n(net.actual, 2)} ${cur}, ` + (Math.abs(net.fav) < 0.005 ? 'exactly on budget.'
        : `${fmt.n(Math.abs(net.fav), 2)} ${cur} ${net.fav < 0 ? 'below' : 'above'} budget.`) } : null;

    if (legacy) {
      base.tables = [fullTable];
      base.layout = 'statement';
      base.statementTitle = 'Budget vs. Actual';
      base.statementBasis = `${base.period || 'this period'} · Amounts in ${cur} · Within ${tol}% of budget counts as On Target`;
      base.insightsTitle = 'Notes';
      if (i.insights) {
        base.insights = i.insights;
      } else {
        const notes = [];
        if (scored.length) notes.push({ label: badL.length ? 'Lines' : 'On plan', color: badL.length ? '#C89B3C' : '#1D5C38',
          text: `${good} of ${scored.length} line${scored.length > 1 ? 's' : ''} met or beat budget; ${badL.length ? badL.length + ' ' + (badL.length > 1 ? 'are' : 'is') + ' over budget or missed target' : 'none are over budget or missed'}.` });
        if (gapNote) notes.push(gapNote);
        if (resultNote) notes.push(resultNote);
        const withTrend = scored.filter(l => l.trend !== null);
        if (withTrend.length) {
          const better = withTrend.filter(l => l.trend >= 0.5).length, worse = withTrend.filter(l => l.trend <= -0.5).length;
          notes.push({ label: 'Trend', color: '#2E86DE',
            text: `Compared with last month, ${better} line${better === 1 ? '' : 's'} moved closer to budget and ${worse} moved further away (of ${withTrend.length} with a prior month).` });
        }
        base.insights = notes.slice(0, 4);
      }
      base.footer.notes = (base.footer.notes || []).concat([
        raw ? 'Variance is Actual minus Budget.'
          : 'Variance is favourable-positive: income above budget and expense below budget are positive; negative (red) means worse than budget.'
      ]);
      return base;
    }

    // ================= v3.9 layout =================
    const inc = tot.income, exp = tot.expense;
    const tcol = v => (v < 0 ? '#C0392B' : '#1D5C38');
    const toneBy = (p) => (p >= tol ? 'good' : (p <= -tol ? 'warn' : undefined));
    base.kpis = [];
    if (inc.n) {
      const p = pctOf(inc.a - inc.b, inc.b);
      base.kpis.push(Object.assign({ label: 'Revenue vs Budget', value: money(inc.a), unit: cur, color: '#2D6A4F' },
        p === null ? {} : { delta: `${fmt.signedPct(p)} vs budget`, deltaTone: toneBy(p) }));
    }
    if (exp.n) {
      const util = exp.b ? (exp.a / exp.b) * 100 : null;
      base.kpis.push(Object.assign({ label: 'Expenses vs Budget', value: money(exp.a), unit: cur, color: '#E67E22' },
        util === null ? {} : { delta: `${fmt.pct(util, 0)} of budget used`, deltaTone: util <= 100 - tol ? 'good' : (util > 100 + tol ? 'warn' : undefined) }));
    }
    if (net) {
      base.kpis.push({ label: net.actual < 0 ? 'Net Loss vs Budget' : 'Net Result vs Budget', value: money(net.actual), unit: cur, color: tcol(net.actual),
        delta: Math.abs(net.fav) < 0.005 ? 'Exactly on budget' : `${money(Math.abs(net.fav))} ${net.fav < 0 ? 'below' : 'above'} budget`, deltaTone: net.fav < 0 ? 'warn' : 'good' });
    } else if (scored.length) {
      const sumFav = sumBy(scored, l => l.fav);
      base.kpis.push({ label: 'Net Variance', value: money(sumFav), unit: cur, color: tcol(sumFav), delta: sumFav < 0 ? 'Unfavourable overall' : 'Favourable overall', deltaTone: sumFav < 0 ? 'warn' : 'good' });
    }
    base.kpis.push({ label: 'Lines Over Budget', value: String(badL.length), unit: `of ${scored.length} lines`, color: badL.length ? '#C0392B' : '#2D6A4F',
      delta: badL.length ? 'Over budget or missed target' : 'All lines on plan', deltaTone: badL.length ? 'warn' : 'good' });
    base.kpis.push(worst
      ? { label: 'Largest Gap', value: money(Math.abs(worst.fav)), unit: cur, color: '#C0392B',
          delta: `${worst.label}${worst.favPct === null ? '' : ' (' + fmt.pct(Math.abs(worst.favPct)) + ')'}`, deltaTone: 'warn' }
      : { label: 'Largest Gap', value: 'None', color: '#2D6A4F', delta: 'No unfavourable variance', deltaTone: 'good' });

    // Row 2 chart: budget vs actual by section
    base.charts = [];
    if (secTotals.length) {
      base.charts.push({ type: 'bar', style: 'clean', minimal: true, precise: true, horizontal: true, title: 'Budget vs. Actual', subtitle: `${cur} by section`, labels: secTotals.map(s => s.title),
        series: [{ label: 'Budget', values: secTotals.map(s => s.b), color: '#C9D3CD' }, { label: 'Actual', values: secTotals.map(s => s.a), color: '#14532D' }] });
    }
    // detailed-only charts
    const expLines = scored.filter(l => l.kind === 'expense' && l.budget > 0);
    if (expLines.length) {
      base.charts.push({ type: 'bar', style: 'clean', minimal: true, horizontal: true, detailOnly: true, title: 'Budget Utilization — Expense Lines', subtitle: '% of budget used; the dashed line is 100% (exactly on budget)',
        labelFormat: 'pct', refLine: { value: 100, label: 'Budget' },
        labels: expLines.map(l => l.label), values: expLines.map(l => Math.round((l.actual / l.budget) * 1000) / 10),
        colors: expLines.map(l => ((l.actual / l.budget) * 100 > 100 + tol ? '#E0634D' : '#3FA37A')) });
    }
    if (scored.length) {
      base.charts.push({ type: 'bar', style: 'clean', minimal: true, precise: true, horizontal: true, detailOnly: true, title: 'Variance by Line', subtitle: `${cur}; green = favourable, red = unfavourable`,
        labels: scored.map(l => l.label), values: scored.map(l => Math.round(l.fav * 100) / 100), colors: scored.map(l => (l.fav < 0 ? '#E0634D' : '#3FA37A')) });
    }
    const monthly = (Array.isArray(i.monthly) ? i.monthly : []).filter(m => m && m.label && hasNum(m.budget) && hasNum(m.actual));
    const mKind = i.monthlyKind === 'income' ? 'income' : 'expense';
    if (monthly.length) {
      base.charts.push({ type: 'bar', style: 'clean', minimal: true, detailOnly: true, title: `Budget vs. Actual by Month${i.monthlyTitle ? ' — ' + i.monthlyTitle : ''}`, subtitle: cur,
        labels: monthly.map(m => String(m.label)),
        series: [{ label: 'Budget', values: monthly.map(m => Number(m.budget)), color: '#C9D3CD' }, { label: 'Actual', values: monthly.map(m => Number(m.actual)), color: '#14532D' }] });
    }
    base.detailChartsTitle = 'Variance Analysis';

    // Key Insights
    if (i.insights) {
      base.insights = i.insights;
    } else {
      const notes = [];
      if (scored.length) {
        if (badL.length) {
          const names = badL.slice(0, 3).map(l => l.label).join(', ') + (badL.length > 3 ? ` and ${badL.length - 3} more` : '');
          notes.push({ label: 'Over budget', color: '#C89B3C', text: `${badL.length} of ${scored.length} lines ${badL.length === 1 ? 'is' : 'are'} over budget or missed target: ${names}.` });
        } else {
          notes.push({ label: 'On plan', color: '#1D5C38', text: `None of the ${scored.length} lines is over budget or below target.` });
        }
      }
      if (gapNote && !(badL.length === 1 && badL[0] === worst)) notes.push(gapNote);
      if (bestL) notes.push({ label: 'Best result', color: '#1D5C38',
        text: `${bestL.label} is ${bestL.kind === 'expense' ? 'under budget' : 'above target'} by ${fmt.n(bestL.fav, 2)} ${cur}${bestL.favPct === null ? '' : ' (' + fmt.pct(bestL.favPct) + ')'}.` });
      if (resultNote) notes.push(resultNote);
      base.insights = notes.slice(0, 4);
    }

    // Row 3: compact table of section totals + net
    const crow = (label, kind, b, a) => {
      const f = fav(kind, b, a), shown = raw ? a - b : f, p = pctOf(shown, b), st = statusOf(kind, b, a);
      return [label, stm(b), stm(a), stm(shown), p === null ? '—' : stmPct(p), { v: st, tone: TONE[st] }];
    };
    const cRows = secTotals.map(s => crow(s.title, s.kind, s.b, s.a)), cKinds = secTotals.map(() => 'line');
    if (net) {
      const r = crow(net.label, 'income', net.budget, net.actual);
      r[0] = tc(r[0], net.actual); r[2] = tc(r[2], net.actual);
      cRows.push(r); cKinds.push('total');
    }
    const compactTable = { title: 'Budget Performance by Section', sheetName: 'Section Summary', rowKinds: cKinds, rows: cRows,
      columns: ['Section', `Budget (${cur})`, `Actual (${cur})`, `Variance (${cur})`, 'Variance %', 'Status'],
      columnAlign: [null, 'right', 'right', 'right', 'right', null], statement: true };

    // ---- detailed tables ----
    const full = Object.assign({}, fullTable, { title: 'Budget vs. Actual — Line by Line', sheetName: 'Budget Lines', statement: true, beforeCharts: true });
    base.tables = [compactTable, full];

    if (monthly.length) {
      const mr = monthly.map(m => {
        const b = Number(m.budget), a = Number(m.actual), f = fav(mKind, b, a), shown = raw ? a - b : f, p = pctOf(shown, b), st = statusOf(mKind, b, a);
        return [String(m.label), stm(b), stm(a), stm(shown), p === null ? '—' : stmPct(p), { v: st, tone: TONE[st] }];
      });
      base.tables.push({ title: `Monthly Comparison${i.monthlyTitle ? ' — ' + i.monthlyTitle : ''}`, sheetName: 'Monthly Comparison',
        columns: ['Month', `Budget (${cur})`, `Actual (${cur})`, `Variance (${cur})`, 'Variance %', 'Status'],
        rows: mr, columnAlign: [null, 'right', 'right', 'right', 'right', null], statement: true });
    }

    // variance explanation
    const expl = [];
    const evar = l => [stm(raw ? l.actual - l.budget : l.fav), l.favPct === null ? '—' : stmPct(raw ? pctOf(l.actual - l.budget, l.budget) : l.favPct)];
    scored.filter(l => l.status === 'Over' || l.status === 'Miss').sort((a, b) => a.fav - b.fav).slice(0, 4).forEach(l =>
      expl.push([{ v: l.kind === 'expense' ? 'Over budget' : 'Below target', tone: 'bad' }, l.label].concat(evar(l))));
    scored.filter(l => l.status === 'Under' || l.status === 'Beat').sort((a, b) => b.fav - a.fav).slice(0, 4).forEach(l =>
      expl.push([{ v: l.kind === 'expense' ? 'Under budget' : 'Above target', tone: 'good' }, l.label].concat(evar(l))));
    dataGaps.forEach(g => expl.push([{ v: 'Data note', tone: 'warn' }, g.line, '—', g.what]));
    if (expl.length) {
      base.tables.push({ title: 'Variance Explanation', columns: ['Finding', 'Line', `Variance (${cur})`, 'Variance % / Note'],
        rows: expl, columnAlign: [null, null, 'right', 'right'], statement: true });
    }

    // supporting transactions behind EVERY budget line (v3.30; detailed PDF / Excel only), grouped by
    // section with a subtotal per line, each line tagged with its status and checked against its actual
    const tx = Array.isArray(i.transactions) ? i.transactions.filter(t => t && t.line && hasNum(t.amount)) : [];
    if (tx.length) {
      const norm = v => String(v).trim().toLowerCase();
      const used = new Set(), bRows = [], bKinds = [], unmatched = [];
      const hasRef = tx.some(t => t.reference);
      const cols = ['Date', 'Description'].concat(hasRef ? ['Reference'] : [], [`Amount (${cur})`]);
      const pad = (first, last) => [first].concat(new Array(cols.length - 2).fill(''), [last]);
      const dcell = t => (isoOk(t.date) ? `${shortDate(t.date)} ${String(t.date).slice(0, 4)}` : (t.date ? String(t.date) : '—'));
      sections.forEach(sec => {
        const kind = kindOf(sec);
        const lines = (Array.isArray(sec.lines) ? sec.lines : []).filter(l => l && l.label);
        let secSum = 0, secN = 0;
        lines.forEach(l => {
          const mine = tx.filter((t, idx) => !used.has(idx) && norm(t.line) === norm(l.label) && (!t.section || norm(t.section) === norm(sec.title)));
          if (!mine.length) { unmatched.push(l.label); return; }
          mine.forEach(t => used.add(tx.indexOf(t)));
          const sorted = mine.slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || Number(b.amount) - Number(a.amount));
          const sub = sumBy(sorted, t => Math.abs(Number(t.amount)));
          const st = statusOf(kind, N(l.budget), N(l.actual));
          bRows.push(pad(`${l.label} (${sec.title}) — ${st}`, '')); bKinds.push('section');
          sorted.forEach(t => {
            bRows.push([dcell(t), String(t.description || '—')].concat(hasRef ? [String(t.reference || '—')] : [], [stm(Math.abs(Number(t.amount)))]));
            bKinds.push('line');
          });
          bRows.push(pad(`Total ${l.label}`, stm(sub))); bKinds.push('subtotal');
          secSum += sub; secN += sorted.length;
          if (hasNum(l.actual)) base.checks = (base.checks || []).concat([{ label: `${l.label}: budget actual vs. supporting transactions`, expected: N(l.actual), actual: sub }]);
        });
        if (secN) { bRows.push(pad(`Total ${String(sec.title).toLowerCase()} transactions (${plural(secN, 'record')})`, stm(secSum))); bKinds.push('total'); }
      });
      const strays = tx.filter((t, idx) => !used.has(idx));
      if (bRows.length) {
        base.tables.push({ title: 'Supporting Transactions by Budget Line', sheetName: 'Transactions', columns: cols, rows: bRows, rowKinds: bKinds,
          columnAlign: [null, null].concat(hasRef ? [null] : [], ['right']), statement: true });
      }
      if (unmatched.length) {
        base.notes = (base.notes || []).concat([`${plural(unmatched.length, 'budget line has', 'budget lines have')} no supporting transactions: ${unmatched.slice(0, 4).join(', ')}${unmatched.length > 4 ? ` and ${unmatched.length - 4} more` : ''}.`]);
      }
      if (strays.length) {
        const names = Array.from(new Set(strays.map(t => String(t.line)))).slice(0, 3).join(', ');
        base.notes = (base.notes || []).concat([`${plural(strays.length, 'transaction')} did not match any budget line and ${strays.length === 1 ? 'is' : 'are'} not listed: ${names}.`]);
      }
    }

    base.footer.notes = (base.footer.notes || []).concat([
      raw ? 'Variance is Actual minus Budget.'
        : 'Variance is favourable-positive: income above budget and expense below budget are positive; negative (red) means worse than budget. Revenue and expenses are read separately; only the net result combines them.'
    ]);
    return base;
  };

  // ---------------------------------------------------------------
  // 1. SALES — "What did we sell, to whom, how was it paid, and how much is still owed?"
  //   v3.31: the Sales design from the PDF Export Design Plan as an engine preset, so Sales is built
  //   the same way as every other module. Summary page: four-to-five KPI cards, a daily sales trend,
  //   a sales-by-product donut, Key Insights, a short ledger and the top customers. The detailed
  //   PDF / Excel then add: Daily Sales Breakdown, Sales by Product Type, Payment-Method Breakdown,
  //   Customer Sales Detail, Credit Sales and Outstanding A/R Detail, and the full Sales Ledger.
  //
  // input: {
  //   sales: [{ date:'2026-09-03', customer, product?, quantity?, unitPrice?,
  //             amount,                       // revenue of the sale, ETB
  //             paymentMethod?,               // 'Cash' | 'Bank' | 'Mobile' | 'Credit' ... (any label)
  //             paid?, balance?, status?,     // collected so far / still owed / 'paid'|'partial'|'unpaid'
  //             invoice?, reference? }],
  //   previousTotal?, previousLabel?          // last period's sales -> "vs Aug" on the first card
  //   asOf?: '2026-09-30'                     // age of open credit sales is counted to this date
  //   customerBalances?: [{ name, outstanding }]   // the BMS A/R balance per customer, cross-checked
  //   totals?: { revenue, units, credit, outstanding }   // BMS figures, used as-is when given
  // }
  // A sale is a CREDIT sale when its payment method or status says so (credit / unpaid / partial / open).
  // What is still owed comes from `balance`, else amount - paid, else the full amount for an unpaid
  // sale. A credit sale with none of these has an UNKNOWN balance: it shows "—", is left out of the
  // outstanding figure and a note says how many. Nothing missing is treated as zero.
  // ---------------------------------------------------------------
  presets.sales = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Sales', 'Sales Report');
    if (base.status === 'empty') return base;
    const cur = base.currency;
    const rows = asArr(i.sales).filter(r => r && hasNum(r.amount));
    const amt = r => Number(r.amount) || 0;
    const qty = r => (hasNum(r.quantity) ? Number(r.quantity) : null);
    const isCredit = r => /credit/i.test(String(r.paymentMethod || '')) || /credit|unpaid|partial|open/i.test(String(r.status || ''));
    const balOf = r => {
      if (!isCredit(r)) return 0;
      if (hasNum(r.balance)) return Math.max(Number(r.balance), 0);
      if (hasNum(r.paid)) return Math.max(amt(r) - Number(r.paid), 0);
      if (/unpaid|open/i.test(String(r.status || ''))) return amt(r);
      return null;
    };
    const tot = Object.assign({}, i.totals);
    const revenue = tot.revenue !== undefined ? Number(tot.revenue) : sumBy(rows, amt);
    const withQty = rows.filter(r => qty(r) !== null);
    const units = tot.units !== undefined ? Number(tot.units) : sumBy(withQty, r => qty(r));
    const creditRows = rows.filter(isCredit);
    const credit = tot.credit !== undefined ? Number(tot.credit) : sumBy(creditRows, amt);
    const known = creditRows.filter(r => balOf(r) !== null);
    const unknownBal = creditRows.length - known.length;
    const outstanding = tot.outstanding !== undefined ? Number(tot.outstanding) : sumBy(known, balOf);
    const prev = hasNum(i.previousTotal) ? Number(i.previousTotal) : null;
    const change = prev ? ((revenue - prev) / prev) * 100 : null;
    const prevLabel = i.previousLabel || 'last month';
    const avgSale = rows.length ? sumBy(rows, amt) / rows.length : null;
    const label = (v, d) => { const t = String(v === undefined || v === null ? '' : v).trim(); return t || d; };
    const prods = groupSum(rows, r => label(r.product, 'Not stated'), amt);
    const custs = groupSum(rows, r => label(r.customer, 'Walk-in / not stated'), amt);
    const trend = dailySeries(rows, r => r.date, amt);

    base.kpis = [
      { label: 'Total Sales', value: fmt.money(revenue), unit: cur, color: '#1D5C38',
        delta: change === null ? undefined : `${fmt.signedPct(change)} vs ${prevLabel}`, deltaTone: change === null ? undefined : (change >= 0 ? 'good' : 'warn') }
    ];
    if (withQty.length) base.kpis.push({ label: 'Units Sold', value: qtyFmt(units), color: '#2E86DE',
      delta: withQty.length < rows.length ? `${plural(rows.length - withQty.length, 'sale')} without quantity` : undefined, deltaTone: 'warn' });
    if (avgSale !== null) base.kpis.push({ label: 'Average Sale Value', value: fmt.money(avgSale), unit: cur, color: '#C89B3C', delta: `${plural(rows.length, 'sale')}` });
    base.kpis.push({ label: 'Credit Sales', value: fmt.money(credit), unit: cur, color: '#8E44AD',
      delta: revenue ? `${fmt.pct(fmt.share(credit, revenue), 0)} of sales` : undefined });
    base.kpis.push({ label: 'Outstanding A/R', value: fmt.money(outstanding), unit: cur, color: outstanding > 0 ? '#C0392B' : '#2D6A4F',
      delta: unknownBal ? `${plural(unknownBal, 'credit sale')} with unknown balance` : (outstanding > 0 ? 'Still to collect' : 'Nothing owed'), deltaTone: unknownBal || outstanding > 0 ? 'warn' : 'good' });

    base.charts = [];
    if (trend.labels.length) base.charts.push({ type: 'line', title: 'Daily Sales', subtitle: `${cur} per day`, labels: trend.labels, values: trend.values });
    if (prods.length) base.charts.push({ type: 'doughnut', title: 'Sales by Product', labels: prods.map(p => p.name), values: prods.map(p => p.amount),
      colors: PALETTE, centerLabel: { top: 'Total', value: fmt.money(sumBy(rows, amt)), bottom: cur } });

    if (i.insights) {
      base.insights = i.insights;
    } else {
      const ins = [];
      if (change !== null) ins.push({ label: change < -10 ? 'Watch' : 'Sales', color: change < -10 ? '#C89B3C' : '#1D5C38',
        text: `Sales are ${change >= 0 ? 'up' : 'down'} ${fmt.pct(Math.abs(change))} versus ${prevLabel} (${fmt.money(revenue)} ${cur}).` });
      if (prods.length > 1 && revenue) ins.push({ label: 'Mix', color: '#2E86DE', text: `${prods[0].name} is the biggest product at ${fmt.pct(fmt.share(prods[0].amount, sumBy(rows, amt)), 0)} of sales.` });
      if (credit > 0 && revenue && fmt.share(credit, revenue) >= 30) ins.push({ label: 'Credit', color: '#C89B3C', text: `${fmt.pct(fmt.share(credit, revenue), 0)} of sales were on credit; ${fmt.money(outstanding)} ${cur} is still to collect.` });
      else if (outstanding > 0) ins.push({ label: 'Collect', color: '#C89B3C', text: `${fmt.money(outstanding)} ${cur} from credit sales is still to collect.` });
      if (custs.length > 1 && fmt.share(custs[0].amount, sumBy(rows, amt)) >= 40) ins.push({ label: 'Risk', color: '#8E44AD', text: `${custs[0].name} accounts for ${fmt.pct(fmt.share(custs[0].amount, sumBy(rows, amt)), 0)} of sales, a concentration worth watching.` });
      base.insights = ins.slice(0, 4);
    }

    // ---- the full ledger (summary page shows a few rows; the detailed PDF prints every one) ----
    const dcell = d => (isoOk(d) ? shortDate(d) : (d ? String(d) : '—'));
    const ordered = rows.slice().sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || amt(b) - amt(a));
    const has = k => rows.some(r => r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '');
    const cols = ['Date'], align = [null], cellOf = [r => dcell(r.date)];
    const addCol = (name, fn, right) => { cols.push(name); align.push(right ? 'right' : null); cellOf.push(fn); };
    if (has('invoice')) addCol('Invoice', r => label(r.invoice, '—'));
    addCol('Customer', r => label(r.customer, '—'));
    if (has('product')) addCol('Product', r => label(r.product, '—'));
    if (withQty.length) addCol('Qty', r => (qty(r) === null ? '—' : qtyFmt(qty(r))), true);
    if (rows.some(r => hasNum(r.unitPrice))) addCol(`Unit Price (${cur})`, r => (hasNum(r.unitPrice) ? fmt.money2(r.unitPrice) : '—'), true);
    if (has('paymentMethod')) addCol('Payment', r => label(r.paymentMethod, '—'));
    if (has('reference')) addCol('Reference', r => label(r.reference, '—'));
    addCol(`Amount (${cur})`, r => fmt.money2(amt(r)), true);
    const totRow = cols.map(() => '');
    totRow[0] = 'TOTAL'; totRow[cols.length - 1] = fmt.money2(sumBy(rows, amt));
    if (withQty.length) totRow[cols.indexOf('Qty')] = qtyFmt(sumBy(withQty, r => qty(r)));
    base.tables = [
      { title: 'Sales Ledger', sheetName: 'Sales Ledger', summaryMaxRows: 4, columns: cols, columnAlign: align,
        rows: ordered.slice().reverse().map(r => cellOf.map(f => f(r))), totalsRow: totRow }
    ];
    base.rankedList = { title: 'Sales by Customer', maxRows: 4,
      items: custs.map((c, k) => ({ rank: k + 1, name: c.name, meta: plural(c.count, 'sale'),
        value: `${fmt.money(c.amount)} ${cur}`, sub: `${fmt.pct(fmt.share(c.amount, sumBy(rows, amt)))} of sales` })) };

    // ================= detailed PDF / Excel only =================
    const notes = [];
    const total = sumBy(rows, amt);
    if (rows.length) {
      base.checks = (base.checks || []).concat([{ label: 'Total sales: summary vs. sales ledger', expected: revenue, actual: total }]);
      if (withQty.length && tot.units !== undefined) base.checks.push({ label: 'Units sold: summary vs. sales ledger', expected: units, actual: sumBy(withQty, r => qty(r)), tolerance: 0.5 });
      if (tot.credit !== undefined) base.checks.push({ label: 'Credit sales: summary vs. sales ledger', expected: credit, actual: sumBy(creditRows, amt) });
      if (tot.outstanding !== undefined) base.checks.push({ label: 'Outstanding A/R: summary vs. credit sale balances', expected: outstanding, actual: sumBy(known, balOf) });

      // Daily Sales Breakdown (every day with a sale; sales with no valid date are listed last so the table foots)
      const dated = rows.filter(r => isoOk(r.date)), undated = rows.filter(r => !isoOk(r.date));
      if (dated.length) {
        const days = Array.from(new Set(dated.map(r => String(r.date).slice(0, 10)))).sort();
        let run = 0;
        const line = (name, list, showRun) => {
          const a = sumBy(list, amt), q = list.filter(r => qty(r) !== null);
          if (showRun) run += a;
          return [name, String(list.length), withQty.length ? (q.length ? qtyFmt(sumBy(q, r => qty(r))) : '—') : null, fmt.money2(a), fmt.money2(sumBy(list.filter(isCredit), amt)), showRun ? fmt.money2(run) : '—'];
        };
        const dRows = days.map(d => line(dcell(d), dated.filter(r => String(r.date).slice(0, 10) === d), true));
        if (undated.length) dRows.push(line('No date', undated, false));
        const keep = withQty.length ? [0, 1, 2, 3, 4, 5] : [0, 1, 3, 4, 5];
        const heads = ['Date', 'Sales', 'Units', `Sales (${cur})`, `Of Which Credit (${cur})`, `Running Total (${cur})`];
        base.tables.push({ title: 'Daily Sales Breakdown', sheetName: 'Daily Sales', columns: keep.map(k => heads[k]),
          rows: dRows.map(r => keep.map(k => r[k])), columnAlign: keep.map(k => (k === 0 ? null : 'right')),
          totalsRow: keep.map(k => ({ 0: 'TOTAL', 1: String(rows.length), 2: qtyFmt(sumBy(withQty, r => qty(r))), 3: fmt.money2(total), 4: fmt.money2(sumBy(creditRows, amt)), 5: '' })[k]) });
        base.checks.push({ label: 'Daily breakdown: all days vs. sales ledger', expected: total, actual: sumBy(dated, amt) + sumBy(undated, amt) });
        if (undated.length) notes.push(`${plural(undated.length, 'sale has', 'sales have')} no valid date and ${undated.length === 1 ? 'is' : 'are'} listed as "No date" at the end of the daily breakdown, outside the running total.`);
        if (withQty.length < rows.length) notes.push('Units are totalled only from sales that record a quantity; a day with none shows a dash.');
      }

      // Sales by Product Type
      if (has('product')) {
        const pRows = prods.map(p => {
          const list = rows.filter(r => label(r.product, 'Not stated') === p.name), q = list.filter(r => qty(r) !== null), qs = sumBy(q, r => qty(r));
          const qAmt = sumBy(q, amt);
          return [p.name, String(p.count), withQty.length ? (q.length ? qtyFmt(qs) : '—') : null, fmt.money2(p.amount), fmt.pct(fmt.share(p.amount, total)),
            withQty.length ? (q.length && qs ? fmt.money2(qAmt / qs) : '—') : null];
        });
        const keep = withQty.length ? [0, 1, 2, 3, 4, 5] : [0, 1, 3, 4];
        const heads = ['Product', 'Sales', 'Quantity', `Revenue (${cur})`, '% of Sales', `Avg. Price (${cur})`];
        base.tables.push({ title: 'Sales by Product Type', sheetName: 'By Product', columns: keep.map(k => heads[k]), rows: pRows.map(r => keep.map(k => r[k])),
          columnAlign: keep.map(k => (k === 0 ? null : 'right')),
          totalsRow: keep.map(k => ({ 0: 'TOTAL', 1: String(rows.length), 2: qtyFmt(sumBy(withQty, r => qty(r))), 3: fmt.money2(total), 4: '100.0%', 5: '' })[k]) });
        base.checks.push({ label: 'Product breakdown: total vs. sales ledger', expected: total, actual: sumBy(prods, p => p.amount) });
        if (withQty.length) notes.push('Average price is calculated only from sales that record a quantity.');
      }

      // Payment-method breakdown
      if (has('paymentMethod')) {
        const pm = groupSum(rows, r => label(r.paymentMethod, 'Not stated'), amt);
        base.tables.push({ title: 'Payment-Method Breakdown', sheetName: 'By Payment', columns: ['Payment Method', 'Sales', `Amount (${cur})`, '% of Sales'],
          rows: pm.map(p => [p.name, String(p.count), fmt.money2(p.amount), fmt.pct(fmt.share(p.amount, total))]), columnAlign: [null, 'right', 'right', 'right'],
          totalsRow: ['TOTAL', String(rows.length), fmt.money2(total), '100.0%'] });
        base.checks.push({ label: 'Payment methods: total vs. sales ledger', expected: total, actual: sumBy(pm, p => p.amount) });
        const ns = rows.filter(r => !String(r.paymentMethod || '').trim()).length;
        if (ns) notes.push(`${plural(ns, 'sale has', 'sales have')} no payment method and ${ns === 1 ? 'is' : 'are'} shown as "Not stated".`);
      }

      // Customer sales detail
      const cRows = custs.map(c => {
        const list = rows.filter(r => label(r.customer, 'Walk-in / not stated') === c.name), cr = list.filter(isCredit), kn = cr.filter(r => balOf(r) !== null);
        const q = list.filter(r => qty(r) !== null);
        return [c.name, String(c.count), withQty.length ? (q.length ? qtyFmt(sumBy(q, r => qty(r))) : '—') : null, fmt.money2(c.amount), fmt.pct(fmt.share(c.amount, total)),
          fmt.money2(sumBy(cr, amt)), cr.length && kn.length < cr.length ? '—' : fmt.money2(sumBy(kn, balOf)), sumBy(kn, balOf)];
      });
      const keepC = withQty.length ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 3, 4, 5, 6];
      const headC = ['Customer', 'Sales', 'Quantity', `Revenue (${cur})`, '% of Sales', `Credit Sales (${cur})`, `Owed (${cur})`];
      base.tables.push({ title: 'Customer Sales Detail', sheetName: 'By Customer', columns: keepC.map(k => headC[k]),
        rows: cRows.map(r => keepC.map(k => (k === 6 && r[7] > 0 && r[6] !== '—' ? { v: r[6], tone: 'warn' } : r[k]))), columnAlign: keepC.map(k => (k === 0 ? null : 'right')),
        totalsRow: keepC.map(k => ({ 0: 'TOTAL', 1: String(rows.length), 2: qtyFmt(sumBy(withQty, r => qty(r))), 3: fmt.money2(total), 4: '100.0%', 5: fmt.money2(sumBy(creditRows, amt)), 6: unknownBal ? '—' : fmt.money2(sumBy(known, balOf)) })[k]) });
      base.checks.push({ label: 'Customer detail: total vs. sales ledger', expected: total, actual: sumBy(custs, c => c.amount) });
      const nc = rows.filter(r => !String(r.customer || '').trim()).length;
      if (nc) notes.push(`${plural(nc, 'sale has', 'sales have')} no customer and ${nc === 1 ? 'is' : 'are'} grouped as "Walk-in / not stated".`);

      // Credit sales and outstanding A/R detail
      if (creditRows.length) {
        const asOf = isoOk(i.asOf) ? String(i.asOf).slice(0, 10) : null;
        const age = r => (asOf && isoOk(r.date) ? Math.round((new Date(asOf + 'T00:00:00Z') - new Date(String(r.date).slice(0, 10) + 'T00:00:00Z')) / 86400000) : null);
        const open = creditRows.slice().sort((a, b) => (balOf(b) === null ? -1 : balOf(b)) - (balOf(a) === null ? -1 : balOf(a)) || String(a.date || '').localeCompare(String(b.date || '')));
        const hasInv = has('invoice');
        const aCols = ['Date'].concat(hasInv ? ['Invoice'] : [], ['Customer', `Sale (${cur})`, `Collected (${cur})`, `Owed (${cur})`], asOf ? ['Days Open'] : []);
        base.tables.push({ title: 'Credit Sales and Outstanding A/R Detail', sheetName: 'Credit and A-R', columns: aCols,
          rows: open.map(r => {
            const b = balOf(r), a = age(r);
            return [dcell(r.date)].concat(hasInv ? [label(r.invoice, '—')] : [], [label(r.customer, '—'), fmt.money2(amt(r)),
              b === null ? '—' : fmt.money2(amt(r) - b), b === null ? { v: '—', tone: 'warn' } : (b > 0 ? { v: fmt.money2(b), tone: 'warn' } : fmt.money2(b))],
              asOf ? [a === null ? '—' : (a > 60 && b ? { v: String(a), tone: 'bad' } : String(a))] : []);
          }),
          columnAlign: [null].concat(hasInv ? [null] : [], [null, 'right', 'right', 'right'], asOf ? ['right'] : []),
          totalsRow: ['TOTAL'].concat(hasInv ? [''] : [], ['', fmt.money2(sumBy(creditRows, amt)), unknownBal ? '—' : fmt.money2(sumBy(known, r => amt(r) - balOf(r))), unknownBal ? '—' : fmt.money2(sumBy(known, balOf))], asOf ? [''] : []) });
        if (unknownBal) notes.push(`${plural(unknownBal, 'credit sale has', 'credit sales have')} no paid, balance or unpaid status, so what is owed is unknown; ${unknownBal === 1 ? 'it is' : 'they are'} shown as "—" and left out of Outstanding A/R.`);
        if (!asOf) notes.push('Days open are not shown because no "as of" date was supplied.');
        if (Array.isArray(i.customerBalances) && i.customerBalances.length) {
          const bal = i.customerBalances.filter(c => c && c.name && hasNum(c.outstanding));
          base.checks.push({ label: 'Outstanding A/R: credit sale balances vs. customer balances', expected: sumBy(bal, c => c.outstanding), actual: sumBy(known, balOf) });
        }
        base.definitions = (base.definitions || []).concat([
          { term: 'Credit sale', text: 'A sale whose payment method or status is credit, unpaid, partial or open. It is revenue now but not cash until collected.' },
          { term: 'Outstanding A/R', text: 'What customers still owe on credit sales: the balance recorded for the sale, else the sale amount less what was collected.' }
        ]);
      }
      base.definitions = (base.definitions || []).concat([{ term: 'Average sale value', text: 'Total sales divided by the number of sales (invoices or sale lines) in the period.' }]);
    }
    if (notes.length) base.notes = (base.notes || []).concat(notes);
    return base;
  };

  // ---------------------------------------------------------------
  // 18. MULTI-YEAR (v3.38) — "How did the business perform across the selected years?"
  //     Built for reports.html. The engine does NOT recalculate the module: the page passes
  //     the figures it already computes and this preset only lays them out. Anything the
  //     page does not supply is left out (no invented numbers).
  //
  // input: {
  //   period: '2023 – 2026 (2026 YTD)', currency?, generatedBy?, generatedRole?, footer?,
  //   years: [{ year: 2025, label?: '2026 (YTD)', months?: 5, partial?: bool,
  //             revenue, cogs, netProfit, grossProfit?, opex?,        // gross / opex derived if absent
  //             injera?, derkosh?, asp?, derkoshAsp?,                 // produced pcs / kg, avg selling prices
  //             injeraRev?, derkoshRev?,                              // product mix
  //             costPerInjera?, profitPerInjera?,                     // derived from cogs / injera / asp if absent
  //             derkoshCostPerKg?, derkoshProfitPerKg?,
  //             cogsComponents?: { blend, corn, ... }, concentration?: { top1, top3, top10 },  // concentration in %
  //             likeForLike?: { revenue, cogs, netProfit } }],        // prior year, SAME months (for a partial year)
  //   componentLabels?: { key: 'Label' },
  //   topCustomers?: [{ name, byYear: { 2023: 1200, ... } }],
  //   retention?: [{ name, byYear: { 2023: 1200, 2024: null, ... } }],   // null / missing = no sales that year
  //   ingredients?: [{ name, byYear: { 2023: 41.5, ... } }], ingredientUnit?: 'ETB/kg',
  //   ingredientForecast?: { name, labels: [...], actual: [...], avg3: [...], avg6: [...] },
  //   seasonality?: { metric, decimals?, rows: [{ year|label, values: [12 numbers or null] }] },
  //   variance?: { metric, decimals?, rows: [{ period, actual, prior, variance, variancePct, favorable }] },
  //   insights?: ['text' | { label, color, text }],                  // the page's executive summary
  //   notes?: ['extra footer note']
  // }
  // ---------------------------------------------------------------
  presets.multiyear = function (input) {
    const i = input || {};
    const base = presetBase(i, 'Multi-Year', 'Multi-Year Report');
    if (base.status === 'empty') return base;
    const cur = base.currency;
    const num = v => (hasNum(v) ? Number(v) : null);
    const ys = asArr(i.years).filter(y => y && hasNum(y.year)).slice().sort((a, b) => Number(a.year) - Number(b.year));
    if (!ys.length) {
      base.status = 'empty';
      base.emptyMessage = i.emptyMessage || 'No yearly figures were supplied for the selected years.';
      return base;
    }

    // ---- normalise each year (derive only what the page's own formulas derive) ----
    const Y = ys.map(y => {
      const partial = y.partial === true || (hasNum(y.months) && Number(y.months) < 12);
      const rev = num(y.revenue) || 0, cogs = num(y.cogs) || 0, net = num(y.netProfit) || 0;
      const gross = num(y.grossProfit) !== null ? num(y.grossProfit) : rev - cogs;
      const opex = num(y.opex) !== null ? num(y.opex) : gross - net;
      const inj = num(y.injera), asp = num(y.asp);
      const cpi = num(y.costPerInjera) !== null ? num(y.costPerInjera) : (inj ? cogs / inj : null);
      const ppi = num(y.profitPerInjera) !== null ? num(y.profitPerInjera) : (asp !== null && cpi !== null ? asp - cpi : null);
      return { year: Number(y.year), label: y.label || (String(y.year) + (partial ? ' (YTD)' : '')), partial,
        rev, cogs, net, gross, opex, opexDerived: num(y.opex) === null, grossGiven: num(y.grossProfit) !== null,
        inj, der: num(y.derkosh), asp, dAsp: num(y.derkoshAsp), injRev: num(y.injeraRev), derRev: num(y.derkoshRev),
        cpi, ppi, dCost: num(y.derkoshCostPerKg), dProfit: num(y.derkoshProfitPerKg),
        comps: y.cogsComponents && typeof y.cogsComponents === 'object' ? y.cogsComponents : null,
        conc: y.concentration && typeof y.concentration === 'object' ? y.concentration : null,
        llf: y.likeForLike && typeof y.likeForLike === 'object' ? y.likeForLike : null,
        gm: rev ? (gross / rev) * 100 : null, nm: rev ? (net / rev) * 100 : null };
    });
    const L = Y.map(y => y.label);
    const last = Y.length - 1;
    const any = f => Y.some(y => f(y) !== null && f(y) !== undefined);
    const LLF = { rev: 'revenue', cogs: 'cogs', net: 'netProfit' };
    // Baseline for year-over-year change: the previous year, or for a part-year the SAME months of the previous year.
    const prior = (k, f) => {
      const y = Y[k];
      if (y.partial) return y.llf && hasNum(y.llf[LLF[f]]) ? Number(y.llf[LLF[f]]) : null;
      return k > 0 ? Y[k - 1][f] : null;
    };
    const chg = (c, b) => (b ? ((c - b) / Math.abs(b)) * 100 : null);
    const growth = (k, f) => { const b = prior(k, f); return b === null ? null : chg(Y[k][f], b); };
    const gCell = (g, pol) => (g === null ? '—' : { v: fmt.signedPct(g), tone: (pol || 1) * g >= 0 ? 'good' : 'bad' });
    const mCell = (v, d) => (v === null || v === undefined ? '—' : fmt.n(v, d));
    const refLabel = last > 0 ? (Y[last].partial ? `${Y[last - 1].year} same months` : Y[last - 1].label) : null;
    const lastTag = Y[last].label;

    // ---- KPI cards ----
    const totRev = sumBy(Y, y => y.rev), totCogs = sumBy(Y, y => y.cogs), totNet = sumBy(Y, y => y.net);
    const totMargin = totRev ? (totNet / totRev) * 100 : 0;
    const yoy = (f, pol) => {
      const g = last > 0 ? growth(last, f) : null;
      return g === null ? {} : { delta: `${lastTag}: ${fmt.signedPct(g)} YoY`, deltaTone: (pol || 1) * g >= 0 ? 'good' : 'warn' };
    };
    const prodYoy = f => {
      if (last < 1 || Y[last].partial || Y[last][f] === null || !Y[last - 1][f]) return {};
      const g = chg(Y[last][f], Y[last - 1][f]);
      return { delta: `${lastTag}: ${fmt.signedPct(g)} YoY`, deltaTone: g >= 0 ? 'good' : 'warn' };
    };
    base.kpis = [
      Object.assign({ label: 'Total Revenue', value: fmt.money(totRev), unit: cur, color: '#1D5C38' }, yoy('rev', 1)),
      Object.assign({ label: 'Total COGS', value: fmt.money(totCogs), unit: cur, color: '#C0392B' }, yoy('cogs', -1)),
      Object.assign({ label: 'Net Profit', value: fmt.money(totNet), unit: cur, color: '#C89B3C' }, yoy('net', 1)),
      { label: 'Net Profit Margin', value: fmt.pct(totMargin), color: '#8E44AD',
        delta: last > 0 && Y[last].nm !== null && Y[last - 1].nm !== null ? `${lastTag}: ${(Y[last].nm - Y[last - 1].nm >= 0 ? '+' : '') + (Y[last].nm - Y[last - 1].nm).toFixed(1)} pts YoY` : undefined,
        deltaTone: last > 0 && Y[last].nm !== null && Y[last - 1].nm !== null ? (Y[last].nm >= Y[last - 1].nm ? 'good' : 'warn') : undefined }
    ];
    if (any(y => y.inj)) base.kpis.push(Object.assign({ label: 'Injera Produced', value: fmt.money(sumBy(Y, y => y.inj)), unit: 'pcs', color: '#2E86DE' }, prodYoy('inj')));
    if (any(y => y.der)) base.kpis.push(Object.assign({ label: 'Derkosh Produced', value: fmt.money(sumBy(Y, y => y.der)), unit: 'kg', color: '#E67E22' }, prodYoy('der')));

    // ---- charts: the first two form the summary page; everything else is detailed-only ----
    base.charts = [
      { type: 'bar', title: 'Revenue Trend', subtitle: `${cur} per year`, labels: L, values: Y.map(y => y.rev) },
      { type: 'line', title: 'Net Profit Trend', subtitle: `${cur} per year`, labels: L, values: Y.map(y => y.net) }
    ];
    const dChart = c => { const o = Object.assign({ detailOnly: true }, c); base.charts.push(o); return o; };
    dChart({ type: 'line', title: 'Gross vs. Net Margin', subtitle: '% of revenue', labels: L,
      series: [{ label: 'Gross margin', values: Y.map(y => y.gm || 0), color: '#2D6A4F' }, { label: 'Net margin', values: Y.map(y => y.nm || 0), color: '#C89B3C' }] });
    dChart({ type: 'bar', title: 'COGS Trend', subtitle: `${cur} per year`, labels: L, values: Y.map(y => y.cogs), colors: L.map(() => '#C0392B') });
    if (any(y => y.inj)) dChart({ type: 'bar', title: 'Injera Production', subtitle: 'pcs per year', labels: L, values: Y.map(y => y.inj || 0) });
    if (any(y => y.der)) dChart({ type: 'bar', title: 'Derkosh Production', subtitle: 'kg per year', labels: L, values: Y.map(y => y.der || 0) });
    if (any(y => y.injRev) || any(y => y.derRev)) dChart({ type: 'bar', title: 'Product Mix', subtitle: '% of revenue', labels: L,
      series: [{ label: 'Injera', values: Y.map(y => (y.rev && y.injRev ? (y.injRev / y.rev) * 100 : 0)), color: '#1D5C38' },
        { label: 'Derkosh', values: Y.map(y => (y.rev && y.derRev ? (y.derRev / y.rev) * 100 : 0)), color: '#C89B3C' }] });
    if (any(y => y.cpi)) dChart({ type: 'bar', title: 'Injera Unit Economics', subtitle: `${cur} per piece`, labels: L,
      series: [{ label: 'Cost per injera', values: Y.map(y => y.cpi || 0), color: '#C0392B' }, { label: 'Profit per injera', values: Y.map(y => y.ppi || 0), color: '#1D5C38' }] });
    const compKeys = [];
    const labelOfComp = k => (i.componentLabels && i.componentLabels[k]) || ({ blend: 'Injera Blend', corn: 'Corn', gomen: 'Gomen Zere', teff: 'Teff', rice: 'Rice', labor: 'Labor', fuel: 'Fuel/Energy', packaging: 'Packaging' })[k] || k;
    ['blend', 'corn', 'gomen', 'teff', 'rice', 'labor', 'fuel', 'packaging'].concat(Y.reduce((a, y) => a.concat(y.comps ? Object.keys(y.comps) : []), [])).forEach(k => {
      if (!compKeys.includes(k) && Y.some(y => y.comps && Math.abs(Number(y.comps[k]) || 0) > 0)) compKeys.push(k);
    });
    const compYear = Y.slice().reverse().find(y => y.comps && compKeys.some(k => Number(y.comps[k]) > 0));
    if (compYear) {
      const parts = compKeys.filter(k => Number(compYear.comps[k]) > 0);
      dChart({ type: 'doughnut', title: `COGS Decomposition — ${compYear.label}`, labels: parts.map(labelOfComp), values: parts.map(k => Number(compYear.comps[k])),
        colors: PALETTE, centerLabel: { top: 'COGS', value: fmt.money(sumBy(parts, k => Number(compYear.comps[k]))), bottom: cur } });
    }
    if (any(y => y.conc)) dChart({ type: 'line', title: 'Customer Concentration', subtitle: '% of revenue', labels: L,
      series: [['top1', 'Top 1', '#C0392B'], ['top3', 'Top 3', '#C89B3C'], ['top10', 'Top 10', '#1D5C38']].map(s => ({ label: s[1], color: s[2], values: Y.map(y => (y.conc && hasNum(y.conc[s[0]]) ? Number(y.conc[s[0]]) : 0)) })) });
    const ingFull = asArr(i.ingredients).filter(g => g && g.name && Y.every(y => g.byYear && hasNum(g.byYear[y.year])));
    if (ingFull.length && Y.length > 1) dChart({ type: 'line', title: 'Ingredient Price Trend', subtitle: i.ingredientUnit || 'ETB/kg', labels: L,
      series: ingFull.slice(0, 5).map((g, k) => ({ label: g.name, values: Y.map(y => Number(g.byYear[y.year])), color: PALETTE[k % PALETTE.length] })) });
    const fc = i.ingredientForecast;
    if (fc && Array.isArray(fc.labels) && Array.isArray(fc.actual)) {
      const keep = fc.labels.map((_, k) => k).filter(k => hasNum(fc.actual[k]) && hasNum((fc.avg3 || [])[k]) && hasNum((fc.avg6 || [])[k]));
      if (keep.length > 1) dChart({ type: 'line', title: `${fc.name || 'Ingredient'} Price vs. Rolling Averages`, subtitle: i.ingredientUnit || 'ETB/kg', labels: keep.map(k => String(fc.labels[k])),
        series: [{ label: 'Actual', values: keep.map(k => Number(fc.actual[k])), color: '#1D5C38' }, { label: '3-month avg', values: keep.map(k => Number(fc.avg3[k])), color: '#2E86DE' }, { label: '6-month avg', values: keep.map(k => Number(fc.avg6[k])), color: '#9AADA5' }] });
    }

    // ---- tables ----
    const right = cols => cols.map((_, k) => (k === 0 ? null : 'right'));
    const T = (title, sheetName, columns, rows, extra) => Object.assign({ title, sheetName, columns, rows, columnAlign: right(columns), negativeRed: true }, extra || {});
    const tables = [];
    // [0] summary page, left
    tables.push(T('Year-over-Year Summary', 'YoY Summary', ['Year', `Revenue (${cur})`, `COGS (${cur})`, `Net Profit (${cur})`, 'Net Margin'],
      Y.map(y => [y.label, fmt.money(y.rev), fmt.money(y.cogs), fmt.money(y.net), mCell(y.nm === null ? null : y.nm, 1) === '—' ? '—' : fmt.pct(y.nm)]),
      { totalsRow: ['TOTAL', fmt.money(totRev), fmt.money(totCogs), fmt.money(totNet), fmt.pct(totMargin)], additive: [1, 2, 3] }));
    // [1] summary page, right
    if (any(y => y.inj) || any(y => y.der)) {
      tables.push(T('Production by Year', 'Production', ['Year', 'Injera Produced (pcs)', 'Derkosh Produced (kg)'],
        Y.map(y => [y.label, mCell(y.inj, 0), mCell(y.der, 0)]),
        { totalsRow: ['TOTAL', fmt.money(sumBy(Y, y => y.inj)), fmt.money(sumBy(Y, y => y.der))], additive: [1, 2] }));
      base.summaryTables = 2;
    }
    // detailed: YoY P&L
    tables.push(T('Year-over-Year P&L', 'YoY P&L', ['Year', `Revenue (${cur})`, `COGS (${cur})`, `Gross Profit (${cur})`, `Operating Expenses (${cur})`, `Net Profit (${cur})`, 'Gross Margin', 'Net Margin'],
      Y.map(y => [y.label, fmt.money(y.rev), fmt.money(y.cogs), fmt.money(y.gross), fmt.money(y.opex), fmt.money(y.net), y.gm === null ? '—' : fmt.pct(y.gm), y.nm === null ? '—' : fmt.pct(y.nm)]),
      { totalsRow: ['TOTAL', fmt.money(totRev), fmt.money(totCogs), fmt.money(sumBy(Y, y => y.gross)), fmt.money(sumBy(Y, y => y.opex)), fmt.money(totNet),
        totRev ? fmt.pct((sumBy(Y, y => y.gross) / totRev) * 100) : '—', fmt.pct(totMargin)], additive: [1, 2, 3, 4, 5] }));
    // revenue
    const hasMixRev = any(y => y.injRev) || any(y => y.derRev);
    tables.push(T('Revenue by Year', 'Revenue', ['Year', `Revenue (${cur})`, 'Growth'].concat(hasMixRev ? [`Injera (${cur})`, `Derkosh (${cur})`] : []),
      Y.map((y, k) => [y.label, fmt.money(y.rev), gCell(growth(k, 'rev'), 1)].concat(hasMixRev ? [mCell(y.injRev, 0), mCell(y.derRev, 0)] : [])),
      { reconcile: false }));
    // COGS
    tables.push(T('COGS by Year', 'COGS', ['Year', `COGS (${cur})`, '% of Revenue', 'Change'],
      Y.map((y, k) => [y.label, fmt.money(y.cogs), y.rev ? fmt.pct((y.cogs / y.rev) * 100) : '—', gCell(growth(k, 'cogs'), -1)]), { reconcile: false }));
    // profit & margin
    tables.push(T('Profit and Margin by Year', 'Profit and Margin', ['Year', `Gross Profit (${cur})`, 'Gross Margin', `Net Profit (${cur})`, 'Net Margin', 'Net Profit Change'],
      Y.map((y, k) => [y.label, fmt.money(y.gross), y.gm === null ? '—' : fmt.pct(y.gm), fmt.money(y.net), y.nm === null ? '—' : fmt.pct(y.nm), gCell(growth(k, 'net'), 1)]), { reconcile: false }));
    // product mix
    if (hasMixRev) {
      const mixRows = Y.map((y, k) => {
        const other = y.rev - (y.injRev || 0) - (y.derRev || 0);
        const sh = v => (y.rev && v !== null ? fmt.pct((v / y.rev) * 100) : '—');
        const pm = k > 0 && y.rev && Y[k - 1].rev && y.injRev !== null && Y[k - 1].injRev !== null ? (y.injRev / y.rev - Y[k - 1].injRev / Y[k - 1].rev) * 100 : null;
        return [y.label, mCell(y.injRev, 0), mCell(y.derRev, 0), Math.abs(other) > 0.5 ? fmt.money(other) : '—', sh(y.injRev), sh(y.derRev),
          pm === null ? '—' : `${pm >= 0 ? '+' : ''}${pm.toFixed(1)} pts`];
      });
      tables.push(T('Product Mix by Year', 'Product Mix', ['Year', `Injera (${cur})`, `Derkosh (${cur})`, `Other (${cur})`, 'Injera Share', 'Derkosh Share', 'Injera Share Change'], mixRows, { reconcile: false }));
    }
    // per-unit economics
    if (any(y => y.cpi)) {
      tables.push(T('Per-Unit Economics — Injera', 'Unit Economics Injera', ['Year', `Avg. Selling Price (${cur}/pc)`, `Cost per Injera (${cur})`, `Profit per Injera (${cur})`, 'Profit Margin'],
        Y.map(y => [y.label, mCell(y.asp, 2), mCell(y.cpi, 2), y.ppi === null ? '—' : { v: fmt.money2(y.ppi), tone: y.ppi < 0 ? 'bad' : undefined }, y.asp ? fmt.pct(((y.ppi || 0) / y.asp) * 100) : '—']), { reconcile: false }));
    }
    if (any(y => y.dAsp)) {
      const withCost = any(y => y.dCost), withProfit = any(y => y.dProfit);
      tables.push(T('Per-Unit Economics — Derkosh', 'Unit Economics Derkosh', ['Year', `Avg. Selling Price (${cur}/kg)`].concat(withCost ? [`Cost per kg (${cur})`] : [], withProfit ? [`Profit per kg (${cur})`] : []),
        Y.map(y => [y.label, mCell(y.dAsp, 2)].concat(withCost ? [mCell(y.dCost, 2)] : [], withProfit ? [mCell(y.dProfit, 2)] : [])), { reconcile: false }));
    }
    // customers
    const custTotal = c => sumBy(Y, y => (c.byYear && hasNum(c.byYear[y.year]) ? Number(c.byYear[y.year]) : 0));
    const tops = asArr(i.topCustomers).filter(c => c && c.name).slice().sort((a, b) => custTotal(b) - custTotal(a)).slice(0, 10);
    if (tops.length) {
      tables.push(T('Top Customers', 'Top Customers', ['Rank', 'Customer'].concat(L.map(l => `${l} (${cur})`), [`Total (${cur})`, '% of Revenue']),
        tops.map((c, k) => [String(k + 1), c.name].concat(Y.map(y => (c.byYear && hasNum(c.byYear[y.year]) ? fmt.money(c.byYear[y.year]) : '—')), [fmt.money(custTotal(c)), totRev ? fmt.pct((custTotal(c) / totRev) * 100) : '—'])),
        { columnAlign: ['right', null].concat(L.map(() => 'right'), ['right', 'right']), reconcile: false }));
    }
    if (any(y => y.conc)) {
      const cv = (y, k) => (y.conc && hasNum(y.conc[k]) ? fmt.pct(Number(y.conc[k])) : '—');
      tables.push(T('Customer Concentration', 'Concentration', ['Year', 'Top 1 Share', 'Top 3 Share', 'Top 10 Share'], Y.map(y => [y.label, cv(y, 'top1'), cv(y, 'top3'), cv(y, 'top10')]), { reconcile: false }));
    }
    const ret = asArr(i.retention).filter(c => c && c.name);
    if (ret.length) {
      const cols = ['Customer']; Y.forEach((y, k) => { cols.push(`${y.label} (${cur})`); if (k > 0) cols.push('Change'); });
      const val = (c, y) => (c.byYear && hasNum(c.byYear[y.year]) ? Number(c.byYear[y.year]) : null);
      tables.push(T('Customer Retention / Churn', 'Retention', cols, ret.map(c => {
        const row = [c.name];
        Y.forEach((y, k) => {
          const v = val(c, y); row.push(v === null ? '—' : fmt.money(v));
          if (k > 0) {
            const p = val(c, Y[k - 1]);
            if (p === null && v !== null) row.push({ v: 'NEW', tone: 'good' });
            else if (p !== null && (v === null || v === 0)) row.push({ v: 'CHURNED', tone: 'bad' });
            else if (p !== null && v !== null && p > 0) { const g = chg(v, p); row.push({ v: fmt.signedPct(g), tone: g >= 0 ? 'good' : 'bad' }); }
            else row.push('—');
          }
        });
        return row;
      }), { reconcile: false }));
    }
    // ingredients
    const ings = asArr(i.ingredients).filter(g => g && g.name);
    if (ings.length) {
      const pv = (g, y) => (g.byYear && hasNum(g.byYear[y.year]) ? Number(g.byYear[y.year]) : null);
      tables.push(T(`Ingredient Prices (${i.ingredientUnit || 'ETB/kg'}, yearly average)`, 'Ingredients', ['Ingredient'].concat(L, ['First to Last']),
        ings.map(g => { const vs = Y.map(y => pv(g, y)).filter(v => v !== null); return [g.name].concat(Y.map(y => mCell(pv(g, y), 2)), [vs.length > 1 ? gCell(chg(vs[vs.length - 1], vs[0]), -1) : '—']); }), { reconcile: false }));
    }
    // seasonality
    const sea = i.seasonality;
    if (sea && Array.isArray(sea.rows) && sea.rows.length) {
      const d = hasNum(sea.decimals) ? Number(sea.decimals) : 0;
      tables.push(T(`Seasonality — ${sea.metric || 'Monthly values'}`, 'Seasonality', ['Year', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        sea.rows.map(r => [String(r.label || r.year)].concat(Array.from({ length: 12 }, (_, m) => mCell(r.values && hasNum(r.values[m]) ? Number(r.values[m]) : null, d)))), { reconcile: false }));
    }
    // variance
    const vr = i.variance;
    if (vr && Array.isArray(vr.rows) && vr.rows.length) {
      const d = hasNum(vr.decimals) ? Number(vr.decimals) : 0;
      tables.push(T(`Variance Analysis — ${vr.metric || 'Year-over-Year'}`, 'Variance', ['Period', 'Actual', 'Prior Period', 'Variance', 'Variance %', 'Status'],
        vr.rows.map(r => [String(r.period), mCell(num(r.actual), d), mCell(num(r.prior), d), mCell(num(r.variance), d), hasNum(r.variancePct) ? fmt.signedPct(r.variancePct) : '—',
          { v: r.favorable ? 'Favorable' : 'Unfavorable', tone: r.favorable ? 'good' : 'bad' }]), { reconcile: false }));
    }
    // COGS decomposition
    if (compKeys.length) {
      const amt = (y, k) => (y.comps ? Number(y.comps[k]) || 0 : 0);
      const withComps = Y.filter(y => y.comps);
      const compTotal = y => sumBy(compKeys, k => amt(y, k));
      tables.push(T('COGS Components by Year', 'COGS Decomposition', ['Year'].concat(compKeys.map(labelOfComp), [`Total (${cur})`]),
        withComps.map(y => [y.label].concat(compKeys.map(k => fmt.money(amt(y, k))), [fmt.money(compTotal(y))])), { reconcile: false }));
      tables.push(T('COGS Mix (% of components)', 'COGS Mix', ['Year'].concat(compKeys.map(labelOfComp)),
        withComps.map(y => [y.label].concat(compKeys.map(k => (compTotal(y) ? fmt.pct((amt(y, k) / compTotal(y)) * 100) : '—')))), { reconcile: false }));
    }
    // production with selling prices (Detailed "Production" section)
    if (any(y => y.inj) || any(y => y.der) || any(y => y.asp) || any(y => y.dAsp)) {
      const pc = [['Year', y => y.label]];
      if (any(y => y.inj)) pc.push(['Injera Produced (pcs)', y => mCell(y.inj, 0)]);
      if (any(y => y.asp)) pc.push([`Injera Avg. Price (${cur}/pc)`, y => mCell(y.asp, 2)]);
      if (any(y => y.der)) pc.push(['Derkosh Produced (kg)', y => mCell(y.der, 0)]);
      if (any(y => y.dAsp)) pc.push([`Derkosh Avg. Price (${cur}/kg)`, y => mCell(y.dAsp, 2)]);
      tables.push(T('Production and Selling Prices', 'Production and Prices', pc.map(c => c[0]), Y.map(y => pc.map(c => c[1](y))), { reconcile: false }));
    }
    // seasonal findings, taken from the monthly values the page supplied
    if (sea && Array.isArray(sea.rows) && sea.rows.length) {
      const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], sd = hasNum(sea.decimals) ? Number(sea.decimals) : 0;
      const ex = sea.rows.map(r => {
        const pts = asArr(r.values).map((v, m) => ({ v: hasNum(v) ? Number(v) : null, m })).filter(p => p.v !== null);
        if (!pts.length) return null;
        const hi = pts.reduce((a, p) => (p.v > a.v ? p : a)), lo = pts.reduce((a, p) => (p.v < a.v ? p : a));
        return [String(r.label || r.year), MN[hi.m], fmt.n(hi.v, sd), MN[lo.m], fmt.n(lo.v, sd), String(pts.length)];
      }).filter(Boolean);
      if (ex.length) tables.push(T('Seasonal Highs and Lows', 'Seasonal Extremes', ['Year', 'Highest Month', 'Highest Value', 'Lowest Month', 'Lowest Value', 'Months With Data'], ex, { reconcile: false }));
    }
    base.tables = tables;

    // ---- reconciliation (only figures the page actually supplied) ----
    base.checks = [];
    Y.forEach(y => {
      if (y.grossGiven) base.checks.push({ label: `${y.label}: gross profit vs. revenue less COGS`, expected: y.rev - y.cogs, actual: y.gross, tolerance: 1 });
      if (!y.opexDerived) base.checks.push({ label: `${y.label}: net profit vs. gross profit less operating expenses`, expected: y.gross - y.opex, actual: y.net, tolerance: 1 });
      if (y.comps && compKeys.length) base.checks.push({ label: `${y.label}: COGS components vs. total COGS`, expected: y.cogs, actual: sumBy(compKeys, k => Number(y.comps[k]) || 0), tolerance: 1 });
    });

    // ---- Key Insights: the page's executive summary wins; otherwise built from the same figures ----
    if (asArr(i.insights).length) {
      // the page's executive summary is HTML (<b>…</b>); a PDF needs plain text
      const plain = t => String(t === undefined || t === null ? '' : t).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      base.insights = asArr(i.insights).map(t => (typeof t === 'string' ? { label: 'Insight', color: '#1D5C38', text: plain(t) } : (t && typeof t === 'object' ? Object.assign({}, t, { text: plain(t.text) }) : null)))
        .filter(t => t && t.text).slice(0, 6);
    } else {
      const ins = [];
      const gR = last > 0 ? growth(last, 'rev') : null;
      ins.push({ label: 'Revenue', color: '#1D5C38', text: gR === null ? `Revenue for ${lastTag} was ${fmt.money(Y[last].rev)} ${cur}.`
        : `Revenue ${gR >= 0 ? 'rose' : 'fell'} ${fmt.pct(Math.abs(gR))} in ${lastTag} versus ${refLabel} (${fmt.money(Y[last].rev)} ${cur}).` });
      const best = Y.reduce((a, y) => (y.net > a.net ? y : a), Y[0]);
      ins.push({ label: 'Profit', color: '#C89B3C', text: `${best.label} recorded the highest net profit: ${fmt.money(best.net)} ${cur}${best.nm !== null ? ` (${fmt.pct(best.nm)} margin)` : ''}.` });
      if (Y.length > 1 && Y[0].nm !== null && Y[last].nm !== null) ins.push({ label: 'Margin', color: '#8E44AD', text: `Net margin moved from ${fmt.pct(Y[0].nm)} in ${Y[0].label} to ${fmt.pct(Y[last].nm)} in ${lastTag}.` });
      if (last > 0 && !Y[last].partial && Y[last].inj && Y[last - 1].inj) { const g = chg(Y[last].inj, Y[last - 1].inj);
        ins.push({ label: 'Output', color: '#2E86DE', text: `Injera production ${g >= 0 ? 'grew' : 'fell'} ${fmt.pct(Math.abs(g))} in ${lastTag} versus ${Y[last - 1].label}.` }); }
      if (Y[last].rev && Y[last].injRev !== null) ins.push({ label: 'Mix', color: '#2E86DE', text: `${lastTag} revenue mix: Injera ${fmt.pct((Y[last].injRev / Y[last].rev) * 100, 0)}${Y[last].derRev !== null ? `, Derkosh ${fmt.pct((Y[last].derRev / Y[last].rev) * 100, 0)}` : ''}.` });
      base.insights = ins.slice(0, 5);
    }

    // ---- Detailed PDF order (the plan): sections print in this order, ending with the Executive Summary ----
    const shT = n => tables.find(t => t.sheetName === n);
    const chT = t => base.charts.find(c => String(c.title).indexOf(t) !== -1);
    const sec = (title, chartTitles, sheets) => ({ title, charts: chartTitles.map(chT).filter(Boolean), tables: sheets.map(shT).filter(Boolean) });
    base.detailSections = [
      sec('Year-over-Year P&L', [], ['YoY P&L']),
      sec('Revenue Analysis', ['Revenue Trend'], ['Revenue']),
      sec('COGS Analysis', ['COGS Trend'], ['COGS']),
      sec('Profit & Margin', ['Net Profit Trend', 'Gross vs. Net Margin'], ['Profit and Margin']),
      sec('Production', ['Injera Production', 'Derkosh Production'], ['Production and Prices']),
      sec('Product Mix', ['Product Mix'], ['Product Mix']),
      sec('Per-Unit Economics', ['Injera Unit Economics'], ['Unit Economics Injera', 'Unit Economics Derkosh']),
      sec('Customer Analysis', ['Customer Concentration'], ['Top Customers', 'Concentration', 'Retention']),
      sec('Ingredient Analysis', ['Ingredient Price Trend', 'Price vs. Rolling Averages'], ['Ingredients']),
      sec('Seasonality', [], ['Seasonality', 'Seasonal Extremes']),
      sec('Variance', [], ['Variance']),
      sec('COGS Decomposition', ['COGS Decomposition'], ['COGS Decomposition', 'COGS Mix']),
      { title: 'Executive Summary', insights: base.insights }
    ].filter(x => (x.charts && x.charts.length) || (x.tables && x.tables.length) || (x.insights && x.insights.length));
    base.typeTitles = { summary: 'Multi-Year Report — Summary', detailed: 'Multi-Year Report — Detailed' };

    // ---- definitions and footer notes ----
    base.definitions = (base.definitions || []).concat([
      { term: 'Net profit margin', text: 'Net profit divided by revenue, for the selected years.' },
      { term: 'Cost per injera', text: 'Total COGS for the year divided by the injera produced that year.' },
      { term: 'Same months', text: 'For a part-year (YTD), growth is measured against the same months of the previous year, not the full previous year.' }
    ]);
    const notes = [];
    if (Y.some(y => y.partial)) notes.push(`${Y.filter(y => y.partial).map(y => y.label).join(', ')} covers part of the year only. Totals include it; growth is shown only where a same-months comparison was supplied.`);
    if (Y.some(y => y.opexDerived)) notes.push('Operating expenses are the gap between gross profit and net profit, as no separate expense layer is tracked.');
    asArr(i.notes).forEach(n => { if (n) notes.push(String(n)); });
    if (notes.length) base.notes = (base.notes || []).concat(notes);
    return base;
  };

  // ---- PRESET EXPORT POINT: later modules are added above this line ----

  // ------------------------------------------------------------
  // EXPORT
  // ------------------------------------------------------------
  global.ReportEngine = {
    THEME,
    ensureLibs,
    renderChartToImage,
    generatePDF,
    generateExcel,
    generateCSV,
    presets,
    format: fmt
  };

})(window);
