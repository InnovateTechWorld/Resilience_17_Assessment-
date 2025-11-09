const STATUS_CODES = {
  SUCCESS: 'AP00',
  PENDING: 'AP02',
};

function execute(parsed, accounts) {
  const { debit_account, credit_account, amount, execute_by } = parsed;
  const debitAccObj = { ...accounts.find(a => a.id === debit_account) };
  const creditAccObj = { ...accounts.find(a => a.id === credit_account) };

  const balance_before_debit = debitAccObj.balance;
  const balance_before_credit = creditAccObj.balance;

  let status, statusCode;
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];

  if (!execute_by || execute_by <= currentDate) {
    // Execute
    debitAccObj.balance -= amount;
    creditAccObj.balance += amount;
    status = 'successful';
    statusCode = STATUS_CODES.SUCCESS;
  } else {
    status = 'pending';
    statusCode = STATUS_CODES.PENDING;
  }

  const responseAccounts = [
    {
      id: debitAccObj.id,
      balance: debitAccObj.balance,
      balance_before: balance_before_debit,
      currency: debitAccObj.currency,
    },
    {
      id: creditAccObj.id,
      balance: creditAccObj.balance,
      balance_before: balance_before_credit,
      currency: creditAccObj.currency,
    },
  ];

  return {
    status,
    status_code: statusCode,
    accounts: responseAccounts,
  };
}

module.exports = {
  execute,
};