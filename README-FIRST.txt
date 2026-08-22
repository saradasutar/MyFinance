MYFINANCE V16.8 — RIGHT UTILITY PANEL

PURPOSE
Make Overview substantially shorter and cleaner by moving Quote of the Day and
Targets & Reminders out of the centre dashboard.

NEW LAYOUT
LEFT:
- Existing navigation
- Existing Quick Diary

CENTRE:
- Portfolio filters
- Compact Live Wealth strip
- Two tiny shortcut chips only:
  📌 Targets & reminders
  💬 Daily quote
- KPI cards, growth, allocation and other portfolio content

RIGHT:
A collapsible “Notes & Quotes” utility drawer.

RIGHT DRAWER — STICKY TAB
- Active Targets and Reminders
- Due / overdue status
- + Add sticky
- ✓ Done
- Edit
- Delete
- Done items still save into Daily Diary as before

RIGHT DRAWER — QUOTES TAB
- Quote of the Day
- Next
- Pause / Resume
- Quote Library
- Auto-shuffle every 30 seconds while the Quotes tab is open

COMPACT BEHAVIOUR
- The previous full-width Sticky Notes row is removed from Overview.
- The previous full-width Quote row is removed from Overview.
- The right drawer overlays the dashboard instead of making Holdings/Watchlist narrower.
- A slim fixed “Notes & Quotes” tab stays at the right edge.
- It shows the active sticky count.
- On mobile the drawer opens nearly full-width.
- Escape key or clicking outside closes it.

BACKEND
Backend remains v3.8.0.
NO Apps Script redeployment is required if BE already shows v3.8.0.

INSTALL
Upload matched frontend files together:

REPLACE:
- index.html
- styles.css
- app-v16-7-1.js  <-- compatibility replacement, important

ADD NEW:
- app-v16-8.js

KEEP:
- config.js

Then open:
https://saradasutar.github.io/MyFinance/?v=1680

Hard refresh:
Mac: Command + Shift + R
Windows: Ctrl + Shift + R

EXPECTED
FE v16.8
BE v3.8.0
