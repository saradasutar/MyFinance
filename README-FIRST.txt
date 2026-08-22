MYFINANCE V18.5 / BACKEND V3.10 — FAILED TO FETCH / CORS FIX

WHY V18.4 COULD SHOW:
- Frontend v18.4
- Backend unavailable
- Failed to fetch

The Apps Script /exec URL may open normally in a browser and show v3.9.0, but a GitHub Pages
page can still be blocked when JavaScript fetch tries to read the cross-origin Apps Script response.

V18.5 removes that dependency.

NEW TRANSPORT
The dashboard now sends API requests through a hidden form + iframe and receives the Apps Script
response through postMessage.

This means:
- No normal cross-origin fetch is required for login/dashboard actions.
- No CORS response header is required.
- Password still goes in the POST body, not the URL.
- Existing GitHub Pages hosting remains.
- Existing Google Sheets/Drive backend remains.

BACKEND
V18.5 requires Code-v3.10.gs because the backend must return the iframe response safely.

DEPLOY BACKEND
1. Open the existing MyFinance Apps Script project.
2. Replace Code.gs completely with Code-v3.10.gs.
3. Save.
4. Deploy > Manage deployments.
5. Edit the existing deployment OR create a new Web App deployment.
6. Select New version.
7. Execute as: Me.
8. Who has access: Anyone.
9. Deploy.
10. Open the /exec URL directly. It should show version 3.10.0.

IMPORTANT
If you create another new /exec URL, update config.js to that URL before uploading GitHub.
This package currently uses the URL supplied for the v3.9 deployment.

UPDATE GITHUB
Replace:
- index.html
- styles.css
- config.js
- app-v18-4.js (compatibility file)

Add:
- app-v18-5.js

You can remove older app-v18-3.js and below after V18.5 is confirmed working.

OPEN
https://saradasutar.github.io/MyFinance/?v=1850

Hard refresh:
Mac: Command + Shift + R
Windows: Ctrl + Shift + R

EXPECTED
Frontend v18.5
Backend v3.10.0

All V18.4 custom-column features are retained.
All V18.3 print-layout features are retained.
