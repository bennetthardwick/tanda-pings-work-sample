const app = require('../server/server');
const expect = require('chai').expect;
const port = 3000;
let server;

describe('Server', () => {
  it('listens', () => {
    server = app.listen(port);
  });

  it('closes', () => {
    server.close();
  });

});