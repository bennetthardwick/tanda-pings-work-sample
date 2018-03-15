const database = require('../server/database/db');
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

  it('parses time strings correctly', () => {
    expect(database.parseTime('2018-01-01') == 1514764800).to.equal(true);
  });

  it('parses unix timestamp correctly', () => {
    expect(database.parseTime('1514764800') == 1514764800).to.equal(true);
  })

});