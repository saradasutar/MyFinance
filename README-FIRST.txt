MYFINANCE V18.1 — EASY PRINT WITHOUT POP-UP BLOCKING

Your screenshot showed:
“Print window was blocked. Please allow pop-ups for this site.”

V18.1 removes that problem by not opening a separate print window.

HOW TO USE
1. Click Preview / Print in Holdings or Watchlist.
2. A large preview opens inside MyFinance itself.
3. Check the data.
4. Click Print now.
5. Chrome's normal Print dialog opens.
6. Select your printer, or choose Save as PDF.

You no longer need to allow website pop-ups for MyFinance printing.

ESC or Close exits preview.

The preview uses the current filters.
Holdings and Watchlist print in landscape.
Daily and Monthly Diary print in portrait.

BACKEND
Backend stays v3.8.0. No Apps Script redeployment required.

INSTALL
REPLACE:
- index.html
- styles.css
- app-v18-0.js (compatibility replacement)

ADD:
- app-v18-1.js

KEEP:
- config.js

OPEN:
https://saradasutar.github.io/MyFinance/?v=1810

Hard refresh:
Mac: Command + Shift + R
Windows: Ctrl + Shift + R
