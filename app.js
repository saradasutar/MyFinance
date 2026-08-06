'use strict';

const CONFIG = window.PORTFOLIO_CONFIG || {};
const state = {
  token: localStorage.getItem('portfolio_token') || '',
  username: localStorage.getItem('portfolio_username') || '',
  user: null,
  holdings: [],
  watchlist: [],
  summary: {},
  users: [],
  activeSection: 'overview',
  syncing: false,
  pendingImport: []
};

const $ = (id) => document.getElementById(id);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const els = {};
[
  'loginView','appView','loginForm','loginUsername','loginPassword','loginButton','loginMessage',
  'sideAppName','todayLabel','pageTitle','syncStatus','refreshBtn','addInvestmentBtn','profileButton',
  'avatarInitial','welcomeName','lastUpdatedText','sumInvested','sumCurrent','sumGain','sumReturn',
  'sumAssetCount','sumPricedCount','sumWatchCount','sumNearTarget','allocationChart','watchSignals',
  'topHoldings','holdingSearch','holdingTypeFilter','holdingsBody','holdingsEmpty','watchSearch',
  'watchBody','watchEmpty','usersBody','modalBackdrop','investmentModal','watchModal','passwordModal',
  'userModal','bulkImportModal','bulkImportForm','bulkCsvFile','bulkImportStatus','runBulkImportBtn','investmentForm','watchForm','passwordForm','userForm','toastRegion','holdingId',
  'holdingType','holdingName','holdingCode','holdingExchange','holdingUnits','holdingInvested',
  'holdingManualPrice','holdingBuyDate','holdingNotes','holdingCodeLabel','exchangeLabel','mfHelp',
  'watchId','watchType','watchName','watchCode','watchExchange','watchTarget','watchManualPrice',
  'watchPriority','watchNotes','watchCodeLabel','watchExchangeLabel','watchMfHelp','currentPassword',
  'newPassword','confirmPassword','newUsername','newDisplayName','newUserRole','newUserPassword'
].forEach((id) => { els[id] = $(id); });

function isConfigured() {
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(String(CONFIG.API_URL || '').trim());
}

function formatCurrency(value, compact = false) {
  if (value === null || value === '' || typeof value === 'undefined') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: CONFIG.CURRENCY || 'INR', maximumFractionDigits: compact ? 0 : 2,
    notation: compact && Math.abs(n) >= 100000 ? 'compact' : 'standard'
  }).format(n);
}

function formatNumber(value, digits = 4) {
  if (value === null || value === '' || typeof value === 'undefined') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: digits }).format(n);
}

function formatPercent(value) {
  if (value === null || value === '' || typeof value === 'undefined') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));
}

function dateLabel(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function pnlClass(value) {
  const n = Number(value);
  return n > 0 ? 'positive' : n < 0 ? 'negative' : 'neutral';
}

function setBusy(button, busy, text) {
  if (!button) return;
  if (busy) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.textContent = text || 'Please wait…';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

function setSyncStatus(mode, message) {
  els.syncStatus.className = `sync-status ${mode || ''}`.trim();
  const label = els.syncStatus.querySelector('span:last-child');
  if (label) label.textContent = message;
}

function toast(message, type = '') {
  const node = document.createElement('div');
  node.className = `toast ${type}`.trim();
  node.textContent = message;
  els.toastRegion.appendChild(node);
  setTimeout(() => node.remove(), 4200);
}

async function api(action, payload = {}, options = {}) {
  if (!isConfigured()) throw new Error('Backend is not configured. Paste the Apps Script /exec URL in config.js.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS || 25000);
  const requestBody = { action, ...payload };
  if (state.token && !requestBody.token) requestBody.token = state.token;
  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store',
      credentials: 'omit'
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('The backend returned an unreadable response. Check the Apps Script deployment permissions.'); }
    if (!data.ok) {
      const error = new Error(data.message || 'Request failed.');
      error.code = data.code || 'REQUEST_FAILED';
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The request timed out. Please try again.');
    if (options.retry && !options._retried) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      return api(action, payload, { ...options, _retried: true });
    }
    throw error;
  } finally { clearTimeout(timeout); }
}

function cacheKey() { return `portfolio_cache_${state.username || 'unknown'}`; }
function saveCache(data) {
  try { localStorage.setItem(cacheKey(), JSON.stringify({ savedAt: Date.now(), data })); } catch { /* ignore */ }
}
function loadCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(cacheKey()) || 'null');
    if (parsed?.data) applyBootstrap(parsed.data, true);
  } catch { /* ignore */ }
}
function clearSession() {
  state.token = '';
  state.username = '';
  state.user = null;
  localStorage.removeItem('portfolio_token');
  localStorage.removeItem('portfolio_username');
}

async function login(event) {
  event.preventDefault();
  els.loginMessage.textContent = '';
  if (!isConfigured()) {
    els.loginMessage.textContent = 'First paste your Apps Script /exec URL in config.js.';
    return;
  }
  const username = els.loginUsername.value.trim();
  const password = els.loginPassword.value;
  setBusy(els.loginButton, true, 'Signing in…');
  try {
    const result = await api('login', { username, password });
    state.token = result.token;
    state.username = result.user.username;
    localStorage.setItem('portfolio_token', state.token);
    localStorage.setItem('portfolio_username', state.username);
    showApp();
    applyBootstrap(result.data);
    toast('Signed in successfully.', 'success');
  } catch (error) {
    els.loginMessage.textContent = error.message;
  } finally { setBusy(els.loginButton, false); }
}

async function logout() {
  try { if (state.token) await api('logout'); } catch { /* session still cleared locally */ }
  clearSession();
  els.appView.classList.add('hidden');
  els.loginView.classList.remove('hidden');
  els.loginPassword.value = '';
}

function showApp() {
  els.loginView.classList.add('hidden');
  els.appView.classList.remove('hidden');
  els.sideAppName.textContent = CONFIG.APP_NAME || 'Investment Dashboard';
  const now = new Date();
  els.todayLabel.textContent = new Intl.DateTimeFormat('en-IN', { weekday:'long', day:'numeric', month:'long' }).format(now).toUpperCase();
}

async function loadDashboard(forcePrices = false) {
  if (state.syncing) return;
  state.syncing = true;
  setSyncStatus('syncing', forcePrices ? 'Updating prices…' : 'Syncing…');
  try {
    const result = await api(forcePrices ? 'refreshPrices' : 'bootstrap', {}, { retry: !forcePrices });
    applyBootstrap(result.data);
    saveCache(result.data);
    setSyncStatus('', 'Up to date');
    if (forcePrices) toast('Prices and NAVs refreshed.', 'success');
  } catch (error) {
    if (error.code === 'AUTH_REQUIRED' || error.code === 'SESSION_EXPIRED') {
      toast('Your session expired. Please sign in again.', 'error');
      logout();
      return;
    }
    setSyncStatus('error', 'Sync failed');
    toast(error.message, 'error');
  } finally { state.syncing = false; }
}

function applyBootstrap(data, fromCache = false) {
  if (!data) return;
  state.user = data.user || state.user;
  state.holdings = Array.isArray(data.holdings) ? data.holdings : [];
  state.watchlist = Array.isArray(data.watchlist) ? data.watchlist : [];
  state.summary = data.summary || {};
  if (Array.isArray(data.users)) state.users = data.users;
  renderAll();
  if (state.user) {
    els.welcomeName.textContent = state.user.displayName || state.user.username;
    els.avatarInitial.textContent = (state.user.displayName || state.user.username || 'I').charAt(0).toUpperCase();
    $$('.admin-only').forEach((el) => el.classList.toggle('hidden', state.user.role !== 'ADMIN'));
  }
  els.lastUpdatedText.textContent = `${fromCache ? 'Showing saved data' : 'Updated'} ${dateLabel(data.updatedAt)}${data.priceNote ? ` · ${data.priceNote}` : ''}`;
}

function renderAll() {
  renderSummary();
  renderAllocation();
  renderTopHoldings();
  renderWatchSignals();
  renderHoldings();
  renderWatchlist();
  if (state.user?.role === 'ADMIN') renderUsers();
}

function renderSummary() {
  const s = state.summary || {};
  els.sumInvested.textContent = formatCurrency(s.investedValue || 0, true);
  els.sumCurrent.textContent = formatCurrency(s.currentValue || 0, true);
  els.sumGain.textContent = formatCurrency(s.gainLoss || 0, true);
  els.sumGain.className = pnlClass(s.gainLoss);
  els.sumReturn.textContent = formatPercent(s.returnPct || 0);
  els.sumReturn.className = pnlClass(s.returnPct);
  els.sumAssetCount.textContent = `${s.assetCount || 0} asset${s.assetCount === 1 ? '' : 's'}`;
  els.sumPricedCount.textContent = `${s.pricedCount || 0} priced`;
  els.sumWatchCount.textContent = String(s.watchCount || 0);
  els.sumNearTarget.textContent = `${s.nearTargetCount || 0} near target`;
}

function renderAllocation() {
  const groups = state.summary?.allocation || [];
  if (!groups.length) {
    els.allocationChart.innerHTML = '<div class="empty-state">Allocation appears after you add investments.</div>';
    return;
  }
  els.allocationChart.innerHTML = groups.map((item) => `
    <div class="allocation-row">
      <div class="allocation-name"><span class="allocation-dot"></span>${escapeHtml(item.type)}</div>
      <div class="allocation-track"><div class="allocation-fill" style="width:${Math.max(0, Math.min(100, Number(item.percent) || 0))}%"></div></div>
      <div class="allocation-value">${Number(item.percent || 0).toFixed(1)}%</div>
    </div>`).join('');
}

function renderTopHoldings() {
  const items = [...state.holdings].sort((a,b) => (b.currentValue || b.investedAmount || 0) - (a.currentValue || a.investedAmount || 0)).slice(0,6);
  if (!items.length) {
    els.topHoldings.className = 'mini-holdings empty-state';
    els.topHoldings.textContent = 'Add your first investment to begin.';
    return;
  }
  els.topHoldings.className = 'mini-holdings';
  els.topHoldings.innerHTML = items.map((item) => `
    <div class="mini-holding">
      <div><strong>${escapeHtml(item.assetName)}</strong><span>${escapeHtml(item.type)} · ${escapeHtml(item.code)}</span></div>
      <div class="mini-value">${formatCurrency(item.currentValue ?? item.investedAmount, true)}<span class="${pnlClass(item.returnPct)}">${item.currentPrice == null ? 'Price pending' : formatPercent(item.returnPct)}</span></div>
    </div>`).join('');
}

function renderWatchSignals() {
  const items = [...state.watchlist]
    .filter((x) => Number.isFinite(Number(x.distancePct)))
    .sort((a,b) => Math.abs(a.distancePct) - Math.abs(b.distancePct)).slice(0,5);
  if (!items.length) {
    els.watchSignals.className = 'signal-list empty-state';
    els.watchSignals.textContent = state.watchlist.length ? 'Add target prices to see signals.' : 'No watchlist items yet.';
    return;
  }
  els.watchSignals.className = 'signal-list';
  els.watchSignals.innerHTML = items.map((item) => `
    <div class="signal-item">
      <div><strong>${escapeHtml(item.assetName)}</strong><span>Target ${formatCurrency(item.targetPrice)}</span></div>
      <div class="signal-price">${formatCurrency(item.currentPrice)}<span class="${Number(item.distancePct) <= 0 ? 'positive' : 'neutral'}">${Number(item.distancePct) <= 0 ? 'At/below target' : `${item.distancePct.toFixed(1)}% above`}</span></div>
    </div>`).join('');
}

function holdingMatches(item) {
  const q = els.holdingSearch.value.trim().toLowerCase();
  const type = els.holdingTypeFilter.value;
  const textMatch = !q || `${item.assetName} ${item.code} ${item.notes || ''}`.toLowerCase().includes(q);
  return textMatch && (type === 'ALL' || item.type === type);
}

function renderHoldings() {
  const items = state.holdings.filter(holdingMatches);
  els.holdingsBody.innerHTML = items.map((item) => `
    <tr>
      <td><div class="asset-cell"><div class="asset-badge">${escapeHtml(item.type.slice(0,2))}</div><div><strong>${escapeHtml(item.assetName)}</strong><span>${escapeHtml(item.exchange ? `${item.exchange}:` : '')}${escapeHtml(item.code)}</span></div></div></td>
      <td>${formatNumber(item.units)}</td>
      <td>${formatCurrency(item.investedAmount)}</td>
      <td>${formatCurrency(item.currentPrice)}<span class="price-note">${escapeHtml(item.priceSource || 'Pending')}</span></td>
      <td>${formatCurrency(item.currentValue)}</td>
      <td class="${pnlClass(item.gainLoss)}">${formatCurrency(item.gainLoss)}</td>
      <td class="${pnlClass(item.returnPct)}">${formatPercent(item.returnPct)}</td>
      <td><div class="row-actions"><button class="row-button" data-edit-holding="${escapeHtml(item.id)}" title="Edit">✎</button><button class="row-button delete" data-delete-holding="${escapeHtml(item.id)}" title="Delete">×</button></div></td>
    </tr>`).join('');
  els.holdingsEmpty.classList.toggle('hidden', items.length > 0);
}

function watchMatches(item) {
  const q = els.watchSearch.value.trim().toLowerCase();
  return !q || `${item.assetName} ${item.code} ${item.notes || ''}`.toLowerCase().includes(q);
}

function renderWatchlist() {
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const items = state.watchlist.filter(watchMatches).sort((a,b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9));
  els.watchBody.innerHTML = items.map((item) => `
    <tr>
      <td><div class="asset-cell"><div class="asset-badge">${escapeHtml(item.type.slice(0,2))}</div><div><strong>${escapeHtml(item.assetName)}</strong><span>${escapeHtml(item.exchange ? `${item.exchange}:` : '')}${escapeHtml(item.code)}</span></div></div></td>
      <td>${formatCurrency(item.currentPrice)}<span class="price-note">${escapeHtml(item.priceSource || 'Pending')}</span></td>
      <td>${formatCurrency(item.targetPrice)}</td>
      <td class="${Number(item.distancePct) <= 0 ? 'positive' : 'neutral'}">${Number.isFinite(Number(item.distancePct)) ? formatPercent(item.distancePct) : '—'}</td>
      <td><span class="pill ${String(item.priority).toLowerCase()}">${escapeHtml(item.priority)}</span></td>
      <td title="${escapeHtml(item.notes)}">${escapeHtml((item.notes || '—').slice(0,45))}${(item.notes || '').length > 45 ? '…' : ''}</td>
      <td><div class="row-actions"><button class="row-button" data-edit-watch="${escapeHtml(item.id)}" title="Edit">✎</button><button class="row-button delete" data-delete-watch="${escapeHtml(item.id)}" title="Delete">×</button></div></td>
    </tr>`).join('');
  els.watchEmpty.classList.toggle('hidden', items.length > 0);
}

function renderUsers() {
  els.usersBody.innerHTML = state.users.map((user) => `
    <tr>
      <td><strong>${escapeHtml(user.username)}</strong></td><td>${escapeHtml(user.displayName)}</td><td><span class="pill">${escapeHtml(user.role)}</span></td>
      <td class="${user.active ? 'positive' : 'negative'}">${user.active ? 'Active' : 'Disabled'}</td><td>${escapeHtml(user.lastLogin ? dateLabel(user.lastLogin) : 'Never')}</td>
      <td><div class="row-actions"><button class="row-button" data-reset-user="${escapeHtml(user.username)}" title="Reset password">⌁</button><button class="row-button ${user.active ? 'delete' : ''}" data-toggle-user="${escapeHtml(user.username)}" data-active="${user.active}" title="${user.active ? 'Disable' : 'Enable'}">${user.active ? '×' : '✓'}</button></div></td>
    </tr>`).join('');
}

function switchSection(name) {
  const titles = { overview: 'Portfolio overview', holdings: 'My holdings', watchlist: 'Investment watchlist', users: 'User administration' };
  state.activeSection = name;
  ['overview','holdings','watchlist','users'].forEach((section) => $(`${section}Section`)?.classList.toggle('hidden', section !== name));
  els.pageTitle.textContent = titles[name] || 'Investment Dashboard';
  $$('[data-section]').forEach((button) => button.classList.toggle('active', button.dataset.section === name));
  if (name === 'users' && state.user?.role === 'ADMIN') loadUsers();
}

function openModal(id) {
  els.modalBackdrop.classList.remove('hidden');
  els.modalBackdrop.setAttribute('aria-hidden', 'false');
  $$('.modal').forEach((m) => m.classList.add('hidden'));
  $(id).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModals() {
  els.modalBackdrop.classList.add('hidden');
  els.modalBackdrop.setAttribute('aria-hidden', 'true');
  $$('.modal').forEach((m) => m.classList.add('hidden'));
  document.body.style.overflow = '';
}

function updateAssetForm(type, scope) {
  const isMf = type === 'MF';
  const isOther = type === 'OTHER';
  if (scope === 'holding') {
    els.holdingCodeLabel.textContent = isMf ? 'AMFI scheme code' : isOther ? 'Reference code' : 'Ticker symbol';
    els.exchangeLabel.classList.toggle('hidden', isMf || isOther);
    els.mfHelp.classList.toggle('hidden', !isMf);
    els.holdingCode.placeholder = isMf ? 'e.g. 122639' : isOther ? 'GOLD-BOND' : 'RELIANCE';
  } else {
    els.watchCodeLabel.textContent = isMf ? 'AMFI scheme code' : isOther ? 'Reference code' : 'Ticker symbol';
    els.watchExchangeLabel.classList.toggle('hidden', isMf || isOther);
    els.watchMfHelp.classList.toggle('hidden', !isMf);
    els.watchCode.placeholder = isMf ? 'e.g. 122639' : isOther ? 'REFERENCE' : 'HDFCBANK';
  }
}

function openInvestment(item = null) {
  els.investmentForm.reset();
  els.holdingId.value = item?.id || '';
  $('investmentModalTitle').textContent = item ? 'Edit investment' : 'Add investment';
  els.holdingType.value = item?.type || 'STOCK';
  els.holdingName.value = item?.assetName || '';
  els.holdingCode.value = item?.code || '';
  els.holdingExchange.value = item?.exchange || 'NSE';
  els.holdingUnits.value = item?.units ?? '';
  els.holdingInvested.value = item?.investedAmount ?? '';
  els.holdingManualPrice.value = item?.manualPrice || '';
  els.holdingBuyDate.value = item?.buyDate || '';
  els.holdingNotes.value = item?.notes || '';
  updateAssetForm(els.holdingType.value, 'holding');
  openModal('investmentModal');
}

function openWatch(item = null) {
  els.watchForm.reset();
  els.watchId.value = item?.id || '';
  $('watchModalTitle').textContent = item ? 'Edit watch item' : 'Add to watchlist';
  els.watchType.value = item?.type || 'STOCK';
  els.watchName.value = item?.assetName || '';
  els.watchCode.value = item?.code || '';
  els.watchExchange.value = item?.exchange || 'NSE';
  els.watchTarget.value = item?.targetPrice || '';
  els.watchManualPrice.value = item?.manualPrice || '';
  els.watchPriority.value = item?.priority || 'MEDIUM';
  els.watchNotes.value = item?.notes || '';
  updateAssetForm(els.watchType.value, 'watch');
  openModal('watchModal');
}

async function saveInvestment(event) {
  event.preventDefault();
  const button = $('saveInvestmentBtn');
  setBusy(button, true, 'Saving…');
  try {
    const result = await api('saveHolding', {
      holding: {
        id: els.holdingId.value,
        type: els.holdingType.value,
        assetName: els.holdingName.value.trim(),
        code: els.holdingCode.value.trim().toUpperCase(),
        exchange: ['MF','OTHER'].includes(els.holdingType.value) ? '' : els.holdingExchange.value,
        units: Number(els.holdingUnits.value),
        investedAmount: Number(els.holdingInvested.value),
        manualPrice: els.holdingManualPrice.value === '' ? null : Number(els.holdingManualPrice.value),
        buyDate: els.holdingBuyDate.value,
        notes: els.holdingNotes.value.trim()
      }
    });
    closeModals();
    applyBootstrap(result.data);
    saveCache(result.data);
    toast('Investment saved.', 'success');
  } catch (error) { toast(error.message, 'error'); }
  finally { setBusy(button, false); }
}


function openBulkImport() {
  state.pendingImport = [];
  els.bulkImportForm.reset();
  els.bulkImportStatus.textContent = 'No file selected.';
  els.bulkImportStatus.className = 'import-status muted';
  els.runBulkImportBtn.disabled = true;
  openModal('bulkImportModal');
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function downloadImportTemplate() {
  const headers = ['Asset Type','Asset Name','Code','Exchange','Units','Invested Amount','Manual Price','Purchase Date','Notes'];
  const examples = [
    ['STOCK','Reliance Industries','RELIANCE','NSE','10','25000','','2026-08-01','Long-term holding'],
    ['MF','Parag Parikh Flexi Cap Fund','122639','','125.432','100000','','2026-07-15','Direct growth'],
    ['ETF','Nippon India ETF Gold BeES','GOLDBEES','NSE','50','35000','','2026-06-10','Gold allocation']
  ];
  const csv = [headers, ...examples].map((row) => row.map(csvCell).join(',')).join('\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'investment-bulk-import-template.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field);
      if (row.some((value) => String(value).trim() !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  row.push(field);
  if (row.some((value) => String(value).trim() !== '')) rows.push(row);
  return rows;
}

function normalizeCsvHeader(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseCsvNumber(value) {
  const cleaned = String(value ?? '').replace(/[₹,\s]/g, '').trim();
  if (cleaned === '') return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : NaN;
}

function normalizeImportType(value) {
  const key = String(value || '').trim().toUpperCase().replace(/[\s_-]+/g, '');
  const types = {
    STOCK: 'STOCK', EQUITY: 'STOCK', SHARE: 'STOCK',
    ETF: 'ETF',
    MF: 'MF', MUTUALFUND: 'MF', FUND: 'MF',
    OTHER: 'OTHER'
  };
  return types[key] || '';
}

function normalizeImportDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (!match) return null;
  const day = String(match[1]).padStart(2, '0');
  const month = String(match[2]).padStart(2, '0');
  return `${match[3]}-${month}-${day}`;
}

function rowsToHoldings(rows) {
  if (rows.length < 2) throw new Error('The CSV does not contain any investment rows.');

  const aliases = {
    assettype: 'type', type: 'type',
    assetname: 'assetName', name: 'assetName', investmentname: 'assetName',
    code: 'code', symbol: 'code', ticker: 'code', tickersymbol: 'code', amfischemecode: 'code', schemecode: 'code',
    exchange: 'exchange',
    units: 'units', quantity: 'units', qty: 'units',
    investedamount: 'investedAmount', totalinvestedamount: 'investedAmount', investedvalue: 'investedAmount', costvalue: 'investedAmount',
    manualprice: 'manualPrice', currentprice: 'manualPrice', nav: 'manualPrice',
    purchasedate: 'buyDate', buydate: 'buyDate', date: 'buyDate',
    notes: 'notes', remark: 'notes', remarks: 'notes'
  };

  const map = {};
  rows[0].forEach((header, index) => {
    const field = aliases[normalizeCsvHeader(header)];
    if (field && typeof map[field] === 'undefined') map[field] = index;
  });

  const required = ['type','assetName','code','units','investedAmount'];
  const missing = required.filter((field) => typeof map[field] === 'undefined');
  if (missing.length) throw new Error(`Missing required column(s): ${missing.join(', ')}.`);

  const errors = [];
  const holdings = [];

  rows.slice(1).forEach((cells, offset) => {
    const rowNumber = offset + 2;
    const get = (field) => typeof map[field] === 'undefined' ? '' : String(cells[map[field]] ?? '').trim();
    const type = normalizeImportType(get('type'));
    const assetName = get('assetName');
    const code = get('code').toUpperCase();
    const units = parseCsvNumber(get('units'));
    const investedAmount = parseCsvNumber(get('investedAmount'));
    const manualRaw = get('manualPrice');
    const manualPrice = parseCsvNumber(manualRaw);
    const buyDate = normalizeImportDate(get('buyDate'));
    const exchange = ['MF','OTHER'].includes(type) ? '' : (get('exchange').toUpperCase() || 'NSE');

    if (!type) errors.push(`Row ${rowNumber}: invalid Asset Type.`);
    if (!assetName) errors.push(`Row ${rowNumber}: Asset Name is required.`);
    if (!code) errors.push(`Row ${rowNumber}: Code is required.`);
    if (!Number.isFinite(units) || units <= 0) errors.push(`Row ${rowNumber}: Units must be greater than zero.`);
    if (!Number.isFinite(investedAmount) || investedAmount < 0) errors.push(`Row ${rowNumber}: Invested Amount is invalid.`);
    if (manualRaw && (!Number.isFinite(manualPrice) || manualPrice < 0)) errors.push(`Row ${rowNumber}: Manual Price is invalid.`);
    if (buyDate === null) errors.push(`Row ${rowNumber}: use YYYY-MM-DD or DD/MM/YYYY for Purchase Date.`);

    holdings.push({
      type,
      assetName,
      code,
      exchange,
      units,
      investedAmount,
      manualPrice: manualRaw === '' ? null : manualPrice,
      buyDate: buyDate || '',
      notes: get('notes')
    });
  });

  if (holdings.length > 500) errors.push('The file has more than 500 investment rows.');
  if (errors.length) throw new Error(`${errors.slice(0, 8).join(' ')}${errors.length > 8 ? ` Plus ${errors.length - 8} more error(s).` : ''}`);
  return holdings;
}

async function handleBulkCsvFile() {
  state.pendingImport = [];
  els.runBulkImportBtn.disabled = true;
  const file = els.bulkCsvFile.files?.[0];
  if (!file) {
    els.bulkImportStatus.textContent = 'No file selected.';
    els.bulkImportStatus.className = 'import-status muted';
    return;
  }

  try {
    const rows = parseCsv(await file.text());
    const holdings = rowsToHoldings(rows);
    state.pendingImport = holdings;
    els.bulkImportStatus.textContent = `${holdings.length} investment row${holdings.length === 1 ? '' : 's'} ready to import.`;
    els.bulkImportStatus.className = 'import-status success';
    els.runBulkImportBtn.disabled = false;
  } catch (error) {
    els.bulkImportStatus.textContent = error.message;
    els.bulkImportStatus.className = 'import-status error';
  }
}

async function bulkImportInvestments(event) {
  event.preventDefault();
  if (!state.pendingImport.length) {
    toast('Select and validate a CSV file first.', 'error');
    return;
  }

  const button = els.runBulkImportBtn;
  setBusy(button, true, 'Importing…');
  try {
    const result = await api('bulkImportHoldings', { holdings: state.pendingImport });
    closeModals();
    state.pendingImport = [];
    applyBootstrap(result.data);
    saveCache(result.data);
    switchSection('holdings');
    toast(`${result.imported} investments imported successfully.`, 'success');
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    setBusy(button, false);
  }
}


async function saveWatch(event) {
  event.preventDefault();
  const button = $('saveWatchBtn');
  setBusy(button, true, 'Saving…');
  try {
    const result = await api('saveWatchItem', {
      item: {
        id: els.watchId.value,
        type: els.watchType.value,
        assetName: els.watchName.value.trim(),
        code: els.watchCode.value.trim().toUpperCase(),
        exchange: ['MF','OTHER'].includes(els.watchType.value) ? '' : els.watchExchange.value,
        targetPrice: els.watchTarget.value === '' ? null : Number(els.watchTarget.value),
        manualPrice: els.watchManualPrice.value === '' ? null : Number(els.watchManualPrice.value),
        priority: els.watchPriority.value,
        notes: els.watchNotes.value.trim()
      }
    });
    closeModals();
    applyBootstrap(result.data);
    saveCache(result.data);
    toast('Watchlist item saved.', 'success');
  } catch (error) { toast(error.message, 'error'); }
  finally { setBusy(button, false); }
}

async function deleteItem(action, id, label) {
  if (!confirm(`Delete this ${label}? This cannot be undone.`)) return;
  try {
    const result = await api(action, { id });
    applyBootstrap(result.data);
    saveCache(result.data);
    toast(`${label[0].toUpperCase()}${label.slice(1)} deleted.`, 'success');
  } catch (error) { toast(error.message, 'error'); }
}

async function changePassword(event) {
  event.preventDefault();
  if (els.newPassword.value !== els.confirmPassword.value) { toast('New passwords do not match.', 'error'); return; }
  const button = event.submitter;
  setBusy(button, true, 'Updating…');
  try {
    await api('changePassword', { currentPassword: els.currentPassword.value, newPassword: els.newPassword.value });
    closeModals();
    els.passwordForm.reset();
    toast('Password changed successfully.', 'success');
  } catch (error) { toast(error.message, 'error'); }
  finally { setBusy(button, false); }
}

async function loadUsers() {
  try {
    const result = await api('adminListUsers');
    state.users = result.users || [];
    renderUsers();
  } catch (error) { toast(error.message, 'error'); }
}

async function createUser(event) {
  event.preventDefault();
  const button = event.submitter;
  setBusy(button, true, 'Creating…');
  try {
    await api('adminCreateUser', {
      username: els.newUsername.value.trim(), displayName: els.newDisplayName.value.trim(),
      role: els.newUserRole.value, password: els.newUserPassword.value
    });
    closeModals();
    els.userForm.reset();
    await loadUsers();
    toast('User created.', 'success');
  } catch (error) { toast(error.message, 'error'); }
  finally { setBusy(button, false); }
}

async function resetUserPassword(username) {
  const password = prompt(`Enter a new temporary password for ${username}:`);
  if (!password) return;
  try { await api('adminResetPassword', { username, password }); toast('Password reset.', 'success'); }
  catch (error) { toast(error.message, 'error'); }
}

async function toggleUser(username, active) {
  if (!confirm(`${active ? 'Disable' : 'Enable'} user ${username}?`)) return;
  try { await api('adminToggleUser', { username, active: !active }); await loadUsers(); toast('User status updated.', 'success'); }
  catch (error) { toast(error.message, 'error'); }
}

function exportCsv() {
  if (!state.holdings.length) { toast('There are no holdings to export.', 'error'); return; }
  const headers = ['Asset Type','Asset Name','Code','Exchange','Units','Invested Amount','Current Price','Present Value','Gain/Loss','Return %','Purchase Date','Notes'];
  const rows = state.holdings.map((x) => [x.type,x.assetName,x.code,x.exchange,x.units,x.investedAmount,x.currentPrice,x.currentValue,x.gainLoss,x.returnPct,x.buyDate,x.notes]);
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `portfolio-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function bindEvents() {
  els.loginForm.addEventListener('submit', login);
  $('logoutBtn').addEventListener('click', logout);
  els.refreshBtn.addEventListener('click', () => loadDashboard(true));
  els.addInvestmentBtn.addEventListener('click', () => openInvestment());
  $('addInvestmentTableBtn').addEventListener('click', () => openInvestment());
  $('bulkImportBtn').addEventListener('click', openBulkImport);
  $('downloadImportTemplateBtn').addEventListener('click', downloadImportTemplate);
  els.bulkCsvFile.addEventListener('change', handleBulkCsvFile);
  els.bulkImportForm.addEventListener('submit', bulkImportInvestments);
  $('addWatchBtn').addEventListener('click', () => openWatch());
  $('addWatchOverviewBtn').addEventListener('click', () => openWatch());
  $('changePasswordBtn').addEventListener('click', () => openModal('passwordModal'));
  els.profileButton.addEventListener('click', () => openModal('passwordModal'));
  $('addUserBtn').addEventListener('click', () => openModal('userModal'));
  $('exportBtn').addEventListener('click', exportCsv);
  els.investmentForm.addEventListener('submit', saveInvestment);
  els.watchForm.addEventListener('submit', saveWatch);
  els.passwordForm.addEventListener('submit', changePassword);
  els.userForm.addEventListener('submit', createUser);
  els.holdingType.addEventListener('change', () => updateAssetForm(els.holdingType.value, 'holding'));
  els.watchType.addEventListener('change', () => updateAssetForm(els.watchType.value, 'watch'));
  els.holdingSearch.addEventListener('input', renderHoldings);
  els.holdingTypeFilter.addEventListener('change', renderHoldings);
  els.watchSearch.addEventListener('input', renderWatchlist);
  els.modalBackdrop.addEventListener('click', (event) => { if (event.target === els.modalBackdrop) closeModals(); });
  $$('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModals));
  $$('[data-section]').forEach((button) => button.addEventListener('click', () => switchSection(button.dataset.section)));
  $$('[data-section-link]').forEach((button) => button.addEventListener('click', () => switchSection(button.dataset.sectionLink)));
  $$('[data-toggle-password]').forEach((button) => button.addEventListener('click', () => {
    const input = $(button.dataset.togglePassword);
    const visible = input.type === 'text'; input.type = visible ? 'password' : 'text'; button.textContent = visible ? 'Show' : 'Hide';
  }));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModals(); });
  document.addEventListener('click', (event) => {
    const editHolding = event.target.closest('[data-edit-holding]');
    const deleteHolding = event.target.closest('[data-delete-holding]');
    const editWatch = event.target.closest('[data-edit-watch]');
    const deleteWatch = event.target.closest('[data-delete-watch]');
    const resetUser = event.target.closest('[data-reset-user]');
    const toggleUserBtn = event.target.closest('[data-toggle-user]');
    if (editHolding) openInvestment(state.holdings.find((x) => x.id === editHolding.dataset.editHolding));
    if (deleteHolding) deleteItem('deleteHolding', deleteHolding.dataset.deleteHolding, 'investment');
    if (editWatch) openWatch(state.watchlist.find((x) => x.id === editWatch.dataset.editWatch));
    if (deleteWatch) deleteItem('deleteWatchItem', deleteWatch.dataset.deleteWatch, 'watchlist item');
    if (resetUser) resetUserPassword(resetUser.dataset.resetUser);
    if (toggleUserBtn) toggleUser(toggleUserBtn.dataset.toggleUser, toggleUserBtn.dataset.active === 'true');
  });
}

async function init() {
  bindEvents();
  document.title = CONFIG.APP_NAME || 'Investment Dashboard';
  if (!isConfigured()) {
    els.loginMessage.textContent = 'Setup required: paste the Apps Script /exec URL into config.js.';
  }
  if (state.token && state.username) {
    showApp();
    loadCache();
    await loadDashboard(false);
  }
}

document.addEventListener('DOMContentLoaded', init);
