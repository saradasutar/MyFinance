MYFINANCE DRAWER CSS FIX v10.1

WHY THE INVESTMENT VERTICAL POP-UP WAS NOT APPEARING
Your current GitHub styles.css is missing the drawer CSS classes such as:
- .drawer-backdrop
- .holding-drawer
- .holding-drawer.open

The JavaScript and HTML for the investment drawer are already present, but without those styles the right-side sliding panel cannot display correctly.

INSTALL
1. In GitHub MyFinance, replace styles.css with this styles.css.
2. Replace index.html with this index.html.
3. Keep app-v10.js unchanged.
4. Keep config.js unchanged.
5. Commit changes.
6. Open:
   https://saradasutar.github.io/MyFinance/?v=1700
7. Press Command + Shift + R on Mac.

HOW TO TEST
- Go to Holdings.
- Click anywhere on an investment row (preferably the investment name).
- The vertical panel should slide in from the right.
- It also works from Largest current holdings on Overview.

No Apps Script change is required.
