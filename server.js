const express = require('express');
const port = process.env.PORT || 3000;

const db = require('./db');

db.createTables();

var server = express();
server.set('port', port);

server.post('/:device_id/:epoch_time', (req, res) => {

  db.addPing(req.params.device_id, req.params.epoch_time);

  res.send('id/time');
});

server.post('/clear_data', (req, res) => {
  db.resetDatabase()
    .then(() => res.send(""));
});

server.get('/:device_id/:date', (req, res) => {
  res.send('id/date');
});

server.get('/:device_id/:from/:to', (req, res) => {
  res.send('id/from/to');
});

server.get('/devices', (req, res) => {
  db.getDevices()
    .then(x => res.send(x));
});

server.listen(port, () => console.log(`Listening on port ${port}`));
