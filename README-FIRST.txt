MYFINANCE V16.3 — FILTER VIEW + PRINT

FRONTEND
- v16.3

BACKEND
- remains v3.7.0
- NO backend redeployment required if v3.7.0 is already active

INVESTMENTS
Existing filters are retained:
- Investor: Combined / Sarada / Niharika
- Investment Type: All / Mutual Funds / Stocks & ETFs
- Search
- Asset Type

New:
- Visible-record count
- “Print view”
- Printing uses ONLY the currently filtered investments

WATCHLIST
New filter view:
- Search
- Type: Stocks / ETFs / Mutual Funds
- Priority: High / Medium / Low
- Target status:
  At/below target
  Within 5%
  More than 5% away
  No target
- Visible-record count
- “Print view”

The printed watchlist includes key price/target/performance/remark fields.

DAILY DIARY
Filter view now supports:
- Day
- Month
- Date Range
- Global diary search
- “Print filtered diary”

Date Range defaults to the first day of the current month through today.

MONTHLY DIARY / PLAN / EXPERIENCE
Existing filter view remains:
- Year
- Month
- Type
- Target status
- Search

New:
- “Print filtered view”

PRINT BEHAVIOUR
- Opens a clean printable page
- Prints only records matching the current filters
- Investment and Watchlist print in landscape
- Diary and Monthly Diary print in portrait
- Includes My Finance frontend version and print date/time

INSTALL
1. GitHub:
   - upload app-v16-3.js as a NEW file
   - replace index.html
   - replace styles.css
   - keep the included/current config.js
2. Backend:
   - keep Code-v3.7.gs already deployed
3. Open:
   https://saradasutar.github.io/MyFinance/?v=1630
4. Hard refresh:
   Mac: Command + Shift + R
   Windows: Ctrl + Shift + R
