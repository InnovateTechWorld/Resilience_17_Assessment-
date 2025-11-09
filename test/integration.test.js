const request = require('supertest');
const { expect } = require('chai');
const server = require('../app');

describe('Integration Tests', () => {
  it('should process a valid payment instruction', (done) => {
    request(server.app)
      .post('/payment-instructions')
      .send({
        accounts: [
          { id: 'a', balance: 230, currency: 'USD' },
          { id: 'b', balance: 300, currency: 'USD' },
        ],
        instruction: 'DEBIT 30 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b',
      })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body.data.status).to.equal('successful');
        expect(res.body.data.accounts[0].balance).to.equal(200);
        expect(res.body.data.accounts[1].balance).to.equal(330);
        done();
      });
  });

  it('should return a 400 for an invalid payment instruction', (done) => {
    request(server.app)
      .post('/payment-instructions')
      .send({
        accounts: [
          { id: 'a', balance: 230, currency: 'USD' },
          { id: 'b', balance: 300, currency: 'USD' },
        ],
        instruction: 'SEND 30 USD TO ACCOUNT b',
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.data.status).to.equal('failed');
        expect(res.body.data.status_code).to.equal('SY01');
        done();
      });
  });

  it('should return a 400 for insufficient funds', (done) => {
    request(server.app)
      .post('/payment-instructions')
      .send({
        accounts: [
          { id: 'a', balance: 20, currency: 'USD' },
          { id: 'b', balance: 300, currency: 'USD' },
        ],
        instruction: 'DEBIT 30 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b',
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        expect(res.body.data.status).to.equal('failed');
        expect(res.body.data.status_code).to.equal('AC01');
        done();
      });
  });
});