/**
 * Message.gs - Message text cleaning and placeholder resolution.
 *
 * Cleans messages before sending: strips HTML (ERR027), emoji (queue stuck),
 * hidden Unicode, converts Arabic digits. Resolves {Column Name} placeholders.
 *
 * Related files: Send.gs (calls clean + resolve before sending)
 */

const MessageUtils = {

  clean(text) {
    if (!text) return '';
    let msg = String(text);
    msg = msg.replace(/<[^>]*>/g, '');
    msg = msg.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
    msg = msg.replace(/[\u{1F300}-\u{1F5FF}]/gu, '');
    msg = msg.replace(/[\u{1F680}-\u{1F6FF}]/gu, '');
    msg = msg.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '');
    msg = msg.replace(/[\u{2600}-\u{26FF}]/gu, '');
    msg = msg.replace(/[\u{2700}-\u{27BF}]/gu, '');
    msg = msg.replace(/[\u{FE00}-\u{FE0F}]/gu, '');
    msg = msg.replace(/[\u{1F900}-\u{1F9FF}]/gu, '');
    msg = msg.replace(/[\u{1FA00}-\u{1FA6F}]/gu, '');
    msg = msg.replace(/[\u{1FA70}-\u{1FAFF}]/gu, '');
    msg = msg.replace(/[\u{200D}\u{20E3}]/gu, '');
    msg = msg.replace(/[\uFEFF\u200B\u200C\u200E\u200F\u00AD\u2060\uFFFE]/g, '');
    msg = PhoneUtils.convertArabicDigits(msg);
    msg = msg.trim();
    return msg;
  },

  resolve(template, rowData) {
    if (!template) return '';
    return template.replace(/\{([^}]+)\}/g, function(match, colName) {
      if (rowData.hasOwnProperty(colName)) {
        const val = rowData[colName];
        return val !== null && val !== undefined ? String(val) : '';
      }
      return match;
    });
  },

  hasPlaceholders(template) {
    return /\{[^}]+\}/.test(template || '');
  },

  getPlaceholderNames(template) {
    const names = [];
    const regex = /\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(template || '')) !== null) {
      if (names.indexOf(match[1]) === -1) names.push(match[1]);
    }
    return names;
  }
};
