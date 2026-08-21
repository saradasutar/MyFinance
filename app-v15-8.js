'use strict';

const CONFIG = window.PORTFOLIO_CONFIG || {};
const APP_VERSION = '15.8';
const state = {
  token: localStorage.getItem('portfolio_token') || '',
  username: localStorage.getItem('portfolio_username') || '',
  user: null,
  holdings: [],
  watchlist: [],
  diary: [],
  monthlyDiary: [],
  monthStatus: [],
  diaryView: 'DAILY',
  diaryWorkspace: 'DAILY',
  users: [],
  owners: [],
  selectedOwner: 'ALL',
  selectedAssetView: 'ALL',
  activeSection: 'overview',
  syncing: false,
  importMode: 'MF_STATEMENT',
  pendingImport: [],
  growthRange: '30D',
  autoRefreshMinutes: Number(localStorage.getItem('portfolio_auto_refresh_min') || 15),
  autoRefreshNextAt: 0,
  autoRefreshTimer: null,
  backendVersion: '',
  masterDataVersion: '',
  masterDataAppliedAt: '',
  hScrollTarget: null,
  diaryDraftTimer: null,
  monthlyDraftTimer: null
};

const $ = (id) => document.getElementById(id);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const els = {};
[
  'loginView','appView','loginForm','loginUsername','loginPassword','rememberUsername','loginVersion','loginBackendVersion','loginButton','loginMessage','sideAppName','dashboardUsername','dashboardVersion','dashboardBackendVersion','dashboardVersionTop','dashboardBackendVersionTop','todayLabel','pageTitle','autoRefreshSelect','autoRefreshCountdown','syncStatus','refreshBtn','addInvestmentBtn','addInvestmentTableBtn','bulkImportBtn','logoutBtn','profileButton','avatarInitial','welcomeTitle','lastUpdatedText','viewChip','ownerSwitcher','assetViewSwitcher','typeSummaryGrid','holdingsHeading','sumInvestedLabel','sumCurrentLabel','importBtn','exportBtn','sumInvested','sumCurrent','sumGain','sumReturn','sumAssetCount','sumPricedCount','sumSplit','sumWatchCount','sumInvestedTrend','sumCurrentTrend','sumGainTrend','sumWatchTrend','growthRangeButtons','growthInvestedDelta','growthInvestedPct','growthValueDelta','growthValuePct','growthGainNow','growthReturnNow','portfolioGrowthChart','growthHistoryNote','watchPulseBadge','watchAtTarget','watchNearTarget','watchAverageGap','watchPulseCount','watchlistTrendChart','watchTrendNote','watchlistLastAutoUpdate','watchStripAtTarget','watchStripNear','watchStripGap','allocationChart','investorSummary','topHoldings','replaceMasterDataBtn','masterDataStatus','masterLoadBanner','masterLoadNowBtn','showAllInvestmentsBtn','holdingSearch','holdingTypeFilter','holdingsBody','holdingsEmpty','viewAllNotesBtn','watchAllNotesBtn','notesModal','notesSearch','notesSource','notesScope','notesFilter','notesSummary','notesList','notesEmpty','watchSearch','watchBody','watchEmpty','diaryForm','diaryId','diaryDate','diaryPrevDayBtn','diaryTodayBtn','diaryNextDayBtn','diaryTitle','diaryText','diaryDraftStatus','diaryCharCount','saveDiaryBtn','clearDiaryBtn','newDiaryEntryBtn','diarySaveStatus','diaryViewSwitcher','diarySearch','diarySearchClearBtn','diaryDayControl','diaryMonthControl','diaryBrowseDate','diaryBrowseMonth','diarySummary','diaryList','diaryEmpty','diaryHeroStatus','diaryWorkspaceSwitcher','dailyDiaryWorkspace','monthlyDiaryWorkspace','monthlyYearFilter','monthlyMonthFilter','monthlyTypeFilter','monthlyStatusFilter','monthlySearch','monthCompletionPanel','monthCompletionTitle','monthCompletionText','monthProgressBar','monthProgressLabel','completeMonthBtn','monthlyForm','monthlyId','monthlyEntryMonth','monthlyPrevMonthBtn','monthlyThisMonthBtn','monthlyNextMonthBtn','monthlyEntryType','monthlyTitle','monthlyText','monthlyDraftStatus','monthlyCharCount','monthlyTargetHelp','monthlySaveStatus','clearMonthlyBtn','saveMonthlyBtn','monthlyListTitle','monthlyResultCount','completedMonthArchive','monthlyList','monthlyEmpty','usersBody','modalBackdrop','investmentModal','investmentForm','holdingId','holdingOwner','holdingType','holdingName','holdingCode','holdingExchange','holdingUnits','holdingInvested','holdingManualPrice','holdingBuyDate','holdingNotes','holdingCodeLabel','exchangeLabel','mfHelp','bulkImportModal','bulkImportForm','bulkCsvFile','bulkImportStatus','runBulkImportBtn','downloadImportTemplateBtn','mfImportHelp','mfSnapshotImportHelp','stockImportHelp','stockOwnerLabel','importOwner','importFileHint','watchModal','watchForm','watchId','watchType','watchName','watchCode','watchExchange','watchTarget','watchManualPrice','watchPriority','watchNotes','watchCodeLabel','watchExchangeLabel','watchMfHelp','passwordModal','passwordForm','currentPassword','newPassword','confirmPassword','userModal','userForm','newUsername','newDisplayName','newUserRole','newUserPassword','dashboardHScroll','dashboardHScrollTrack','dashboardHScrollInner','dashboardHScrollLeft','dashboardHScrollRight','holdingDrawerBackdrop','holdingDrawer','drawerEyebrow','drawerAssetBadge','drawerTitle','drawerSubtitle','drawerContent','drawerCloseBtn','drawerEditBtn','drawerDoneBtn','toastRegion'
].forEach((id) => { els[id] = $(id); });

function isConfigured() {
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(String(CONFIG.API_URL || '').trim());
}
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function formatCurrency(value, compact = false) {
  if (value === null || value === '' || value === undefined) return '—';
  const n = Number(value); if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-IN',{style:'currency',currency:CONFIG.CURRENCY||'INR',maximumFractionDigits:compact?0:2,notation:compact&&Math.abs(n)>=100000?'compact':'standard'}).format(n);
}
function formatNumber(value, digits = 4) { const n=Number(value); return value===null||value===''||value===undefined||!Number.isFinite(n)?'—':new Intl.NumberFormat('en-IN',{maximumFractionDigits:digits}).format(n); }
function formatPercent(value) { const n=Number(value); return value===null||value===''||value===undefined||!Number.isFinite(n)?'—':`${n>=0?'+':''}${n.toFixed(2)}%`; }
function pnlClass(value) { const n=Number(value); return n>0?'positive':n<0?'negative':'neutral'; }
function dateLabel(value) { const d=value?new Date(value):null; return !d||Number.isNaN(d.getTime())?'Not available':new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short'}).format(d); }
function setBusy(button,busy,text){ if(!button)return; if(busy){button.dataset.originalText=button.textContent;button.disabled=true;button.textContent=text||'Please wait…';}else{button.disabled=false;button.textContent=button.dataset.originalText||button.textContent;} }
function setSyncStatus(mode,message){ if(!els.syncStatus)return; els.syncStatus.className=`sync-status ${mode||''}`.trim(); const label=els.syncStatus.querySelector('span:last-child'); if(label)label.textContent=message; }
function toast(message,type=''){ const node=document.createElement('div');node.className=`toast ${type}`.trim();node.textContent=message;els.toastRegion.appendChild(node);setTimeout(()=>node.remove(),4500); }

async function api(action,payload={},options={}){
  if(!isConfigured()) throw new Error('Backend is not configured. Check config.js.');
  const controller=new AbortController(); const timeoutMs=Number(options.timeoutMs)||CONFIG.REQUEST_TIMEOUT_MS||30000; const timeout=setTimeout(()=>controller.abort(),timeoutMs);
  const body={action,...payload}; if(state.token&&!body.token) body.token=state.token;
  try{
    const response=await fetch(CONFIG.API_URL,{method:'POST',body:JSON.stringify(body),redirect:'follow',signal:controller.signal,cache:'no-store',credentials:'omit'});
    const text=await response.text(); let data; try{data=JSON.parse(text);}catch{throw new Error('The backend returned an unreadable response. Redeploy the Apps Script web app and check access permissions.');}
    if(!data.ok){const e=new Error(data.message||'Request failed.');e.code=data.code||'REQUEST_FAILED';throw e;} return data;
  }catch(error){ if(error.name==='AbortError')throw new Error('The request timed out. Please try again.'); if(options.retry&&!options._retried){await new Promise(r=>setTimeout(r,700));return api(action,payload,{...options,_retried:true});} throw error; }
  finally{clearTimeout(timeout);}
}

function cacheKey(){return `portfolio_cache_${state.username||'unknown'}`;}
function saveCache(data){try{localStorage.setItem(cacheKey(),JSON.stringify({savedAt:Date.now(),data}));}catch{} }
function loadCache(){try{const p=JSON.parse(localStorage.getItem(cacheKey())||'null');if(p?.data)applyBootstrap(p.data,true);}catch{} }
function clearSession(){state.token='';state.username='';state.user=null;localStorage.removeItem('portfolio_token');localStorage.removeItem('portfolio_username');}


function growthHistoryKey(){return `portfolio_growth_history_${state.username||'unknown'}`;}
function loadGrowthHistory(){try{const p=JSON.parse(localStorage.getItem(growthHistoryKey())||'[]');return Array.isArray(p)?p:[];}catch{return [];}}
function saveGrowthHistory(h){try{localStorage.setItem(growthHistoryKey(),JSON.stringify(h.slice(-2200)));}catch{}}
function scopeKey(owner,asset){return `${owner||'ALL'}::${asset||'ALL'}`;}
function scopedItems(owner,asset){let items=state.holdings;if(owner&&owner!=='ALL')items=items.filter(h=>canonicalOwner(h.owner)===owner);if(asset==='MF')items=items.filter(h=>h.type==='MF');if(asset==='STOCKS')items=items.filter(h=>h.type==='STOCK'||h.type==='ETF');return items;}
function watchPulseSummary(){const valid=state.watchlist.filter(x=>Number(x.currentPrice)>0&&Number(x.targetPrice)>0);const d=valid.map(x=>Number.isFinite(Number(x.distancePct))?Number(x.distancePct):(Number(x.currentPrice)-Number(x.targetPrice))/Number(x.targetPrice)*100);return{count:state.watchlist.length,priced:valid.length,atTarget:d.filter(x=>x<=0).length,nearTarget:d.filter(x=>x>0&&x<=5).length,avgDistance:d.length?d.reduce((a,b)=>a+b,0)/d.length:null};}
function buildGrowthSnapshot(ts=Date.now()){const owners=['ALL',...configuredOwners()],assets=['ALL','MF','STOCKS'],scopes={};owners.forEach(o=>assets.forEach(a=>{const items=scopedItems(o,a),s=summarizeHoldings(items);scopes[scopeKey(o,a)]={invested:s.invested,current:s.current,gain:s.gain,returnPct:s.returnPct,count:items.length};}));return{ts,scopes,watch:watchPulseSummary()};}
function recordGrowthSnapshot(){if(!state.username)return;const now=Date.now(),h=loadGrowthHistory(),prev=h[h.length-1],cur=buildGrowthSnapshot(now),k=scopeKey('ALL','ALL'),a=cur.scopes[k]||{},b=prev?.scopes?.[k]||{};const changed=Math.abs(Number(a.invested||0)-Number(b.invested||0))>.01||Math.abs(Number(a.current||0)-Number(b.current||0))>.01||Math.abs(Number(cur.watch?.avgDistance||0)-Number(prev?.watch?.avgDistance||0))>.01;if(prev&&now-Number(prev.ts||0)<10*60*1000&&!changed)return;h.push(cur);saveGrowthHistory(h);}
function filteredGrowthHistory(){const h=loadGrowthHistory(),now=Date.now();if(state.growthRange==='7D')return h.filter(x=>now-Number(x.ts||0)<=7*86400000);if(state.growthRange==='30D')return h.filter(x=>now-Number(x.ts||0)<=30*86400000);return h;}
function pctChange(c,s){c=Number(c);s=Number(s);return Number.isFinite(c)&&Number.isFinite(s)&&s!==0?(c-s)/Math.abs(s)*100:null;}
function trendText(delta,pct,label=''){if(!Number.isFinite(Number(delta)))return'Tracking growth…';const d=Number(delta),p=Number(pct),sign=d>0?'▲':d<0?'▼':'•';return`${sign} ${formatCurrency(Math.abs(d),true)}${Number.isFinite(p)?` · ${p>=0?'+':''}${p.toFixed(2)}%`:''}${label?` ${label}`:''}`;}
function svgTrendChart(series,{height=220,emptyText='More history will appear after automatic updates.'}={}){const vals=series.flatMap(s=>s.points.map(p=>Number(p.value)).filter(Number.isFinite));if(!vals.length)return`<div class="chart-empty">${escapeHtml(emptyText)}</div>`;const W=720,H=height,l=20,r=18,t=18,b=28;let mn=Math.min(...vals),mx=Math.max(...vals);if(mn===mx){mn-=1;mx+=1;}const sp=mx-mn||1,n=Math.max(...series.map(s=>s.points.length),1),x=i=>l+(n<=1?0:i/(n-1))*(W-l-r),y=v=>t+(mx-Number(v))/sp*(H-t-b),grid=[0,.25,.5,.75,1].map(f=>{const yy=t+f*(H-t-b);return`<line x1="${l}" y1="${yy}" x2="${W-r}" y2="${yy}" class="chart-grid-line"/>`;}).join(''),paths=series.map(s=>{const pts=s.points.map((p,i)=>`${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' '),last=s.points[s.points.length-1],lx=x(Math.max(0,s.points.length-1)),ly=last?y(last.value):0;return`<polyline points="${pts}" fill="none" class="chart-series ${s.className}" vector-effect="non-scaling-stroke"/>${last?`<circle cx="${lx}" cy="${ly}" r="4" class="chart-point ${s.className}"/>`:''}`;}).join('');return`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${grid}${paths}</svg>`;}
function renderGrowthDashboard(){const hist=filteredGrowthHistory(),key=scopeKey(state.selectedOwner,state.selectedAssetView),pts=hist.map(h=>({ts:h.ts,scope:h.scopes?.[key]})).filter(x=>x.scope),cur=summarizeHoldings(visibleHoldings()),first=pts[0]?.scope||null,last=pts[pts.length-1]?.scope||{invested:cur.invested,current:cur.current,gain:cur.gain,returnPct:cur.returnPct},id=first?Number(last.invested||0)-Number(first.invested||0):0,vd=first?Number(last.current||0)-Number(first.current||0):0,ip=first?pctChange(last.invested,first.invested):0,vp=first?pctChange(last.current,first.current):0;
 if(els.growthInvestedDelta){els.growthInvestedDelta.textContent=formatCurrency(id,true);els.growthInvestedDelta.className=pnlClass(id);els.growthInvestedPct.textContent=first?formatPercent(ip):'Starting now';els.growthValueDelta.textContent=formatCurrency(vd,true);els.growthValueDelta.className=pnlClass(vd);els.growthValuePct.textContent=first?formatPercent(vp):'Starting now';els.growthGainNow.textContent=formatCurrency(cur.gain,true);els.growthGainNow.className=pnlClass(cur.gain);els.growthReturnNow.textContent=formatPercent(cur.returnPct);els.growthReturnNow.className=pnlClass(cur.returnPct);}
 if(els.portfolioGrowthChart)els.portfolioGrowthChart.innerHTML=svgTrendChart([{className:'invested',points:pts.map(x=>({value:Number(x.scope.invested)||0}))},{className:'current',points:pts.map(x=>({value:Number(x.scope.current)||0}))}]);
 if(els.growthHistoryNote)els.growthHistoryNote.textContent=pts.length>1?`${pts.length} snapshots · ${state.growthRange==='ALL'?'all recorded history':state.growthRange}`:'Growth history starts now and builds automatically.';
 if(els.sumInvestedTrend){els.sumInvestedTrend.textContent=pts.length>1?trendText(id,ip,state.growthRange):'Tracking from now';els.sumInvestedTrend.className=`summary-trend ${pnlClass(id)}`;els.sumCurrentTrend.textContent=pts.length>1?trendText(vd,vp,state.growthRange):'Tracking from now';els.sumCurrentTrend.className=`summary-trend ${pnlClass(vd)}`;els.sumGainTrend.textContent=`${formatPercent(cur.returnPct)} total return`;els.sumGainTrend.className=`summary-trend ${pnlClass(cur.returnPct)}`;}renderWatchPulse(hist);}
function renderWatchPulse(hist=filteredGrowthHistory()){const p=watchPulseSummary();if(els.watchAtTarget)els.watchAtTarget.textContent=String(p.atTarget);if(els.watchNearTarget)els.watchNearTarget.textContent=String(p.nearTarget);if(els.watchAverageGap)els.watchAverageGap.textContent=p.avgDistance===null?'—':formatPercent(p.avgDistance);if(els.watchPulseCount)els.watchPulseCount.textContent=String(p.count);if(els.watchStripAtTarget)els.watchStripAtTarget.textContent=String(p.atTarget);if(els.watchStripNear)els.watchStripNear.textContent=String(p.nearTarget);if(els.watchStripGap)els.watchStripGap.textContent=p.avgDistance===null?'—':formatPercent(p.avgDistance);const wp=hist.map(h=>({value:Number(h.watch?.avgDistance)})).filter(x=>Number.isFinite(x.value));if(els.watchlistTrendChart)els.watchlistTrendChart.innerHTML=svgTrendChart([{className:'watch',points:wp}],{height:160,emptyText:'Watchlist target-distance history will build after updates.'});const first=hist.find(h=>Number.isFinite(Number(h.watch?.avgDistance)))?.watch?.avgDistance,gd=Number.isFinite(Number(first))&&Number.isFinite(Number(p.avgDistance))?Number(p.avgDistance)-Number(first):null;if(els.watchTrendNote)els.watchTrendNote.textContent=gd===null?'Lower average gap means ideas are moving closer to your targets.':`${gd<=0?'Closer':'Farther'} by ${Math.abs(gd).toFixed(2)} percentage points over ${state.growthRange}.`;if(els.sumWatchTrend){els.sumWatchTrend.textContent=p.atTarget?`${p.atTarget} at/below target · ${p.nearTarget} near`:`${p.nearTarget} near target · avg gap ${p.avgDistance===null?'—':formatPercent(p.avgDistance)}`;els.sumWatchTrend.className=`summary-trend ${p.atTarget?'positive':'neutral'}`;}}
function updateAutoRefreshUI(){if(!els.autoRefreshCountdown)return;const m=Number(state.autoRefreshMinutes)||0;if(!m){els.autoRefreshCountdown.textContent='Off';return;}const left=Math.max(0,state.autoRefreshNextAt-Date.now()),sec=Math.ceil(left/1000);els.autoRefreshCountdown.textContent=left>0?`Next ${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`:'Updating…';}
function resetAutoRefreshClock(){const m=Number(state.autoRefreshMinutes)||0;state.autoRefreshNextAt=m?Date.now()+m*60000:0;updateAutoRefreshUI();}
function startAutoRefresh(){if(state.autoRefreshTimer)clearInterval(state.autoRefreshTimer);if(els.autoRefreshSelect)els.autoRefreshSelect.value=String(state.autoRefreshMinutes);resetAutoRefreshClock();state.autoRefreshTimer=setInterval(async()=>{updateAutoRefreshUI();if(!state.token||document.hidden||!state.autoRefreshMinutes||state.syncing)return;if(Date.now()>=state.autoRefreshNextAt){resetAutoRefreshClock();await loadDashboard(true);}},1000);}
function changeAutoRefresh(){state.autoRefreshMinutes=Number(els.autoRefreshSelect?.value||0);localStorage.setItem('portfolio_auto_refresh_min',String(state.autoRefreshMinutes));resetAutoRefreshClock();toast(state.autoRefreshMinutes?`Auto update set to every ${state.autoRefreshMinutes} minutes.`:'Auto update turned off.','success');}

function titleCase(value){return String(value||'').trim().toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());}
function canonicalOwner(value){
  const raw=String(value||'').trim(); if(!raw)return 'Portfolio';
  const low=raw.toLowerCase(); const configured=Array.isArray(CONFIG.OWNERS)?CONFIG.OWNERS:[];
  for(const owner of configured){const first=String(owner).trim().toLowerCase().split(/\s+/)[0]; if(first&&low.includes(first))return String(owner).trim();}
  return titleCase(raw);
}
function configuredOwners(){
  const defaults=Array.isArray(CONFIG.OWNERS)?CONFIG.OWNERS.map(canonicalOwner):[];
  return [...new Set([...defaults,...state.owners.map(canonicalOwner),...state.holdings.map(h=>canonicalOwner(h.owner))].filter(Boolean))];
}
function shortOwner(owner){ const c=canonicalOwner(owner); const configured=Array.isArray(CONFIG.OWNERS)?CONFIG.OWNERS:[]; const match=configured.find(x=>c.toLowerCase().includes(String(x).toLowerCase().split(/\s+/)[0])); return match||c.split(/\s+/)[0]||c; }

function updateVersionLabels(){
  if(els.loginVersion)els.loginVersion.textContent=`Frontend · v${APP_VERSION}`;
  if(els.dashboardVersion)els.dashboardVersion.textContent=`Frontend · v${APP_VERSION}`;
  if(els.dashboardVersionTop)els.dashboardVersionTop.textContent=`FE v${APP_VERSION}`;
  const be=state.backendVersion?`v${state.backendVersion}`:'checking…';
  if(els.loginBackendVersion)els.loginBackendVersion.textContent=`Backend · ${be}`;
  if(els.dashboardBackendVersion)els.dashboardBackendVersion.textContent=`Backend · ${be}`;
  if(els.dashboardBackendVersionTop)els.dashboardBackendVersionTop.textContent=state.backendVersion?`BE v${state.backendVersion}`:'BE …';
}
async function loadBackendVersion(){
  updateVersionLabels();
  if(!isConfigured())return;
  try{
    const response=await fetch(String(CONFIG.API_URL).trim(),{method:'GET',cache:'no-store',redirect:'follow'});
    const data=await response.json();
    if(data&&data.version)state.backendVersion=String(data.version);
  }catch(e){if(!state.backendVersion)state.backendVersion='unavailable';}
  updateVersionLabels();
}
function loadSavedUsername(){
  const saved=localStorage.getItem('portfolio_saved_username')||'';
  if(els.loginUsername&&saved){els.loginUsername.value=saved;if(els.rememberUsername)els.rememberUsername.checked=true;}
  updateVersionLabels();
}
function updateSavedUsernamePreference(){
  const username=els.loginUsername?.value.trim()||'';
  if(els.rememberUsername?.checked&&username)localStorage.setItem('portfolio_saved_username',username);
  else localStorage.removeItem('portfolio_saved_username');
}
function localIsoDate(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function localIsoMonth(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
}

async function login(event){
  event.preventDefault(); els.loginMessage.textContent='';
  if(!isConfigured()){els.loginMessage.textContent='Setup required: paste the Apps Script /exec URL into config.js.';return;}
  setBusy(els.loginButton,true,'Signing in…');
  try{const result=await api('login',{username:els.loginUsername.value.trim(),password:els.loginPassword.value});state.token=result.token;state.username=result.user.username;localStorage.setItem('portfolio_token',state.token);localStorage.setItem('portfolio_username',state.username);updateSavedUsernamePreference();showApp();applyBootstrap(result.data);resetAutoRefreshClock();toast('Signed in successfully.','success');}
  catch(error){els.loginMessage.textContent=error.message;}
  finally{setBusy(els.loginButton,false);}
}
async function logout(){try{if(state.token)await api('logout');}catch{}clearSession();els.appView.classList.add('hidden');els.loginView.classList.remove('hidden');els.loginPassword.value='';loadSavedUsername();}
function showApp(){els.loginView.classList.add('hidden');els.appView.classList.remove('hidden');els.sideAppName.textContent=CONFIG.APP_NAME||'My Finance';updateVersionLabels();els.todayLabel.textContent=new Intl.DateTimeFormat('en-IN',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toUpperCase();}
async function loadDashboard(force=false){
  if(state.syncing)return; state.syncing=true;setSyncStatus('syncing',force?'Updating prices & performance…':'Syncing…');
  try{const result=await api(force?'refreshPrices':'bootstrap',{}, {retry:!force});applyBootstrap(result.data);saveCache(result.data);setSyncStatus('','Up to date');if(force)toast('Prices, NAVs and performance refreshed.','success');}
  catch(error){if(error.code==='AUTH_REQUIRED'||error.code==='SESSION_EXPIRED'){toast('Your session expired. Please sign in again.','error');logout();return;}setSyncStatus('error','Sync failed');toast(error.message,'error');}
  finally{state.syncing=false;}
}

function applyBootstrap(data,fromCache=false){
  if(!data)return;
  if(data.backendVersion)state.backendVersion=String(data.backendVersion);
  state.masterDataVersion=String(data.masterDataVersion||'');
  state.masterDataAppliedAt=String(data.masterDataAppliedAt||'');
  if(!state.masterDataAppliedAt && data.holdings && data.holdings.length){
    setTimeout(()=>toast('Master spreadsheet has not been applied yet. Click “Load Master Sheet Data” on Overview.','info'),500);
  }
  updateVersionLabels();
  state.user=data.user||state.user;state.holdings=Array.isArray(data.holdings)?data.holdings:[];state.watchlist=Array.isArray(data.watchlist)?data.watchlist:[];state.diary=Array.isArray(data.diary)?data.diary:[];state.monthlyDiary=Array.isArray(data.monthlyDiary)?data.monthlyDiary:[];state.monthStatus=Array.isArray(data.monthStatus)?data.monthStatus:[];state.owners=Array.isArray(data.owners)?data.owners:[];if(Array.isArray(data.users))state.users=data.users;
  if(!fromCache)recordGrowthSnapshot();
  refreshOwnerControls();renderAll();
  if(state.user){els.avatarInitial.textContent=(state.user.displayName||state.user.username||'I').charAt(0).toUpperCase();if(els.dashboardUsername)els.dashboardUsername.textContent=state.user.username||state.user.displayName||'—';if(els.diaryHeroStatus)els.diaryHeroStatus.textContent=`Private diary · ${state.user.username||'signed in'}`;$$('.admin-only').forEach(el=>el.classList.toggle('hidden',state.user.role!=='ADMIN'));}
  if(els.masterLoadBanner){
    const loaded=Boolean(state.masterDataAppliedAt);
    els.masterLoadBanner.classList.toggle('hidden',loaded);
  }
  if(els.masterDataStatus){
    els.masterDataStatus.textContent=state.masterDataAppliedAt?`Master sheet loaded · 35 holdings · 17 watchlist · ${detailDate(state.masterDataAppliedAt)}`:'Master spreadsheet not loaded yet · use “Replace from Master Sheet”.';
    els.masterDataStatus.classList.toggle('loaded',Boolean(state.masterDataAppliedAt));
  }
  els.lastUpdatedText.textContent=`${fromCache?'Showing saved data':'Updated'} ${dateLabel(data.updatedAt)}${data.priceNote?` · ${data.priceNote}`:''}`;if(els.watchlistLastAutoUpdate)els.watchlistLastAutoUpdate.textContent=`Updated ${dateLabel(data.updatedAt)}`;
}

function refreshOwnerControls(){
  const owners=configuredOwners();
  if(state.selectedOwner!=='ALL'&&!owners.some(o=>o===state.selectedOwner))state.selectedOwner='ALL';
  els.ownerSwitcher.innerHTML=[{value:'ALL',label:'Combined'},...owners.map(o=>({value:o,label:shortOwner(o)}))].map(x=>`<button type="button" class="owner-pill ${state.selectedOwner===x.value?'active':''}" data-owner-view="${escapeHtml(x.value)}">${escapeHtml(x.label)}</button>`).join('');
  const opts=owners.length?owners:['Sarada','Niharika'];
  [els.holdingOwner,els.importOwner].forEach(select=>{if(!select)return;const old=select.value;select.innerHTML=opts.map(o=>`<option value="${escapeHtml(o)}">${escapeHtml(shortOwner(o))}</option>`).join('');if(opts.includes(old))select.value=old;});
}
function ownerHoldings(){
  return state.holdings.filter(h=>state.selectedOwner==='ALL'||canonicalOwner(h.owner)===state.selectedOwner);
}
function assetViewMatches(h){
  if(state.selectedAssetView==='ALL')return true;
  if(state.selectedAssetView==='MF')return h.type==='MF';
  if(state.selectedAssetView==='STOCKS')return h.type==='STOCK'||h.type==='ETF';
  return true;
}
function visibleHoldings(){return ownerHoldings().filter(assetViewMatches);}
function assetViewLabel(){
  return state.selectedAssetView==='MF'?'Mutual Funds':state.selectedAssetView==='STOCKS'?'Stocks & ETFs':'All Investments';
}
function visibleWatchlist(){return state.watchlist;}
function summarizeHoldings(items){
  let invested=0,current=0,pricedInvested=0,priced=0;const allocation={};
  items.forEach(h=>{invested+=Number(h.investedAmount)||0;const basis=h.currentValue==null?(Number(h.investedAmount)||0):Number(h.currentValue)||0;allocation[h.type]=(allocation[h.type]||0)+basis;if(h.currentValue!=null){current+=Number(h.currentValue)||0;pricedInvested+=Number(h.investedAmount)||0;priced++;}});
  const gain=current-pricedInvested;return{invested,current,gain,returnPct:pricedInvested>0?gain/pricedInvested*100:0,priced,allocation};
}
function showAllInvestments(){
  state.selectedOwner='ALL';
  state.selectedAssetView='ALL';

  if(els.holdingSearch)els.holdingSearch.value='';
  if(els.holdingTypeFilter)els.holdingTypeFilter.value='ALL';

  refreshOwnerControls();
  refreshAssetViewControls();
  renderAll();
  switchSection('holdings');

  const total=state.holdings.length;
  toast(
    total
      ? `Showing all ${total} investment${total===1?'':'s'}.`
      : 'All filters cleared. No investments are currently loaded.',
    total ? 'success' : 'info'
  );
}

function refreshAssetViewControls(){
  if(!['ALL','MF','STOCKS'].includes(state.selectedAssetView))state.selectedAssetView='ALL';
  if(els.assetViewSwitcher){
    $$('[data-asset-view]').forEach(b=>b.classList.toggle('active',b.dataset.assetView===state.selectedAssetView));
  }
  if(els.holdingsHeading){
    els.holdingsHeading.textContent=state.selectedAssetView==='MF'?'Mutual fund holdings':state.selectedAssetView==='STOCKS'?'Stock & ETF holdings':'Mutual funds, stocks and ETFs';
  }
}
function renderAll(){refreshAssetViewControls();renderSummary();renderGrowthDashboard();renderTypeSummary();renderAllocation();renderInvestorSummary();renderTopHoldings();renderHoldings();renderWatchlist();refreshMonthlyYearFilter();renderDiary();renderMonthlyDiary();if(state.user?.role==='ADMIN')renderUsers();}
function renderSummary(){
  const items=visibleHoldings(),s=summarizeHoldings(items);
  els.sumInvested.textContent=formatCurrency(s.invested,true);
  els.sumCurrent.textContent=formatCurrency(s.current,true);
  els.sumGain.textContent=formatCurrency(s.gain,true);
  els.sumGain.className=pnlClass(s.gain);
  els.sumReturn.textContent=formatPercent(s.returnPct);
  els.sumReturn.className=pnlClass(s.returnPct);
  els.sumAssetCount.textContent=`${items.length} holding${items.length===1?'':'s'}`;
  els.sumPricedCount.textContent=`${s.priced} priced`;
  const viewLabel=assetViewLabel();
  els.sumSplit.textContent=viewLabel;
  els.sumWatchCount.textContent=`${state.watchlist.length} watchlist`;
  const ownerLabel=state.selectedOwner==='ALL'?'Combined':shortOwner(state.selectedOwner);
  els.welcomeTitle.textContent=state.selectedAssetView==='ALL'?`${ownerLabel} portfolio`:`${ownerLabel} · ${viewLabel}`;
  els.viewChip.textContent=state.selectedAssetView==='ALL'?ownerLabel:`${ownerLabel} · ${viewLabel}`;
  if(els.sumInvestedLabel)els.sumInvestedLabel.textContent=state.selectedAssetView==='ALL'?'Invested / cost value':`${viewLabel} invested`;
  if(els.sumCurrentLabel)els.sumCurrentLabel.textContent=state.selectedAssetView==='ALL'?'Current value':`${viewLabel} current value`;
}
function renderTypeSummary(){
  if(!els.typeSummaryGrid)return;
  const base=ownerHoldings();
  const defs=[
    {key:'ALL',label:'All investments',items:base,icon:'▦'},
    {key:'MF',label:'Mutual funds',items:base.filter(h=>h.type==='MF'),icon:'MF'},
    {key:'STOCKS',label:'Stocks & ETFs',items:base.filter(h=>h.type==='STOCK'||h.type==='ETF'),icon:'ST'}
  ];
  els.typeSummaryGrid.innerHTML=defs.map(d=>{
    const s=summarizeHoldings(d.items);
    const active=state.selectedAssetView===d.key?'active':'';
    return `<button type="button" class="type-summary-card ${active}" data-asset-view="${d.key}">
      <div class="type-summary-head"><span class="type-summary-icon">${d.icon}</span><div><strong>${d.label}</strong><span>${d.items.length} holding${d.items.length===1?'':'s'}</span></div></div>
      <div class="type-summary-values">
        <div><span>Invested</span><b>${formatCurrency(s.invested,true)}</b></div>
        <div><span>Current</span><b>${formatCurrency(s.current,true)}</b></div>
        <div><span>Gain / loss</span><b class="${pnlClass(s.gain)}">${formatCurrency(s.gain,true)}</b></div>
        <div><span>Return</span><b class="${pnlClass(s.returnPct)}">${formatPercent(s.returnPct)}</b></div>
      </div>
    </button>`;
  }).join('');
}
function renderAllocation(){
  const s=summarizeHoldings(visibleHoldings()),entries=Object.entries(s.allocation).sort((a,b)=>b[1]-a[1]);const total=entries.reduce((a,[,v])=>a+v,0);
  if(!entries.length){els.allocationChart.innerHTML='<div class="empty-state">Allocation appears after holdings are imported.</div>';return;}
  els.allocationChart.innerHTML=entries.map(([type,value])=>{const pct=total?value/total*100:0;return `<div class="allocation-row"><div class="allocation-name"><span class="allocation-dot ${type.toLowerCase()}"></span>${escapeHtml(type)}</div><div class="allocation-track"><div class="allocation-fill" style="width:${Math.min(100,Math.max(0,pct))}%"></div></div><div class="allocation-value">${pct.toFixed(1)}%</div></div>`;}).join('');
}
function renderInvestorSummary(){
  const owners=configuredOwners();
  if(!owners.length){els.investorSummary.innerHTML='<div class="empty-state">Investor summary appears after import.</div>';return;}
  els.investorSummary.innerHTML=owners.map(owner=>{
    const ownerItems=state.holdings.filter(h=>canonicalOwner(h.owner)===owner).filter(assetViewMatches);
    const s=summarizeHoldings(ownerItems);
    return `<button class="investor-card" data-owner-view="${escapeHtml(owner)}"><div><strong>${escapeHtml(shortOwner(owner))}</strong><span>${ownerItems.length} ${assetViewLabel().toLowerCase()}</span></div><div class="investor-metrics"><b>${formatCurrency(s.current,true)}</b><span class="${pnlClass(s.gain)}">${formatPercent(s.returnPct)}</span></div></button>`;
  }).join('');
}
function renderTopHoldings(){const items=[...visibleHoldings()].sort((a,b)=>(Number(b.currentValue)||Number(b.investedAmount)||0)-(Number(a.currentValue)||Number(a.investedAmount)||0)).slice(0,8);if(!items.length){els.topHoldings.className='mini-holdings empty-state';els.topHoldings.textContent='Import your MF statement or stocks to begin.';return;}els.topHoldings.className='mini-holdings';els.topHoldings.innerHTML=items.map(h=>`<div class="mini-holding" data-view-holding="${escapeHtml(h.id)}" role="button" tabindex="0" aria-label="View details for ${escapeHtml(h.assetName)}"><div><strong>${escapeHtml(h.assetName)}</strong><span>${escapeHtml(shortOwner(h.owner))} · ${escapeHtml(h.type)} · ${escapeHtml(h.exchange?`${h.exchange}:`:'')}${escapeHtml(h.code)}</span></div><div class="mini-value">${formatCurrency(h.currentValue??h.investedAmount,true)}<span class="${pnlClass(h.returnPct)}">${h.currentPrice==null?'Price pending':formatPercent(h.returnPct)}</span></div></div>`).join('');}

function holdingMatches(h){
  const q=els.holdingSearch.value.trim().toLowerCase(),type=els.holdingTypeFilter.value;
  const ownerOk=state.selectedOwner==='ALL'||canonicalOwner(h.owner)===state.selectedOwner;
  const assetOk=assetViewMatches(h);
  const text=`${h.owner} ${h.assetName} ${h.code} ${h.sourceCode||''} ${h.notes||''}`.toLowerCase();
  return ownerOk&&assetOk&&(!q||text.includes(q))&&(type==='ALL'||h.type===type);
}
function notePreview(value, max=82){
  const clean=String(value||'').replace(/\s+/g,' ').trim();
  if(!clean)return '<span class="note-empty">Add note</span>';
  const short=clean.length>max?`${clean.slice(0,max-1)}…`:clean;
  return `<span class="note-preview">${escapeHtml(short)}</span>`;
}
function perfCell(v){return `<td class="perf ${pnlClass(v)}">${formatPercent(v)}</td>`;}
function renderHoldings(){
  const items=state.holdings.filter(holdingMatches);els.holdingsBody.innerHTML=items.map(h=>{const avg=(Number(h.units)>0?Number(h.investedAmount)/Number(h.units):null),p=h.performance||{};return `<tr class="holding-row" data-view-holding="${escapeHtml(h.id)}" tabindex="0" aria-label="View details for ${escapeHtml(h.assetName)}"><td class="sticky-col owner-col"><span class="owner-tag">${escapeHtml(shortOwner(h.owner))}</span></td><td class="sticky-col asset-col"><div class="asset-cell"><div class="asset-badge ${String(h.type).toLowerCase()}">${escapeHtml(h.type==='MF'?'MF':h.type==='ETF'?'ET':'ST')}</div><div><strong>${escapeHtml(h.assetName)}</strong><span>${escapeHtml(h.exchange?`${h.exchange}:`:'')}${escapeHtml(h.code)}${h.sourceCode?` · stmt ${escapeHtml(h.sourceCode)}`:''}</span></div></div></td><td>${formatNumber(h.units)}</td><td>${formatCurrency(avg)}</td><td>${formatCurrency(h.investedAmount)}</td><td>${formatCurrency(h.currentPrice)}<span class="price-note">${escapeHtml(h.priceSource||'Pending')}</span></td><td><strong>${formatCurrency(h.currentValue)}</strong></td><td class="${pnlClass(h.gainLoss)}">${formatCurrency(h.gainLoss)}</td><td class="${pnlClass(h.returnPct)}"><strong>${formatPercent(h.returnPct)}</strong></td><td class="${pnlClass(h.xirr)}">${formatPercent(h.xirr)}</td>${perfCell(p.d1)}${perfCell(p.w1)}${perfCell(p.m1)}${perfCell(p.m6)}${perfCell(p.y1)}${perfCell(p.y3)}${perfCell(p.y5)}${perfCell(p.y10)}<td class="personal-note-cell" data-note-cell="${escapeHtml(h.id)}">${notePreview(h.notes)}</td><td class="row-actions"><button class="small-button view-button" data-view-holding-button="${escapeHtml(h.id)}">View</button><button class="small-button" data-edit-holding="${escapeHtml(h.id)}">Edit</button><button class="small-button danger" data-delete-holding="${escapeHtml(h.id)}">Delete</button></td></tr>`;}).join('');
  els.holdingsEmpty.classList.toggle('hidden',items.length>0);
  requestAnimationFrame(refreshDashboardHScroll);
}
function sourcePerfCell(v){return `<td class="perf ${pnlClass(v)}">${formatPercent(v)}</td>`;}
function compactText(value,max=74){const c=String(value||'').replace(/\s+/g,' ').trim();if(!c)return '—';return c.length>max?`${c.slice(0,max-1)}…`:c;}
function renderWatchlist(){
  const q=els.watchSearch.value.trim().toLowerCase();
  const items=visibleWatchlist().filter(x=>{const s=x.sourceDetails||{};const hay=`${x.assetName} ${x.code} ${x.notes||''} ${s.companyName||''} ${s.salesGrowth||''} ${s.profitGrowth||''} ${s.valuation||''} ${s.moatRemark||''} ${s.finalRemark||''}`.toLowerCase();return !q||hay.includes(q);});
  els.watchBody.innerHTML=items.map(x=>{const s=x.sourceDetails||{};const hl=(s.high52!=null||s.low52!=null)?`${formatCurrency(s.high52)} / ${formatCurrency(s.low52)}`:'—';return `<tr class="watch-row" data-view-watch="${escapeHtml(x.id)}" tabindex="0" aria-label="View watchlist details for ${escapeHtml(x.assetName)}"><td class="sticky-col asset-col"><div class="asset-cell"><div class="asset-badge ${String(x.type).toLowerCase()}">${escapeHtml(x.type==='MF'?'MF':x.type==='ETF'?'ET':x.type==='STOCK'?'ST':'OT')}</div><div><strong>${escapeHtml(x.assetName)}</strong><span>${escapeHtml(x.exchange?`${x.exchange}:`:'')}${escapeHtml(x.code)}</span></div></div></td><td>${formatCurrency(x.currentPrice)}<span class="price-note">${escapeHtml(x.priceSource||'Pending')}</span></td><td class="${pnlClass(s.snapshotChangePct)}">${formatPercent(s.snapshotChangePct)}</td><td>${formatCurrency(x.targetPrice)}</td><td class="${Number(x.distancePct)<=0?'positive':'neutral'}">${formatPercent(x.distancePct)}</td><td>${hl}</td><td>${escapeHtml(s.valuation||'—')}</td>${sourcePerfCell(s.perf1M)}${sourcePerfCell(s.perf1Y)}${sourcePerfCell(s.perf3Y)}${sourcePerfCell(s.perf5Y)}${sourcePerfCell(s.perf10Y)}<td class="watch-source-remark" title="${escapeHtml(s.moatRemark||'')}">${escapeHtml(compactText(s.moatRemark,72))}</td><td class="personal-note-cell" data-watch-note-cell="${escapeHtml(x.id)}">${notePreview(x.notes)}</td><td class="row-actions"><button class="small-button" data-view-watch-button="${escapeHtml(x.id)}">View</button><button class="small-button note-button" data-watch-note-button="${escapeHtml(x.id)}">📝 Note</button><button class="small-button" data-edit-watch="${escapeHtml(x.id)}">Edit</button><button class="small-button danger" data-delete-watch="${escapeHtml(x.id)}">Delete</button></td></tr>`;}).join('');
  els.watchEmpty.classList.toggle('hidden',items.length>0);
  requestAnimationFrame(refreshDashboardHScroll);
}

function renderUsers(){
  if(!els.usersBody)return;
  els.usersBody.innerHTML=(state.users||[]).map(u=>`<tr>
    <td><strong>${escapeHtml(u.username)}</strong></td>
    <td>${escapeHtml(u.displayName)}</td>
    <td>${escapeHtml(u.role)}</td>
    <td>${u.active?'Active':'Disabled'}</td>
    <td>${escapeHtml(u.lastLogin||'—')}</td>
    <td class="row-actions">
      <button class="small-button" data-reset-user="${escapeHtml(u.username)}">Reset password</button>
      <button class="small-button" data-toggle-user="${escapeHtml(u.username)}" data-active="${u.active?'false':'true'}">${u.active?'Disable':'Enable'}</button>
    </td>
  </tr>`).join('');
}

function detailDate(value){
  if(!value)return '—';
  const raw=String(value);
  const d=/^\d{4}-\d{2}-\d{2}$/.test(raw)?new Date(raw+'T00:00:00'):new Date(raw);
  return Number.isNaN(d.getTime())
    ? escapeHtml(raw)
    : new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric'}).format(d);
}

function drawerMetric(label,value,valueClass=''){
  return `<div class="drawer-metric"><span>${escapeHtml(label)}</span><strong class="${valueClass}">${value}</strong></div>`;
}
function openHoldingDrawer(item){
  if(!item)return;
  state.drawerHoldingId=item.id;
  state.drawerWatchId='';
  state.drawerMode='HOLDING';
  if(els.drawerEyebrow)els.drawerEyebrow.textContent='INVESTMENT DETAILS';
  els.drawerEditBtn.textContent='Edit investment';
  const p=item.performance||{};
  const avg=Number(item.units)>0?Number(item.investedAmount)/Number(item.units):null;
  const isMf=item.type==='MF';
  const priceLabel=isMf?'Current NAV':'Current price';
  const avgLabel=isMf?'Average cost / unit':'Avg buy price';
  const badge=isMf?'MF':item.type==='ETF'?'ETF':item.type==='STOCK'?'ST':'₹';
  els.drawerAssetBadge.textContent=badge;
  els.drawerTitle.textContent=item.assetName||'Investment';
  els.drawerSubtitle.textContent=[shortOwner(item.owner),item.type,item.exchange?`${item.exchange}:${item.code}`:item.code].filter(Boolean).join(' · ');
  const perf=[['1D',p.d1],['1W',p.w1],['1M',p.m1],['6M',p.m6],['1Y',p.y1],['3Y',p.y3],['5Y',p.y5],['10Y',p.y10]];
  els.drawerContent.innerHTML=`
    <section class="drawer-value-card">
      <span class="drawer-value-label">Current value</span>
      <strong class="drawer-current-value">${formatCurrency(item.currentValue??item.investedAmount,true)}</strong>
      <div class="drawer-gain-line">
        <span>${item.gainLoss==null?'Gain/loss pending':`${formatCurrency(item.gainLoss,true)} gain / loss`}</span>
        <span class="drawer-gain-chip ${pnlClass(item.returnPct)}">${formatPercent(item.returnPct)}</span>
      </div>
    </section>
    <section class="drawer-section">
      <h3 class="drawer-section-title">Holding summary</h3>
      <div class="drawer-metric-grid">
        ${drawerMetric('Invested / cost value',formatCurrency(item.investedAmount,true))}
        ${drawerMetric('Units / quantity',formatNumber(item.units,6))}
        ${drawerMetric(avgLabel,formatCurrency(avg))}
        ${drawerMetric(priceLabel,formatCurrency(item.currentPrice))}
        ${drawerMetric('Gain / loss',formatCurrency(item.gainLoss,true),pnlClass(item.gainLoss))}
        ${drawerMetric('Total return',formatPercent(item.returnPct),pnlClass(item.returnPct))}
        ${isMf?drawerMetric('XIRR',formatPercent(item.xirr),pnlClass(item.xirr)):''}
        ${drawerMetric('Price source',escapeHtml(item.priceSource||'Pending'))}
      </div>
    </section>
    <section class="drawer-section">
      <h3 class="drawer-section-title">Performance</h3>
      <div class="drawer-performance">${perf.map(([label,value])=>`<div class="drawer-perf-item"><span>${label}</span><strong class="${pnlClass(value)}">${formatPercent(value)}</strong></div>`).join('')}</div>
    </section>
    <section class="drawer-section">
      <h3 class="drawer-section-title">Investment information</h3>
      <div class="drawer-info-list">
        <div class="drawer-info-row"><span>Investor</span><strong>${escapeHtml(shortOwner(item.owner))}</strong></div>
        <div class="drawer-info-row"><span>Asset type</span><strong>${escapeHtml(item.type||'—')}</strong></div>
        <div class="drawer-info-row"><span>${isMf?'AMFI code':'Symbol'}</span><strong>${escapeHtml(item.code||'—')}</strong></div>
        ${item.sourceCode?`<div class="drawer-info-row"><span>Statement code</span><strong>${escapeHtml(item.sourceCode)}</strong></div>`:''}
        ${item.exchange?`<div class="drawer-info-row"><span>Exchange</span><strong>${escapeHtml(item.exchange)}</strong></div>`:''}
        <div class="drawer-info-row"><span>Price date</span><strong>${detailDate(item.priceDate)}</strong></div>
        ${item.buyDate?`<div class="drawer-info-row"><span>Purchase date</span><strong>${detailDate(item.buyDate)}</strong></div>`:''}
      </div>
    </section>
    <section class="drawer-section"><h3 class="drawer-section-title">Personal Note</h3><div class="drawer-notes ${item.notes?'':'drawer-notes-empty'}">${item.notes?escapeHtml(item.notes):'No personal note added yet. Use Edit investment to add one.'}</div></section>
  `;
  els.holdingDrawer.classList.add('open');
  els.holdingDrawerBackdrop.classList.add('open');
  els.holdingDrawer.setAttribute('aria-hidden','false');
  els.holdingDrawerBackdrop.setAttribute('aria-hidden','false');
  document.body.classList.add('drawer-open');
  setTimeout(()=>els.drawerCloseBtn?.focus(),50);
}
function watchTargetStatus(item){
  const d=item.distancePct;
  if(d===null||d===undefined||!Number.isFinite(Number(d)))return {text:'Target status pending',cls:'neutral'};
  const n=Number(d);
  if(n<=0)return {text:'At / below target price',cls:'positive'};
  if(n<=5)return {text:`${formatPercent(n)} above target · near target`,cls:'neutral'};
  return {text:`${formatPercent(n)} above target`,cls:'neutral'};
}
function openWatchDrawer(item){
  if(!item)return;
  state.drawerWatchId=item.id;state.drawerHoldingId='';state.drawerMode='WATCH';
  const isMf=item.type==='MF',currentLabel=isMf?'Current NAV':'Current price',targetLabel=isMf?'Target NAV':'Target buy price';
  const badge=isMf?'MF':item.type==='ETF'?'ETF':item.type==='STOCK'?'ST':'☆',status=watchTargetStatus(item),s=item.sourceDetails||{};
  if(els.drawerEyebrow)els.drawerEyebrow.textContent='WATCHLIST DETAILS · MASTER SHEET';
  els.drawerEditBtn.textContent='Edit watch item';els.drawerAssetBadge.textContent=badge;els.drawerTitle.textContent=item.assetName||'Watchlist item';
  els.drawerSubtitle.textContent=[item.type,item.exchange?`${item.exchange}:${item.code}`:item.code,`${item.priority||'MEDIUM'} priority`].filter(Boolean).join(' · ');
  els.drawerContent.innerHTML=`<section class="drawer-value-card watch-drawer-value"><span class="drawer-value-label">${currentLabel}</span><strong class="drawer-current-value">${formatCurrency(item.currentPrice)}</strong><div class="drawer-gain-line"><span>${targetLabel}: ${formatCurrency(item.targetPrice)}</span><span class="drawer-gain-chip ${status.cls}">${escapeHtml(status.text)}</span></div></section>
  <section class="drawer-section"><h3 class="drawer-section-title">Live watch summary</h3><div class="drawer-metric-grid">${drawerMetric(currentLabel,formatCurrency(item.currentPrice))}${drawerMetric(targetLabel,formatCurrency(item.targetPrice))}${drawerMetric('Distance from target',formatPercent(item.distancePct),Number(item.distancePct)<=0?'positive':'neutral')}${drawerMetric('Priority',escapeHtml(item.priority||'MEDIUM'))}${drawerMetric('Price source',escapeHtml(item.priceSource||'Pending'))}${drawerMetric('Price date',detailDate(item.priceDate))}</div></section>
  <section class="drawer-section master-sheet-detail-section"><div class="drawer-section-head"><h3 class="drawer-section-title">Uploaded master-sheet details</h3><span class="tiny muted">${escapeHtml(s.sourceSheet||'Workbook')}</span></div><div class="drawer-metric-grid">${drawerMetric('Sheet price / NAV',formatCurrency(s.snapshotPrice))}${drawerMetric('Sheet day change',formatCurrency(s.snapshotChange),pnlClass(s.snapshotChange))}${drawerMetric('Sheet day %',formatPercent(s.snapshotChangePct),pnlClass(s.snapshotChangePct))}${drawerMetric('Day high',formatCurrency(s.dayHigh))}${drawerMetric('Day low',formatCurrency(s.dayLow))}${drawerMetric('Volume',s.volume==null?'—':formatNumber(s.volume,0))}${drawerMetric('52W high',formatCurrency(s.high52))}${drawerMetric('52W low',formatCurrency(s.low52))}${drawerMetric('P/E or P/B',escapeHtml(s.valuation||'—'))}${drawerMetric('Market cap / assets / debt',escapeHtml(s.marketCap||'—'))}</div>
  <div class="drawer-performance source-performance-grid">${[['1M',s.perf1M],['1Y',s.perf1Y],['3Y',s.perf3Y],['5Y',s.perf5Y],['10Y',s.perf10Y]].map(([label,value])=>`<div class="drawer-perf-item"><span>${label}</span><strong class="${pnlClass(value)}">${formatPercent(value)}</strong></div>`).join('')}</div>
  <div class="drawer-info-list source-info-list"><div class="drawer-info-row"><span>Company / scheme</span><strong>${escapeHtml(s.companyName||item.assetName||'—')}</strong></div><div class="drawer-info-row"><span>Sales growth</span><strong>${escapeHtml(s.salesGrowth||'—')}</strong></div><div class="drawer-info-row"><span>Profit growth</span><strong>${escapeHtml(s.profitGrowth||'—')}</strong></div><div class="drawer-info-row"><span>Remark / moat / management</span><strong>${escapeHtml(s.moatRemark||'—')}</strong></div><div class="drawer-info-row"><span>Final remark</span><strong>${escapeHtml(s.finalRemark||'—')}</strong></div></div></section>
  <section class="drawer-section"><h3 class="drawer-section-title">Watchlist information</h3><div class="drawer-info-list"><div class="drawer-info-row"><span>Asset type</span><strong>${escapeHtml(item.type||'—')}</strong></div><div class="drawer-info-row"><span>${isMf?'AMFI code':'Symbol / code'}</span><strong>${escapeHtml(item.code||'—')}</strong></div>${item.exchange?`<div class="drawer-info-row"><span>Exchange</span><strong>${escapeHtml(item.exchange)}</strong></div>`:''}<div class="drawer-info-row"><span>Priority</span><strong><span class="priority ${String(item.priority||'MEDIUM').toLowerCase()}">${escapeHtml(item.priority||'MEDIUM')}</span></strong></div><div class="drawer-info-row"><span>Target status</span><strong class="${status.cls}">${escapeHtml(status.text)}</strong></div></div></section>
  <section class="drawer-section watch-note-editor-section"><div class="drawer-section-head"><h3 class="drawer-section-title">Personal Note</h3><span class="tiny muted">Your editable note</span></div><textarea id="drawerWatchNote" class="drawer-note-textarea" rows="6" maxlength="500" placeholder="Add your personal note for this watchlist item…">${escapeHtml(item.notes||'')}</textarea><div class="drawer-note-actions"><span id="drawerWatchNoteStatus" class="tiny muted">${item.notes?'Existing note shown above.':'No note yet.'}</span><button id="drawerSaveWatchNoteBtn" class="primary-button compact-button" type="button">Save Note</button></div></section>`;
  els.holdingDrawer.classList.add('open');els.holdingDrawerBackdrop.classList.add('open');els.holdingDrawer.setAttribute('aria-hidden','false');els.holdingDrawerBackdrop.setAttribute('aria-hidden','false');document.body.classList.add('drawer-open');
  const noteBtn=$('drawerSaveWatchNoteBtn');if(noteBtn)noteBtn.addEventListener('click',saveWatchDrawerNote);setTimeout(()=>els.drawerCloseBtn?.focus(),50);
}
async function saveWatchDrawerNote(){
  const item=state.watchlist.find(x=>x.id===state.drawerWatchId);
  const textarea=$('drawerWatchNote');
  const button=$('drawerSaveWatchNoteBtn');
  const status=$('drawerWatchNoteStatus');
  if(!item||!textarea||!button)return;
  const note=textarea.value.trim();
  setBusy(button,true,'Saving…');
  if(status)status.textContent='Saving note…';
  try{
    const result=await api('saveWatchItem',{item:{
      id:item.id,
      type:item.type,
      assetName:item.assetName,
      code:item.code,
      exchange:['MF','OTHER'].includes(item.type)?'':(item.exchange||'NSE'),
      targetPrice:item.targetPrice===null||item.targetPrice===undefined?null:Number(item.targetPrice),
      manualPrice:item.manualPrice===null||item.manualPrice===undefined?null:Number(item.manualPrice),
      priority:item.priority||'MEDIUM',
      notes:note
    }});
    applyBootstrap(result.data);
    saveCache(result.data);
    const fresh=state.watchlist.find(x=>x.id===item.id);
    if(status)status.textContent=note?'Note saved.':'Note cleared.';
    toast('Watchlist note saved.','success');
    if(fresh){
      state.drawerWatchId=fresh.id;
      setTimeout(()=>{
        const t=$('drawerWatchNote');
        if(t)t.value=fresh.notes||'';
      },0);
    }
  }catch(e){
    if(status)status.textContent='Could not save note.';
    toast(e.message,'error');
  }finally{
    setBusy(button,false);
  }
}
function closeHoldingDrawer(){
  els.holdingDrawer?.classList.remove('open');
  els.holdingDrawerBackdrop?.classList.remove('open');
  els.holdingDrawer?.setAttribute('aria-hidden','true');
  els.holdingDrawerBackdrop?.setAttribute('aria-hidden','true');
  document.body.classList.remove('drawer-open');
  state.drawerHoldingId='';
  state.drawerWatchId='';
  state.drawerMode='';
}
function editDrawerHolding(){
  const mode=state.drawerMode;
  const holding=mode==='HOLDING'?state.holdings.find(x=>x.id===state.drawerHoldingId):null;
  const watch=mode==='WATCH'?state.watchlist.find(x=>x.id===state.drawerWatchId):null;
  closeHoldingDrawer();
  if(holding)openInvestment(holding);
  else if(watch)openWatch(watch);
}


function notesHoldingItems(){
  return els.notesScope?.value==='CURRENT' ? visibleHoldings() : state.holdings;
}
function notesWatchItems(){
  return state.watchlist;
}
function noteRecordHolding(h){
  return {
    source:'HOLDINGS', id:h.id, owner:h.owner||'', type:h.type||'', assetName:h.assetName||'',
    code:h.code||'', exchange:h.exchange||'', notes:h.notes||'', currentValue:Number(h.currentValue)||0,
    currentPrice:Number(h.currentPrice)||0, targetPrice:null, priority:''
  };
}
function noteRecordWatch(w){
  return {
    source:'WATCHLIST', id:w.id, owner:'', type:w.type||'', assetName:w.assetName||'',
    code:w.code||'', exchange:w.exchange||'', notes:w.notes||'', currentValue:null,
    currentPrice:Number(w.currentPrice)||0, targetPrice:Number(w.targetPrice)||0, priority:w.priority||''
  };
}
function notesBaseItems(){
  const source=els.notesSource?.value||'BOTH';
  const items=[];
  if(source==='BOTH'||source==='HOLDINGS')items.push(...notesHoldingItems().map(noteRecordHolding));
  if(source==='BOTH'||source==='WATCHLIST')items.push(...notesWatchItems().map(noteRecordWatch));
  return items;
}
function renderNotesModal(){
  if(!els.notesList)return;
  const q=String(els.notesSearch?.value||'').trim().toLowerCase();
  const filter=els.notesFilter?.value||'ALL';
  let items=notesBaseItems().filter(x=>{
    const has=Boolean(String(x.notes||'').trim());
    if(filter==='WITH_NOTES'&&!has)return false;
    if(filter==='WITHOUT_NOTES'&&has)return false;
    const hay=`${x.source} ${x.owner} ${x.type} ${x.assetName} ${x.code} ${x.priority} ${x.notes||''}`.toLowerCase();
    return !q||hay.includes(q);
  });
  items=[...items].sort((a,b)=>{
    const an=Boolean(String(a.notes||'').trim()),bn=Boolean(String(b.notes||'').trim());
    if(an!==bn)return an?-1:1;
    if(a.source!==b.source)return a.source.localeCompare(b.source);
    return String(a.assetName||'').localeCompare(String(b.assetName||''));
  });

  const withNotes=items.filter(x=>String(x.notes||'').trim()).length;
  const holdingCount=items.filter(x=>x.source==='HOLDINGS').length;
  const watchCount=items.filter(x=>x.source==='WATCHLIST').length;
  if(els.notesSummary){
    let scope='Entire portfolio';
    if(els.notesScope?.value==='CURRENT'){
      scope=`${state.selectedOwner==='ALL'?'Combined':shortOwner(state.selectedOwner)} · ${assetViewLabel()}`;
    }
    els.notesSummary.textContent=`${scope} · ${items.length} item${items.length===1?'':'s'} · ${holdingCount} investments · ${watchCount} watchlist · ${withNotes} with notes`;
  }

  els.notesList.innerHTML=items.map(x=>{
    const note=String(x.notes||'').trim();
    const isWatch=x.source==='WATCHLIST';
    const sourceLabel=isWatch?'Watchlist':'Investment';
    const meta=isWatch
      ? `${escapeHtml(x.type)} · ${escapeHtml(x.exchange?`${x.exchange}:`:'')}${escapeHtml(x.code)} · ${escapeHtml(x.priority||'')} priority`
      : `${escapeHtml(shortOwner(x.owner))} · ${escapeHtml(x.type)} · ${escapeHtml(x.exchange?`${x.exchange}:`:'')}${escapeHtml(x.code)}`;
    const valueLabel=isWatch
      ? `Target ${formatCurrency(x.targetPrice)}`
      : formatCurrency(x.currentValue,true);
    const actionAttr=isWatch?`data-watch-note-edit="${escapeHtml(x.id)}"`:`data-note-edit="${escapeHtml(x.id)}"`;
    const viewButton=isWatch
      ? `<button type="button" class="small-button" data-watch-note-view="${escapeHtml(x.id)}">View watch item</button>`
      : `<button type="button" class="small-button" data-note-view="${escapeHtml(x.id)}">View investment</button>`;
    return `<article class="investment-note-card ${note?'has-note':'no-note'} ${isWatch?'watch-note-card':''}">
      <div class="note-card-top">
        <div class="asset-cell">
          <div class="asset-badge ${String(x.type).toLowerCase()}">${escapeHtml(x.type==='MF'?'MF':x.type==='ETF'?'ET':x.type==='STOCK'?'ST':'OT')}</div>
          <div><strong>${escapeHtml(x.assetName)}</strong><span><b class="note-source-badge ${isWatch?'watch':'holding'}">${sourceLabel}</b> · ${meta}</span></div>
        </div>
        <strong class="note-card-value">${valueLabel}</strong>
      </div>
      <div class="note-card-body ${note?'':'empty'}">${note?escapeHtml(note):'No personal note added yet.'}</div>
      <div class="note-card-actions">
        ${viewButton}
        <button type="button" class="small-button" ${actionAttr}>${note?'Edit note':'Add note'}</button>
      </div>
    </article>`;
  }).join('');
  els.notesEmpty.classList.toggle('hidden',items.length>0);
}
function openAllNotes(source='HOLDINGS'){
  if(els.notesSearch)els.notesSearch.value='';
  if(els.notesSource)els.notesSource.value=source;
  if(els.notesScope)els.notesScope.value='ALL';
  if(els.notesFilter)els.notesFilter.value='ALL';
  if(els.notesModalTitle){
    els.notesModalTitle.textContent=source==='WATCHLIST'?'All watchlist notes':source==='HOLDINGS'?'All investment notes':'All personal notes';
  }
  renderNotesModal();
  openModal('notesModal');
}

/* V15.4 FREEZE FIX — restored core dashboard/import/modal functions. */
function openModal(id){els.modalBackdrop.classList.remove('hidden');els.modalBackdrop.setAttribute('aria-hidden','false');$$('.modal').forEach(m=>m.classList.add('hidden'));$(id).classList.remove('hidden');}
function closeModals(){els.modalBackdrop.classList.add('hidden');els.modalBackdrop.setAttribute('aria-hidden','true');$$('.modal').forEach(m=>m.classList.add('hidden'));}
function updateAssetForm(type,prefix){const isMf=type==='MF',isOther=type==='OTHER';const codeLabel=$(prefix==='holding'?'holdingCodeLabel':'watchCodeLabel'),exchangeLabel=$(prefix==='holding'?'exchangeLabel':'watchExchangeLabel'),help=$(prefix==='holding'?'mfHelp':'watchMfHelp');if(codeLabel)codeLabel.textContent=isMf?'AMFI scheme code':isOther?'Code / label':'Ticker symbol';exchangeLabel?.classList.toggle('hidden',isMf||isOther);help?.classList.toggle('hidden',!isMf);}
function openInvestment(item=null){refreshOwnerControls();els.investmentForm.reset();els.holdingId.value=item?.id||'';$('investmentModalTitle').textContent=item?'Edit investment':'Add investment';if(item){els.holdingOwner.value=canonicalOwner(item.owner);els.holdingType.value=item.type;els.holdingName.value=item.assetName;els.holdingCode.value=item.code;els.holdingExchange.value=item.exchange||'NSE';els.holdingUnits.value=item.units;els.holdingInvested.value=item.investedAmount;els.holdingManualPrice.value=item.manualPrice??'';els.holdingBuyDate.value=item.buyDate||'';els.holdingNotes.value=item.notes||'';}else{els.holdingOwner.value=state.selectedOwner!=='ALL'?state.selectedOwner:(configuredOwners()[0]||'Sarada');els.holdingType.value='STOCK';}updateAssetForm(els.holdingType.value,'holding');openModal('investmentModal');}
function openWatch(item=null){els.watchForm.reset();els.watchId.value=item?.id||'';if(item){els.watchType.value=item.type;els.watchName.value=item.assetName;els.watchCode.value=item.code;els.watchExchange.value=item.exchange||'NSE';els.watchTarget.value=item.targetPrice??'';els.watchManualPrice.value=item.manualPrice??'';els.watchPriority.value=item.priority||'MEDIUM';els.watchNotes.value=item.notes||'';}updateAssetForm(els.watchType.value,'watch');openModal('watchModal');}

async function saveInvestment(event){event.preventDefault();const button=$('saveInvestmentBtn');setBusy(button,true,'Saving…');try{const result=await api('saveHolding',{holding:{id:els.holdingId.value,owner:els.holdingOwner.value,type:els.holdingType.value,assetName:els.holdingName.value.trim(),code:els.holdingCode.value.trim().toUpperCase(),exchange:['MF','OTHER'].includes(els.holdingType.value)?'':els.holdingExchange.value,units:Number(els.holdingUnits.value),investedAmount:Number(els.holdingInvested.value),manualPrice:els.holdingManualPrice.value===''?null:Number(els.holdingManualPrice.value),buyDate:els.holdingBuyDate.value,notes:els.holdingNotes.value.trim()}});closeModals();applyBootstrap(result.data);saveCache(result.data);toast('Investment saved.','success');}catch(e){toast(e.message,'error');}finally{setBusy(button,false);}}
async function saveWatch(event){event.preventDefault();const button=$('saveWatchBtn');setBusy(button,true,'Saving…');try{const result=await api('saveWatchItem',{item:{id:els.watchId.value,type:els.watchType.value,assetName:els.watchName.value.trim(),code:els.watchCode.value.trim().toUpperCase(),exchange:['MF','OTHER'].includes(els.watchType.value)?'':els.watchExchange.value,targetPrice:els.watchTarget.value===''?null:Number(els.watchTarget.value),manualPrice:els.watchManualPrice.value===''?null:Number(els.watchManualPrice.value),priority:els.watchPriority.value,notes:els.watchNotes.value.trim()}});closeModals();applyBootstrap(result.data);saveCache(result.data);toast('Watchlist item saved.','success');}catch(e){toast(e.message,'error');}finally{setBusy(button,false);}}
async function deleteItem(action,id,label){if(!confirm(`Delete this ${label}?`))return;try{const result=await api(action,{id});applyBootstrap(result.data);saveCache(result.data);toast(`${label} deleted.`,'success');}catch(e){toast(e.message,'error');}}

function csvCell(value){return `"${String(value??'').replace(/"/g,'""')}"`;}
function parseCsv(text){
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'){if(quoted&&n==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(field);if(row.some(v=>String(v).trim()!==''))rows.push(row);row=[];field='';}else field+=c;}
  row.push(field);if(row.some(v=>String(v).trim()!==''))rows.push(row);return rows;
}

async function loadSheetJs(){
  if(window.XLSX)return window.XLSX;
  await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';script.onload=resolve;script.onerror=()=>reject(new Error('Could not load the Excel reader. Save the file as CSV and try again.'));document.head.appendChild(script);});
  if(!window.XLSX)throw new Error('Excel reader did not load. Save the file as CSV and try again.');
  return window.XLSX;
}
async function fileToRows(file){
  const name=String(file?.name||'').toLowerCase();
  if(name.endsWith('.xlsx')||name.endsWith('.xls')){
    const XLSX=await loadSheetJs();const workbook=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:false});const sheet=workbook.Sheets[workbook.SheetNames[0]];return XLSX.utils.sheet_to_json(sheet,{header:1,defval:'',raw:false});
  }
  return parseCsv(await file.text());
}
function trimToDetectedHeader(rows,mode){
  const max=Math.min(rows.length,30);
  for(let i=0;i<max;i++){
    const h=(rows[i]||[]).map(normalizeHeader);
    if(mode==='MF_STATEMENT'){
      if(h.includes('investorname')&&h.includes('productcode')&&h.includes('schemename')&&h.includes('tradedate'))return rows.slice(i);
    }else if(mode==='MF_SNAPSHOT'){
      const hasName=['schemename','assetname','name'].some(x=>h.includes(x));
      const hasIsin=h.includes('isin');
      const hasUnits=['unitsheld','units','quantity','qty'].some(x=>h.includes(x));
      if(hasName&&hasIsin&&hasUnits)return rows.slice(i);
    }else{
      const hasSymbol=['stocksymbol','symbol','tradingsymbol','instrument','scrip'].some(x=>h.includes(x));
      const hasQty=['quantity','qty'].some(x=>h.includes(x));
      if(hasSymbol&&hasQty)return rows.slice(i);
    }
  }
  return rows;
}

function normalizeHeader(v){return String(v||'').replace(/^\ufeff/,'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function parseNum(v){const s=String(v??'').replace(/[₹,%\s]/g,'').replace(/,/g,'').trim();if(!s)return null;const n=Number(s);return Number.isFinite(n)?n:NaN;}
function normalizeDate(v){
  const raw=String(v||'').trim();if(!raw)return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw))return raw;
  let m=raw.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);if(m)return `${m[3]}-${String(m[2]).padStart(2,'0')}-${String(m[1]).padStart(2,'0')}`;
  m=raw.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);if(m){const months={jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};const mm=months[m[2].toLowerCase()];if(mm)return `${m[3]}-${mm}-${String(m[1]).padStart(2,'0')}`;}
  return null;
}
function detectIndex(headers,aliases){for(const a of aliases){const i=headers.indexOf(normalizeHeader(a));if(i>=0)return i;}return -1;}
function cell(cells,i){return i>=0?String(cells[i]??'').trim():'';}
function isFinancialMfTransaction(type,amount,units){const t=String(type||'').toLowerCase();if(/address|nominee|contact|mandate|registered|registration|updation|correction|cancelled|invalid|kyc|bank/.test(t))return false;return (Number.isFinite(amount)&&Math.abs(amount)>0.000001)||(Number.isFinite(units)&&Math.abs(units)>0.000001);}
function rowsToMfTransactions(rows){
  if(rows.length<2)throw new Error('The CSV has no transaction rows.');const h=rows[0].map(normalizeHeader);
  const idx={amc:detectIndex(h,['MF_NAME','AMC','Fund House']),owner:detectIndex(h,['INVESTOR_NAME','Investor Name','Owner']),product:detectIndex(h,['PRODUCT_CODE','Product Code']),scheme:detectIndex(h,['SCHEME_NAME','Scheme Name']),date:detectIndex(h,['TRADE_DATE','Trade Date','Date']),tx:detectIndex(h,['TRANSACTION_TYPE','Transaction Type']),amount:detectIndex(h,['AMOUNT','Amount']),units:detectIndex(h,['UNITS','Units']),price:detectIndex(h,['PRICE','NAV','Price']),broker:detectIndex(h,['BROKER','Broker'])};
  const required=['owner','product','scheme','date','tx'];const missing=required.filter(k=>idx[k]<0);if(missing.length)throw new Error(`MF statement columns not recognised: ${missing.join(', ')}.`);
  const out=[],errors=[];rows.slice(1).forEach((r,n)=>{const owner=canonicalOwner(cell(r,idx.owner)),productCode=cell(r,idx.product).toUpperCase(),schemeName=cell(r,idx.scheme),tradeDate=normalizeDate(cell(r,idx.date)),transactionType=cell(r,idx.tx),amount=parseNum(cell(r,idx.amount)),units=parseNum(cell(r,idx.units)),price=parseNum(cell(r,idx.price));if(!isFinancialMfTransaction(transactionType,amount,units))return;if(!owner||!productCode||!schemeName||!tradeDate||!transactionType){errors.push(`Row ${n+2}: missing investor/product/scheme/date/type.`);return;}if([amount,units,price].some(v=>Number.isNaN(v))){errors.push(`Row ${n+2}: invalid amount/units/price.`);return;}out.push({owner,amc:cell(r,idx.amc),productCode,schemeName,tradeDate,transactionType,amount:amount??0,units,price,broker:cell(r,idx.broker)});});
  if(errors.length)throw new Error(errors.slice(0,6).join(' ')+(errors.length>6?` Plus ${errors.length-6} more.`:''));if(!out.length)throw new Error('No purchase/SIP/redemption rows were found.');if(out.length>5000)throw new Error('More than 5,000 MF transactions detected. Split the file.');return out;
}
function classifyAsset(symbol,explicit=''){const e=String(explicit||'').toUpperCase().replace(/[^A-Z]/g,'');if(e.includes('ETF'))return'ETF';if(e.includes('STOCK')||e.includes('EQUITY'))return'STOCK';const s=String(symbol||'').toUpperCase();return /(BEES$|ETF$|MAFANG|MON100|HNGSNGBEES|ITBEES|CPSEETF|MOM100)/.test(s)?'ETF':'STOCK';}
function rowsToMfSnapshotHoldings(rows){
  if(rows.length<2)throw new Error('The file has no mutual-fund holding rows.');
  const h=rows[0].map(normalizeHeader);
  const idx={
    owner:detectIndex(h,['Investor Name','INVESTOR_NAME','Owner']),
    name:detectIndex(h,['Scheme Name','SCHEME_NAME','Asset Name','Name']),
    isin:detectIndex(h,['ISIN']),
    units:detectIndex(h,['Units Held','Units','Quantity','Qty']),
    avg:detectIndex(h,['Avg NAV','Average NAV','Average Price']),
    invested:detectIndex(h,['Invested Amount','Investment Amount','Invested Value','Cost Value']),
    currentNav:detectIndex(h,['Current NAV','NAV','Current Price']),
    notes:detectIndex(h,['Personal Note','Notes','Note'])
  };
  if(idx.name<0||idx.isin<0||idx.units<0||(idx.invested<0&&idx.avg<0)){
    throw new Error('MF holdings file needs Scheme Name, ISIN, Units Held and Invested Amount or Avg NAV.');
  }
  const selected=canonicalOwner(els.importOwner.value||configuredOwners()[0]||'Niharika');
  const out=[],errors=[];
  rows.slice(1).forEach((r,n)=>{
    const schemeName=cell(r,idx.name);
    const isin=cell(r,idx.isin).toUpperCase().replace(/\s+/g,'');
    if(!schemeName&&!isin)return;
    const units=parseNum(cell(r,idx.units));
    const avg=parseNum(cell(r,idx.avg));
    const investedRaw=parseNum(cell(r,idx.invested));
    const invested=Number.isFinite(investedRaw)?investedRaw:(Number.isFinite(units)&&Number.isFinite(avg)?units*avg:null);
    const currentNav=parseNum(cell(r,idx.currentNav));
    const owner=idx.owner>=0&&cell(r,idx.owner)?canonicalOwner(cell(r,idx.owner)):selected;
    if(!schemeName||!/^[A-Z0-9]{12}$/.test(isin)||!Number.isFinite(units)||units<=0||!Number.isFinite(invested)||invested<0){
      errors.push(`Row ${n+2}: check Scheme Name, 12-character ISIN, Units Held and Invested Amount.`);
      return;
    }
    out.push({
      owner,
      schemeName,
      isin,
      units,
      investedAmount:invested,
      avgNav:Number.isFinite(avg)?avg:null,
      currentNav:Number.isFinite(currentNav)?currentNav:null,
      notes:idx.notes>=0?cell(r,idx.notes):''
    });
  });
  if(errors.length)throw new Error(errors.slice(0,6).join(' '));
  if(!out.length)throw new Error('No MF current holdings found.');
  return out;
}

function rowsToStockHoldings(rows){
  if(rows.length<2)throw new Error('The CSV has no stock rows.');const h=rows[0].map(normalizeHeader);
  const idx={owner:detectIndex(h,['INVESTOR_NAME','Investor Name','Owner']),type:detectIndex(h,['Asset Type','Type','Instrument Type']),symbol:detectIndex(h,['Stock Symbol','Symbol','Tradingsymbol','Trading Symbol','Instrument','Scrip']),exchange:detectIndex(h,['Exchange']),qty:detectIndex(h,['Quantity','Qty','Qty.','QTY']),avg:detectIndex(h,['Avg Buy Price','Average Buy Price','Avg. cost','Avg Cost','Average price','Buy Average']),invested:detectIndex(h,['Invested Amount','Invested Value','Cost Value','Investment Value']),name:detectIndex(h,['Company Name','Asset Name','Name'])};
  if(idx.symbol<0||idx.qty<0||(idx.avg<0&&idx.invested<0))throw new Error('Stock file needs Symbol/Instrument, Quantity and Avg Buy Price or Invested Amount.');
  const out=[],errors=[];const selected=canonicalOwner(els.importOwner.value||configuredOwners()[0]||'Niharika');rows.slice(1).forEach((r,n)=>{const symbol=cell(r,idx.symbol).toUpperCase().replace(/\s+/g,'');if(!symbol)return;const qty=parseNum(cell(r,idx.qty)),avg=parseNum(cell(r,idx.avg)),invRaw=parseNum(cell(r,idx.invested));const invested=Number.isFinite(invRaw)?invRaw:(Number.isFinite(qty)&&Number.isFinite(avg)?qty*avg:null);if(!Number.isFinite(qty)||qty<=0||!Number.isFinite(invested)||invested<0){errors.push(`Row ${n+2}: invalid quantity/invested amount.`);return;}const owner=idx.owner>=0&&cell(r,idx.owner)?canonicalOwner(cell(r,idx.owner)):selected;const exchange=(cell(r,idx.exchange)||'NSE').toUpperCase()==='BSE'?'BOM':(cell(r,idx.exchange)||'NSE').toUpperCase();const type=classifyAsset(symbol,cell(r,idx.type));out.push({owner,type,assetName:cell(r,idx.name)||symbol,code:symbol,exchange,units:qty,investedAmount:invested,manualPrice:null,buyDate:'',notes:'Imported stock holding'});});if(errors.length)throw new Error(errors.slice(0,6).join(' '));if(!out.length)throw new Error('No stock holdings found.');return out;
}
function setImportMode(mode){
  state.importMode=mode;
  $$('.import-mode').forEach(b=>b.classList.toggle('active',b.dataset.importMode===mode));
  els.mfImportHelp.classList.toggle('hidden',mode!=='MF_STATEMENT');
  els.mfSnapshotImportHelp.classList.toggle('hidden',mode!=='MF_SNAPSHOT');
  els.stockImportHelp.classList.toggle('hidden',mode!=='STOCK_HOLDINGS');
  els.stockOwnerLabel.classList.toggle('hidden',!['MF_SNAPSHOT','STOCK_HOLDINGS'].includes(mode));
  if(mode==='MF_STATEMENT')els.importFileHint.textContent='Up to 5,000 MF transaction rows. PAN and folio are ignored. CSV/XLSX supported.';
  else if(mode==='MF_SNAPSHOT')els.importFileHint.textContent='Current MF holdings snapshot. ISIN is resolved to AMFI scheme code for automatic NAV updates.';
  else els.importFileHint.textContent='Current stock/ETF holdings. Zerodha XLSX/CSV supported.';
  els.bulkCsvFile.value='';
  state.pendingImport=[];
  els.bulkImportStatus.textContent='No file selected.';
  els.bulkImportStatus.className='import-status muted';
  els.runBulkImportBtn.disabled=true;
}
function openBulkImport(){refreshOwnerControls();setImportMode('MF_STATEMENT');openModal('bulkImportModal');}
function downloadImportTemplate(){
  let headers,examples,name;
  if(state.importMode==='MF_STATEMENT'){
    headers=['MF_NAME','INVESTOR_NAME','PRODUCT_CODE','SCHEME_NAME','Type','TRADE_DATE','TRANSACTION_TYPE','DIVIDEND_RATE','AMOUNT','UNITS','PRICE','BROKER'];
    examples=[['PPFAS Mutual Fund','Sarada','PP001ZG','Parag Parikh Flexi Cap - Dir Plan Growth','Equity','2026-07-05','Purchase Systematic','','12999.35','140.000','92.8525','Direct']];
    name='mf-statement-import-template.csv';
  }else if(state.importMode==='MF_SNAPSHOT'){
    headers=['Investor Name','Scheme Name','ISIN','Units Held','Avg NAV','Invested Amount','Current NAV','Personal Note'];
    examples=[['Niharika','Parag Parikh Flexi Cap Fund - Direct Plan Growth','INF879O01027','1865.091','42.89','80000','91.75','']];
    name='mf-current-holdings-template.csv';
  }else{
    headers=['Investor Name','Asset Type','Stock Symbol','Exchange','Quantity','Avg Buy Price','Invested Amount'];
    examples=[['Niharika','STOCK','DMART','NSE','20','3923.85','78477'],['Niharika','ETF','GOLDBEES','NSE','1123','91.37','102614']];
    name='stock-holdings-import-template.csv';
  }
  const csv=[headers,...examples].map(r=>r.map(csvCell).join(',')).join('\n');
  const blob=new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function handleBulkFile(){
  state.pendingImport=[];
  els.runBulkImportBtn.disabled=true;
  const file=els.bulkCsvFile.files?.[0];
  if(!file){els.bulkImportStatus.textContent='No file selected.';return;}
  try{
    const rows=trimToDetectedHeader(await fileToRows(file),state.importMode);
    let data;
    if(state.importMode==='MF_STATEMENT')data=rowsToMfTransactions(rows);
    else if(state.importMode==='MF_SNAPSHOT')data=rowsToMfSnapshotHoldings(rows);
    else data=rowsToStockHoldings(rows);
    state.pendingImport=data;
    const owners=[...new Set(data.map(x=>x.owner).filter(Boolean))];
    const label=state.importMode==='MF_STATEMENT'?'financial transaction':state.importMode==='MF_SNAPSHOT'?'MF holding':'stock/ETF holding';
    els.bulkImportStatus.textContent=`${data.length} ${label} row${data.length===1?'':'s'} ready · ${owners.map(shortOwner).join(', ')}`;
    els.bulkImportStatus.className='import-status success';
    els.runBulkImportBtn.disabled=false;
  }catch(e){
    els.bulkImportStatus.textContent=e.message;
    els.bulkImportStatus.className='import-status error';
  }
}
async function runBulkImport(event){
  event.preventDefault();
  if(!state.pendingImport.length)return;
  const b=els.runBulkImportBtn;
  setBusy(b,true,'Importing…');
  try{
    let action,payload;
    if(state.importMode==='MF_STATEMENT'){
      action='bulkImportMfTransactions';payload={transactions:state.pendingImport};
    }else if(state.importMode==='MF_SNAPSHOT'){
      action='bulkImportMfSnapshot';payload={mfHoldings:state.pendingImport};
    }else{
      action='bulkImportHoldings';payload={holdings:state.pendingImport};
    }
    const result=await api(action,payload);
    closeModals();
    state.pendingImport=[];
    applyBootstrap(result.data);
    saveCache(result.data);
    switchSection('holdings');
    if(state.importMode==='MF_STATEMENT')toast(`${result.imported} new MF transactions imported; ${result.skipped||0} duplicates skipped. Click Refresh for 1D–10Y performance.`,'success');
    else if(state.importMode==='MF_SNAPSHOT')toast(`${result.imported} MF holdings imported and mapped to AMFI. NAV will update automatically; XIRR needs transaction history.`,'success');
    else toast(`${result.imported} stock/ETF holdings imported. Click Refresh for performance.`,'success');
  }catch(e){
    toast(e.message,'error');
    els.bulkImportStatus.textContent=e.message;
    els.bulkImportStatus.className='import-status error';
  }finally{
    setBusy(b,false);
  }
}

async function replaceMasterPortfolioData(){
  const msg=['This will REPLACE the current investment and watchlist data for this login.','','It deletes earlier Holdings, Watchlist and MF transaction rows, then loads:','• 35 consolidated holdings','• 17 cleaned watchlist items','','Daily Diary, Monthly Diary, users and passwords are NOT deleted.','A backend backup is attempted first.','','Continue?'].join('\n');
  if(!confirm(msg))return;
  setBusy(els.replaceMasterDataBtn,true,'Replacing…');setSyncStatus('syncing','Loading master spreadsheet data…');
  try{
    const result=await api('replaceMasterPortfolioData',{}, {timeoutMs:180000});
    if(!result.data||result.data.holdings?.length!==35||result.data.watchlist?.length!==17){
      throw new Error(`Master replacement verification failed. Found ${result.data?.holdings?.length??0} holdings and ${result.data?.watchlist?.length??0} watchlist items.`);
    }
    applyBootstrap(result.data);saveCache(result.data);state.selectedOwner='ALL';state.selectedAssetView='ALL';
    if(els.holdingSearch)els.holdingSearch.value='';if(els.holdingTypeFilter)els.holdingTypeFilter.value='ALL';
    refreshOwnerControls();renderAll();switchSection('holdings');setSyncStatus('','Master data loaded');
    if(els.masterLoadBanner)els.masterLoadBanner.classList.add('hidden');
    toast(`Master sheet loaded: ${result.importedHoldings} holdings and ${result.importedWatchlist} watchlist items.`,'success');
  }catch(e){setSyncStatus('error','Master load failed');toast(e.message,'error');}
  finally{setBusy(els.replaceMasterDataBtn,false);}
}

function exportCsv(){const headers=['Investor','Type','Asset','Code','Exchange','Units','Avg Buy','Invested','Current Price','Current Value','Gain Loss','Gain %','XIRR','1D','1W','1M','6M','1Y','3Y','5Y','10Y','Personal Note'];const rows=visibleHoldings().map(h=>{const p=h.performance||{};return[shortOwner(h.owner),h.type,h.assetName,h.code,h.exchange,h.units,Number(h.units)>0?Number(h.investedAmount)/Number(h.units):'',h.investedAmount,h.currentPrice,h.currentValue,h.gainLoss,h.returnPct,h.xirr,p.d1,p.w1,p.m1,p.m6,p.y1,p.y3,p.y5,p.y10,h.notes||''];});const csv=[headers,...rows].map(r=>r.map(csvCell).join(',')).join('\n');const blob=new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`my-finance-${state.selectedOwner==='ALL'?'combined':shortOwner(state.selectedOwner)}-${state.selectedAssetView.toLowerCase()}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

async function changePassword(event){event.preventDefault();if(els.newPassword.value!==els.confirmPassword.value){toast('New passwords do not match.','error');return;}const b=event.submitter;setBusy(b,true,'Updating…');try{await api('changePassword',{currentPassword:els.currentPassword.value,newPassword:els.newPassword.value});closeModals();els.passwordForm.reset();toast('Password changed.','success');}catch(e){toast(e.message,'error');}finally{setBusy(b,false);}}

function dateShiftIso(value,days){
  const base=/^\d{4}-\d{2}-\d{2}$/.test(String(value||''))?new Date(`${value}T12:00:00`):new Date();
  base.setDate(base.getDate()+days);
  return localIsoDate(base);
}
function monthShiftIso(value,months){
  const valid=/^\d{4}-\d{2}$/.test(String(value||''))?String(value):localIsoMonth();
  const [y,m]=valid.split('-').map(Number);
  const d=new Date(y,m-1+months,1,12,0,0);
  return localIsoMonth(d);
}
function autosizeDiaryTextarea(el){
  if(!el)return;
  el.style.height='auto';
  el.style.height=`${Math.min(Math.max(el.scrollHeight,150),520)}px`;
}
function diaryDraftKey(){return `myfinance_daily_draft_${state.username||'guest'}_${els.diaryDate?.value||localIsoDate()}`;}
function monthlyDraftKey(){return `myfinance_monthly_draft_${state.username||'guest'}_${els.monthlyEntryMonth?.value||localIsoMonth()}_${els.monthlyEntryType?.value||'DIARY'}`;}
function updateDiaryWritingMeta(){
  if(els.diaryCharCount)els.diaryCharCount.textContent=`${els.diaryText?.value.length||0} / 5000`;
  if(els.monthlyCharCount)els.monthlyCharCount.textContent=`${els.monthlyText?.value.length||0} / 5000`;
  autosizeDiaryTextarea(els.diaryText);autosizeDiaryTextarea(els.monthlyText);
}
function saveDailyDraft(){
  if(!els.diaryText)return;
  const payload={title:els.diaryTitle.value||'',text:els.diaryText.value||'',savedAt:Date.now()};
  if(payload.title||payload.text)localStorage.setItem(diaryDraftKey(),JSON.stringify(payload));else localStorage.removeItem(diaryDraftKey());
  if(els.diaryDraftStatus)els.diaryDraftStatus.textContent=payload.title||payload.text?'Draft saved locally':'Draft ready';
}
function restoreDailyDraft(){
  if(els.diaryId?.value)return;
  const raw=localStorage.getItem(diaryDraftKey());
  if(!raw){if(els.diaryDraftStatus)els.diaryDraftStatus.textContent='Draft ready';updateDiaryWritingMeta();return;}
  try{const d=JSON.parse(raw);if(!els.diaryTitle.value)els.diaryTitle.value=d.title||'';if(!els.diaryText.value)els.diaryText.value=d.text||'';if(els.diaryDraftStatus)els.diaryDraftStatus.textContent='Local draft restored';}catch{}
  updateDiaryWritingMeta();
}
function clearDailyDraft(){localStorage.removeItem(diaryDraftKey());if(els.diaryDraftStatus)els.diaryDraftStatus.textContent='Saved';}
function scheduleDailyDraft(){clearTimeout(state.diaryDraftTimer);if(els.diaryDraftStatus)els.diaryDraftStatus.textContent='Saving draft…';state.diaryDraftTimer=setTimeout(saveDailyDraft,450);updateDiaryWritingMeta();}
function saveMonthlyDraft(){
  if(!els.monthlyText)return;
  const payload={title:els.monthlyTitle.value||'',text:els.monthlyText.value||'',savedAt:Date.now()};
  if(payload.title||payload.text)localStorage.setItem(monthlyDraftKey(),JSON.stringify(payload));else localStorage.removeItem(monthlyDraftKey());
  if(els.monthlyDraftStatus)els.monthlyDraftStatus.textContent=payload.title||payload.text?'Draft saved locally':'Draft ready';
}
function restoreMonthlyDraft(){
  if(els.monthlyId?.value)return;
  const raw=localStorage.getItem(monthlyDraftKey());
  if(!raw){if(els.monthlyDraftStatus)els.monthlyDraftStatus.textContent='Draft ready';updateDiaryWritingMeta();return;}
  try{const d=JSON.parse(raw);if(!els.monthlyTitle.value)els.monthlyTitle.value=d.title||'';if(!els.monthlyText.value)els.monthlyText.value=d.text||'';if(els.monthlyDraftStatus)els.monthlyDraftStatus.textContent='Local draft restored';}catch{}
  updateDiaryWritingMeta();
}
function clearMonthlyDraft(){localStorage.removeItem(monthlyDraftKey());if(els.monthlyDraftStatus)els.monthlyDraftStatus.textContent='Saved';}
function scheduleMonthlyDraft(){clearTimeout(state.monthlyDraftTimer);if(els.monthlyDraftStatus)els.monthlyDraftStatus.textContent='Saving draft…';state.monthlyDraftTimer=setTimeout(saveMonthlyDraft,450);updateDiaryWritingMeta();}
function setDailyDiaryDate(value,{syncBrowse=true,restore=true}={}){
  if(!value)return;els.diaryDate.value=value;if(syncBrowse){els.diaryBrowseDate.value=value;state.diaryView='DAILY';}
  if(!els.diaryId.value){els.diaryTitle.value='';els.diaryText.value='';}renderDiary();if(restore)restoreDailyDraft();updateDiaryWritingMeta();
}
function setMonthlyEntryMonth(value,{syncFilter=true,restore=true}={}){
  if(!value)return;els.monthlyEntryMonth.value=value;
  if(syncFilter){refreshMonthlyYearFilter();els.monthlyYearFilter.value=value.slice(0,4);els.monthlyMonthFilter.value=value.slice(5,7);}
  if(!els.monthlyId.value){els.monthlyTitle.value='';els.monthlyText.value='';}renderMonthlyDiary();if(restore)restoreMonthlyDraft();updateDiaryWritingMeta();
}
function activeHorizontalScrollTarget(){
  if(state.activeSection==='holdings')return document.querySelector('#holdingsSection .table-wrap');
  if(state.activeSection==='watchlist')return document.querySelector('#watchlistSection .table-wrap');
  return null;
}
function refreshDashboardHScroll(){
  if(!els.dashboardHScroll||!els.dashboardHScrollTrack||!els.dashboardHScrollInner)return;
  const target=activeHorizontalScrollTarget();state.hScrollTarget=target;
  const hasOverflow=Boolean(target&&target.scrollWidth>target.clientWidth+4);els.dashboardHScroll.classList.toggle('hidden',!hasOverflow);if(!hasOverflow)return;
  els.dashboardHScrollInner.style.width=`${target.scrollWidth}px`;
  const maxTarget=Math.max(1,target.scrollWidth-target.clientWidth),maxTrack=Math.max(1,els.dashboardHScrollTrack.scrollWidth-els.dashboardHScrollTrack.clientWidth);
  els.dashboardHScrollTrack.scrollLeft=(target.scrollLeft/maxTarget)*maxTrack;
}
function syncHScrollFromTrack(){
  const target=state.hScrollTarget||activeHorizontalScrollTarget();if(!target)return;
  const maxTrack=Math.max(1,els.dashboardHScrollTrack.scrollWidth-els.dashboardHScrollTrack.clientWidth),maxTarget=Math.max(1,target.scrollWidth-target.clientWidth);
  target.scrollLeft=(els.dashboardHScrollTrack.scrollLeft/maxTrack)*maxTarget;
}
function scrollDashboardHorizontal(amount){const target=state.hScrollTarget||activeHorizontalScrollTarget();if(!target)return;target.scrollBy({left:amount,behavior:'smooth'});setTimeout(refreshDashboardHScroll,120);}

function diaryDateLabel(value){
  if(!value)return 'No date';
  const d=new Date(`${String(value).slice(0,10)}T00:00:00`);
  return Number.isNaN(d.getTime())?String(value):new Intl.DateTimeFormat('en-IN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).format(d);
}
function resetDiaryForm(dateValue=''){
  els.diaryForm?.reset();
  els.diaryId.value='';
  els.diaryDate.value=dateValue||els.diaryBrowseDate?.value||localIsoDate();
  els.diarySaveStatus.textContent='New entry';
  restoreDailyDraft();
  updateDiaryWritingMeta();
}
function openDiaryEntry(item){
  if(!item)return;
  switchSection('diary');
  els.diaryId.value=item.id||'';
  els.diaryDate.value=item.entryDate||localIsoDate();
  els.diaryTitle.value=item.title||'';
  els.diaryText.value=item.text||'';
  els.diarySaveStatus.textContent=`Editing ${diaryDateLabel(item.entryDate)}`;
  if(els.diaryDraftStatus)els.diaryDraftStatus.textContent='Editing saved entry';
  updateDiaryWritingMeta();
  setTimeout(()=>els.diaryText?.focus(),50);
}
function diaryVisibleItems(){
  const q=String(els.diarySearch?.value||'').trim().toLowerCase();
  let items=[...state.diary];
  if(q)items=items.filter(x=>`${x.entryDate||''} ${x.title||''} ${x.text||''}`.toLowerCase().includes(q));
  else if(state.diaryView==='DAILY'){
    const day=els.diaryBrowseDate?.value||localIsoDate();
    items=items.filter(x=>String(x.entryDate||'').slice(0,10)===day);
  }else{
    const month=els.diaryBrowseMonth?.value||localIsoMonth();
    items=items.filter(x=>String(x.entryDate||'').slice(0,7)===month);
  }
  return items.sort((a,b)=>{
    const byDate=String(b.entryDate||'').localeCompare(String(a.entryDate||''));
    return byDate!==0?byDate:String(b.updatedAt||'').localeCompare(String(a.updatedAt||''));
  });
}
function renderDiary(){
  if(!els.diaryList)return;
  const q=String(els.diarySearch?.value||'').trim();
  const items=diaryVisibleItems();
  els.diaryDayControl.classList.toggle('hidden',state.diaryView!=='DAILY'||Boolean(q));
  els.diaryMonthControl.classList.toggle('hidden',state.diaryView!=='MONTHLY'||Boolean(q));
  $$('[data-diary-view]').forEach(b=>b.classList.toggle('active',b.dataset.diaryView===state.diaryView));

  if(q)els.diarySummary.textContent=`Search results · ${items.length} entr${items.length===1?'y':'ies'}`;
  else if(state.diaryView==='DAILY')els.diarySummary.textContent=`${diaryDateLabel(els.diaryBrowseDate.value||localIsoDate())} · ${items.length} entr${items.length===1?'y':'ies'}`;
  else{
    const month=els.diaryBrowseMonth.value||localIsoMonth(),d=new Date(`${month}-01T00:00:00`);
    const label=Number.isNaN(d.getTime())?month:new Intl.DateTimeFormat('en-IN',{month:'long',year:'numeric'}).format(d);
    els.diarySummary.textContent=`${label} · ${items.length} entr${items.length===1?'y':'ies'}`;
  }

  let lastDate='';
  els.diaryList.innerHTML=items.map(item=>{
    const date=String(item.entryDate||'').slice(0,10);
    const dateHeader=state.diaryView==='MONTHLY'&&!q&&date!==lastDate?`<div class="diary-date-divider"><span>${escapeHtml(diaryDateLabel(date))}</span></div>`:'';
    lastDate=date;
    return `${dateHeader}<article class="diary-card" data-diary-view-entry="${escapeHtml(item.id)}">
      <div class="diary-card-head">
        <div><span class="diary-date-pill">${escapeHtml(diaryDateLabel(date))}</span><h4>${escapeHtml(item.title?.trim()||'Untitled entry')}</h4></div>
        <div class="diary-card-actions">
          <button type="button" class="small-button" data-edit-diary="${escapeHtml(item.id)}">Edit</button>
          <button type="button" class="small-button danger" data-delete-diary="${escapeHtml(item.id)}">Delete</button>
        </div>
      </div>
      <div class="diary-card-text">${escapeHtml(item.text||'')}</div>
      <div class="diary-card-foot"><span>Updated ${escapeHtml(dateLabel(item.updatedAt))}</span></div>
    </article>`;
  }).join('');
  els.diaryEmpty.classList.toggle('hidden',items.length>0);
}
async function saveDiaryEntry(event){
  event.preventDefault();
  if(!els.diaryDate.value||!els.diaryText.value.trim()){toast('Choose a date and write a diary entry.','error');return;}
  setBusy(els.saveDiaryBtn,true,'Saving…');
  els.diarySaveStatus.textContent='Saving…';
  try{
    const result=await api('saveDiaryEntry',{entry:{
      id:els.diaryId.value,
      entryDate:els.diaryDate.value,
      title:els.diaryTitle.value.trim(),
      text:els.diaryText.value.trim()
    }});
    applyBootstrap(result.data);
    saveCache(result.data);
    els.diaryBrowseDate.value=els.diaryDate.value;
    els.diaryBrowseMonth.value=els.diaryDate.value.slice(0,7);
    state.diaryView='DAILY';
    clearDailyDraft();
    resetDiaryForm(els.diaryBrowseDate.value);
    renderDiary();
    toast('Diary entry saved.','success');
  }catch(e){els.diarySaveStatus.textContent='Save failed';toast(e.message,'error');}
  finally{setBusy(els.saveDiaryBtn,false);}
}
async function deleteDiaryEntry(id){
  if(!id||!confirm('Delete this diary entry?'))return;
  try{
    const result=await api('deleteDiaryEntry',{id});
    applyBootstrap(result.data);saveCache(result.data);renderDiary();toast('Diary entry deleted.','success');
  }catch(e){toast(e.message,'error');}
}


function monthKeyLabel(monthKey){
  if(!/^\d{4}-\d{2}$/.test(String(monthKey||'')))return String(monthKey||'');
  const d=new Date(`${monthKey}-01T00:00:00`);
  return new Intl.DateTimeFormat('en-IN',{month:'long',year:'numeric'}).format(d);
}
function currentMonthlyFilterKey(){
  const year=els.monthlyYearFilter?.value||String(new Date().getFullYear());
  const month=els.monthlyMonthFilter?.value||String(new Date().getMonth()+1).padStart(2,'0');
  return year!=='ALL'&&month!=='ALL'?`${year}-${month}`:'';
}
function refreshMonthlyYearFilter(){
  if(!els.monthlyYearFilter)return;
  const current=String(new Date().getFullYear());
  const years=new Set([current]);
  state.monthlyDiary.forEach(x=>{const y=String(x.monthKey||'').slice(0,4);if(/^\d{4}$/.test(y))years.add(y);});
  state.monthStatus.forEach(x=>{const y=String(x.monthKey||'').slice(0,4);if(/^\d{4}$/.test(y))years.add(y);});
  const previous=els.monthlyYearFilter.value||current;
  const sorted=[...years].sort((a,b)=>Number(b)-Number(a));
  els.monthlyYearFilter.innerHTML='<option value="ALL">All years</option>'+sorted.map(y=>`<option value="${y}">${y}</option>`).join('');
  els.monthlyYearFilter.value=[...sorted,'ALL'].includes(previous)?previous:current;
}
function resetMonthlyForm(monthValue=''){
  els.monthlyForm?.reset();
  els.monthlyId.value='';
  els.monthlyEntryMonth.value=monthValue||currentMonthlyFilterKey()||localIsoMonth();
  els.monthlyEntryType.value='DIARY';
  els.monthlySaveStatus.textContent='New monthly item';
  updateMonthlyTargetHelp();
  restoreMonthlyDraft();
  updateDiaryWritingMeta();
}
function updateMonthlyTargetHelp(){
  if(!els.monthlyTargetHelp)return;
  const isTarget=els.monthlyEntryType.value==='TARGET';
  els.monthlyTargetHelp.innerHTML=isTarget
    ? 'Save the target first. When achieved, use <strong>Mark completed</strong>. The month can be completed after all its targets are achieved.'
    : 'Use this space for a monthly diary, plan or experience. It remains saved with the selected month.';
}
function openMonthlyItem(item){
  if(!item)return;
  state.diaryWorkspace='MONTHLY';
  renderDiaryWorkspace();
  els.monthlyId.value=item.id||'';
  els.monthlyEntryMonth.value=item.monthKey||localIsoMonth();
  els.monthlyEntryType.value=item.entryType||'DIARY';
  els.monthlyTitle.value=item.title||'';
  els.monthlyText.value=item.text||'';
  els.monthlySaveStatus.textContent=`Editing ${monthKeyLabel(item.monthKey)}`;
  if(els.monthlyDraftStatus)els.monthlyDraftStatus.textContent='Editing saved item';
  updateDiaryWritingMeta();
  updateMonthlyTargetHelp();
  setTimeout(()=>els.monthlyText?.focus(),50);
}
function monthlyVisibleItems(){
  const y=els.monthlyYearFilter?.value||'ALL';
  const m=els.monthlyMonthFilter?.value||'ALL';
  const type=els.monthlyTypeFilter?.value||'ALL';
  const status=els.monthlyStatusFilter?.value||'ALL';
  const q=String(els.monthlySearch?.value||'').trim().toLowerCase();
  return [...state.monthlyDiary].filter(item=>{
    const key=String(item.monthKey||'');
    if(y!=='ALL'&&key.slice(0,4)!==y)return false;
    if(m!=='ALL'&&key.slice(5,7)!==m)return false;
    if(type!=='ALL'&&item.entryType!==type)return false;
    if(status!=='ALL'){
      if(item.entryType!=='TARGET')return false;
      if(status==='OPEN'&&item.status==='COMPLETED')return false;
      if(status==='COMPLETED'&&item.status!=='COMPLETED')return false;
    }
    if(q&&!`${item.monthKey||''} ${item.entryType||''} ${item.title||''} ${item.text||''}`.toLowerCase().includes(q))return false;
    return true;
  }).sort((a,b)=>{
    const byMonth=String(b.monthKey||'').localeCompare(String(a.monthKey||''));
    if(byMonth!==0)return byMonth;
    const targetOrder=(a.entryType==='TARGET'?0:1)-(b.entryType==='TARGET'?0:1);
    if(targetOrder!==0)return targetOrder;
    return String(b.updatedAt||'').localeCompare(String(a.updatedAt||''));
  });
}
function monthStatusFor(monthKey){
  return state.monthStatus.find(x=>x.monthKey===monthKey)||null;
}
function monthTargets(monthKey){
  return state.monthlyDiary.filter(x=>x.monthKey===monthKey&&x.entryType==='TARGET');
}
function renderMonthCompletion(){
  if(!els.monthCompletionPanel)return;
  const key=currentMonthlyFilterKey();
  if(!key){
    els.monthCompletionPanel.classList.add('year-mode');
    els.monthCompletionTitle.textContent='Year / multi-month view';
    els.monthCompletionText.textContent='Choose one specific year and month to manage target completion and close the month.';
    els.monthProgressBar.style.width='0%';
    els.monthProgressLabel.textContent='Select a month';
    els.completeMonthBtn.disabled=true;
    els.completeMonthBtn.textContent='✓ Complete month';
    return;
  }
  els.monthCompletionPanel.classList.remove('year-mode');
  const targets=monthTargets(key);
  const completed=targets.filter(x=>x.status==='COMPLETED').length;
  const pct=targets.length?Math.round(completed/targets.length*100):0;
  const status=monthStatusFor(key);
  const monthDone=status?.status==='COMPLETED';
  els.monthCompletionTitle.textContent=monthKeyLabel(key);
  els.monthCompletionText.textContent=monthDone
    ? `Month completed and saved${status.completedAt?` · ${dateLabel(status.completedAt)}`:''}.`
    : targets.length
      ? `${targets.length-completed} target${targets.length-completed===1?'':'s'} still open.`
      : 'No targets yet. You can still save diary, plan and experiences, or add a target.';
  els.monthProgressBar.style.width=`${monthDone?100:pct}%`;
  els.monthProgressLabel.textContent=monthDone?'Month completed':`${completed} / ${targets.length} targets completed`;
  els.completeMonthBtn.disabled=!monthDone&&targets.length>0&&completed<targets.length;
  els.completeMonthBtn.textContent=monthDone?'↺ Reopen month':'✓ Complete month';
}
function renderCompletedMonthArchive(){
  if(!els.completedMonthArchive)return;
  const y=els.monthlyYearFilter?.value||'ALL';
  const m=els.monthlyMonthFilter?.value||'ALL';
  const completed=state.monthStatus
    .filter(x=>x.status==='COMPLETED')
    .filter(x=>y==='ALL'||String(x.monthKey).slice(0,4)===y)
    .filter(x=>m==='ALL'||String(x.monthKey).slice(5,7)===m)
    .sort((a,b)=>String(b.monthKey).localeCompare(String(a.monthKey)));
  els.completedMonthArchive.innerHTML=completed.length
    ? `<div class="completed-archive-head"><strong>Completed months</strong><span>${completed.length} saved</span></div><div class="completed-month-chips">${completed.map(x=>`<button type="button" data-open-completed-month="${escapeHtml(x.monthKey)}">✓ ${escapeHtml(monthKeyLabel(x.monthKey))}</button>`).join('')}</div>`
    : '';
}
function renderMonthlyDiary(){
  if(!els.monthlyList)return;
  const items=monthlyVisibleItems();
  const y=els.monthlyYearFilter.value||'ALL',m=els.monthlyMonthFilter.value||'ALL';
  const key=y!=='ALL'&&m!=='ALL'?`${y}-${m}`:'';
  els.monthlyListTitle.textContent=key?monthKeyLabel(key):y!=='ALL'?`${y} monthly records`:'All monthly records';
  els.monthlyResultCount.textContent=`${items.length} item${items.length===1?'':'s'}`;
  renderMonthCompletion();
  renderCompletedMonthArchive();

  let lastMonth='';
  els.monthlyList.innerHTML=items.map(item=>{
    const monthHeader=item.monthKey!==lastMonth?`<div class="monthly-month-divider"><span>${escapeHtml(monthKeyLabel(item.monthKey))}</span>${monthStatusFor(item.monthKey)?.status==='COMPLETED'?'<b>✓ Completed month</b>':''}</div>`:'';
    lastMonth=item.monthKey;
    const typeLabel={DIARY:'Diary',PLAN:'Plan',EXPERIENCE:'Experience',TARGET:'Target'}[item.entryType]||item.entryType;
    const isTarget=item.entryType==='TARGET';
    const isDone=item.status==='COMPLETED';
    return `${monthHeader}<article class="monthly-item-card type-${escapeHtml(String(item.entryType||'').toLowerCase())} ${isTarget&&isDone?'completed-target':''}">
      <div class="monthly-item-head">
        <div><span class="monthly-type-badge">${escapeHtml(typeLabel)}</span><h4>${escapeHtml(item.title?.trim()||typeLabel)}</h4></div>
        <div class="monthly-item-actions">
          ${isTarget?`<button type="button" class="small-button ${isDone?'completed-button':''}" data-toggle-monthly-target="${escapeHtml(item.id)}">${isDone?'✓ Completed':'Mark completed'}</button>`:''}
          <button type="button" class="small-button" data-edit-monthly="${escapeHtml(item.id)}">Edit</button>
          <button type="button" class="small-button danger" data-delete-monthly="${escapeHtml(item.id)}">Delete</button>
        </div>
      </div>
      <div class="monthly-item-text">${escapeHtml(item.text||'')}</div>
      <div class="monthly-item-foot"><span>${escapeHtml(monthKeyLabel(item.monthKey))}</span>${isTarget?`<span class="${isDone?'target-done':'target-open'}">${isDone?'Achieved':'Open target'}</span>`:''}</div>
    </article>`;
  }).join('');
  els.monthlyEmpty.classList.toggle('hidden',items.length>0);
}
function renderDiaryWorkspace(){
  const monthly=state.diaryWorkspace==='MONTHLY';
  els.dailyDiaryWorkspace.classList.toggle('hidden',monthly);
  els.monthlyDiaryWorkspace.classList.toggle('hidden',!monthly);
  $$('[data-diary-workspace]').forEach(b=>b.classList.toggle('active',b.dataset.diaryWorkspace===state.diaryWorkspace));
  els.newDiaryEntryBtn.textContent=monthly?'+ New monthly item':'+ New daily entry';
  if(monthly){refreshMonthlyYearFilter();renderMonthlyDiary();}
  else renderDiary();
}
async function saveMonthlyItem(event){
  event.preventDefault();
  const monthKey=els.monthlyEntryMonth.value;
  const text=els.monthlyText.value.trim();
  if(!monthKey||!text){toast('Choose a month and enter details.','error');return;}
  setBusy(els.saveMonthlyBtn,true,'Saving…');
  els.monthlySaveStatus.textContent='Saving…';
  try{
    const result=await api('saveMonthlyItem',{item:{
      id:els.monthlyId.value,
      monthKey,
      entryType:els.monthlyEntryType.value,
      title:els.monthlyTitle.value.trim(),
      text
    }});
    applyBootstrap(result.data);saveCache(result.data);
    els.monthlyYearFilter.value=monthKey.slice(0,4);
    els.monthlyMonthFilter.value=monthKey.slice(5,7);
    clearMonthlyDraft();
    resetMonthlyForm(monthKey);
    renderMonthlyDiary();
    toast('Monthly item saved.','success');
  }catch(e){els.monthlySaveStatus.textContent='Save failed';toast(e.message,'error');}
  finally{setBusy(els.saveMonthlyBtn,false);}
}
async function deleteMonthlyItem(id){
  if(!id||!confirm('Delete this monthly item?'))return;
  try{
    const result=await api('deleteMonthlyItem',{id});
    applyBootstrap(result.data);saveCache(result.data);renderMonthlyDiary();toast('Monthly item deleted.','success');
  }catch(e){toast(e.message,'error');}
}
async function toggleMonthlyTarget(id){
  const item=state.monthlyDiary.find(x=>x.id===id);
  if(!item)return;
  const completed=item.status!=='COMPLETED';
  try{
    const result=await api('toggleMonthlyTarget',{id,completed});
    applyBootstrap(result.data);saveCache(result.data);renderMonthlyDiary();
    toast(completed?'Target marked completed.':'Target reopened.','success');
  }catch(e){toast(e.message,'error');}
}
async function toggleMonthCompletion(){
  const key=currentMonthlyFilterKey();
  if(!key){toast('Select one specific month first.','error');return;}
  const current=monthStatusFor(key);
  const completed=current?.status!=='COMPLETED';
  try{
    const result=await api('setMonthStatus',{monthKey:key,completed});
    applyBootstrap(result.data);saveCache(result.data);renderMonthlyDiary();
    toast(completed?`${monthKeyLabel(key)} completed and saved.`:`${monthKeyLabel(key)} reopened.`,'success');
  }catch(e){toast(e.message,'error');}
}

function switchSection(section){
  state.activeSection=section;
  const titles={overview:'Portfolio overview',holdings:'Holdings & performance',watchlist:'Watchlist',diary:'Diary',users:'User administration'};
  els.pageTitle.textContent=titles[section]||'My Finance';
  ['overview','holdings','watchlist','diary','users'].forEach(name=>$(`${name}Section`)?.classList.toggle('hidden',name!==section));
  $$('[data-section]').forEach(b=>b.classList.toggle('active',b.dataset.section===section));
  if(section==='diary'){
    if(!els.diaryBrowseDate.value)els.diaryBrowseDate.value=localIsoDate();
    if(!els.diaryBrowseMonth.value)els.diaryBrowseMonth.value=localIsoMonth();
    if(!els.diaryDate.value)els.diaryDate.value=els.diaryBrowseDate.value;
    renderDiaryWorkspace();
  }
  if(section==='users'&&state.user?.role==='ADMIN')loadUsers();
  requestAnimationFrame(()=>setTimeout(refreshDashboardHScroll,20));
}
async function loadUsers(){try{const r=await api('adminListUsers');state.users=r.users||[];renderUsers();}catch(e){toast(e.message,'error');}}
async function createUser(event){event.preventDefault();const b=event.submitter;setBusy(b,true,'Creating…');try{await api('adminCreateUser',{username:els.newUsername.value.trim(),displayName:els.newDisplayName.value.trim(),role:els.newUserRole.value,password:els.newUserPassword.value});closeModals();els.userForm.reset();await loadUsers();toast('User created.','success');}catch(e){toast(e.message,'error');}finally{setBusy(b,false);}}
async function resetUserPassword(username){const password=prompt(`Enter a new temporary password for ${username}:`);if(!password)return;try{await api('adminResetPassword',{username,password});toast('Password reset.','success');}catch(e){toast(e.message,'error');}}
async function toggleUser(username,active){try{await api('adminToggleUser',{username,active});await loadUsers();toast(`User ${active?'enabled':'disabled'}.`,'success');}catch(e){toast(e.message,'error');}}

function safeOn(el,event,handler){
  if(!el)return;
  el.addEventListener(event,handler);
}

function bindEvents(){
  els.autoRefreshSelect.addEventListener('change',changeAutoRefresh);els.rememberUsername.addEventListener('change',()=>{if(!els.rememberUsername.checked)localStorage.removeItem('portfolio_saved_username');});els.diaryForm.addEventListener('submit',saveDiaryEntry);els.clearDiaryBtn.addEventListener('click',()=>{clearDailyDraft();resetDiaryForm();updateDiaryWritingMeta();});els.newDiaryEntryBtn.addEventListener('click',()=>{switchSection('diary');if(state.diaryWorkspace==='MONTHLY'){resetMonthlyForm(currentMonthlyFilterKey()||localIsoMonth());setTimeout(()=>els.monthlyTitle?.focus(),30);}else{resetDiaryForm(els.diaryBrowseDate.value||localIsoDate());setTimeout(()=>els.diaryTitle?.focus(),30);}});els.diarySearch.addEventListener('input',renderDiary);els.diaryBrowseDate.addEventListener('change',()=>{if(!els.diaryId.value)els.diaryDate.value=els.diaryBrowseDate.value;renderDiary();});els.diaryBrowseMonth.addEventListener('change',renderDiary);
  els.monthlyForm.addEventListener('submit',saveMonthlyItem);
  els.clearMonthlyBtn.addEventListener('click',()=>{clearMonthlyDraft();resetMonthlyForm();updateDiaryWritingMeta();});
  els.monthlyEntryType.addEventListener('change',updateMonthlyTargetHelp);
  els.monthlyYearFilter.addEventListener('change',renderMonthlyDiary);
  els.monthlyMonthFilter.addEventListener('change',renderMonthlyDiary);
  els.monthlyTypeFilter.addEventListener('change',renderMonthlyDiary);
  els.monthlyStatusFilter.addEventListener('change',renderMonthlyDiary);
  els.monthlySearch.addEventListener('input',renderMonthlyDiary);
  els.completeMonthBtn.addEventListener('click',toggleMonthCompletion);
  safeOn(els.diaryPrevDayBtn,'click',()=>setDailyDiaryDate(dateShiftIso(els.diaryDate.value,-1)));
  safeOn(els.diaryTodayBtn,'click',()=>setDailyDiaryDate(localIsoDate()));
  safeOn(els.diaryNextDayBtn,'click',()=>setDailyDiaryDate(dateShiftIso(els.diaryDate.value,1)));
  safeOn(els.monthlyPrevMonthBtn,'click',()=>setMonthlyEntryMonth(monthShiftIso(els.monthlyEntryMonth.value,-1)));
  safeOn(els.monthlyThisMonthBtn,'click',()=>setMonthlyEntryMonth(localIsoMonth()));
  safeOn(els.monthlyNextMonthBtn,'click',()=>setMonthlyEntryMonth(monthShiftIso(els.monthlyEntryMonth.value,1)));
  safeOn(els.diarySearchClearBtn,'click',()=>{els.diarySearch.value='';renderDiary();els.diarySearch.focus();});
  safeOn(els.diaryDate,'change',()=>{if(!els.diaryId.value){els.diaryBrowseDate.value=els.diaryDate.value;restoreDailyDraft();}updateDiaryWritingMeta();});
  safeOn(els.monthlyEntryMonth,'change',()=>{if(!els.monthlyId.value)restoreMonthlyDraft();updateDiaryWritingMeta();});
  safeOn(els.diaryTitle,'input',scheduleDailyDraft);safeOn(els.diaryText,'input',scheduleDailyDraft);
  safeOn(els.monthlyTitle,'input',scheduleMonthlyDraft);safeOn(els.monthlyText,'input',scheduleMonthlyDraft);
  safeOn(els.monthlyEntryType,'change',()=>{updateMonthlyTargetHelp();if(!els.monthlyId.value)restoreMonthlyDraft();});
  [els.diaryTitle,els.diaryText].forEach(el=>safeOn(el,'keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();els.diaryForm.requestSubmit();}}));
  [els.monthlyTitle,els.monthlyText].forEach(el=>safeOn(el,'keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();els.monthlyForm.requestSubmit();}}));
  safeOn(els.dashboardHScrollTrack,'scroll',syncHScrollFromTrack);
  safeOn(els.dashboardHScrollLeft,'click',()=>scrollDashboardHorizontal(-320));safeOn(els.dashboardHScrollRight,'click',()=>scrollDashboardHorizontal(320));
  window.addEventListener('resize',()=>requestAnimationFrame(refreshDashboardHScroll));
  document.querySelectorAll('.table-wrap').forEach(wrap=>wrap.addEventListener('scroll',()=>{if(wrap===state.hScrollTarget)refreshDashboardHScroll();},{passive:true}));els.loginForm.addEventListener('submit',login);els.logoutBtn.addEventListener('click',logout);safeOn(els.replaceMasterDataBtn,'click',replaceMasterPortfolioData);safeOn(els.masterLoadNowBtn,'click',replaceMasterPortfolioData);els.showAllInvestmentsBtn.addEventListener('click',showAllInvestments);els.viewAllNotesBtn.addEventListener('click',()=>openAllNotes('HOLDINGS'));els.watchAllNotesBtn.addEventListener('click',()=>openAllNotes('WATCHLIST'));els.notesSearch.addEventListener('input',renderNotesModal);els.notesSource.addEventListener('change',renderNotesModal);els.notesScope.addEventListener('change',renderNotesModal);els.notesFilter.addEventListener('change',renderNotesModal);els.drawerCloseBtn.addEventListener('click',closeHoldingDrawer);els.drawerDoneBtn.addEventListener('click',closeHoldingDrawer);els.drawerEditBtn.addEventListener('click',editDrawerHolding);els.holdingDrawerBackdrop.addEventListener('click',closeHoldingDrawer);els.refreshBtn.addEventListener('click',async()=>{await loadDashboard(true);resetAutoRefreshClock();});els.addInvestmentBtn.addEventListener('click',()=>openInvestment());els.addInvestmentTableBtn.addEventListener('click',()=>openInvestment());safeOn(els.importBtn,'click',openBulkImport);safeOn(els.bulkImportBtn,'click',openBulkImport);safeOn(els.downloadImportTemplateBtn,'click',downloadImportTemplate);safeOn(els.bulkCsvFile,'change',handleBulkFile);safeOn(els.bulkImportForm,'submit',runBulkImport);safeOn(els.exportBtn,'click',exportCsv);safeOn(els.investmentForm,'submit',saveInvestment);safeOn(els.watchForm,'submit',saveWatch);safeOn(els.passwordForm,'submit',changePassword);els.userForm.addEventListener('submit',createUser);els.holdingType.addEventListener('change',()=>updateAssetForm(els.holdingType.value,'holding'));els.watchType.addEventListener('change',()=>updateAssetForm(els.watchType.value,'watch'));els.holdingSearch.addEventListener('input',renderHoldings);els.holdingTypeFilter.addEventListener('change',renderHoldings);els.watchSearch.addEventListener('input',renderWatchlist);$('addWatchBtn').addEventListener('click',()=>openWatch());$('changePasswordBtn').addEventListener('click',()=>openModal('passwordModal'));$('addUserBtn').addEventListener('click',()=>openModal('userModal'));els.modalBackdrop.addEventListener('click',e=>{if(e.target===els.modalBackdrop)closeModals();});$$('[data-close-modal]').forEach(b=>b.addEventListener('click',closeModals));$$('[data-section]').forEach(b=>b.addEventListener('click',()=>switchSection(b.dataset.section)));$$('[data-section-link]').forEach(b=>b.addEventListener('click',()=>switchSection(b.dataset.sectionLink)));$$('[data-toggle-password]').forEach(b=>b.addEventListener('click',()=>{const input=$(b.dataset.togglePassword),show=input.type==='password';input.type=show?'text':'password';b.textContent=show?'Hide':'Show';}));$$('.import-mode').forEach(b=>b.addEventListener('click',()=>setImportMode(b.dataset.importMode)));
  document.addEventListener('click',e=>{const workspace=e.target.closest('[data-diary-workspace]');if(workspace){state.diaryWorkspace=workspace.dataset.diaryWorkspace;renderDiaryWorkspace();return;}const openCompleted=e.target.closest('[data-open-completed-month]');if(openCompleted){const key=openCompleted.dataset.openCompletedMonth;state.diaryWorkspace='MONTHLY';renderDiaryWorkspace();els.monthlyYearFilter.value=key.slice(0,4);els.monthlyMonthFilter.value=key.slice(5,7);renderMonthlyDiary();return;}const monthlyEdit=e.target.closest('[data-edit-monthly]');if(monthlyEdit){const item=state.monthlyDiary.find(x=>x.id===monthlyEdit.dataset.editMonthly);if(item)openMonthlyItem(item);return;}const monthlyDelete=e.target.closest('[data-delete-monthly]');if(monthlyDelete){deleteMonthlyItem(monthlyDelete.dataset.deleteMonthly);return;}const monthlyTarget=e.target.closest('[data-toggle-monthly-target]');if(monthlyTarget){toggleMonthlyTarget(monthlyTarget.dataset.toggleMonthlyTarget);return;}const diaryView=e.target.closest('[data-diary-view]');if(diaryView){state.diaryView=diaryView.dataset.diaryView;renderDiary();return;}const diaryEdit=e.target.closest('[data-edit-diary]');if(diaryEdit){const item=state.diary.find(x=>x.id===diaryEdit.dataset.editDiary);if(item)openDiaryEntry(item);return;}const diaryDelete=e.target.closest('[data-delete-diary]');if(diaryDelete){deleteDiaryEntry(diaryDelete.dataset.deleteDiary);return;}const diaryCard=e.target.closest('[data-diary-view-entry]');if(diaryCard&&!e.target.closest('button')){const item=state.diary.find(x=>x.id===diaryCard.dataset.diaryViewEntry);if(item)openDiaryEntry(item);return;}const gr=e.target.closest('[data-growth-range]');if(gr){state.growthRange=gr.dataset.growthRange;$$('[data-growth-range]').forEach(b=>b.classList.toggle('active',b.dataset.growthRange===state.growthRange));renderGrowthDashboard();return;}const owner=e.target.closest('[data-owner-view]');if(owner){state.selectedOwner=owner.dataset.ownerView;refreshOwnerControls();renderAll();return;}const assetView=e.target.closest('[data-asset-view]');if(assetView){state.selectedAssetView=assetView.dataset.assetView;els.holdingTypeFilter.value='ALL';renderAll();return;}const noteView=e.target.closest('[data-note-view]'),noteEdit=e.target.closest('[data-note-edit]'),watchNoteView=e.target.closest('[data-watch-note-view]'),watchNoteEdit=e.target.closest('[data-watch-note-edit]'),holdingViewButton=e.target.closest('[data-view-holding-button]'),watchViewButton=e.target.closest('[data-view-watch-button]'),watchNoteButton=e.target.closest('[data-watch-note-button]'),edit=e.target.closest('[data-edit-holding]'),del=e.target.closest('[data-delete-holding]'),ew=e.target.closest('[data-edit-watch]'),dw=e.target.closest('[data-delete-watch]'),ru=e.target.closest('[data-reset-user]'),tu=e.target.closest('[data-toggle-user]');if(noteView){const item=state.holdings.find(x=>x.id===noteView.dataset.noteView);closeModals();if(item)openHoldingDrawer(item);return;}if(noteEdit){const item=state.holdings.find(x=>x.id===noteEdit.dataset.noteEdit);closeModals();if(item)openInvestment(item);return;}if(watchNoteView){const item=state.watchlist.find(x=>x.id===watchNoteView.dataset.watchNoteView);closeModals();if(item)openWatchDrawer(item);return;}if(holdingViewButton){const item=state.holdings.find(x=>x.id===holdingViewButton.dataset.viewHoldingButton);if(item)openHoldingDrawer(item);return;}if(watchViewButton){const item=state.watchlist.find(x=>x.id===watchViewButton.dataset.viewWatchButton);if(item)openWatchDrawer(item);return;}if(watchNoteButton){const item=state.watchlist.find(x=>x.id===watchNoteButton.dataset.watchNoteButton);if(item){openWatchDrawer(item);setTimeout(()=>{const t=$('drawerWatchNote');if(t){t.focus();t.setSelectionRange(t.value.length,t.value.length);}},80);}return;}if(watchNoteEdit){const item=state.watchlist.find(x=>x.id===watchNoteEdit.dataset.watchNoteEdit);closeModals();if(item){openWatchDrawer(item);setTimeout(()=>{const t=$('drawerWatchNote');if(t){t.focus();t.setSelectionRange(t.value.length,t.value.length);}},80);}return;}if(edit){openInvestment(state.holdings.find(x=>x.id===edit.dataset.editHolding));return;}if(del){deleteItem('deleteHolding',del.dataset.deleteHolding,'investment');return;}if(ew){openWatch(state.watchlist.find(x=>x.id===ew.dataset.editWatch));return;}if(dw){deleteItem('deleteWatchItem',dw.dataset.deleteWatch,'watchlist item');return;}if(ru){resetUserPassword(ru.dataset.resetUser);return;}if(tu){toggleUser(tu.dataset.toggleUser,tu.dataset.active==='true');return;}const watchNoteCell=e.target.closest('[data-watch-note-cell]');if(watchNoteCell){const item=state.watchlist.find(x=>x.id===watchNoteCell.dataset.watchNoteCell);if(item){openWatchDrawer(item);setTimeout(()=>{const t=$('drawerWatchNote');if(t)t.focus();},80);}return;}const noteCell=e.target.closest('[data-note-cell]');if(noteCell){const item=state.holdings.find(x=>x.id===noteCell.dataset.noteCell);if(item)openHoldingDrawer(item);return;}const watchView=e.target.closest('[data-view-watch]');if(watchView){const item=state.watchlist.find(x=>x.id===watchView.dataset.viewWatch);if(item)openWatchDrawer(item);return;}const view=e.target.closest('[data-view-holding]');if(view){openHoldingDrawer(state.holdings.find(x=>x.id===view.dataset.viewHolding));}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state.autoRefreshMinutes&&Date.now()>=state.autoRefreshNextAt&&!state.syncing){resetAutoRefreshClock();loadDashboard(true);}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(els.holdingDrawer?.classList.contains('open'))closeHoldingDrawer();else closeModals();return;}if((e.key==='Enter'||e.key===' ')&&e.target?.matches?.('[data-view-holding]')){e.preventDefault();openHoldingDrawer(state.holdings.find(x=>x.id===e.target.dataset.viewHolding));return;}if((e.key==='Enter'||e.key===' ')&&e.target?.matches?.('[data-view-watch]')){e.preventDefault();openWatchDrawer(state.watchlist.find(x=>x.id===e.target.dataset.viewWatch));}});
}

async function init(){bindEvents();loadBackendVersion();els.diaryBrowseDate.value=localIsoDate();els.diaryBrowseMonth.value=localIsoMonth();els.diaryDate.value=localIsoDate();els.monthlyEntryMonth.value=localIsoMonth();refreshMonthlyYearFilter();els.monthlyYearFilter.value=String(new Date().getFullYear());els.monthlyMonthFilter.value=String(new Date().getMonth()+1).padStart(2,'0');loadSavedUsername();refreshOwnerControls();updateDiaryWritingMeta();setTimeout(()=>{restoreDailyDraft();restoreMonthlyDraft();refreshDashboardHScroll();},80);startAutoRefresh();if(!isConfigured()){els.loginMessage.textContent='Setup required: paste the Apps Script /exec URL into config.js.';return;}if(state.token){showApp();loadCache();await loadDashboard(false);resetAutoRefreshClock();}}
console.info('MyFinance v15.8 loaded — horizontal scroller + smoother diary');
init();
