/**
 * Phone.gs - Phone number normalization, validation, and deduplication.
 *
 * All functions are pure (no side effects). Phone numbers must be
 * digits-only international format for kwtSMS API (e.g. 96598765432).
 *
 * Related files: Send.gs (calls these before sending), Store.gs (coverage data)
 */

const PhoneUtils = {

  ARABIC_DIGIT_MAP: {
    '\u0660':'0','\u0661':'1','\u0662':'2','\u0663':'3','\u0664':'4',
    '\u0665':'5','\u0666':'6','\u0667':'7','\u0668':'8','\u0669':'9',
    '\u06F0':'0','\u06F1':'1','\u06F2':'2','\u06F3':'3','\u06F4':'4',
    '\u06F5':'5','\u06F6':'6','\u06F7':'7','\u06F8':'8','\u06F9':'9'
  },

  convertArabicDigits(str) {
    if (!str) return '';
    const map = this.ARABIC_DIGIT_MAP;
    return str.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, function(ch) { return map[ch] || ch; });
  },

  normalize(phone, defaultCountryCode, coverage) {
    if (!phone) return '';
    let num = String(phone);
    num = this.convertArabicDigits(num);
    num = num.replace(/\D/g, '');
    num = num.replace(/^0+/, '');
    if (!num) return '';
    const hasCountryCode = coverage.some(function(prefix) { return num.startsWith(prefix); });
    if (!hasCountryCode && defaultCountryCode) { num = defaultCountryCode + num; }
    return num;
  },

  validate(phone, coverage) {
    if (!phone) return { valid: false, reason: 'err_empty_phone' };
    if (!/^\d{8,15}$/.test(phone)) return { valid: false, reason: 'err_invalid_phone' };
    if (coverage.length > 0) {
      const hasCoverage = coverage.some(function(prefix) { return phone.startsWith(prefix); });
      if (!hasCoverage) return { valid: false, reason: 'err_unsupported_country' };
    }
    return { valid: true, reason: '' };
  },

  processAll(entries, defaultCountryCode, coverage) {
    const valid = [];
    const skipped = [];
    const seen = {};
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const normalized = this.normalize(entry.phone, defaultCountryCode, coverage);
      const validation = this.validate(normalized, coverage);
      if (!validation.valid) {
        skipped.push({ phone: entry.phone, rowIndex: entry.rowIndex, reason: validation.reason });
        continue;
      }
      if (seen[normalized]) {
        skipped.push({ phone: entry.phone, rowIndex: entry.rowIndex, reason: 'err_duplicate' });
        continue;
      }
      seen[normalized] = true;
      valid.push({ phone: normalized, rowIndex: entry.rowIndex });
    }
    return { valid: valid, skipped: skipped };
  }
};
