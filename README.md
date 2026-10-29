# kwtSMS for Google Sheets

[![Version](https://img.shields.io/badge/version-1.0.0-FFA200)](https://github.com/kwtsms/kwtsms-googlesheets/releases/tag/v1.0.0)
[![Google Sheets](https://img.shields.io/badge/Google%20Sheets-Add--on-34A853?logo=google-sheets&logoColor=white)](https://workspace.google.com/marketplace)
[![Apps Script](https://img.shields.io/badge/Apps%20Script-V8-4285F4?logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![License](https://img.shields.io/badge/license-Proprietary-lightgrey)](LICENSE)
[![kwtSMS](https://img.shields.io/badge/Powered%20by-kwtSMS-FFA200)](https://www.kwtsms.com)
[![Arabic](https://img.shields.io/badge/lang-EN%20%7C%20AR-79CCF2)](https://github.com/kwtsms/kwtsms-googlesheets)

Send bulk SMS from your Google Sheets spreadsheet using [kwtSMS](https://www.kwtsms.com). The first Arabic-native SMS add-on for Google Workspace Marketplace.

## About kwtSMS

[kwtSMS](https://www.kwtsms.com) is a Kuwait-based SMS gateway providing reliable A2P messaging across the GCC and 80+ countries. Trusted by businesses for bulk SMS, OTP delivery, and transactional notifications with Arabic-first support, competitive regional pricing, and 12 official client libraries.

## Features

- **Bulk SMS** from sheet rows with `{Column Name}` placeholders
- **Arabic and English** UI with full RTL support
- **Phone validation** for 83+ countries with per-country rules
- **Phone normalization** (Arabic digits, country code prepend, format cleanup)
- **Message cleaning** (emoji, hidden Unicode, HTML auto-stripped)
- **Smart batching** (200 numbers/call, groups identical messages)
- **Delivery tracking** per row (Status, Error, Message ID columns)
- **Sent message logs** in a dedicated "kwtSMS Logs" sheet tab
- **Test mode** support (no real delivery, credits recoverable)
- **Collapsible sidebar** sections for clean workflow

## How It Works

1. Open the sidebar from **Extensions > kwtSMS for Google Sheets**
2. Login with your kwtSMS API credentials
3. Select the phone number column
4. Compose your message with `{Column Name}` placeholders
5. Preview, then send

Results are written back to your sheet: Status, Error, and Message ID for each row.

## Requirements

- A [kwtSMS](https://www.kwtsms.com) account with API credentials
- Google Sheets

## Development

```bash
npm install -g @google/clasp
clasp login
clasp create --type sheets --title "kwtSMS for Google Sheets" --rootDir src
clasp push
clasp open
```

## Project Structure

```
src/
  Code.gs          Entry points, menu, sidebar handlers
  Api.gs           kwtSMS REST API client
  Phone.gs         Phone validation (83+ countries)
  Message.gs       Message cleaning + placeholders
  Send.gs          Bulk send with smart batching
  Logs.gs          Log sheet tab management
  Store.gs         PropertiesService wrapper
  i18n.gs          EN + AR translations
  Sidebar.html     Sidebar layout
  SidebarCss.html  Branded styles + RTL
  SidebarJs.html   Client-side logic
  Test.gs          Integration tests
```

## Links

- [kwtSMS Website](https://www.kwtsms.com)
- [kwtSMS Developers](https://www.kwtsms.com/developers.html)
- [Support](https://www.kwtsms.com/support.html)

## Security

To report a vulnerability, please [open an issue](https://github.com/kwtsms/kwtsms-googlesheets/issues).

## License

Proprietary. All rights reserved.
