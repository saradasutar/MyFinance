MYFINANCE V16.1 — SCREENSHOT LAYOUT FIX

1. QUICK DIARY PANEL
- Fixed the left panel so it is fully visible.
- It now opens from the true left edge of the browser.
- Width is 380px on desktop and full-width on small screens.
- Header/close button stays visible while scrolling.
- No part of the form should remain off-screen.

2. VIEW PORTFOLIO
- Combined / Sarada / Niharika stay in ONE LINE on desktop.
- Owner buttons no longer wrap into two rows.
- At narrow mobile widths they become horizontally scrollable rather than breaking awkwardly.

3. LIVE WEALTH DASHBOARD
- The previous V16.0 compact rule used the wrong selector.
- The real dashboard banner is .welcome-banner.
- V16.1 now reduces the actual live wealth banner to a slim single-row strip:
  LIVE WEALTH DASHBOARD | Combined portfolio | last update | tracking | Combined
- Approx. 58px minimum height on desktop.
- Decorative height/space greatly reduced.
- The tab is NOT deleted because it can now be compacted correctly.

BACKEND
Keep Backend v3.6.0. No Apps Script redeployment.

INSTALL
1. Upload app-v16-1.js as a NEW GitHub file.
2. Replace index.html.
3. Replace styles.css.
4. Keep config.js unchanged.
5. Open:
   https://saradasutar.github.io/MyFinance/?v=1610
6. Hard refresh:
   Mac: Command + Shift + R
   Windows: Ctrl + Shift + R
