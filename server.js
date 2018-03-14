const express = require('express');
const port = process.env.PORT || 3000;

var server = express();
server.set('port', port);

server.post('/:device_id/:epoch_time', (req, res) => {
  res.send('id/time');
});

server.post('/clear_data', (req, res) => {
  res.send('clear');
});

server.get('/:device_id/:date', (req, res) => {
  res.send('id/date');
});

server.get('/:device_id/:from/:to', (req, res) => {
  res.send('id/from/to');
});

server.get('/devices', (req, res) => {
  res.send('devices');
});

server.listen(port, () => console.log(`Listening on port ${port}`));
