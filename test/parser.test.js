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
    const instruction =
      'DEBIT 500 USD FROM ACCOUNT N90394 FOR CREDIT TO ACCOUNT N9122 ON 2026-09-20';
    const result = parseInstruction(instruction);
    expect(result).to.deep.equal({
      type: 'DEBIT',
      amount: 500,
      currency: 'USD',
      debitAccount: 'N90394',
      creditAccount: 'N9122',
      executeBy: '2026-09-20',
    });
  });

  it('should handle extra whitespace', () => {
    const instruction =
      '  DEBIT   30   USD   FROM   ACCOUNT   a   FOR   CREDIT   TO   ACCOUNT   b  ';
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
    const instruction = 'Debit 30 uSd FrOm AcCoUnT a FoR cReDiT tO aCcOuNt b';
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

  it('should return an error for an invalid instruction', () => {
    const instruction = 'SEND 100 USD TO ACCOUNT b';
    const result = parseInstruction(instruction);
    expect(result).to.deep.equal({
      error: 'SY01',
    });
  });

  it('should return an error for a malformed instruction', () => {
    const instruction = 'DEBIT 100 USD a FOR CREDIT TO ACCOUNT b';
    const result = parseInstruction(instruction);
    expect(result).to.deep.equal({
      error: 'SY02',
    });
  });

  it('should return an error for a non-integer amount', () => {
    const instruction = 'DEBIT 100.50 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b';
    const result = parseInstruction(instruction);
    expect(result).to.deep.equal({
      error: 'AM01',
    });
  });
});
