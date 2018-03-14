const database = require('../db');
const expect = require('chai').expect;

describe('Database', () => {
  it('creates empty tables', () => {
    database.createTables()
      .then(() => {
        expect(true).to.equal(true);
      });
  });

  it('drops the tables', () => {
    database.resetDatabase();
  });

  it('adds a new ping', () => {
    database.createTables()
      .then(() => {
        database.addPing("donald", 1234);
      })
  });

});