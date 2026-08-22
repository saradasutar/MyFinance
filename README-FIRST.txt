MYFINANCE V18.8 / BACKEND V3.12.0 — SAME-ORIGIN RELAY FIX

Your v18.7 screenshot confirms the frontend is loading, but the Apps Script browser bridge is not starting.
V18.8 replaces that bridge with a same-origin relay.

BACKEND
- Replace Code.gs with Code-v3.12.gs
- Save
- Deploy > Manage deployments > Edit existing Web App
- Choose New version
- Execute as: Me
- Who has access: Anyone
- Deploy
- Open /exec directly and confirm "version":"3.12.0"

GITHUB
Upload/replace:
- index.html
- styles.css
- config.js
- app-v18-8.js
- app-v18-7.js
- relay.html   (NEW AND REQUIRED)

Your current site name saradaniharika is handled automatically.

Open:
https://saradasutar.github.io/saradaniharika/?v=1880

Hard refresh on Mac:
Command + Shift + R

Expected:
Frontend v18.8
Backend v3.12.0
