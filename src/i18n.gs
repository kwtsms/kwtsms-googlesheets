/**
 * i18n.gs - Internationalization: English + Arabic translations.
 *
 * Usage: t('key') returns translated string for current language.
 * Language detection: saved preference > Google locale > English default.
 *
 * Related files: Store.gs (saves language preference), Sidebar.html (displays translated text),
 *                Logs.gs (translates log headers), Send.gs (translates status values)
 */

const TRANSLATIONS = {
  en: {
    app_name: 'kwtSMS',
    lang_toggle: 'AR',
    login_title: 'Connect to kwtSMS',
    username_label: 'Username',
    username_placeholder: 'API username',
    password_label: 'Password',
    password_placeholder: 'API password',
    login_button: 'Login',
    logging_in: 'Connecting...',
    login_success: 'Connected successfully',
    login_failed: 'Login failed',
    logout_button: 'Logout',
    reload_button: 'Reload',
    balance_label: 'Balance',
    balance_credits: 'credits',
    senderid_label: 'Sender ID',
    country_code_label: 'Default Country Code',
    test_mode_label: 'Test Mode',
    test_mode_banner: 'TEST MODE',
    last_sync_label: 'Last sync',
    settings_title: 'Settings',
    send_title: 'Send SMS',
    phone_column_label: 'Phone Column',
    phone_column_placeholder: 'Select column...',
    message_label: 'Message',
    message_placeholder: 'Type your message. Use {Column Name} for placeholders.',
    preview_title: 'Preview (first 3 rows)',
    send_button: 'Send SMS',
    sending: 'Sending...',
    send_confirm: 'Send SMS to {count} recipients?',
    send_partial: 'You have {balance} credits but {count} recipients. Send to the first {balance}?',
    send_personalized_warn: 'Personalized messages require individual sends. Estimated time: {time}s for {count} messages. Proceed?',
    send_complete: 'Complete: {sent} sent, {failed} failed, {skipped} skipped. Credits used: {credits}',
    no_valid_recipients: 'No valid recipients found',
    insufficient_balance: 'Insufficient balance (0 credits)',
    status_sent: 'Sent',
    status_failed: 'Failed',
    status_skipped: 'Skipped',
    err_invalid_phone: 'Invalid phone number',
    err_unsupported_country: 'Unsupported country',
    err_duplicate: 'Duplicate number',
    err_empty_phone: 'Empty phone number',
    logs_title: 'Logs',
    logs_view: 'View kwtSMS Logs sheet',
    logs_header_timestamp: 'Timestamp',
    logs_header_phone: 'Phone',
    logs_header_message: 'Message',
    logs_header_senderid: 'Sender ID',
    logs_header_status: 'Status',
    logs_header_error: 'Error',
    logs_header_msgid: 'Message ID',
    logs_header_credits: 'Credits',
    col_status: 'Status',
    col_error: 'Error',
    col_msgid: 'Message ID',
    err_not_logged_in: 'Please login first',
    err_no_phone_column: 'Please select a phone column',
    err_empty_message: 'Please enter a message',
    err_api_error: 'API Error',
    err_network: 'Network error. Please check your connection.',
    err_unknown: 'An unexpected error occurred'
  },
  ar: {
    app_name: 'kwtSMS',
    lang_toggle: 'EN',
    login_title: '\u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0640 kwtSMS',
    username_label: '\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645',
    username_placeholder: '\u0627\u0633\u0645 \u0645\u0633\u062a\u062e\u062f\u0645 API',
    password_label: '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
    password_placeholder: '\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 API',
    login_button: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
    logging_in: '\u062c\u0627\u0631\u064a \u0627\u0644\u0627\u062a\u0635\u0627\u0644...',
    login_success: '\u062a\u0645 \u0627\u0644\u0627\u062a\u0635\u0627\u0644 \u0628\u0646\u062c\u0627\u062d',
    login_failed: '\u0641\u0634\u0644 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
    logout_button: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c',
    reload_button: '\u062a\u062d\u062f\u064a\u062b',
    balance_label: '\u0627\u0644\u0631\u0635\u064a\u062f',
    balance_credits: '\u0631\u0635\u064a\u062f',
    senderid_label: '\u0627\u0633\u0645 \u0627\u0644\u0645\u0631\u0633\u0644',
    country_code_label: '\u0631\u0645\u0632 \u0627\u0644\u062f\u0648\u0644\u0629 \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a',
    test_mode_label: '\u0648\u0636\u0639 \u0627\u0644\u0627\u062e\u062a\u0628\u0627\u0631',
    test_mode_banner: '\u0648\u0636\u0639 \u0627\u0644\u0627\u062e\u062a\u0628\u0627\u0631',
    last_sync_label: '\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b',
    settings_title: '\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a',
    send_title: '\u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629',
    phone_column_label: '\u0639\u0645\u0648\u062f \u0627\u0644\u0647\u0627\u062a\u0641',
    phone_column_placeholder: '\u0627\u062e\u062a\u0631 \u0627\u0644\u0639\u0645\u0648\u062f...',
    message_label: '\u0627\u0644\u0631\u0633\u0627\u0644\u0629',
    message_placeholder: '\u0627\u0643\u062a\u0628 \u0631\u0633\u0627\u0644\u062a\u0643. \u0627\u0633\u062a\u062e\u062f\u0645 {\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u0648\u062f} \u0644\u0644\u0645\u062a\u063a\u064a\u0631\u0627\u062a.',
    preview_title: '\u0645\u0639\u0627\u064a\u0646\u0629 (\u0623\u0648\u0644 3 \u0635\u0641\u0648\u0641)',
    send_button: '\u0625\u0631\u0633\u0627\u0644 SMS',
    sending: '\u062c\u0627\u0631\u064a \u0627\u0644\u0625\u0631\u0633\u0627\u0644...',
    send_confirm: '\u0625\u0631\u0633\u0627\u0644 SMS \u0625\u0644\u0649 {count} \u0645\u0633\u062a\u0644\u0645\u061f',
    send_partial: '\u0644\u062f\u064a\u0643 {balance} \u0631\u0635\u064a\u062f \u0648\u0644\u0643\u0646 {count} \u0645\u0633\u062a\u0644\u0645. \u0625\u0631\u0633\u0627\u0644 \u0644\u0623\u0648\u0644 {balance}\u061f',
    send_personalized_warn: '\u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0645\u062e\u0635\u0635\u0629 \u062a\u062a\u0637\u0644\u0628 \u0625\u0631\u0633\u0627\u0644 \u0641\u0631\u062f\u064a. \u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u0642\u062f\u0631: {time} \u062b\u0627\u0646\u064a\u0629 \u0644\u0640 {count} \u0631\u0633\u0627\u0644\u0629. \u0645\u062a\u0627\u0628\u0639\u0629\u061f',
    send_complete: '\u0627\u0643\u062a\u0645\u0644: {sent} \u0645\u0631\u0633\u0644, {failed} \u0641\u0634\u0644, {skipped} \u062a\u062e\u0637\u064a. \u0627\u0644\u0631\u0635\u064a\u062f \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645: {credits}',
    no_valid_recipients: '\u0644\u0627 \u064a\u0648\u062c\u062f \u0645\u0633\u062a\u0644\u0645\u0648\u0646 \u0635\u0627\u0644\u062d\u0648\u0646',
    insufficient_balance: '\u0631\u0635\u064a\u062f \u063a\u064a\u0631 \u0643\u0627\u0641\u064d (0 \u0631\u0635\u064a\u062f)',
    status_sent: '\u0645\u0631\u0633\u0644',
    status_failed: '\u0641\u0634\u0644',
    status_skipped: '\u062a\u062e\u0637\u064a',
    err_invalid_phone: '\u0631\u0642\u0645 \u0647\u0627\u062a\u0641 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d',
    err_unsupported_country: '\u062f\u0648\u0644\u0629 \u063a\u064a\u0631 \u0645\u062f\u0639\u0648\u0645\u0629',
    err_duplicate: '\u0631\u0642\u0645 \u0645\u0643\u0631\u0631',
    err_empty_phone: '\u0631\u0642\u0645 \u0647\u0627\u062a\u0641 \u0641\u0627\u0631\u063a',
    logs_title: '\u0627\u0644\u0633\u062c\u0644\u0627\u062a',
    logs_view: '\u0639\u0631\u0636 \u0633\u062c\u0644 kwtSMS',
    logs_header_timestamp: '\u0627\u0644\u0648\u0642\u062a',
    logs_header_phone: '\u0627\u0644\u0647\u0627\u062a\u0641',
    logs_header_message: '\u0627\u0644\u0631\u0633\u0627\u0644\u0629',
    logs_header_senderid: '\u0627\u0644\u0645\u0631\u0633\u0644',
    logs_header_status: '\u0627\u0644\u062d\u0627\u0644\u0629',
    logs_header_error: '\u0627\u0644\u062e\u0637\u0623',
    logs_header_msgid: '\u0645\u0639\u0631\u0641 \u0627\u0644\u0631\u0633\u0627\u0644\u0629',
    logs_header_credits: '\u0627\u0644\u0631\u0635\u064a\u062f',
    col_status: '\u0627\u0644\u062d\u0627\u0644\u0629',
    col_error: '\u0627\u0644\u062e\u0637\u0623',
    col_msgid: '\u0645\u0639\u0631\u0641 \u0627\u0644\u0631\u0633\u0627\u0644\u0629',
    err_not_logged_in: '\u064a\u0631\u062c\u0649 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0623\u0648\u0644\u0627\u064b',
    err_no_phone_column: '\u064a\u0631\u062c\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 \u0639\u0645\u0648\u062f \u0627\u0644\u0647\u0627\u062a\u0641',
    err_empty_message: '\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0631\u0633\u0627\u0644\u0629',
    err_api_error: '\u062e\u0637\u0623 API',
    err_network: '\u062e\u0637\u0623 \u0641\u064a \u0627\u0644\u0634\u0628\u0643\u0629. \u064a\u0631\u062c\u0649 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0627\u062a\u0635\u0627\u0644.',
    err_unknown: '\u062d\u062f\u062b \u062e\u0637\u0623 \u063a\u064a\u0631 \u0645\u062a\u0648\u0642\u0639'
  }
};

function getLang() {
  const saved = Store.getLanguage();
  if (saved === 'en' || saved === 'ar') return saved;
  try {
    const locale = Session.getActiveUserLocale();
    if (locale && locale.startsWith('ar')) return 'ar';
  } catch (e) {}
  return 'en';
}

function setLang(lang) {
  if (lang === 'en' || lang === 'ar') { Store.saveLanguage(lang); }
}

function t(key, params) {
  const lang = getLang();
  const str = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || (TRANSLATIONS.en[key]) || key;
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, function(match, name) {
    return params[name] !== undefined ? String(params[name]) : match;
  });
}

function isRtl() { return getLang() === 'ar'; }

function getI18nBundle() {
  const lang = getLang();
  return { lang: lang, rtl: lang === 'ar', strings: TRANSLATIONS[lang] || TRANSLATIONS.en };
}
