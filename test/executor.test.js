const { expect } = require('chai');
const { execute } = require('../services/payment/execute');

describe('Executor', () => {
  it('should execute a transaction immediately if no date is provided', () => {
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
    const result = execute(parsed, accounts);
    expect(result.status).to.equal('successful');
    expect(result.status_code).to.equal('AP00');
    expect(result.accounts[0].balance).to.equal(200);
    expect(result.accounts[1].balance).to.equal(330);
  });

  it('should execute a transaction immediately if the date is in the past', () => {
    const parsed = {
      type: 'DEBIT',
      amount: 30,
      currency: 'USD',
      debitAccount: 'a',
      creditAccount: 'b',
      executeBy: '2020-01-01',
    };
    const accounts = [
      { id: 'a', balance: 230, currency: 'USD' },
      { id: 'b', balance: 300, currency: 'USD' },
    ];
    const result = execute(parsed, accounts);
    expect(result.status).to.equal('successful');
    expect(result.status_code).to.equal('AP00');
    expect(result.accounts[0].balance).to.equal(200);
    expect(result.accounts[1].balance).to.equal(330);
  });

  it('should mark a transaction as pending if the date is in the future', () => {
    const parsed = {
      type: 'DEBIT',
      amount: 30,
      currency: 'USD',
      debitAccount: 'a',
      creditAccount: 'b',
      executeBy: '2099-01-01',
    };
    const accounts = [
      { id: 'a', balance: 230, currency: 'USD' },
      { id: 'b', balance: 300, currency: 'USD' },
    ];
    const result = execute(parsed, accounts);
    expect(result.status).to.equal('pending');
    expect(result.status_code).to.equal('AP02');
    expect(result.accounts[0].balance).to.equal(230);
    expect(result.accounts[1].balance).to.equal(300);
  });
});
