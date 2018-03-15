const express = require('express');
const db = require('./database/db');

db.createTables();

var server = express();

server.post('/:device_id/:epoch_time', (req, res) => {
  db.addPing(req.params.device_id, req.params.epoch_time)
    .then(() => res.send('ok'));
});

server.post('/clear_data', (req, res) => {
  db.resetDatabase()
    .then(() => res.send('ok'));
});

server.get('/all/:date', (req, res) => {
  db.getAllPingsByDate(req.params.date)
    .then((x) => res.json(x));
});

server.get('/all/:from/:to', (req, res) => {
  db.getAllPingsByPeriod(req.params.from, req.params.to)
    .then((x) => res.send(x));
});

server.get('/:device_id/:date', (req, res) => {
  db.getPingsByDate(req.params.device_id, req.params.date)
    .then((x) => res.send(x));
});

server.get('/:device_id/:from/:to', (req, res) => {
  db.getPingsByPeriod(req.params.device_id, req.params.from, req.params.to)
    .then((x) => res.send(x));
});

server.get('/devices', (req, res) => {
  db.getDevices()
    .then(x => res.send(x));
});

module.exports = server;
