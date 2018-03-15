const app = require('../server/server');
const expect = require('chai').expect;
const port = 3000;
let server;

const exec = require('child_process').exec;

describe('Server', () => {

  beforeEach(() => {
    server = app.listen(port);
  });

  afterEach(() => {
    server.close();
  });

  it('passes all Tanda tests', (done) => {
    exec('ruby pings.rb', (err, stdout, stderr) => {
      if (err) expect(false).to.equal(true);
      else if (stderr) expect(false.to.equal(true));
      else expect(true).to.equal(true);
      done();
    })
  })
});