MYFINANCE V16.6 — DAILY LIFE QUOTES WITH AUTO SHUFFLE

FRONTEND
v16.6

BACKEND
v3.8.0

NEW QUOTE PORTION
A compact “QUOTE OF THE DAY” strip appears on Overview.

It shows life quotes saved permanently in the Google Sheet tab:
DailyQuotes

BEHAVIOUR
- A different starting quote is selected each calendar day.
- While the dashboard is open, quotes auto-shuffle every 30 seconds.
- Auto shuffle pauses when the browser tab is hidden or when you leave Overview.
- “↻ Next” shows another quote immediately.
- “Ⅱ Pause / ▶ Resume” controls auto shuffle.
- “☰ Library” opens the saved Quote Library.

QUOTE LIBRARY
From the dashboard you can:
- Add a quote
- Add optional author/source
- Search saved quotes
- Edit a saved quote
- Delete a saved quote

The backend stores:
Id | QuoteText | Author | Active | CreatedBy | CreatedAt | UpdatedAt

FIRST INSTALL
Backend v3.8 automatically creates:
DailyQuotes

It also adds 12 starter life quotes so the feature works immediately.
They are ordinary rows in DailyQuotes and can be edited/deleted/replaced from the dashboard.

IMPORTANT
The existing market-price sheet named “Quotes” is NOT changed.
Life quotes use the separate “DailyQuotes” sheet.

INSTALL
GITHUB
1. Replace index.html
2. Replace styles.css
3. Upload app-v16-6.js as a NEW file
4. Keep/replace config.js with the included file
5. Commit together

APPS SCRIPT
1. Replace Code.gs with Code-v3.8.gs
2. Save
3. Deploy > Manage deployments > Edit
4. Select New version
5. Deploy
6. Keep the same Web App /exec URL

The direct /exec URL must show:
"version":"3.8.0"

OPEN
https://saradasutar.github.io/MyFinance/?v=1660

Hard refresh:
Mac: Command + Shift + R
Windows: Ctrl + Shift + R

All V16.5 freeze repairs and earlier filter/print/sticky/diary features are retained.
