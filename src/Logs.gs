/**
 * Logs.gs - "kwtSMS Logs" sheet tab management.
 *
 * Auto-creates the log tab on first use. Appends a row per send attempt.
 * Columns: Timestamp | Phone | Message | Sender ID | Status | Error | Message ID | Credits
 *
 * Related files: Send.gs (calls appendBatch), i18n.gs (translated headers)
 */

const LOG_SHEET_NAME = 'kwtSMS Logs';
const LOG_COLUMNS = 8;

const SmsLogs = {

  getSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(LOG_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(LOG_SHEET_NAME);
      const headers = [
        t('logs_header_timestamp'), t('logs_header_phone'), t('logs_header_message'),
        t('logs_header_senderid'), t('logs_header_status'), t('logs_header_error'),
        t('logs_header_msgid'), t('logs_header_credits')
      ];
      sheet.getRange(1, 1, 1, LOG_COLUMNS).setValues([headers]).setFontWeight('bold');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 160);
      sheet.setColumnWidth(2, 130);
      sheet.setColumnWidth(3, 250);
      sheet.setColumnWidth(4, 100);
      sheet.setColumnWidth(5, 80);
      sheet.setColumnWidth(6, 200);
      sheet.setColumnWidth(7, 260);
      sheet.setColumnWidth(8, 80);
    }
    return sheet;
  },

  appendBatch(entries, senderId) {
    if (!entries || entries.length === 0) return;
    const sheet = this.getSheet();
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Kuwait', 'yyyy-MM-dd HH:mm:ss');
    const lastRow = sheet.getLastRow();
    const rows = entries.map(function(entry) {
      return [
        timestamp,
        entry.phone || '',
        (entry.message || '').substring(0, 100),
        senderId || '',
        entry.status || '',
        entry.error || '',
        entry.msgId || '',
        entry.credits || 0
      ];
    });
    sheet.getRange(lastRow + 1, 1, rows.length, LOG_COLUMNS).setValues(rows);
  }
};
