/**
 * Phone.gs - Phone number normalization, validation, and deduplication.
 *
 * Validation rules ported from official kwtSMS-js library (github.com/boxlinknet/kwtsms-js).
 * 83 countries with per-country local length and mobile start digit rules.
 *
 * Related files: Send.gs (calls these before sending), Store.gs (coverage data)
 */

/**
 * Per-country phone validation rules from kwtSMS-js.
 * localLengths: valid lengths for the local part (after country code).
 * mobileStartDigits: valid first digit(s) of the local part (if specified).
 */
const PHONE_RULES = {
  // GCC
  "965": { localLengths: [8], mobileStartDigits: ["4", "5", "6", "9"] },
  "966": { localLengths: [9], mobileStartDigits: ["5"] },
  "971": { localLengths: [9], mobileStartDigits: ["5"] },
  "973": { localLengths: [8], mobileStartDigits: ["3", "6"] },
  "974": { localLengths: [8], mobileStartDigits: ["3", "5", "6", "7"] },
  "968": { localLengths: [8], mobileStartDigits: ["7", "9"] },
  // Levant
  "962": { localLengths: [9], mobileStartDigits: ["7"] },
  "961": { localLengths: [7, 8], mobileStartDigits: ["3", "7", "8"] },
  "970": { localLengths: [9], mobileStartDigits: ["5"] },
  "964": { localLengths: [10], mobileStartDigits: ["7"] },
  "963": { localLengths: [9], mobileStartDigits: ["9"] },
  // Other Arab
  "967": { localLengths: [9], mobileStartDigits: ["7"] },
  "20":  { localLengths: [10], mobileStartDigits: ["1"] },
  "218": { localLengths: [9], mobileStartDigits: ["9"] },
  "216": { localLengths: [8], mobileStartDigits: ["2", "4", "5", "9"] },
  "212": { localLengths: [9], mobileStartDigits: ["6", "7"] },
  "213": { localLengths: [9], mobileStartDigits: ["5", "6", "7"] },
  "249": { localLengths: [9], mobileStartDigits: ["9"] },
  // Non-Arab Middle East
  "98":  { localLengths: [10], mobileStartDigits: ["9"] },
  "90":  { localLengths: [10], mobileStartDigits: ["5"] },
  "972": { localLengths: [9], mobileStartDigits: ["5"] },
  // South Asia
  "91":  { localLengths: [10], mobileStartDigits: ["6", "7", "8", "9"] },
  "92":  { localLengths: [10], mobileStartDigits: ["3"] },
  "880": { localLengths: [10], mobileStartDigits: ["1"] },
  "94":  { localLengths: [9], mobileStartDigits: ["7"] },
  "960": { localLengths: [7], mobileStartDigits: ["7", "9"] },
  // East Asia
  "86":  { localLengths: [11], mobileStartDigits: ["1"] },
  "81":  { localLengths: [10], mobileStartDigits: ["7", "8", "9"] },
  "82":  { localLengths: [10], mobileStartDigits: ["1"] },
  "886": { localLengths: [9], mobileStartDigits: ["9"] },
  // Southeast Asia
  "65":  { localLengths: [8], mobileStartDigits: ["8", "9"] },
  "60":  { localLengths: [9, 10], mobileStartDigits: ["1"] },
  "62":  { localLengths: [9, 10, 11, 12], mobileStartDigits: ["8"] },
  "63":  { localLengths: [10], mobileStartDigits: ["9"] },
  "66":  { localLengths: [9], mobileStartDigits: ["6", "8", "9"] },
  "84":  { localLengths: [9], mobileStartDigits: ["3", "5", "7", "8", "9"] },
  "95":  { localLengths: [9], mobileStartDigits: ["9"] },
  "855": { localLengths: [8, 9], mobileStartDigits: ["1", "6", "7", "8", "9"] },
  "976": { localLengths: [8], mobileStartDigits: ["6", "8", "9"] },
  // Europe
  "44":  { localLengths: [10], mobileStartDigits: ["7"] },
  "33":  { localLengths: [9], mobileStartDigits: ["6", "7"] },
  "49":  { localLengths: [10, 11], mobileStartDigits: ["1"] },
  "39":  { localLengths: [10], mobileStartDigits: ["3"] },
  "34":  { localLengths: [9], mobileStartDigits: ["6", "7"] },
  "31":  { localLengths: [9], mobileStartDigits: ["6"] },
  "32":  { localLengths: [9] },
  "41":  { localLengths: [9], mobileStartDigits: ["7"] },
  "43":  { localLengths: [10], mobileStartDigits: ["6"] },
  "47":  { localLengths: [8], mobileStartDigits: ["4", "9"] },
  "48":  { localLengths: [9] },
  "30":  { localLengths: [10], mobileStartDigits: ["6"] },
  "420": { localLengths: [9], mobileStartDigits: ["6", "7"] },
  "46":  { localLengths: [9], mobileStartDigits: ["7"] },
  "45":  { localLengths: [8] },
  "40":  { localLengths: [9], mobileStartDigits: ["7"] },
  "36":  { localLengths: [9] },
  "380": { localLengths: [9] },
  // Americas
  "1":   { localLengths: [10] },
  "52":  { localLengths: [10] },
  "55":  { localLengths: [11] },
  "57":  { localLengths: [10], mobileStartDigits: ["3"] },
  "54":  { localLengths: [10], mobileStartDigits: ["9"] },
  "56":  { localLengths: [9], mobileStartDigits: ["9"] },
  "58":  { localLengths: [10], mobileStartDigits: ["4"] },
  "51":  { localLengths: [9], mobileStartDigits: ["9"] },
  "593": { localLengths: [9], mobileStartDigits: ["9"] },
  "53":  { localLengths: [8], mobileStartDigits: ["5", "6"] },
  // Africa
  "27":  { localLengths: [9], mobileStartDigits: ["6", "7", "8"] },
  "234": { localLengths: [10], mobileStartDigits: ["7", "8", "9"] },
  "254": { localLengths: [9], mobileStartDigits: ["1", "7"] },
  "233": { localLengths: [9], mobileStartDigits: ["2", "5"] },
  "251": { localLengths: [9], mobileStartDigits: ["7", "9"] },
  "255": { localLengths: [9], mobileStartDigits: ["6", "7"] },
  "256": { localLengths: [9], mobileStartDigits: ["7"] },
  "237": { localLengths: [9], mobileStartDigits: ["6"] },
  "225": { localLengths: [10] },
  "221": { localLengths: [9], mobileStartDigits: ["7"] },
  "252": { localLengths: [9], mobileStartDigits: ["6", "7"] },
  "250": { localLengths: [9], mobileStartDigits: ["7"] },
  // Oceania
  "61":  { localLengths: [9], mobileStartDigits: ["4"] },
  "64":  { localLengths: [8, 9, 10], mobileStartDigits: ["2"] }
};

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

  /**
   * Find the country code prefix for a normalized number.
   * Checks 3-digit, 2-digit, then 1-digit prefixes against PHONE_RULES.
   * @param {string} normalized - Digits-only phone number.
   * @returns {string|null} Country code or null if not found.
   */
  findCountryCode(normalized) {
    if (normalized.length >= 3) {
      var cc3 = normalized.slice(0, 3);
      if (PHONE_RULES[cc3]) return cc3;
    }
    if (normalized.length >= 2) {
      var cc2 = normalized.slice(0, 2);
      if (PHONE_RULES[cc2]) return cc2;
    }
    if (normalized.length >= 1) {
      var cc1 = normalized.slice(0, 1);
      if (PHONE_RULES[cc1]) return cc1;
    }
    return null;
  },

  /**
   * Validate phone number format against country-specific rules.
   * Checks local part length and mobile start digits.
   * @param {string} phone - Normalized digits-only number.
   * @returns {{valid: boolean, reason: string}}
   */
  validateFormat(phone) {
    var cc = this.findCountryCode(phone);
    if (!cc) return { valid: true, reason: '' }; // No rule, allow through

    var rule = PHONE_RULES[cc];
    var local = phone.slice(cc.length);

    // Check local length
    if (rule.localLengths.indexOf(local.length) === -1) {
      return { valid: false, reason: 'err_invalid_phone' };
    }

    // Check mobile start digits (if rule specifies them)
    if (rule.mobileStartDigits && rule.mobileStartDigits.length > 0) {
      var hasValidPrefix = rule.mobileStartDigits.some(function(prefix) {
        return local.startsWith(prefix);
      });
      if (!hasValidPrefix) {
        return { valid: false, reason: 'err_invalid_phone' };
      }
    }

    return { valid: true, reason: '' };
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
    if (!/^\d{7,15}$/.test(phone)) return { valid: false, reason: 'err_invalid_phone' };
    if (coverage.length > 0) {
      const hasCoverage = coverage.some(function(prefix) { return phone.startsWith(prefix); });
      if (!hasCoverage) return { valid: false, reason: 'err_unsupported_country' };
    }
    // Country-specific format validation (length + mobile start digits)
    var formatCheck = this.validateFormat(phone);
    if (!formatCheck.valid) {
      // Retry: strip redundant local leading zero (e.g. 9650598... -> 965598...)
      var cc = this.findCountryCode(phone);
      if (cc) {
        var local = phone.slice(cc.length);
        if (local.startsWith('0')) {
          var stripped = cc + local.slice(1);
          var retryCheck = this.validateFormat(stripped);
          if (retryCheck.valid) {
            // Number is valid after stripping local zero, but we need to
            // update the phone in the caller. Return a special flag.
            return { valid: true, reason: '', corrected: stripped };
          }
        }
      }
      return formatCheck;
    }

    return { valid: true, reason: '' };
  },

  /**
   * Process phone list: normalize, validate, and conditionally dedup.
   * @param {Array} entries - [{phone, rowIndex}]
   * @param {string} defaultCountryCode
   * @param {string[]} coverage
   * @param {boolean} skipDedup - If true, allow same number multiple times (for personalized messages).
   */
  processAll(entries, defaultCountryCode, coverage, skipDedup) {
    const valid = [];
    const skipped = [];
    const seen = {};
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      let normalized = this.normalize(entry.phone, defaultCountryCode, coverage);
      const validation = this.validate(normalized, coverage);
      if (!validation.valid) {
        skipped.push({ phone: entry.phone, rowIndex: entry.rowIndex, reason: validation.reason });
        continue;
      }
      // Use corrected number if local leading zero was stripped
      if (validation.corrected) {
        normalized = validation.corrected;
      }
      if (!skipDedup && seen[normalized]) {
        skipped.push({ phone: entry.phone, rowIndex: entry.rowIndex, reason: 'err_duplicate' });
        continue;
      }
      seen[normalized] = true;
      valid.push({ phone: normalized, rowIndex: entry.rowIndex });
    }
    return { valid: valid, skipped: skipped };
  }
};
