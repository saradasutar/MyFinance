MYFINANCE V19.2 / BACKEND V3.15.0 — ADVANCED STICKY NOTES

NEW TARGET / REMINDER FEATURES
- Six sticky-note colours: Yellow, Blue, Green, Pink, Purple, Orange.
- Very small Edit (✎) and Delete (×) buttons directly on every sticky.
- 📌 Pin / Keep Open: pinned stickies move to the front and open automatically.
- ▾ / ▸ Collapse / Expand each sticky individually.
- Click the sticky title to collapse/expand it.
- Drag a sticky card to move/reorder it on desktop.
- ← / → move buttons are also provided, especially useful on mobile.
- − / + resize controls with S / M / L / XL sizes.
- Position, pin status, collapse status, colour and size are saved in Google Sheets.
- Completed sticky notes still move to Daily Diary as before.

BACKEND UPDATE REQUIRED
This version adds 5 columns automatically to StickyNotes:
Color, Pinned, Collapsed, Size, SortOrder

1. Replace Code.gs with Code-v3.15.gs.
2. Save.
3. Deploy > Manage deployments.
4. EDIT THE EXISTING deployment.
5. Choose New version.
6. Execute as: Me.
7. Who has access: Anyone.
8. Deploy.
9. Open the same /exec URL and confirm "version":"3.15.0".

GITHUB
Upload/replace:
- index.html
- styles.css
- app-v19-1.js  (compatibility)

Add:
- app-v19-2.js

Keep:
- config.js

Open:
https://saradasutar.github.io/saradaniharika/?v=1920

Hard refresh on Mac:
Command + Shift + R

Expected:
Frontend v19.2
Backend v3.15.0
