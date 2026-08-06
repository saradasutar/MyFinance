/**
 * Replace API_URL after deploying Code.gs as a Google Apps Script Web App.
 * The URL must end with /exec (not /dev).
 */
window.PORTFOLIO_CONFIG = Object.freeze({
  API_URL: 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',
  APP_NAME: 'My Investment Dashboard',
  CURRENCY: 'INR',
  REQUEST_TIMEOUT_MS: 25000
});
