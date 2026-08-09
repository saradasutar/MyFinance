MYFINANCE V12 — FINAL VERTICAL DRAWER RUNTIME FIX

The screenshot showed the exact runtime error:
  renderUsers is not defined

I checked the live app-v11.js and found TWO missing helper functions:
1. renderUsers()
2. detailDate()

Why this stops the drawer:
- renderUsers() is called after dashboard rendering for an ADMIN user, producing the red runtime error.
- detailDate() is called inside BOTH the Holding and Watchlist vertical drawers before the drawer is opened.
  Therefore clicking View can fail before the .open class is applied.

V12 restores both functions.

INSTALL
1. Upload app-v12.js to GitHub as a NEW file.
2. Replace index.html with the V12 index.html.
3. Keep styles.css unchanged if you already installed the V11 stylesheet.
   You can also replace it with the included styles.css; it is the same validated drawer stylesheet.
4. Keep config.js unchanged.
5. Commit.
6. Wait about one minute.
7. Check:
   https://saradasutar.github.io/MyFinance/app-v12.js
   It must show JavaScript text, not 404.
8. Open:
   https://saradasutar.github.io/MyFinance/?v=1900
9. Press Command + Shift + R.

TEST
- Holdings -> click View -> vertical investment panel.
- Holdings -> click anywhere on row -> same panel.
- Watchlist -> click View -> vertical watchlist panel.
- Watchlist -> click anywhere on row -> same panel.

No Apps Script/backend change is required.
