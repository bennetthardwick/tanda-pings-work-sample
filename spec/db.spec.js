const database = require('../server/database/db');
const expect = require('chai').expect;

describe('Database', () => {
  it('parses time strings correctly', () => {
    expect(database.parseTime('2018-01-01') == 1514764800).to.equal(true);
  });

  it('parses unix timestamp correctly', () => {
    expect(database.parseTime('1514764800') == 1514764800).to.equal(true);
  });

});