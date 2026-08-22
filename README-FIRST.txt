MYFINANCE V18.7 / BACKEND V3.11.0 — RELIABLE BACKEND BRIDGE

WHY THE PREVIOUS FIXES STILL TIMED OUT
The direct /exec URL could show the backend version correctly, but GitHub Pages still could
not reliably complete request/response communication through Apps Script POST + iframe redirects.

V18.7 changes the connection architecture.

NEW CONNECTION METHOD
1. MyFinance loads one tiny hidden Apps Script HTML bridge.
2. That bridge runs inside Apps Script HtmlService.
3. The bridge uses Google's supported google.script.run API to call backend functions.
4. A browser MessageChannel is created by the bridge and transferred to the GitHub page.
5. All later login / bootstrap / save / edit / delete requests travel through that persistent channel.

This avoids:
- normal cross-origin fetch
- CORS response reading
- repeated form POST iframe redirects
- the nested iframe response problem

Google officially supports google.script.run for asynchronous calls from HTML-service pages.

BACKEND UPDATE REQUIRED
1. Open MyFinance Apps Script.
2. Replace all Code.gs with Code-v3.11.gs.
3. Save.
4. Deploy > Manage deployments.
5. Edit the SAME Web App deployment.
6. Select New version.
7. Execute as: Me.
8. Who has access: Anyone.
9. Deploy.

CHECK
Open the /exec URL directly.
It must show:
"version":"3.11.0"

GITHUB UPDATE
Replace:
- index.html
- styles.css
- config.js
- app-v18-6.js (compatibility file)

Add:
- app-v18-7.js

You may keep app-v18-5.js temporarily, but it is no longer required by the new index.

OPEN
https://saradasutar.github.io/MyFinance/?v=1870

Hard refresh:
Mac: Command + Shift + R

EXPECTED
Frontend v18.7
Backend v3.11.0

All previous features remain:
- Custom Holdings / Watchlist columns
- Add / edit / delete parameter values
- Saved drag widths
- Print preview adjustments
- Larger Holdings Summary
- Quotes / Diary / Targets / Reminders
