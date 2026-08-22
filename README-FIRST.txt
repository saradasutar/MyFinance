MYFINANCE V16.4 — BUTTON FREEZE FIX

CAUSE
V16.3 passes syntax checks, but it still used many direct event bindings.
If GitHub Pages served a mixed pair of files (for example old index.html + new app-v16-3.js),
one missing control could stop bindEvents() and make later dashboard buttons appear frozen.

V16.4 FIX
- Safe event binding for dashboard controls.
- Missing optional controls no longer stop all buttons.
- Navigation is protected.
- Initialization is protected.
- Adds a visible runtime warning if a component fails.
- Warns when Backend is below v3.7.0.
- Keeps V16.3 filter/print, sticky notes, Quick Diary and horizontal scroller.

INSTALL MATCHED FILES TOGETHER
1. Replace index.html
2. Replace styles.css
3. Upload app-v16-4.js as a NEW file
4. Keep/replace config.js with the included one
5. Commit all files together

BACKEND
Sticky Notes require Backend v3.7.0 / Code-v3.7.gs.
If your backend shows v3.6.0, deploy Code-v3.7.gs as a NEW Apps Script version.

OPEN
https://saradasutar.github.io/MyFinance/?v=1640

Then hard refresh.
