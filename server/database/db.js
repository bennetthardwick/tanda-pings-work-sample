const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('database.db');

const deviceTableName = "devices";
const pingTableName = "pings";

/* -- Private Methods --*/

let parseTime = (time) => {
  if (parseInt(time) <= 9999) return Math.round(new Date(time).getTime() / 1000);
  else if (parseInt(time) > 9999) return time;
  else return false;
}

let parseDate = (date) => {
  return {
    start: new Date(date).setUTCHours(0, 0, 0, 0) / 1000,
    end: new Date(date).setUTCHours(23, 59, 59, 999) / 1000
  }
}

// TODO: Find a faster way to manipulate sqlite data
let createDeviceHashTableFromRows = (rows) => {
  
  let data = {};

  rows.forEach((x) => {
    if (!data[x.device_id]) data[x.device_id] = [];
    data[x.device_id].push(x.epoch_time);
  })

  return data;

}

let pingsByPeriod = (from, to) => {

  let fromEpoch = parseTime(from);
  let toEpoch = parseTime(to);

  let allSelectQuery = `SELECT * FROM ${pingTableName} 
                        JOIN ${deviceTableName} USING (device)
                        WHERE epoch_time BETWEEN (?) AND (?)`;


  return new Promise((resolve, reject) => {
    db.all(allSelectQuery, fromEpoch, toEpoch, (err, rows) => {
      if (err) return reject(err);
      else resolve(createDeviceHashTableFromRows(rows));
    });
  });
}

let devicePingsByPeriod = (from, to, device_id) => {

  let fromEpoch = parseTime(from);
  let toEpoch = parseTime(to) - 1;

  let allSelectQuery = `SELECT * FROM ${pingTableName} 
                        WHERE epoch_time BETWEEN (?) AND (?)
                          AND device=(SELECT device FROM devices WHERE device_id=(?))`;

  return new Promise((resolve, reject) => {
    db.all(allSelectQuery, fromEpoch, toEpoch, device_id, (err, rows) => {
  
      if (err) return reject(err);
      else resolve(rows.map(x => x.epoch_time));
    });
  });
}
/* -- Public Methods --*/

/**
 * Create the database tables if they don't already exist 
 * @return {Promise}            A promise that resolves upon completion of
 *                              the queries
 */
module.exports.createTables = () => {

  const deviceTableCreationQuery = 
    `CREATE TABLE IF NOT EXISTS ${deviceTableName}(
      device INTEGER PRIMARY KEY,
      device_id TEXT UNIQUE
    );
    `;

  const pingTableCreationQuery = 
    `CREATE TABLE IF NOT EXISTS ${pingTableName}(
      epoch_time INTEGER,
      device INTEGER,
      FOREIGN KEY(device) REFERENCES ${deviceTableName}(device)
    );
    `;

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(deviceTableCreationQuery);
      db.run(pingTableCreationQuery, resolve);
    });
  })
};

/**
 * Reset the database by dropping all the rows
 * @return {Promise}      A promise that resolves on completion of the queries
 */
module.exports.resetDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`DELETE FROM ${deviceTableName}`);
      db.run(`DELETE FROM ${pingTableName}`, resolve);
    });
  })
};

/**
 * Creates a new entry in the database for a ping
 * @param  {string} device_id  The device id of the ping to be created
 * @param  {number} epoch_time The time of the ping as a unix timestamp
 * @return {Promise}           Promise that resolves on completion of the query 
 */
module.exports.addPing = (device_id, epoch_time) => {
  return new Promise((resolve, reject) => {

    let deviceSelectQuery = 
      `SELECT device FROM ${deviceTableName} WHERE device_id=(?)`;
    
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
        else if (row && row.device) db.run(pingInsertQuery, epoch_time, row.device, resolve);
      })
    });

  });
};

/**
 * Get all pings for a certain device for a certain day
 * @param  {string} device_id       The device id of the pings to be retrieved
 * @param  {string | number} date   The date in unix timestamp or YYYY-MM-DD
 * @return {Promise<number[]>}      A promise that resolves an array of pings
 */
module.exports.getPingsByDate = (device_id, date) => {
  
  let day = parseDate(date);

  return devicePingsByPeriod(day.start, day.end, device_id);

};

/**
 * Get all pings for a certain device for a certain period of time
 * @param  {string} device_id       The device id of the pings to be retrieved
 * @param  {string | number} from   The start date of the period of time as a unix 
 *                                  timestamp or YYYY-MM-DD
 * @param  {string | number} to     The end date of the period of time as a unix 
 *                                  timestamp or YYYY-MM-DD
 * @return {Promise<number[]>}      A promise that resolves an array of pings
 */
module.exports.getPingsByPeriod = (device_id, from, to) => {
  return devicePingsByPeriod(from, to, device_id);
};

/**
 * Get all pings for a certain period of time
 * @param  {string | number} from   The start date of the period of time as a unix 
 *                                  timestamp or YYYY-MM-DD
 * @param  {string | number} to     The end date of the period of time as a unix 
 *                                  timestamp or YYYY-MM-DD
 * @return {Promise<Object[]>}      A promise that resolves a hashmap of device ids
 *                                  and their associated pings
 */
module.exports.getAllPingsByPeriod = (from, to) => {
  return pingsByPeriod(from, to);
};

/**
 * Get all pings for a certain date
 * @param  {string | number} date   The date of as a unix timestamp or YYYY-MM-DD
 * @return {Promise<Object[]>}      A promise that resolves a hashmap of device ids
 *                                  and their associated pings
 */
module.exports.getAllPingsByDate = (date) => {

  let day = parseDate(date);

  return pingsByPeriod(day.start, day.end);
}

/**
 * Get all the devices from the database
 * @return {Promise<string[]>}    A promise that resolves with all devices
 */   
module.exports.getDevices = () => {
  return new Promise((resolve, reject) => {
    db.all(`SELECT device_id FROM ${deviceTableName}`, (err, rows) => {
      if (err) return reject(err);
      else if (rows) {
        // TODO: put in a format function for better readability
        return resolve(rows.map(x => x.device_id));
      }
    })
  });
};

module.exports.closeConnection = () => {
  db.close();
}

module.exports.sqlite = db;
module.exports.parseTime = parseTime; 



