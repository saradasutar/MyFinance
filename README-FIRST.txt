MYFINANCE V18.8 — CONFIG UPDATED TO YOUR NEW APPS SCRIPT URL

New backend URL:
https://script.google.com/macros/s/AKfycbx9mq2u-rzOSsfzmUP52SpyIZbJE9gqA1gh5_sdDJmtVa0vCYCEcKsqRUZK278tw2-f/exec

BACKEND EXPECTED:
v3.12.0

GITHUB
Replace these files:
- config.js  (most important)
- index.html (cache-bust update)

Keep/upload if not already present:
- app-v18-8.js
- app-v18-7.js
- styles.css
- relay.html

IMPORTANT
relay.html must exist at:
https://saradasutar.github.io/saradaniharika/relay.html

TEST
1. Open the Apps Script /exec URL directly and confirm it shows "version":"3.12.0".
2. Open relay.html directly; a blank page is normal.
3. Open:
   https://saradasutar.github.io/saradaniharika/?v=1881
4. Hard refresh: Command + Shift + R.

Expected:
Frontend v18.8
Backend v3.12.0
