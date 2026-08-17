MYFINANCE V15.4 — ALL TABS FREEZE FIX

ROOT CAUSE FOUND
The live V15.3 file calls core functions from bindEvents(), but a large working function block was accidentally dropped from app-v15-3.js.

Missing functions included:
- openModal / closeModals
- openInvestment / openWatch
- saveInvestment / saveWatch
- deleteItem
- MF / stock import parsers
- setImportMode / openBulkImport
- downloadImportTemplate / handleBulkFile / runBulkImport
- exportCsv
- changePassword

The most important failure was openBulkImport:
bindEvents() tried to attach it directly to the Import buttons, but the function did not exist.
JavaScript therefore stopped before the Overview / Holdings / Watchlist / Diary navigation listeners were attached.
That made all tabs appear frozen.

V15.4
- Restores the full working V15 function block.
- Keeps Daily Diary.
- Keeps Monthly Diary / Plan / Experience / Targets.
- Keeps year/month/type/status filtering.
- Keeps completed targets and completed month archive.
- Keeps save username and visible version.
- Keeps Holdings and Watchlist vertical views.
- Keeps Niharika MF current-holdings import.
- Adds safer binding for key controls.
- Frontend version: v15.4.
- Backend stays version 3.4.0.

INSTALL — FRONTEND ONLY
1. Upload app-v15-4.js to GitHub as a NEW file.
2. Replace index.html.
3. Replace styles.css.
4. Keep config.js unchanged.
5. Do NOT change/redeploy Apps Script if Code-v3.4.gs is already deployed.
6. Commit.
7. Check:
   https://saradasutar.github.io/MyFinance/app-v15-4.js
   It must show JavaScript text, not 404.
8. Open:
   https://saradasutar.github.io/MyFinance/?v=1540
9. Hard refresh:
   Mac: Command + Shift + R
   Windows: Ctrl + Shift + R

TEST
Overview -> Holdings -> Watchlist -> Diary -> Daily/Monthly -> Import -> Add investment -> View holding/watchlist.
