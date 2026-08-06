/**
 * Replace API_URL after deploying Code.gs as a Google Apps Script Web App.
 * The URL must end with /exec (not /dev).
 */
window.PORTFOLIO_CONFIG = Object.freeze({
  API_URL: 'https://script.google.com/macros/s/AKfycbxbqdU19I3Elgsj07hRUJtVs9vcUPGnTkNKzYDz5syolmm9dAos4CAu3FI_sAKNeihv/exec',
  APP_NAME: 'My Investment Dashboard',
  CURRENCY: 'INR',
  REQUEST_TIMEOUT_MS: 25000
});
