MYFINANCE V19.0 / BACKEND V3.14.0 — POST + JSONP POLLING FIX

WHY RELAY.HTML STILL TIMED OUT
V18.9 still required the Apps Script response iframe to navigate back to GitHub relay.html.
That cross-site iframe navigation is the fragile part.

V19.0 DOES NOT USE relay.html AT ALL.

HOW IT WORKS
1. MyFinance sends the login/data request to Apps Script using a hidden HTML form POST.
   The browser is allowed to submit a cross-origin form.
2. The frontend does NOT try to read the Apps Script POST response.
3. Apps Script completes the request and stores the result temporarily against a random request ID.
4. MyFinance polls for that result using a cross-origin <script> request (JSONP).
5. When the result is ready, it is returned and immediately removed from temporary cache.

This avoids:
- CORS fetch
- postMessage between Apps Script and GitHub
- nested Apps Script iframe communication
- window.name
- relay.html
- redirecting an iframe back to GitHub

SECURITY
- Username/password/token stay in the POST body.
- They are NOT placed in the URL.
- Only a random request ID appears in polling URLs.
- Results expire after 3 minutes and are removed after successful retrieval.

BACKEND
1. Replace the entire Code.gs with Code-v3.14.gs
2. Save
3. Deploy > Manage deployments
4. EDIT THE EXISTING DEPLOYMENT (do not create another new deployment)
5. Version: New version
6. Execute as: Me
7. Who has access: Anyone
8. Deploy
9. Open the same /exec URL and confirm:
   "version":"3.14.0"

CURRENT CONFIGURED URL
https://script.google.com/macros/s/AKfycbwNR8hIu-XdPwj90RwqsjjY1_ZvkBH6BHpzBOfYqU_ekcIr2JtUv0Feq_-uolj7oqkd/exec

GITHUB
Upload/replace:
- index.html
- styles.css
- config.js
- app-v19-0.js
- app-v18-9.js  (compatibility)

relay.html is no longer required and can be deleted.

OPEN
https://saradasutar.github.io/saradaniharika/?v=1900

Hard refresh on Mac:
Command + Shift + R

EXPECTED
Frontend v19.0
Backend v3.14.0
