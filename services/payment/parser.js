function normalizeAndTokenize(instr) {
  if (!instr || typeof instr !== 'string') return [];
  // Trim & split by spaces, remove empty tokens:
  const raw = instr.trim();
  const tokens = raw.split(' ');
  const toks = [];
  for (let t of tokens) {
    if (t !== '') toks.push(t);
  }
  return toks;
}

function parseInstruction(instr) {
  const toks = normalizeAndTokenize(instr);
  if (toks.length < 6) return { error: 'SY03' };

  // get first token (type)
  const first = toks[0].toUpperCase();
  if (first !== 'DEBIT' && first !== 'CREDIT') return { error: 'SY01' };

  // amount is next token (1)
  const amountToken = toks[1];
  // Validate integer: must contain only digits
  for (let ch of amountToken) {
    if (ch < '0' || ch > '9') return { error: 'AM01' };
  }
  const amount = parseInt(amountToken, 10);

  // currency is token[2]
  const currency = toks[2].toUpperCase();

  let debitAccount, creditAccount, executeBy = null;

  if (first === 'DEBIT') {
    // DEBIT amount currency FROM ACCOUNT <acctA> FOR CREDIT TO ACCOUNT <acctB> [ON date]
    if (toks[3].toUpperCase() !== 'FROM' || toks[4].toUpperCase() !== 'ACCOUNT' || toks[6].toUpperCase() !== 'FOR' || toks[7].toUpperCase() !== 'CREDIT' || toks[8].toUpperCase() !== 'TO' || toks[9].toUpperCase() !== 'ACCOUNT') {
      return { error: 'SY02' };
    }
    debitAccount = toks[5];
    creditAccount = toks[10];
    if (toks.length > 11) {
      if (toks[11].toUpperCase() !== 'ON') return { error: 'SY02' };
      executeBy = toks[12];
    }
  } else { // CREDIT
    // CREDIT amount currency TO ACCOUNT <acctB> FOR DEBIT FROM ACCOUNT <acctA> [ON date]
    if (toks[3].toUpperCase() !== 'TO' || toks[4].toUpperCase() !== 'ACCOUNT' || toks[6].toUpperCase() !== 'FOR' || toks[7].toUpperCase() !== 'DEBIT' || toks[8].toUpperCase() !== 'FROM' || toks[9].toUpperCase() !== 'ACCOUNT') {
      return { error: 'SY02' };
    }
    creditAccount = toks[5];
    debitAccount = toks[10];
    if (toks.length > 11) {
      if (toks[11].toUpperCase() !== 'ON') return { error: 'SY02' };
      executeBy = toks[12];
    }
  }

  return {
    type: first,
    amount,
    currency,
    debit_account: debitAccount,
    credit_account: creditAccount,
    execute_by: executeBy,
  };
}

module.exports = {
  parseInstruction,
};