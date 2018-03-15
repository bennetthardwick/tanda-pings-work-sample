const express = require('express');
const db = require('./database/db');

db.createTables();

var server = express();

server.post('/:device_id/:epoch_time', (req, res) => {
  db.addPing(req.params.device_id, req.params.epoch_time)
    .then(() => res.status(200).send())
    .catch(() => res.status(500).send());
});

server.post('/clear_data', (req, res) => {
  db.resetDatabase()
    .then(() => res.status(200).send())
    .catch(() => res.status(500).send());
});

server.get('/all/:date', (req, res) => {
  db.getAllPingsByDate(req.params.date)
    .then(x => res.json(x))
    .catch(x => res.status(500).send());
});

server.get('/all/:from/:to', (req, res) => {
  db.getAllPingsByPeriod(req.params.from, req.params.to)
    .then(x => res.send(x))
    .catch(() => res.status(500).send());
});

server.get('/:device_id/:date', (req, res) => {
  db.getPingsByDate(req.params.device_id, req.params.date)
    .then(x => res.send(x))
    .catch(() => res.status(500).send());
});

server.get('/:device_id/:from/:to', (req, res) => {
  db.getPingsByPeriod(req.params.device_id, req.params.from, req.params.to)
    .then(x => res.send(x))
    .catch(() => res.status(500).send());
});

server.get('/devices', (req, res) => {
  db.getDevices()
    .then(x => res.send(x))
    .catch(() => res.status(500).send());
});

module.exports = server;
