MYFINANCE V15.6 — MASTER DATA NOT SHOWING FIX

WHAT YOUR SCREENSHOT PROVES
- Frontend v15.5 is live.
- Backend v3.5.0 is live.
- Dashboard still shows 22 holdings and 1 watchlist item.
Therefore the master-data replacement action has NOT been executed yet.

V15.6 FIX
- Adds a large visible banner on the Overview page:
  “Master spreadsheet not yet applied”.
- Adds a prominent button:
  ⇄ Load Master Sheet Data
- Clicking it uses the existing backend action replaceMasterPortfolioData.
- After confirmation it replaces old Holdings / Watchlist / MF transaction rows with:
  35 consolidated investments
  17 cleaned watchlist items
- Diary, monthly diary, users and passwords remain untouched.
- After successful replacement the banner disappears automatically.

INSTALL
1. GitHub:
   - upload app-v15-6.js as a NEW file
   - replace index.html
   - replace styles.css
   - keep config.js unchanged
2. NO Apps Script change is required if your page already shows Backend v3.5.0.
3. Open:
   https://saradasutar.github.io/MyFinance/?v=1560
4. Hard refresh:
   Mac: Command + Shift + R
   Windows: Ctrl + Shift + R
5. On Overview click:
   ⇄ Load Master Sheet Data
6. Confirm the warning.
7. Wait for the success message.
8. You should then see:
   35 holdings
   17 watchlist items
