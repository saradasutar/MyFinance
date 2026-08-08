MY FINANCE — FAMILY PORTFOLIO V3
================================

This upgrade is made for:
- Combined / Sarada / Niharika portfolio views
- Mutual fund transaction-statement import for both investors
- Automatic consolidation of SIPs, purchases and redemptions
- PAN and folio are ignored and are NOT stored by the new importer
- Niharika stock/ETF holdings import
- Future Sarada stock upload
- Zerodha holdings XLSX/CSV import support
- Automatic stock/ETF prices via Google Finance
- Automatic MF current NAV via AMFI
- Gain/Loss ₹ and Gain/Loss %
- MF XIRR from transaction history
- 1D, 1W, 1M, 6M, 1Y, 3Y, 5Y and 10Y asset/scheme performance

IMPORTANT
---------
Your Apps Script URL is already placed in github-frontend/config.js.
Do NOT put any password, PAN, folio number, Sheet ID or private key in GitHub.

STEP 1 — UPDATE GOOGLE APPS SCRIPT
----------------------------------
1. Open your existing Investment Dashboard Apps Script project.
2. Open Code.gs.
3. Delete the old Code.gs contents.
4. Copy everything from:
   google-apps-script/Code.gs
5. Paste it into Apps Script and Save.
6. In the function drop-down choose setupSystem.
7. Click Run once and approve permission if asked.
   - On your existing project this upgrades the database schema.
   - It adds Owner/SourceCode columns and Transactions/Performance sheets.
   - It does not intentionally delete your existing holdings/watchlist data.
8. Go to Deploy -> Manage deployments.
9. Click the pencil/edit icon on your Web app deployment.
10. Version -> New version.
11. Click Deploy.
12. Keep the same /exec URL.

If Apps Script asks about appsscript.json, the supplied manifest is in:
   google-apps-script/appsscript.json

STEP 2 — UPDATE GITHUB
----------------------
In https://github.com/saradasutar/MyFinance replace/upload these files from github-frontend:
- index.html
- styles.css
- app.js
- config.js
- .nojekyll

Commit the changes to main.
Wait about 1-2 minutes, then open:
https://saradasutar.github.io/MyFinance/?v=3000
On Mac press Command + Shift + R.

STEP 3 — IMPORT THE MUTUAL FUNDS
--------------------------------
A cleaned file is supplied:
   mf-transactions-cleaned.csv

It was prepared from the two MF datasets shared in ChatGPT.
PAN and folio columns are not present in this cleaned file.

In the dashboard:
1. Sign in.
2. Click Import portfolio.
3. Choose Mutual fund statement.
4. Select mf-transactions-cleaned.csv.
5. Click Import.
6. Re-uploading the same statement is designed to skip duplicate transaction rows.
7. Click the Refresh icon after import to populate the latest NAV and 1D-10Y performance.

The importer recognises these statement columns:
MF_NAME, INVESTOR_NAME, PRODUCT_CODE, SCHEME_NAME, Type, TRADE_DATE,
TRANSACTION_TYPE, DIVIDEND_RATE, AMOUNT, UNITS, PRICE, BROKER.

Non-financial rows such as address updates, nominee registration, mandate updates,
KRA/NCT changes and similar administrative rows are ignored in the browser.

STEP 4 — IMPORT NIHARIKA STOCKS/ETFs
-------------------------------------
A ready file is supplied:
   niharika-stock-import.csv

In the dashboard:
1. Click Import portfolio.
2. Choose Stock / Zerodha holdings.
3. Investor: Niharika.
4. Select niharika-stock-import.csv.
5. Click Import.
6. Click Refresh.

The imported stock file stores only the holding information required for tracking.
Current price, current value and gain/loss are calculated automatically.

STEP 5 — ZERODHA LATER
----------------------
The Stock / Zerodha importer accepts CSV and XLSX.
It recognises common headings such as:
- Instrument / Symbol / Tradingsymbol
- Quantity / Qty.
- Avg Buy Price / Avg. cost / Average price
- Exchange
- Invested Amount / Cost Value (if present)

If Investor Name is not present in the Zerodha file, select Sarada or Niharika in
the import window before choosing the file.

Sarada currently needs no stock rows. When Sarada buys stocks later, use the same
Stock / Zerodha importer and select Sarada.

PERFORMANCE NOTES
-----------------
- Current stock/ETF prices use Google Finance and may be delayed.
- Mutual fund latest NAV uses AMFI end-of-day NAV data.
- Mutual fund 1D-10Y history uses a public MF history service; if that service is
  temporarily unavailable, current NAV/value still works and performance may show —.
- Stock/ETF 1D-10Y history is calculated using Google Finance formulas in the private Sheet.
- MF XIRR is calculated from imported purchase/SIP/redemption cash flows plus current value.
- For stocks, XIRR will remain — until trade-level history is imported in a future upgrade.

If any MF displays 'AMFI mapping pending', edit that holding and enter the correct numeric
AMFI scheme code. The automatic matcher should resolve most current schemes but renamed or
merged schemes can sometimes require manual correction.
