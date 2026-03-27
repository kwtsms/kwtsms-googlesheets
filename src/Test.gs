/**
 * Test.gs - Integration and unit tests for kwtSMS Google Sheets Add-on.
 *
 * Run individual test functions or runAllTests() from the Apps Script editor.
 * Check Execution Log (View > Logs) for PASS/FAIL results.
 *
 * Unit tests use pure functions only (no API calls, no side effects).
 * API tests require valid credentials saved via Store and use test=1 to avoid charges.
 *
 * Related files: Phone.gs, Message.gs, Api.gs, Store.gs, i18n.gs
 */

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Log a PASS or FAIL line to the Execution Log.
 *
 * @param {boolean} condition - true means the test passed.
 * @param {string}  testName  - short identifier shown in the log.
 * @param {string}  [detail]  - extra context shown on failure.
 */
function assert(condition, testName, detail) {
  if (condition) {
    Logger.log('PASS: ' + testName);
  } else {
    Logger.log('FAIL: ' + testName + (detail ? ' | ' + detail : ''));
  }
}

// ---------------------------------------------------------------------------
// Phone tests
// ---------------------------------------------------------------------------

function testPhoneNormalization() {
  Logger.log('--- testPhoneNormalization ---');
  const coverage = ['965', '966', '971'];

  // Strip leading +
  assert(
    PhoneUtils.normalize('+96598765432', '965', coverage) === '96598765432',
    'normalize: strip leading +'
  );

  // Strip leading 00
  assert(
    PhoneUtils.normalize('0096598765432', '965', coverage) === '96598765432',
    'normalize: strip leading 00'
  );

  // Strip spaces
  assert(
    PhoneUtils.normalize('965 9876 5432', '965', coverage) === '96598765432',
    'normalize: strip spaces'
  );

  // Strip dashes
  assert(
    PhoneUtils.normalize('965-9876-5432', '965', coverage) === '96598765432',
    'normalize: strip dashes'
  );

  // Arabic-Indic digits (U+0660-U+0669)
  assert(
    PhoneUtils.normalize('\u0669\u0666\u0665\u0669\u0668\u0667\u0666\u0665\u0664\u0663\u0662', '965', coverage) === '96598765432',
    'normalize: Arabic-Indic digits'
  );

  // Extended Arabic-Indic digits (U+06F0-U+06F9)
  assert(
    PhoneUtils.normalize('\u06F9\u06F6\u06F5\u06F9\u06F8\u06F7\u06F6\u06F5\u06F4\u06F3\u06F2', '965', coverage) === '96598765432',
    'normalize: extended Arabic digits'
  );

  // Country code prepend when not present
  assert(
    PhoneUtils.normalize('98765432', '965', coverage) === '96598765432',
    'normalize: prepend country code'
  );

  // Number already has country code, should not double-prepend
  assert(
    PhoneUtils.normalize('96598765432', '965', coverage) === '96598765432',
    'normalize: no double-prepend when country code present'
  );

  // Empty string input
  assert(
    PhoneUtils.normalize('', '965', coverage) === '',
    'normalize: empty string returns empty'
  );

  // Null input
  assert(
    PhoneUtils.normalize(null, '965', coverage) === '',
    'normalize: null returns empty'
  );
}

function testPhoneValidation() {
  Logger.log('--- testPhoneValidation ---');
  const coverage = ['965', '966', '971'];

  // Valid Kuwait number
  const kwResult = PhoneUtils.validate('96598765432', coverage);
  assert(kwResult.valid === true, 'validate: valid Kuwait number');

  // Valid Saudi number
  const saResult = PhoneUtils.validate('966512345678', coverage);
  assert(saResult.valid === true, 'validate: valid Saudi number');

  // Valid UAE number
  const aeResult = PhoneUtils.validate('971501234567', coverage);
  assert(aeResult.valid === true, 'validate: valid UAE number');

  // Unsupported country prefix
  const unsupportedResult = PhoneUtils.validate('12025550100', coverage);
  assert(
    unsupportedResult.valid === false && unsupportedResult.reason === 'err_unsupported_country',
    'validate: unsupported country',
    'reason=' + unsupportedResult.reason
  );

  // Too short (fewer than 8 digits)
  const shortResult = PhoneUtils.validate('9655555', coverage);
  assert(
    shortResult.valid === false && shortResult.reason === 'err_invalid_phone',
    'validate: too short',
    'reason=' + shortResult.reason
  );

  // Empty string
  const emptyResult = PhoneUtils.validate('', coverage);
  assert(
    emptyResult.valid === false && emptyResult.reason === 'err_empty_phone',
    'validate: empty string',
    'reason=' + emptyResult.reason
  );

  // Non-digit characters (should already be stripped by normalize, but validate rejects raw)
  const nonDigitResult = PhoneUtils.validate('9659876ABCD', coverage);
  assert(
    nonDigitResult.valid === false,
    'validate: non-digit characters rejected'
  );
}

function testPhoneDedup() {
  Logger.log('--- testPhoneDedup ---');
  const coverage = ['965', '966', '971'];

  // Two identical entries after normalization: second is skipped
  const entries = [
    { phone: '+96598765432', rowIndex: 2 },
    { phone: '96598765432',  rowIndex: 3 },
    { phone: '966512345678', rowIndex: 4 }
  ];
  const result = PhoneUtils.processAll(entries, '965', coverage);

  assert(result.valid.length === 2, 'dedup: two unique numbers kept', 'got ' + result.valid.length);
  assert(result.skipped.length === 1, 'dedup: one duplicate skipped', 'got ' + result.skipped.length);

  // First occurrence kept (rowIndex 2, not 3)
  assert(result.valid[0].rowIndex === 2, 'dedup: first occurrence preserved');

  // Skipped entry has reason err_duplicate
  assert(
    result.skipped[0].reason === 'err_duplicate',
    'dedup: skip reason is err_duplicate',
    'got ' + result.skipped[0].reason
  );
}

// ---------------------------------------------------------------------------
// Message tests
// ---------------------------------------------------------------------------

function testMessageClean() {
  Logger.log('--- testMessageClean ---');

  // Strip HTML tags
  assert(
    MessageUtils.clean('<b>Hello</b> <i>World</i>') === 'Hello World',
    'clean: strip HTML tags'
  );

  // Strip emoji
  assert(
    MessageUtils.clean('Hello \uD83D\uDE00 World') === 'Hello  World',
    'clean: strip emoji'
  );

  // Strip BOM (U+FEFF)
  assert(
    MessageUtils.clean('\uFEFFHello') === 'Hello',
    'clean: strip BOM'
  );

  // Strip zero-width space (U+200B)
  assert(
    MessageUtils.clean('Hel\u200Blo') === 'Hello',
    'clean: strip zero-width space'
  );

  // Arabic digits converted to Latin
  assert(
    MessageUtils.clean('\u0661\u0662\u0663') === '123',
    'clean: Arabic digits to Latin'
  );

  // Trim leading and trailing whitespace
  assert(
    MessageUtils.clean('  hello  ') === 'hello',
    'clean: trim whitespace'
  );

  // Empty string returns empty
  assert(
    MessageUtils.clean('') === '',
    'clean: empty string returns empty'
  );

  // Null returns empty
  assert(
    MessageUtils.clean(null) === '',
    'clean: null returns empty'
  );
}

function testMessagePlaceholders() {
  Logger.log('--- testMessagePlaceholders ---');

  // Simple single placeholder replace
  assert(
    MessageUtils.resolve('Hello {Name}', { Name: 'Ahmad' }) === 'Hello Ahmad',
    'resolve: simple single placeholder'
  );

  // Two placeholders replaced
  assert(
    MessageUtils.resolve('{Name} owes {Amount} KD', { Name: 'Sara', Amount: '50' }) === 'Sara owes 50 KD',
    'resolve: two placeholders'
  );

  // Unmatched placeholder left as-is
  assert(
    MessageUtils.resolve('Hello {Name}', { Other: 'x' }) === 'Hello {Name}',
    'resolve: unmatched placeholder left as-is'
  );

  // No placeholders: template returned unchanged
  assert(
    MessageUtils.resolve('Hello World', { Name: 'Ahmad' }) === 'Hello World',
    'resolve: no placeholders unchanged'
  );

  // hasPlaceholders: true when template contains {…}
  assert(
    MessageUtils.hasPlaceholders('Hello {Name}') === true,
    'hasPlaceholders: true for {Name}'
  );

  // hasPlaceholders: false for plain text
  assert(
    MessageUtils.hasPlaceholders('Hello World') === false,
    'hasPlaceholders: false for plain text'
  );

  // hasPlaceholders: false for empty
  assert(
    MessageUtils.hasPlaceholders('') === false,
    'hasPlaceholders: false for empty'
  );

  // getPlaceholderNames: extracts unique names in order
  const names = MessageUtils.getPlaceholderNames('{Name} sent {Amount} to {Name}');
  assert(
    names.length === 2 && names[0] === 'Name' && names[1] === 'Amount',
    'getPlaceholderNames: unique names in order',
    'got ' + JSON.stringify(names)
  );

  // getPlaceholderNames: empty array for no placeholders
  const noNames = MessageUtils.getPlaceholderNames('Hello World');
  assert(
    noNames.length === 0,
    'getPlaceholderNames: empty array for no placeholders'
  );
}

// ---------------------------------------------------------------------------
// i18n tests
// ---------------------------------------------------------------------------

function testI18n() {
  Logger.log('--- testI18n ---');

  // t() returns a string
  const appName = t('app_name');
  assert(typeof appName === 'string' && appName.length > 0, 'i18n: t() returns non-empty string');

  // Placeholder replacement in t()
  const sendConfirm = t('send_confirm', { count: 5 });
  assert(
    typeof sendConfirm === 'string' && sendConfirm.indexOf('5') !== -1,
    'i18n: t() replaces {count} placeholder',
    'got: ' + sendConfirm
  );

  // Missing key returns the key itself
  const missingKey = t('this_key_does_not_exist_xyz');
  assert(
    missingKey === 'this_key_does_not_exist_xyz',
    'i18n: missing key returns key',
    'got: ' + missingKey
  );

  // getI18nBundle returns object with lang and strings properties
  const bundle = getI18nBundle();
  assert(
    bundle && typeof bundle.lang === 'string',
    'i18n: bundle has lang property',
    'lang=' + (bundle && bundle.lang)
  );
  assert(
    bundle && typeof bundle.strings === 'object' && bundle.strings !== null,
    'i18n: bundle has strings object'
  );
  assert(
    bundle && typeof bundle.rtl === 'boolean',
    'i18n: bundle has rtl boolean'
  );

  // Bundle lang is either 'en' or 'ar'
  assert(
    bundle && (bundle.lang === 'en' || bundle.lang === 'ar'),
    'i18n: bundle lang is en or ar',
    'got: ' + (bundle && bundle.lang)
  );
}

// ---------------------------------------------------------------------------
// API tests (require saved credentials, use test mode)
// ---------------------------------------------------------------------------

function testApiBalance() {
  Logger.log('--- testApiBalance ---');
  const result = KwtSmsApi.balance();
  assert(result.success === true, 'api balance: success', result.error);
  assert(typeof result.available === 'number', 'api balance: available is number', 'got ' + typeof result.available);
  assert(typeof result.purchased === 'number', 'api balance: purchased is number', 'got ' + typeof result.purchased);
}

function testApiSenderIds() {
  Logger.log('--- testApiSenderIds ---');
  const result = KwtSmsApi.senderIds();
  assert(result.success === true, 'api senderIds: success', result.error);
  assert(Array.isArray(result.senderIds), 'api senderIds: senderIds is array', 'got ' + typeof result.senderIds);
}

function testApiCoverage() {
  Logger.log('--- testApiCoverage ---');
  const result = KwtSmsApi.coverage();
  assert(result.success === true, 'api coverage: success', result.error);
  assert(Array.isArray(result.coverage), 'api coverage: coverage is array', 'got ' + typeof result.coverage);
}

function testApiSendTest() {
  Logger.log('--- testApiSendTest ---');
  const settings = Store.getSettings();
  const sender = settings.selectedSenderId || 'KWT-SMS';

  // test=1 means the API validates the request but does not deliver or charge credits
  const result = KwtSmsApi.send('96598765432', 'Test message from kwtSMS Add-on', sender, true);
  assert(result.success === true, 'api send test=1: success', result.error);
  assert(typeof result.msgId === 'string' && result.msgId.length > 0, 'api send test=1: msg-id returned', 'got ' + result.msgId);
}

// ---------------------------------------------------------------------------
// Run all tests
// ---------------------------------------------------------------------------

/**
 * Run the full test suite.
 *
 * Unit tests always run. API tests are skipped when no credentials are saved
 * so the function is safe to call even before logging in.
 */
function runAllTests() {
  Logger.log('========== kwtSMS Add-on Test Suite ==========');

  testPhoneNormalization();
  testPhoneValidation();
  testPhoneDedup();
  testMessageClean();
  testMessagePlaceholders();
  testI18n();

  if (Store.isLoggedIn()) {
    Logger.log('--- API tests (credentials found) ---');
    testApiBalance();
    testApiSenderIds();
    testApiCoverage();
    testApiSendTest();
  } else {
    Logger.log('SKIP: API tests (no credentials saved - login first to run API tests)');
  }

  Logger.log('========== Test Suite Complete ==========');
}
