MYFINANCE V15.7 — MASTER DATA REPLACEMENT TIMEOUT FIX

WHY V15.5 / V15.6 WAS NOT REPLACING
The backend replacement was doing too much work in one request:
- deleting old rows one-by-one with deleteRow()
- deleting every old MF transaction row one-by-one
- creating/updating quote rows one at a time
- creating performance rows one at a time
- refreshing mutual-fund NAV/performance before returning

The frontend request timeout was only 60 seconds.
With many old transaction rows, the request could time out before the browser received a success response.

V15.7 / BACKEND V3.6.0 FIX
- Replaces old Holdings in one batch write.
- Replaces old Watchlist in one batch write.
- Removes old MF Transactions in one batch write.
- Loads 35 holdings in one batch.
- Loads 17 watchlist items in one batch.
- Does NOT run slow AMFI/network refresh during replacement.
- Sets up quote rows in batch.
- Verifies the final dashboard contains exactly:
  35 holdings
  17 watchlist items
- Master replacement gets a 180-second frontend timeout as extra protection.
- Live NAV/price/performance refresh runs separately afterwards through Refresh / auto-update.

YOUR DIARY DATA IS NOT DELETED.
Daily Diary, Monthly Diary / Plan / Experience / Targets, users and passwords remain intact.

INSTALL
1. GitHub:
   - upload app-v15-7.js as a NEW file
   - replace index.html
   - replace styles.css
   - keep config.js unchanged

2. Apps Script:
   - replace Code.gs with Code-v3.6.gs
   - Save
   - Deploy > Manage deployments > Edit > New version > Deploy
   - keep the SAME /exec URL

3. Confirm the /exec URL shows:
   "version":"3.6.0"

4. Open:
   https://saradasutar.github.io/MyFinance/?v=1570

5. Hard refresh:
   Mac: Command + Shift + R
   Windows: Ctrl + Shift + R

6. On Overview click:
   ⇄ Load Master Sheet Data

7. Confirm.

8. Wait for the success message:
   35 holdings and 17 watchlist items loaded.

9. Then click Refresh once to update live prices / MF NAV / performance.
