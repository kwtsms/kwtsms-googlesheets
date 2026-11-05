# Changelog

## [1.0.0] - Unreleased

### Changed
- Tests no longer use a sample Kuwait mobile number: mock values use 99912345678 and the live send test reads the KWTSMS_TEST_NUMBER script property

### Docs
- Test code comments: test=1 messages are queued but not delivered; their credits are held until you delete them from the Sending Queue (previously described as not charged)

### Added
- Requests to kwtSMS carry the integration name and version (no personal data) so kwtSMS can see which integrations are in use.
- Initial release
- Bulk SMS sending from Google Sheets
- Column placeholder support in messages
- English and Arabic UI with RTL
- Phone number normalization and validation
- Message cleaning (emoji, hidden chars, HTML)
- Delivery status tracking in sheet columns
- kwtSMS Logs sheet tab
- Test mode support
