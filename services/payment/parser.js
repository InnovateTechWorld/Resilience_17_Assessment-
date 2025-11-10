function normalizeAndTokenize(instr) {
  if (!instr || typeof instr !== 'string') return [];
  const trimmed = instr.trim();
  if (trimmed === '') return [];
  const toks = trimmed.split(' ').filter((t) => t !== '');
  return toks;
}

function parseInstruction(instr) {
  const toks = normalizeAndTokenize(instr);
  if (toks.length < 6) return { error: 'SY03' };
  if (toks[0].toUpperCase() !== 'DEBIT' && toks[0].toUpperCase() !== 'CREDIT') return { error: 'SY01' };

  // Normalize keywords to uppercase for comparison, but keep accounts case-sensitive
  const normalizedToks = toks.map((t, i) => {
    // Skip account IDs (always positions 5 and 10 for accounts)
    if (i === 5 || i === 10) {
      return t; // Keep account IDs as-is
    }
    return t.toUpperCase();
  });

  let type = null;
  let amount = null;
  let currency = null;
  let debitAccount = null;
  let creditAccount = null;
  let executeBy = null;

  if (normalizedToks[0] === 'DEBIT') {
    // DEBIT format: DEBIT amount currency FROM ACCOUNT debitAccount FOR CREDIT TO ACCOUNT creditAccount [ON date]
    if (normalizedToks.length > 13) return { error: 'SY02' };
    if (
      normalizedToks[1] &&
      normalizedToks[2] &&
      normalizedToks[3] === 'FROM' &&
      normalizedToks[4] === 'ACCOUNT' &&
      normalizedToks[6] === 'FOR' &&
      normalizedToks[7] === 'CREDIT' &&
      normalizedToks[8] === 'TO' &&
      normalizedToks[9] === 'ACCOUNT'
    ) {
      // Validate amount
      const amountToken = normalizedToks[1];
      let isValidAmount = true;
      for (let i = 0; i < amountToken.length; i++) {
        if (amountToken[i] < '0' || amountToken[i] > '9') {
          isValidAmount = false;
          break;
        }
      }
      if (!isValidAmount) return { error: 'AM01' };
      amount = parseInt(amountToken, 10);
      currency = normalizedToks[2];
      if (normalizedToks.length === 11) {
        debitAccount = normalizedToks[5].toUpperCase();
        creditAccount = normalizedToks[10].toUpperCase();
      } else if (normalizedToks.length === 13 && normalizedToks[11] === 'ON') {
        debitAccount = normalizedToks[5].toUpperCase();
        creditAccount = normalizedToks[10].toUpperCase();
        executeBy = normalizedToks[12];
      } else {
        return { error: 'SY03' };
      }
      type = 'DEBIT';
    } else {
      return { error: 'SY03' };
    }
  } else if (normalizedToks[0] === 'CREDIT') {
    // CREDIT format: CREDIT amount currency TO ACCOUNT creditAccount FOR DEBIT FROM ACCOUNT debitAccount [ON date]
    if (normalizedToks.length > 13) return { error: 'SY02' };
    if (
      normalizedToks[1] &&
      normalizedToks[2] &&
      normalizedToks[3] === 'TO' &&
      normalizedToks[4] === 'ACCOUNT' &&
      normalizedToks[6] === 'FOR' &&
      normalizedToks[7] === 'DEBIT' &&
      normalizedToks[8] === 'FROM' &&
      normalizedToks[9] === 'ACCOUNT'
    ) {
      // Validate amount
      const amountToken = normalizedToks[1];
      let isValidAmount = true;
      for (let i = 0; i < amountToken.length; i++) {
        if (amountToken[i] < '0' || amountToken[i] > '9') {
          isValidAmount = false;
          break;
        }
      }
      if (!isValidAmount) return { error: 'AM01' };
      amount = parseInt(amountToken, 10);
      currency = normalizedToks[2];
      if (normalizedToks.length === 11) {
        creditAccount = normalizedToks[5].toUpperCase();
        debitAccount = normalizedToks[10].toUpperCase();
      } else if (normalizedToks.length === 13 && normalizedToks[11] === 'ON') {
        creditAccount = normalizedToks[5].toUpperCase();
        debitAccount = normalizedToks[10].toUpperCase();
        executeBy = normalizedToks[12];
      } else {
        return { error: 'SY03' };
      }
      type = 'CREDIT';
    } else {
      return { error: 'SY03' };
    }
  }

  return {
    type,
    amount,
    currency,
    debitAccount,
    creditAccount,
    executeBy,
  };
}

module.exports = { parseInstruction };