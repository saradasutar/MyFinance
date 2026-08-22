MYFINANCE V18.6 + BACKEND V3.10.1 — BACKEND RESPONSE FIX

SYMPTOM
Frontend v18.6 loads, direct /exec shows backend v3.10.0, but login says:
“The backend did not respond.”

ROOT CAUSE FIXED
The hidden iframe transport was reaching Apps Script, but the HTML response used an
incorrect escaped closing script tag. The browser therefore did not execute the response
message back to MyFinance, so the frontend waited until timeout.

V3.10.1 fixes the response HTML.

YOU ONLY NEED TO UPDATE APPS SCRIPT
Your current Frontend v18.6 can stay as it is.

STEPS
1. Open the existing MyFinance Apps Script project.
2. Replace the entire Code.gs with Code-v3.10.1.gs.
3. Save.
4. Deploy > Manage deployments.
5. Edit the SAME Web App deployment.
6. Select New version.
7. Execute as: Me.
8. Who has access: Anyone.
9. Deploy.

IMPORTANT
Keep the same /exec URL if you edit the existing deployment.
No config.js change is needed when the URL stays the same.

TEST
Open the /exec URL directly.
It should show:
"version":"3.10.1"

Then open:
https://saradasutar.github.io/MyFinance/?v=1861

Hard refresh on Mac:
Command + Shift + R

EXPECTED
Frontend v18.6
Backend v3.10.1
Login should respond instead of timing out.

All custom columns, print layout, saved table widths, quotes and larger Holdings Summary remain unchanged.
