MYFINANCE PERSONAL NOTES V7

NEW FEATURES
1. A new "Personal Note" column in Holdings.
2. Existing saved Notes are shown in that column.
3. Click a Personal Note cell to immediately edit that investment and update the note.
4. New "📝 All notes" button in Holdings.
5. All Notes window can:
   - show the entire portfolio or only the current dashboard view,
   - show all investments, only investments with notes, or investments without notes,
   - search by investment, investor, symbol/code, or note text,
   - open the investment detail drawer,
   - add/edit a personal note.
6. Personal Note is also shown in the right-side investment detail drawer.
7. Export CSV now includes a "Personal Note" column.

BACKEND
No Apps Script change is required. The current V3 backend already stores Notes in the Holdings sheet.

GITHUB INSTALL
1. Keep config.js exactly as it is.
2. Replace index.html with this V7 file.
3. Replace styles.css with this V7 file.
4. Upload app-v7.js as a NEW file.
5. Commit changes.
6. Open:
   https://saradasutar.github.io/MyFinance/?v=1300
7. On Mac press Command + Shift + R.

DO NOT
- Do not change config.js.
- Do not redeploy Apps Script just for this notes feature.
