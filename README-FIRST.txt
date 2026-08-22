MYFINANCE V19.1 — PROFIT GREEN / LOSS RED FIX

WHY THE COLOUR WAS NOT CLEAR
The dashboard already applied positive/negative classes in JavaScript, but a later V18.6
Holdings Summary typography rule used a more specific selector with !important and forced
the value text back to the normal dark colour.

V19.1 fixes that CSS priority and strengthens semantic colours throughout:
- Profit / positive gain = GREEN
- Loss / negative gain = RED
- Holdings Gain/Loss
- Gain %
- XIRR / performance periods
- Holdings Summary Growth
- Main Gain/Loss KPI
- Growth analysis cards
- Investor cards
- Detail drawer

Backend remains v3.14.0.
No Apps Script redeployment is needed.

GITHUB
Replace:
- index.html
- styles.css
- app-v19-0.js  (compatibility)

Add:
- app-v19-1.js

Keep:
- config.js

Open:
https://saradasutar.github.io/saradaniharika/?v=1910

Hard refresh:
Mac: Command + Shift + R
