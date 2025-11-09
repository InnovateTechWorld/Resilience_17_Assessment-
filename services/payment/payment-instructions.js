const validator = require('@app-core/validator');
const { parseInstruction } = require('./parser');
const { validate } = require('./validate');
const { execute } = require('./execute');

// Spec for payment instructions service
const paymentSpec = `root {
  accounts array {
    id string
    balance number
    currency string
  }
  instruction string
}`;

// Parse the spec outside the service function
const parsedPaymentSpec = validator.parse(paymentSpec);

async function paymentInstructions(serviceData) {
  // Validate incoming data
  const validatedData = validator.validate(serviceData, parsedPaymentSpec);

  const { accounts, instruction } = validatedData;

  // Parse instruction
  const parsed = parseInstruction(instruction);
  if (parsed.error) {
    return {
      type: null,
      amount: null,
      currency: null,
      debit_account: null,
      credit_account: null,
      execute_by: null,
      status: 'failed',
      status_reason: 'Malformed instruction: unable to parse keywords',
      status_code: parsed.error,
      accounts: []
    };
  }

  // Validate instruction
  const validationResult = validate(parsed, accounts);
  if (validationResult.status === 'failed') {
    const { debit_account, credit_account } = parsed;
    const involvedAccounts = accounts
      .filter(a => a.id === debit_account || a.id === credit_account)
      .map(a => ({
        id: a.id,
        balance: a.balance,
        balance_before: a.balance,
        currency: a.currency
      }));

    return {
      ...parsed,
      ...validationResult,
      accounts: involvedAccounts,
    };
  }

  // Execute transaction
  const executionResult = execute(parsed, accounts);

  return {
    ...parsed,
    ...executionResult,
    status_reason: executionResult.status === 'successful' ? 'Transaction executed successfully' : 'Transaction scheduled for future execution',
  };
}

module.exports = paymentInstructions;