const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('database');


const deviceTableName = "devices";
const pingTableName = "pings";
const deviceTableCreationQuery = 
  `CREATE TABLE IF NOT EXISTS ${deviceTableName}(
    id INTEGER PRIMARY KEY,
    device_id TEXT UNIQUE
  );
  `;

const pingTableCreationQuery = 
  `CREATE TABLE IF NOT EXISTS ${pingTableName}(
    epoch_time INTEGER,
    device INTEGER,
    FOREIGN KEY(device) REFERENCES ${deviceTableName}(id)
  );
  `;


module.exports.addPing = (device_id, epoch_time) => {
  return new Promise((resolve, reject) => {

    let deviceSelectQuery = 
      `SELECT id FROM ${deviceTableName} WHERE device_id=(?)`;
    
    let deviceInsertQuery = 
      `INSERT INTO ${deviceTableName} (device_id) 
       SELECT (?) 
       WHERE NOT EXISTS (SELECT 1 FROM ${deviceTableName} WHERE device_id = (?))`;

    let pingInsertQuery = 
      `INSERT INTO ${pingTableName} (epoch_time, device) VALUES (?, ?)`;

    db.serialize(() => {
      db.run(deviceInsertQuery, device_id, device_id)
      db.get(deviceSelectQuery, device_id, (err, row) => {
        if (err) return reject(err);
        else if (row && row.id) db.run(pingInsertQuery, epoch_time, row.id);
      })
    });
    
  });
};

module.exports.getPingByDate = (device_id, date) => {

};

module.exports.getPingByPeriod = (device_id, from, to) => {

};

module.exports.getDevices = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT device_id FROM ${deviceTableName}`, (err, rows) => {
      if (err) return reject(err);
      else if (rows) {
        console.log(rows);
        return resolve(rows);
      }
    })
  });
};

module.exports.resetDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`DELETE FROM ${deviceTableName}`);
      db.run(`DELETE FROM ${pingTableName}`);
      resolve();
    });
  })
};

module.exports.createTables = (callback) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(deviceTableCreationQuery);
      db.run(pingTableCreationQuery);
      resolve();
    });
  })
};

module.exports.closeConnection = () => {
  db.close();
}

module.exports.sqlite = db;