const STATUS_CODES = {
  SUCCESS: 'AP00',
  PENDING: 'AP02',
  AMOUNT_INVALID: 'AM01',
  CURRENCY_MISMATCH: 'CU01',
  CURRENCY_UNSUPPORTED: 'CU02',
  INSUFFICIENT_FUNDS: 'AC01',
  SAME_ACCOUNT: 'AC02',
  ACCOUNT_NOT_FOUND: 'AC03',
  INVALID_ACCOUNT_ID: 'AC04',
  MISSING_KEYWORD: 'SY01',
  INVALID_ORDER: 'SY02',
  MALFORMED: 'SY03',
  INVALID_DATE: 'DT01'
};

const SUPPORTED_CURRENCIES = ['NGN', 'USD', 'GBP', 'GHS'];

function isValidDate(dateStr) {
  if (typeof dateStr !== 'string' || dateStr.length !== 10) {
    return false;
  }
  if (dateStr[4] !== '-' || dateStr[7] !== '-') {
    return false;
  }
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return false;
  }
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (year.length !== 4 || month.length !== 2 || day.length !== 2) {
    return false;
  }
  for (const part of parts) {
    for (const char of part) {
      if (char < '0' || char > '9') {
        return false;
      }
    }
  }
  const monthNum = parseInt(month, 10);
  const dayNum = parseInt(day, 10);
  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
    return false;
  }
  return true;
}


function validate(parsed, accounts) {
  const { type, amount, currency, debit_account, credit_account, execute_by } = parsed;

  // Find accounts
  const debitAccObj = accounts.find(a => a.id === debit_account);
  const creditAccObj = accounts.find(a => a.id === credit_account);
  if (!debitAccObj || !creditAccObj) {
    return {
      status: 'failed',
      status_reason: 'Account not found',
      status_code: STATUS_CODES.ACCOUNT_NOT_FOUND,
    };
  }

  // Check same account
  if (debit_account === credit_account) {
    return {
      status: 'failed',
      status_reason: 'Debit and credit accounts cannot be the same',
      status_code: STATUS_CODES.SAME_ACCOUNT,
    };
  }

  // Check currency support
  if (!SUPPORTED_CURRENCIES.includes(currency)) {
      return {
          status: 'failed',
          status_reason: 'Unsupported currency. Only NGN, USD, GBP, and GHS are supported',
          status_code: STATUS_CODES.CURRENCY_UNSUPPORTED,
      };
  }

  // Check currency match
  if (debitAccObj.currency !== currency || creditAccObj.currency !== currency) {
    return {
      status: 'failed',
      status_reason: 'Account currency mismatch',
      status_code: STATUS_CODES.CURRENCY_MISMATCH,
    };
  }

  // Check sufficient funds
  if (debitAccObj.balance < amount) {
    return {
      status: 'failed',
      status_reason: `Insufficient funds in debit account: has ${debitAccObj.balance} ${currency}, needs ${amount} ${currency}`,
      status_code: STATUS_CODES.INSUFFICIENT_FUNDS,
    };
  }

  // Date validation
  if (execute_by) {
    if (!isValidDate(execute_by)) {
        return {
            status: 'failed',
            status_reason: 'Invalid date format',
            status_code: STATUS_CODES.INVALID_DATE,
        };
    }
  }

  return { status: 'success' };
}

module.exports = {
  validate,
};