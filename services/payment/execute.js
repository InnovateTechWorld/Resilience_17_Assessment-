const STATUS_CODES = {
  SUCCESS: 'AP00',
  PENDING: 'AP02',
};

function execute(parsed, accounts) {
  const { debitAccount, creditAccount, amount, executeBy } = parsed;
  const debitAccObj = { ...accounts.find((a) => a.id === debitAccount) };
  const creditAccObj = { ...accounts.find((a) => a.id === creditAccount) };

  const balanceBeforeDebit = debitAccObj.balance;
  const balanceBeforeCredit = creditAccObj.balance;

  let status;
  let statusCode;
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];

  if (!executeBy || executeBy <= currentDate) {
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
      balance_before: balanceBeforeDebit,
      currency: debitAccObj.currency,
    },
    {
      id: creditAccObj.id,
      balance: creditAccObj.balance,
      balance_before: balanceBeforeCredit,
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
