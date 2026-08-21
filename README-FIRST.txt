MYFINANCE V15.9 — FIXED HORIZONTAL SCROLLER VISIBILITY FIX

WHY V15.8 COULD DISAPPEAR
V15.8 only displayed the fixed horizontal scroller when JavaScript immediately detected:
table.scrollWidth > table.clientWidth.

When a hidden Holdings/Watchlist section is first opened, some browsers calculate its
dimensions slightly later. The first measurement could therefore report no overflow,
causing the fixed scroller to stay hidden.

V15.9 FIX
- The fixed horizontal controller is ALWAYS visible while you are in Holdings or Watchlist.
- It no longer depends on the first overflow measurement to decide whether it should appear.
- Uses a reliable horizontal RANGE slider instead of a nested fake scrollbar.
- Slider position is synchronized with the actual table.
- Moving the table itself updates the slider.
- Left / right arrow buttons remain available.
- Shows horizontal position as 0% to 100%.
- Rechecks table size several times after changing tabs or rendering rows.
- On Overview / Diary / Users it hides automatically because those sections do not need it.
- Works on desktop and mobile.

BACKEND
Backend remains v3.6.0.
This is FRONTEND ONLY — do not redeploy Apps Script if Backend v3.6.0 is already active.

INSTALL
1. GitHub:
   - upload app-v15-9.js as a NEW file
   - replace index.html
   - replace styles.css
   - keep config.js unchanged
2. Open:
   https://saradasutar.github.io/MyFinance/?v=1590
3. Hard refresh:
   Mac: Command + Shift + R
   Windows: Ctrl + Shift + R
4. Click Holdings.
   The fixed horizontal controller should appear at the bottom immediately.
5. Click Watchlist.
   The same controller should remain available.
