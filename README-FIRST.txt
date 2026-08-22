MYFINANCE V18.2 — DRAGGED TABLE VIEW IS SAVED

YES. Holdings and Watchlist now explicitly SAVE the layout you adjust.

SAVED AUTOMATICALLY
For Holdings and Watchlist separately, MyFinance remembers:
- Row height slider setting
- Overall column/table width slider setting
- Every individually dragged column width
- Horizontal scroll position

WHEN YOU RETURN
After refresh, login again, switching sections, or reopening the dashboard in the same
browser, the saved Holdings / Watchlist layout is restored automatically.

VISIBLE CONFIRMATION
The Table size bar now shows:
  Saving…
then
  ✓ Saved

So you can see that the dragged view has been stored.

RESET
Reset now clears:
- Row height adjustment
- Overall width adjustment
- Individual dragged column widths
- Saved horizontal position

and saves the normal 100% layout again.

IMPORTANT
The layout is saved in the browser's local storage. This means:
- It survives page refresh and normal browser reopening.
- Holdings and Watchlist are saved independently.
- A different browser/device has its own layout unless a future backend-sync feature is added.

All V18.1 features remain, including the no-pop-up Print Preview.

BACKEND
Backend remains v3.8.0.
No Apps Script redeployment required.

INSTALL
REPLACE:
- index.html
- styles.css
- app-v18-1.js  (compatibility replacement)

ADD:
- app-v18-2.js

KEEP:
- config.js

OPEN:
https://saradasutar.github.io/MyFinance/?v=1820

Hard refresh:
Mac: Command + Shift + R
Windows: Ctrl + Shift + R
