# kwtSMS for Google Sheets

Send bulk SMS from your Google Sheets spreadsheet using kwtSMS.

## Features

- Bulk SMS from sheet rows with column placeholders
- Arabic and English UI with RTL support
- Phone number normalization (Arabic digits, country codes)
- Message cleaning (emoji, hidden characters, HTML)
- Delivery status tracking per row
- Sent message logs in a dedicated sheet tab
- kwtSMS test mode support

## Requirements

- A kwtSMS account with API credentials (kwtsms.com)
- Google Sheets

## Development

Install clasp globally:

    npm install -g @google/clasp

Login and create project:

    clasp login
    clasp create --type sheets --title "kwtSMS for Google Sheets" --rootDir src

Push code:

    clasp push

Open in browser:

    clasp open

## License

Proprietary. All rights reserved.
