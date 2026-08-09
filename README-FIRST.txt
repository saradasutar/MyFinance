MYFINANCE V11 — HOLDING + WATCHLIST VERTICAL DRAWER FIX

ROOT CAUSE FOUND
The live GitHub app-v10.js is currently invalid JavaScript. Two single-quoted strings were split across lines:
- "Avg. cost" in the Zerodha column aliases
- "Current stock/ETF holdings. Zerodha XLSX/CSV supported."

When JavaScript cannot parse, bindEvents() never runs. That prevents click-to-open behavior for BOTH Holdings and Watchlist.

V11 FIXES THIS AND ADDS EASY TEST BUTTONS
- Entire Holding row -> vertical drawer
- NEW View button in every Holding row -> vertical drawer
- Holding Personal Note cell -> vertical drawer
- Largest current holding -> vertical drawer
- Entire Watchlist row -> vertical drawer
- Watchlist View button -> vertical drawer
- Watchlist Personal Note cell -> vertical drawer
- Watchlist Note button -> vertical drawer + focus note
- Edit and Delete remain separate

INSTALL
1. Upload app-v11.js to GitHub as a NEW file.
2. Replace index.html.
3. Replace styles.css.
4. Keep config.js unchanged.
5. Commit all 3 changes.
6. Wait about 1 minute.
7. First test this direct URL:
   https://saradasutar.github.io/MyFinance/app-v11.js
   It must show JavaScript text and must NOT show 404.
8. Then open:
   https://saradasutar.github.io/MyFinance/?v=1800
9. Press Command + Shift + R on Mac.

TEST
- Holdings -> click View.
- Holdings -> click anywhere on a row.
- Watchlist -> click View.
- Watchlist -> click anywhere on a row.

No Apps Script change is required.
