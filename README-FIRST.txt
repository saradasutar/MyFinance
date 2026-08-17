MYFINANCE V15.3 — DAILY + MONTHLY DIARY / PLAN / EXPERIENCE / TARGETS

SIGN-IN + DASHBOARD IDENTITY
- Login page has “Save username on this device”.
- Password is never saved.
- Login page shows: My Finance · v15.3.
- Inside dashboard, the sidebar shows the signed-in username and My Finance · v15.3.
- Top header also shows v15.3.

DAILY DIARY
- Daily diary entry by date.
- Day view or month view.
- Search daily diary by date, title or text.
- Edit and delete saved daily entries.

MONTHLY DIARY / PLAN / EXPERIENCE
A new Monthly workspace has:
- Monthly Diary
- Plan
- Experience
- Target
- Search
- Year filter
- Month filter
- Type filter
- Target status filter

MONTHLY TARGETS
- Add any number of targets for a month.
- Each target starts as “Open target”.
- Click “Mark completed” when achieved.
- Completed targets are permanently retained unless you delete them.
- A month cannot be marked completed while it still has open targets.
- When all targets are achieved, click “Complete month”.
- Completed months are saved permanently in a Completed Months archive.
- A completed month can be reopened later.

FILTERING
You can view:
- All years
- A selected year
- A selected month
- The same month across different years
- Diary only
- Plan only
- Experience only
- Target only
- Open or completed targets
- Search within monthly records

BACKEND
- Code-v3.4.gs
- Backend version 3.4.0
- Schema version 5
- Automatically creates:
  MonthlyDiary
  MonthlyStatus

INSTALL FRONTEND
1. Upload app-v15-3.js to GitHub as a NEW file.
2. Replace index.html.
3. Replace styles.css.
4. Keep config.js unchanged.
5. Commit.
6. Check:
   https://saradasutar.github.io/MyFinance/app-v15-3.js
7. Open:
   https://saradasutar.github.io/MyFinance/?v=1530
8. Mac: Command + Shift + R.

INSTALL BACKEND
1. Open the SAME Apps Script project currently used by MyFinance.
2. Replace Code.gs with Code-v3.4.gs.
3. Save.
4. Deploy > Manage deployments > Edit > New version > Deploy.
5. Keep the same /exec URL.
6. Open the /exec URL and confirm:
   "version":"3.4.0"

The first request after deployment automatically creates the MonthlyDiary and MonthlyStatus sheets.
