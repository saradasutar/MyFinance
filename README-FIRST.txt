MYFINANCE V18.4 / BACKEND V3.9 — CUSTOM COLUMNS & PARAMETERS

NEW BUTTON
Holdings:
  ⚙ Columns

Watchlist:
  ⚙ Columns

WHAT YOU CAN DO

STANDARD COLUMNS
- Rename the displayed heading
- Hide / show optional standard columns
- Required Asset/Investor columns remain protected
- Reset standard names and visibility

CUSTOM COLUMNS / PARAMETERS
You can:
- Add a new column
- Edit its name
- Choose a unique Parameter Key
- Choose data type:
  Text
  Number
  Currency ₹
  Percentage %
  Date
- Set its display order
- Delete the custom column

EXAMPLES
Holdings:
- Risk Level
- Target Allocation %
- Review Date
- Goal
- Advisor Remark
- Exit Price

Watchlist:
- Conviction
- Buy Zone
- Expected CAGR %
- Review Date
- Sector
- Trigger

EDITING VALUES
After a custom column is created, it appears directly in the Holdings / Watchlist table.
Click the custom cell in any row to enter or edit its value.
Leave it blank and Save to clear the value.

PRINT
Custom columns are automatically included in Preview / Print.
Your V18.3 print row-height and print-column drag resizing remains available.

STORAGE
This version adds two backend Google Sheet tabs automatically:
- CustomColumns
- CustomValues

Therefore BACKEND V3.9.0 IS REQUIRED.

DEPLOY BACKEND FIRST
1. Open your existing Apps Script project.
2. Replace Code.gs with Code-v3.9.gs.
3. Deploy > Manage deployments.
4. Edit your EXISTING Web App deployment.
5. Select New version.
6. Deploy.

Keep the SAME /exec URL in config.js.

The schema upgrade to V9 runs automatically on the first frontend request and creates the
CustomColumns and CustomValues tabs.

THEN UPDATE GITHUB
REPLACE:
- index.html
- styles.css
- app-v18-3.js  (compatibility replacement)

ADD:
- app-v18-4.js

KEEP:
- config.js

OPEN
https://saradasutar.github.io/MyFinance/?v=1840

Hard refresh:
Mac: Command + Shift + R
Windows: Ctrl + Shift + R

EXPECTED
Frontend v18.4
Backend v3.9.0
