/**
 * Api.gs - kwtSMS REST/JSON API client.
 *
 * All endpoints: POST to https://www.kwtsms.com/API/{endpoint}/
 * Content-Type: application/json, Accept: application/json
 * Auth: username + password in JSON body.
 *
 * Related files: Store.gs (credentials), Send.gs (calls send()), Code.gs (calls login/reload)
 */

const API_BASE = 'https://www.kwtsms.com/API';

const KwtSmsApi = {

  _request(endpoint, payload) {
    const url = API_BASE + '/' + endpoint + '/';
    try {
      const response = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: { 'Accept': 'application/json' },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      const code = response.getResponseCode();
      const text = response.getContentText();
      let data;
      try { data = JSON.parse(text); } catch (e) { data = null; }

      // If we got JSON with an error result, use the API error message regardless of HTTP code
      if (data && data.result === 'ERROR') {
        return { success: false, data: data, error: data.description || 'Unknown error' };
      }

      // Non-2xx without parseable API error
      if (code < 200 || code >= 300) {
        return { success: false, data: null, error: 'Request failed. Please try again.' };
      }

      if (!data) {
        return { success: false, data: null, error: 'Invalid response from API' };
      }

      return { success: true, data: data, error: '' };
    } catch (e) {
      return { success: false, data: null, error: e.message || 'Network error' };
    }
  },

  _authPayload() {
    const creds = Store.getCredentials();
    if (!creds) return null;
    return { username: creds.username, password: creds.password };
  },

  balance(username, password) {
    const payload = (username && password)
      ? { username: username, password: password }
      : this._authPayload();
    if (!payload) return { success: false, available: 0, purchased: 0, error: t('err_not_logged_in') };
    const result = this._request('balance', payload);
    if (!result.success) return { success: false, available: 0, purchased: 0, error: result.error };
    return {
      success: true,
      available: Number(result.data.available) || 0,
      purchased: Number(result.data.purchased) || 0,
      error: ''
    };
  },

  senderIds() {
    const payload = this._authPayload();
    if (!payload) return { success: false, senderIds: [], error: t('err_not_logged_in') };
    const result = this._request('senderid', payload);
    if (!result.success) return { success: false, senderIds: [], error: result.error };
    const ids = result.data.senderid || result.data.senderids || result.data.sender_ids || [];
    return { success: true, senderIds: Array.isArray(ids) ? ids : [], error: '' };
  },

  coverage() {
    const payload = this._authPayload();
    if (!payload) return { success: false, coverage: [], error: t('err_not_logged_in') };
    const result = this._request('coverage', payload);
    if (!result.success) return { success: false, coverage: [], error: result.error };
    let prefixes = result.data.coverage || result.data.prefixes || result.data.countries || [];
    if (!Array.isArray(prefixes)) prefixes = Object.keys(prefixes);
    prefixes = prefixes.map(function(p) { return String(p).replace(/\D/g, ''); }).filter(Boolean);
    return { success: true, coverage: prefixes, error: '' };
  },

  send(mobile, message, sender, testMode) {
    const payload = this._authPayload();
    if (!payload) return { success: false, msgId: '', numbers: 0, pointsCharged: 0, balanceAfter: 0, error: t('err_not_logged_in') };
    payload.sender = sender;
    payload.mobile = mobile;
    payload.message = message;
    payload.test = testMode ? 1 : 0;
    const result = this._request('send', payload);
    if (!result.success) {
      return { success: false, msgId: '', numbers: 0, pointsCharged: 0, balanceAfter: 0, error: result.error };
    }
    return {
      success: true,
      msgId: result.data['msg-id'] || '',
      numbers: Number(result.data.numbers) || 0,
      pointsCharged: Number(result.data['points-charged']) || 0,
      balanceAfter: Number(result.data['balance-after']) || 0,
      error: ''
    };
  }
};
