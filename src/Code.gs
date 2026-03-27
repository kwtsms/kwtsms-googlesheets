/**
 * Code.gs - Entry points and server-side handlers for the sidebar.
 *
 * onOpen/onInstall: create add-on menu.
 * showSidebar: launch sidebar HTML.
 * handle* functions: called from Sidebar.html via google.script.run.
 *
 * Related files: All .gs files, Sidebar.html
 */

function onOpen(e) {
  SpreadsheetApp.getUi()
    .createAddonMenu()
    .addItem('Open Sidebar', 'showSidebar')
    .addSeparator()
    .addItem('Check Balance', 'handleMenuCheckBalance')
    .addToUi();
}

function onInstall(e) {
  onOpen(e);
}

function showSidebar() {
  const template = HtmlService.createTemplateFromFile('Sidebar');
  const html = template.evaluate().setTitle('kwtSMS').setWidth(320);
  SpreadsheetApp.getUi().showSidebar(html);
}

/** Include helper for HTML scriptlets. */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// === Sidebar Handlers ===

function handleGetState() {
  const loggedIn = Store.isLoggedIn();
  const columns = [];
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const lastCol = sheet.getLastColumn();
    if (lastCol > 0) {
      const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      headers.forEach(function(h) { const name = String(h).trim(); if (name) columns.push(name); });
    }
  } catch (e) {}

  return {
    loggedIn: loggedIn,
    i18n: getI18nBundle(),
    balance: Store.getBalance(),
    senderIds: Store.getSenderIds(),
    coverage: Store.getCoverage(),
    settings: Store.getSettings(),
    columns: columns
  };
}

function handleLogin(username, password) {
  username = String(username || '').trim();
  password = String(password || '').trim();
  if (!username || !password) return { success: false, error: t('login_failed') + ': missing credentials' };

  const balanceResult = KwtSmsApi.balance(username, password);
  if (!balanceResult.success) return { success: false, error: balanceResult.error };

  Store.saveCredentials(username, password);
  Store.saveBalance(balanceResult.available);

  const senderResult = KwtSmsApi.senderIds();
  const senderIds = senderResult.success ? senderResult.senderIds : [];
  Store.saveSenderIds(senderIds);

  const coverageResult = KwtSmsApi.coverage();
  const coverage = coverageResult.success ? coverageResult.coverage : [];
  Store.saveCoverage(coverage);

  // Set defaults
  const settings = Store.getSettings();
  if (senderIds.length > 0 && settings.selectedSenderId === 'KWT-SMS' && senderIds.indexOf('KWT-SMS') === -1) {
    Store.saveSettings({ selectedSenderId: senderIds[0] });
  }
  if (coverage.length > 0 && coverage.indexOf('965') !== -1) {
    Store.saveSettings({ defaultCountryCode: '965' });
  } else if (coverage.length > 0) {
    Store.saveSettings({ defaultCountryCode: coverage[0] });
  }

  return { success: true, balance: Store.getBalance(), senderIds: senderIds, coverage: coverage, error: '' };
}

function handleLogout() {
  Store.clearAll();
}

function handleReload() {
  const balanceResult = KwtSmsApi.balance();
  if (!balanceResult.success) return { success: false, error: balanceResult.error };
  Store.saveBalance(balanceResult.available);

  const senderResult = KwtSmsApi.senderIds();
  if (senderResult.success) Store.saveSenderIds(senderResult.senderIds);

  const coverageResult = KwtSmsApi.coverage();
  if (coverageResult.success) Store.saveCoverage(coverageResult.coverage);

  return {
    success: true,
    balance: Store.getBalance(),
    senderIds: senderResult.success ? senderResult.senderIds : Store.getSenderIds(),
    coverage: coverageResult.success ? coverageResult.coverage : Store.getCoverage(),
    error: ''
  };
}

function handleSaveSettings(settings) {
  if (settings && typeof settings === 'object') {
    const allowed = {};
    if (typeof settings.testMode === 'boolean') allowed.testMode = settings.testMode;
    if (typeof settings.defaultCountryCode === 'string') allowed.defaultCountryCode = settings.defaultCountryCode.replace(/\D/g, '');
    if (typeof settings.selectedSenderId === 'string') allowed.selectedSenderId = settings.selectedSenderId.trim();
    Store.saveSettings(allowed);
  }
}

function handleSwitchLanguage(lang) {
  setLang(lang);
  return { i18n: getI18nBundle() };
}

function handlePreview(phoneColumn, messageTemplate) {
  return SmsSender.preview(phoneColumn, messageTemplate, 3);
}

function handleGetSendInfo(phoneColumn) {
  const data = SmsSender.readSheetData();
  const phoneIdx = data.headers.indexOf(phoneColumn);
  let totalRows = 0;
  if (phoneIdx !== -1) {
    data.rows.forEach(function(row) { if (String(row[phoneIdx] || '').trim()) totalRows++; });
  }
  const balance = Store.getBalance();
  return { totalRows: totalRows, balance: balance ? balance.available : 0 };
}

function handleSend(phoneColumn, messageTemplate, senderId, maxRecipients) {
  phoneColumn = String(phoneColumn || '').trim();
  messageTemplate = String(messageTemplate || '');
  senderId = String(senderId || 'KWT-SMS').trim();
  if (!phoneColumn) return { sent: 0, failed: 0, skipped: 0, creditsUsed: 0, errors: [t('err_no_phone_column')] };
  if (!messageTemplate.trim()) return { sent: 0, failed: 0, skipped: 0, creditsUsed: 0, errors: [t('err_empty_message')] };
  return SmsSender.sendAll(phoneColumn, messageTemplate, senderId, maxRecipients);
}

function handleMenuCheckBalance() {
  if (!Store.isLoggedIn()) { SpreadsheetApp.getUi().alert(t('err_not_logged_in')); return; }
  const result = KwtSmsApi.balance();
  if (result.success) {
    Store.saveBalance(result.available);
    SpreadsheetApp.getUi().alert(t('balance_label') + ': ' + result.available + ' ' + t('balance_credits'));
  } else {
    SpreadsheetApp.getUi().alert(result.error);
  }
}
