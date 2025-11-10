const { expect } = require('chai');
const { parseInstruction } = require('../services/payment/parser');

describe('Parser', () => {
  it('should parse a valid DEBIT instruction', () => {
    const instruction = 'DEBIT 30 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b';
    const result = parseInstruction(instruction);
    expect(result).to.deep.equal({
      type: 'DEBIT',
      amount: 30,
      currency: 'USD',
      debitAccount: 'A',
      creditAccount: 'B',
      executeBy: null,
    });
  });

  it('should parse a valid CREDIT instruction', () => {
    const instruction = 'CREDIT 100 NGN TO ACCOUNT b FOR DEBIT FROM ACCOUNT a';
    const result = parseInstruction(instruction);
    expect(result).to.deep.equal({
      type: 'CREDIT',
      amount: 100,
      currency: 'NGN',
      debitAccount: 'A',
      creditAccount: 'B',
      executeBy: null,
    });
  });

  it('should parse an instruction with a future date', () => {
    const instruction = 'DEBIT 50 GBP FROM ACCOUNT x FOR CREDIT TO ACCOUNT y ON 2026-12-31';
    const result = parseInstruction(instruction);
    expect(result).to.deep.equal({
      type: 'DEBIT',
      amount: 50,
      currency: 'GBP',
      debitAccount: 'X',
      creditAccount: 'Y',
      executeBy: '2026-12-31',
    });
  });

  it('should handle extra whitespace', () => {
    const instruction = 'DEBIT   30    USD   FROM   ACCOUNT   a   FOR   CREDIT   TO   ACCOUNT   b';
    const result = parseInstruction(instruction);
    expect(result).to.deep.equal({
      type: 'DEBIT',
      amount: 30,
      currency: 'USD',
      debitAccount: 'A',
      creditAccount: 'B',
      executeBy: null,
    });
  });

  it('should handle mixed case keywords', () => {
    const instruction = 'debit 100 gbp from account a for credit to account b';
    const result = parseInstruction(instruction);
    expect(result).to.deep.equal({
      type: 'DEBIT',
      amount: 100,
      currency: 'GBP',
      debitAccount: 'A',
      creditAccount: 'B',
      executeBy: null,
    });
  });

  it('should return an error for an invalid instruction', () => {
    const instruction = 'SEND 30 USD TO ACCOUNT b';
    const result = parseInstruction(instruction);
    expect(result).to.deep.equal({ error: 'SY01' });
  });

  it('should return an error for a malformed instruction', () => {
    const instruction = 'DEBIT 30 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT';
    const result = parseInstruction(instruction);
    expect(result).to.deep.equal({ error: 'SY03' });
  });

  it('should return an error for a non-integer amount', () => {
    const instruction = 'DEBIT 30.5 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b';
    const result = parseInstruction(instruction);
    expect(result).to.deep.equal({ error: 'AM01' });
  });
});