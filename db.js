const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('database.db');


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

module.exports.getPingsByDate = (device_id, date) => {
  let dateFrom = new Date(date).setHours(0, 0, 0, 0);
  let dateTo = new Date(date).setHours(23, 59, 59, 999);

  return genericDevicePingsByPeriod(dateFrom, dateTo, device_id);

};

module.exports.getPingsByPeriod = (device_id, from, to) => {
  return genericDevicePingsByPeriod(from, to, device_id);
};

module.exports.getAllPingsByPeriod = (from, to) => {
  return genericPingsByPeriod(from, to);
};

module.exports.getAllPingsByDate = (date, to) => {


  let dateFrom = new Date(date).setHours(0, 0, 0, 0);
  let dateTo = new Date(date).setHours(23, 59, 59, 999);

  return genericPingsByPeriod(dateFrom, dateTo);
}

function genericPingsByPeriod(from, to) {

  console.log(from);

  let fromEpoch = new Date(from).getTime() / 1000;
  let toEpoch = new Date(to).getTime() / 1000;

  let allSelectQuery = `SELECT * FROM ${pingTableName} 
                        WHERE epoch_time >= (?) AND epoch_time < (?)`;


  return new Promise((resolve, reject) => {
    db.all(allSelectQuery, fromEpoch, toEpoch, (err, rows) => {

      console.log(fromEpoch);

      if (err) return reject(err);
      else resolve(rows);
    });
  });
}

function genericDevicePingsByPeriod(from, to, device_id) {
  let fromEpoch = Math.floor(new Date(from).getTime() / 1000);
  let toEpoch = Math.floor(new Date(to).getTime() / 1000);


  console.log(fromEpoch, 'to', toEpoch);

  let allSelectQuery = `SELECT * FROM ${pingTableName} 
                        WHERE epoch_time >= (?) AND epoch_time < (?)
                          AND device=(SELECT id FROM devices WHERE device_id=(?))`;


  return new Promise((resolve, reject) => {
    db.all(allSelectQuery, fromEpoch, toEpoch, device_id, (err, rows) => {
      console.log(rows);
      if (err) return reject(err);
      else resolve(rows);
    });
  });
}


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