MYFINANCE V18.9 / BACKEND V3.13.0 — RELIABLE TICKETED RELAY

I found two problems in the previous connection code:

1. processApiRequest_ was returning Apps Script TextOutput objects for most actions, then the outer
   transport tried to wrap those objects again. That is now corrected: API actions return plain data.

2. V18.8 depended on window.name surviving a cross-site Apps Script -> GitHub navigation.
   That is not reliable enough in modern browsers.

V18.9 uses a ticketed relay instead:
- Login/data request is still POSTed to Apps Script.
- Password/token stays in the POST body, not in the URL.
- Apps Script stores the response briefly under a random one-time relay ID.
- The iframe returns only that random ID to GitHub relay.html.
- GitHub retrieves the one-time result with a script/JSONP request, which does not depend on CORS.
- Relay data expires after 3 minutes and is removed after successful retrieval.

BACKEND
1. Replace the entire Apps Script Code.gs with Code-v3.13.gs
2. Save
3. Deploy > Manage deployments > Edit existing Web App
4. Select New version
5. Execute as: Me
6. Who has access: Anyone
7. Deploy
8. Open the /exec URL directly and confirm:
   "version":"3.13.0"

GITHUB
Upload/replace ALL:
- index.html
- styles.css
- config.js
- app-v18-9.js
- app-v18-8.js   (compatibility)
- relay.html     (required)

The package is already configured for:
https://script.google.com/macros/s/AKfycbx9mq2u-rzOSsfzmUP52SpyIZbJE9gqA1gh5_sdDJmtVa0vCYCEcKsqRUZK278tw2-f/exec

CHECK relay page:
https://saradasutar.github.io/saradaniharika/relay.html
A blank page is correct.

OPEN:
https://saradasutar.github.io/saradaniharika/?v=1890

Hard refresh on Mac:
Command + Shift + R

EXPECTED:
Frontend v18.9
Backend v3.13.0

All dashboard features from V18.8 are retained.
