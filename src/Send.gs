/**
 * Send.gs - Bulk SMS send orchestration.
 *
 * Pipeline: read sheet -> normalize -> dedup -> validate -> coverage filter
 * -> balance check -> clean message -> resolve placeholders -> smart batch
 * -> send API -> write results to sheet + logs -> summary.
 *
 * Related files: Phone.gs, Message.gs, Api.gs, Logs.gs, Store.gs, Code.gs
 */

const BATCH_SIZE = 200;
const BATCH_DELAY_MS = 200;

const SmsSender = {

  readSheetData() {
    const sheet = SpreadsheetApp.getActiveSheet();
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) return { headers: [], rows: [], sheet: sheet };

    const allData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = allData[0].map(function(h) { return String(h).trim(); });
    return { headers: headers, rows: allData.slice(1), sheet: sheet };
  },

  preview(phoneColumn, messageTemplate, count) {
    count = count || 3;
    const data = this.readSheetData();
    const phoneIdx = data.headers.indexOf(phoneColumn);
    if (phoneIdx === -1) return [];

    const settings = Store.getSettings();
    const coverage = Store.getCoverage();
    const cleanedTemplate = MessageUtils.clean(messageTemplate);
    const results = [];

    for (let i = 0; i < Math.min(count, data.rows.length); i++) {
      const row = data.rows[i];
      const rawPhone = String(row[phoneIdx] || '');
      const normalized = PhoneUtils.normalize(rawPhone, settings.defaultCountryCode, coverage);

      const rowData = {};
      data.headers.forEach(function(h, idx) {
        rowData[h] = row[idx] !== null && row[idx] !== undefined ? String(row[idx]) : '';
      });

      results.push({ phone: normalized || rawPhone, message: MessageUtils.resolve(cleanedTemplate, rowData) });
    }
    return results;
  },

  /**
   * Main send function. Full pipeline.
   * @param {string} phoneColumn
   * @param {string} messageTemplate
   * @param {string} senderId
   * @param {number} [maxRecipients] - Limit for partial balance sends.
   * @returns {{sent: number, failed: number, skipped: number, creditsUsed: number, errors: string[]}}
   */
  sendAll(phoneColumn, messageTemplate, senderId, maxRecipients) {
    const settings = Store.getSettings();
    const coverage = Store.getCoverage();
    const data = this.readSheetData();
    const sheet = data.sheet;
    const headers = data.headers;
    const rows = data.rows;

    const phoneIdx = headers.indexOf(phoneColumn);
    if (phoneIdx === -1) return { sent: 0, failed: 0, skipped: 0, creditsUsed: 0, errors: [t('err_no_phone_column')] };

    const cleanedTemplate = MessageUtils.clean(messageTemplate);
    if (!cleanedTemplate) return { sent: 0, failed: 0, skipped: 0, creditsUsed: 0, errors: [t('err_empty_message')] };

    const hasPlaceholders = MessageUtils.hasPlaceholders(cleanedTemplate);

    // Build entries
    const entries = [];
    for (let i = 0; i < rows.length; i++) {
      const phone = String(rows[i][phoneIdx] || '').trim();
      if (!phone) continue;
      const rowData = {};
      headers.forEach(function(h, idx) {
        rowData[h] = rows[i][idx] !== null && rows[i][idx] !== undefined ? String(rows[i][idx]) : '';
      });
      entries.push({ phone: phone, rowIndex: i + 2, rowData: rowData });
    }

    // Normalize + validate + dedup
    const phoneEntries = entries.map(function(e) { return { phone: e.phone, rowIndex: e.rowIndex }; });
    const processed = PhoneUtils.processAll(phoneEntries, settings.defaultCountryCode, coverage);
    const validMap = {};
    processed.valid.forEach(function(v) { validMap[v.rowIndex] = v.phone; });

    // Result column positions (after existing data columns)
    const statusColIdx = headers.length + 1;
    const errorColIdx = headers.length + 2;
    const msgIdColIdx = headers.length + 3;

    // Write result column headers
    sheet.getRange(1, statusColIdx).setValue(t('col_status'));
    sheet.getRange(1, errorColIdx).setValue(t('col_error'));
    sheet.getRange(1, msgIdColIdx).setValue(t('col_msgid'));

    const logEntries = [];
    let skippedCount = 0;

    // Write skipped results
    processed.skipped.forEach(function(s) {
      sheet.getRange(s.rowIndex, statusColIdx).setValue(t('status_skipped'));
      sheet.getRange(s.rowIndex, errorColIdx).setValue(t(s.reason));
      sheet.getRange(s.rowIndex, msgIdColIdx).setValue('');
      logEntries.push({ phone: s.phone, message: cleanedTemplate.substring(0, 100), status: t('status_skipped'), error: t(s.reason) });
      skippedCount++;
    });

    // Prepare valid send list
    let validEntries = entries.filter(function(e) { return validMap[e.rowIndex]; });
    validEntries = validEntries.map(function(e) {
      return {
        phone: validMap[e.rowIndex],
        rowIndex: e.rowIndex,
        rowData: e.rowData,
        message: hasPlaceholders ? MessageUtils.clean(MessageUtils.resolve(cleanedTemplate, e.rowData)) : cleanedTemplate
      };
    });

    // Apply maxRecipients limit
    if (maxRecipients && maxRecipients > 0 && validEntries.length > maxRecipients) {
      var trimmed = validEntries.slice(maxRecipients);
      validEntries = validEntries.slice(0, maxRecipients);
      trimmed.forEach(function(e) {
        sheet.getRange(e.rowIndex, statusColIdx).setValue(t('status_skipped'));
        sheet.getRange(e.rowIndex, errorColIdx).setValue(t('insufficient_balance'));
        sheet.getRange(e.rowIndex, msgIdColIdx).setValue('');
        skippedCount++;
      });
    }

    if (validEntries.length === 0) {
      SmsLogs.appendBatch(logEntries, senderId);
      return { sent: 0, failed: 0, skipped: skippedCount, creditsUsed: 0, errors: [] };
    }

    // Smart batching: group by resolved message
    const messageGroups = {};
    validEntries.forEach(function(e) {
      if (!messageGroups[e.message]) messageGroups[e.message] = [];
      messageGroups[e.message].push(e);
    });

    // Send
    let sentCount = 0, failedCount = 0, totalCredits = 0;
    const errors = [];
    let batchIndex = 0;

    const groupKeys = Object.keys(messageGroups);
    for (let g = 0; g < groupKeys.length; g++) {
      const message = groupKeys[g];
      const group = messageGroups[message];

      for (let i = 0; i < group.length; i += BATCH_SIZE) {
        const chunk = group.slice(i, i + BATCH_SIZE);
        const phones = chunk.map(function(e) { return e.phone; }).join(',');

        if (batchIndex > 0) Utilities.sleep(BATCH_DELAY_MS);
        batchIndex++;

        const result = KwtSmsApi.send(phones, message, senderId, settings.testMode);

        if (result.success) {
          Store.saveBalance(result.balanceAfter);
          totalCredits += result.pointsCharged;
          chunk.forEach(function(e) {
            sheet.getRange(e.rowIndex, statusColIdx).setValue(t('status_sent'));
            sheet.getRange(e.rowIndex, errorColIdx).setValue('');
            sheet.getRange(e.rowIndex, msgIdColIdx).setValue(result.msgId);
            logEntries.push({ phone: e.phone, message: message, status: t('status_sent'), msgId: result.msgId, credits: result.pointsCharged > 0 ? Math.round(result.pointsCharged / chunk.length) : 0 });
          });
          sentCount += chunk.length;
        } else {
          errors.push(result.error);
          chunk.forEach(function(e) {
            sheet.getRange(e.rowIndex, statusColIdx).setValue(t('status_failed'));
            sheet.getRange(e.rowIndex, errorColIdx).setValue(result.error);
            sheet.getRange(e.rowIndex, msgIdColIdx).setValue('');
            logEntries.push({ phone: e.phone, message: message, status: t('status_failed'), error: result.error });
          });
          failedCount += chunk.length;
        }
      }
    }

    SmsLogs.appendBatch(logEntries, senderId);
    return { sent: sentCount, failed: failedCount, skipped: skippedCount, creditsUsed: totalCredits, errors: errors };
  }
};
