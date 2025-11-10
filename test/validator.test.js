const { expect } = require('chai');
const { validate } = require('../services/payment/validate');

describe('Validator', () => {
  it('should return success for a valid instruction', () => {
    const parsed = {
      type: 'DEBIT',
      amount: 30,
      currency: 'USD',
      debitAccount: 'a',
      creditAccount: 'b',
      executeBy: null,
    };
    const accounts = [
      { id: 'a', balance: 230, currency: 'USD' },
      { id: 'b', balance: 300, currency: 'USD' },
    ];
    const result = validate(parsed, accounts);
    expect(result).to.deep.equal({
      status: 'success',
    });
  });

  it('should return an error for insufficient funds', () => {
    const parsed = {
      type: 'DEBIT',
      amount: 500,
      currency: 'USD',
      debitAccount: 'a',
      creditAccount: 'b',
      executeBy: null,
    };
    const accounts = [
      { id: 'a', balance: 230, currency: 'USD' },
      { id: 'b', balance: 300, currency: 'USD' },
    ];
    const result = validate(parsed, accounts);
    expect(result.status_code).to.equal('AC01');
  });

  it('should return an error for a currency mismatch', () => {
    const parsed = {
      type: 'DEBIT',
      amount: 30,
      currency: 'USD',
      debitAccount: 'a',
      creditAccount: 'b',
      executeBy: null,
    };
    const accounts = [
      { id: 'a', balance: 230, currency: 'USD' },
      { id: 'b', balance: 300, currency: 'NGN' },
    ];
    const result = validate(parsed, accounts);
    expect(result.status_code).to.equal('CU01');
  });

  it('should return an error for an unsupported currency', () => {
    const parsed = {
      type: 'DEBIT',
      amount: 30,
      currency: 'EUR',
      debitAccount: 'a',
      creditAccount: 'b',
      executeBy: null,
    };
    const accounts = [
      { id: 'a', balance: 230, currency: 'EUR' },
      { id: 'b', balance: 300, currency: 'EUR' },
    ];
    const result = validate(parsed, accounts);
    expect(result.status_code).to.equal('CU02');
  });

  it('should return an error for the same account', () => {
    const parsed = {
      type: 'DEBIT',
      amount: 30,
      currency: 'USD',
      debitAccount: 'a',
      creditAccount: 'a',
      executeBy: null,
    };
    const accounts = [{ id: 'a', balance: 230, currency: 'USD' }];
    const result = validate(parsed, accounts);
    expect(result.status_code).to.equal('AC02');
  });

  it('should return an error for an account not found', () => {
    const parsed = {
      type: 'DEBIT',
      amount: 30,
      currency: 'USD',
      debitAccount: 'a',
      creditAccount: 'c',
      executeBy: null,
    };
    const accounts = [
      { id: 'a', balance: 230, currency: 'USD' },
      { id: 'b', balance: 300, currency: 'USD' },
    ];
    const result = validate(parsed, accounts);
    expect(result.status_code).to.equal('AC03');
  });

  it('should return an error for an invalid date format', () => {
    const parsed = {
      type: 'DEBIT',
      amount: 30,
      currency: 'USD',
      debitAccount: 'a',
      creditAccount: 'b',
      executeBy: '2026-9-20',
    };
    const accounts = [
      { id: 'a', balance: 230, currency: 'USD' },
      { id: 'b', balance: 300, currency: 'USD' },
    ];
    const result = validate(parsed, accounts);
    expect(result.status_code).to.equal('DT01');
  });
});
