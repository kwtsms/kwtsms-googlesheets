/**
 * Store.gs - PropertiesService wrapper for per-user data storage.
 *
 * All data stored in UserProperties (per-user, encrypted at rest by Google).
 * Values are JSON-serialized. Keys are prefixed to avoid collisions.
 *
 * Related files: Api.gs (reads credentials), Send.gs (reads settings),
 *                i18n.gs (reads language preference), Code.gs (calls login/logout)
 */

const STORE_KEYS = {
  CREDENTIALS: 'kwtsms_credentials',
  BALANCE: 'kwtsms_balance',
  SENDER_IDS: 'kwtsms_senderids',
  COVERAGE: 'kwtsms_coverage',
  SETTINGS: 'kwtsms_settings',
  LANGUAGE: 'kwtsms_language'
};

const Store = {

  _props() {
    return PropertiesService.getUserProperties();
  },

  get(key) {
    const raw = this._props().getProperty(key);
    if (raw === null) return null;
    try { return JSON.parse(raw); }
    catch (e) { return null; }
  },

  set(key, value) {
    this._props().setProperty(key, JSON.stringify(value));
  },

  remove(key) {
    this._props().deleteProperty(key);
  },

  saveCredentials(username, password) {
    this.set(STORE_KEYS.CREDENTIALS, { username: username.trim(), password: password.trim() });
  },

  getCredentials() {
    return this.get(STORE_KEYS.CREDENTIALS);
  },

  isLoggedIn() {
    return this.getCredentials() !== null;
  },

  saveBalance(available) {
    this.set(STORE_KEYS.BALANCE, { available: available, updatedAt: new Date().toISOString() });
  },

  getBalance() {
    return this.get(STORE_KEYS.BALANCE);
  },

  saveSenderIds(senderIds) {
    this.set(STORE_KEYS.SENDER_IDS, senderIds);
  },

  getSenderIds() {
    return this.get(STORE_KEYS.SENDER_IDS) || [];
  },

  saveCoverage(prefixes) {
    this.set(STORE_KEYS.COVERAGE, prefixes);
  },

  getCoverage() {
    return this.get(STORE_KEYS.COVERAGE) || [];
  },

  saveSettings(settings) {
    const current = this.getSettings();
    this.set(STORE_KEYS.SETTINGS, Object.assign({}, current, settings));
  },

  getSettings() {
    const saved = this.get(STORE_KEYS.SETTINGS);
    return Object.assign({
      testMode: false,
      defaultCountryCode: '965',
      selectedSenderId: 'KWT-SMS'
    }, saved || {});
  },

  saveLanguage(lang) {
    this.set(STORE_KEYS.LANGUAGE, lang);
  },

  getLanguage() {
    return this.get(STORE_KEYS.LANGUAGE);
  },

  clearAll() {
    const props = this._props();
    Object.values(STORE_KEYS).forEach(key => props.deleteProperty(key));
  }
};
