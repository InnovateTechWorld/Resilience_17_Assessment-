function normalizeAndTokenize(instr) {
  if (!instr || typeof instr !== 'string') return [];
  const trimmed = instr.trim();
  if (trimmed === '') return [];
  const toks = trimmed.split(' ').filter((t) => t !== '');
  return toks;
}

function parseInstruction(instr) {
  const toks = normalizeAndTokenize(instr);
  if (toks[0].toUpperCase() !== 'DEBIT' && toks[0].toUpperCase() !== 'CREDIT')
    return { error: 'SY01' };
  if (toks.length < 6) return { error: 'SY03' };

  // Destructure amount and currency before uppercasing
  const [, amountToken, currencyToken] = toks;

  // Normalize keywords to uppercase for comparison
  for (let i = 0; i < toks.length; i++) {
    toks[i] = toks[i].toUpperCase();
  }

  let type = null;
  let amount = null;
  let currency = null;
  let debitAccount = null;
  let creditAccount = null;
  let executeBy = null;

  if (toks[0] === 'DEBIT') {
    // DEBIT format: DEBIT amount currency FROM ACCOUNT debitAccount FOR CREDIT TO ACCOUNT creditAccount [ON date]
    if (toks.length > 13) return { error: 'SY02' };
    if (
      toks[1] &&
      toks[2] &&
      toks[3] === 'FROM' &&
      toks[4] === 'ACCOUNT' &&
      toks[6] === 'FOR' &&
      toks[7] === 'CREDIT' &&
      toks[8] === 'TO' &&
      toks[9] === 'ACCOUNT'
    ) {
      // Validate amount
      let isValidAmount = true;
      for (let i = 0; i < amountToken.length; i++) {
        if (amountToken[i] < '0' || amountToken[i] > '9') {
          isValidAmount = false;
          break;
        }
      }
      if (!isValidAmount) return { error: 'AM01' };
      amount = parseInt(amountToken, 10);
      currency = currencyToken.toUpperCase();
      if (toks.length === 11) {
        [, , , , , debitAccount, , , , , creditAccount] = toks;
      } else if (toks.length === 13 && toks[11] === 'ON') {
        [, , , , , debitAccount, , , , , creditAccount, , executeBy] = toks;
      } else {
        return { error: 'SY02' };
      }
      type = 'DEBIT';
    } else {
      return { error: 'SY02' };
    }
  } else if (toks[0] === 'CREDIT') {
    // CREDIT format: CREDIT amount currency TO ACCOUNT creditAccount FOR DEBIT FROM ACCOUNT debitAccount [ON date]
    if (toks.length > 13) return { error: 'SY02' };
    if (
      toks[1] &&
      toks[2] &&
      toks[3] === 'TO' &&
      toks[4] === 'ACCOUNT' &&
      toks[6] === 'FOR' &&
      toks[7] === 'DEBIT' &&
      toks[8] === 'FROM' &&
      toks[9] === 'ACCOUNT'
    ) {
      // Validate amount
      let isValidAmount = true;
      for (let i = 0; i < amountToken.length; i++) {
        if (amountToken[i] < '0' || amountToken[i] > '9') {
          isValidAmount = false;
          break;
        }
      }
      if (!isValidAmount) return { error: 'AM01' };
      amount = parseInt(amountToken, 10);
      currency = currencyToken;
      if (toks.length === 11) {
        [, , , , , creditAccount, , , , , debitAccount] = toks;
      } else if (toks.length === 13 && toks[11] === 'ON') {
        [, , , , , creditAccount, , , , , debitAccount, , executeBy] = toks;
      } else {
        return { error: 'SY02' };
      }
      type = 'CREDIT';
    } else {
      return { error: 'SY02' };
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
