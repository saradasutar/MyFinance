MYFINANCE V15.5 — MASTER SPREADSHEET REPLACEMENT

SOURCE
Family_Portfolio_stock nm Tracker.xlsx

EXTRACTED DATA
- Niharika Stocks/ETFs invested: ₹574,647.01
- Niharika Mutual Funds invested: ₹554,521.25
- Sarada Mutual Funds invested: ₹2,086,171.49
- Combined invested amount: ₹3,215,339.75
- Consolidated holdings: 35
- Cleaned watchlist items: 17

CLEANING / PRIVACY
- Duplicate HDFCBANK watchlist row was consolidated.
- Same-investor mutual-fund rows with the same ISIN were consolidated.
- Folio-specific text was removed from fund names.
- No PAN or folio identifiers are written into this dashboard package.
- Blank-code invalid MF watchlist rows were not imported.

REPLACE FROM MASTER SHEET
This new button:
- deletes old Holdings for the signed-in dashboard account
- deletes old Watchlist rows
- deletes old MF Transactions
- loads the 35 holdings and 17 watchlist items above
- preserves Daily Diary
- preserves Monthly Diary / Plan / Experience / Targets
- preserves users/passwords/settings
- attempts a backend backup before replacement

WATCHLIST DETAILS
The View drawer now displays:
- live price/NAV
- workbook snapshot price and day move
- day high/low
- volume
- 52-week high/low
- market cap/assets/debt field
- sales/profit growth
- P/E or P/B
- remark/moat/management
- final remark
- 1M/1Y/3Y/5Y/10Y workbook performance

VERSIONS
Login page:
- Frontend v15.5
- Backend version read live from Apps Script

Inside dashboard:
- signed-in username
- Frontend v15.5
- Backend version
- FE/BE chips in the top header

INSTALL
1. GitHub:
   Upload app-v15-5.js as a NEW file.
   Replace index.html.
   Replace styles.css.
   Keep config.js unchanged.

2. Apps Script:
   Replace Code.gs with Code-v3.5.gs.
   Save.
   Deploy > Manage deployments > Edit > New version > Deploy.
   Keep the SAME /exec URL.

3. Confirm backend direct URL shows:
   "version":"3.5.0"

4. Open:
   https://saradasutar.github.io/MyFinance/?v=1550

5. Hard refresh:
   Mac: Command + Shift + R
   Windows: Ctrl + Shift + R

6. Sign in -> Holdings -> click:
   ⇄ Replace from Master Sheet

7. Confirm the replacement warning.

After successful replacement, use Show All Investments.
