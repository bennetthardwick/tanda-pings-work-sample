# tanda-pings-work-sample
[![Build Status](https://travis-ci.org/bennetthardwick/tanda-pings-work-sample.svg?branch=master)](https://travis-ci.org/bennetthardwick/tanda-pings-work-sample)  
My solution to the Tanda pings work sample. You can view the brief [here][1].  

## Getting Started
### Dependencies
To install dependencies, simply run:
```
npm install
```
### Testing
Note: [Mocha](https://github.com/mochajs/mocha) and [Ruby](https://www.ruby-lang.org/en/) are required for testing.
To test the software, run:
```
npm test
```
### Running
To start the software, run:
```
npm start
```

## Built With
- [Express](https://github.com/expressjs/express)
- Node
- [Sqlite3](https://github.com/mapbox/node-sqlite3)

## Reflection
### Why JavaScript?
Recently I've been using TypeScript for the majority of my projects. This is mainly due to the static type checking and support for experimental ECMAScript Syntax. For this project I decided to go back to basics and use JavaScript

### Why Sqlite?
Typically I'd use a NoSQL database like [MongoDB](https://www.mongodb.com/) or an ORM like [Sequelize](http://docs.sequelizejs.com/) as a datastore. For this project, I orignally intended to follow the suit and use [NeDB](https://github.com/louischatriot/nedb) a MongoDB inspired local datastore. While I felt this would be a great fit for a small project like this, I felt that using a SQL database like Sqlite3 would be better. This is mainly because Tanda currently uses Postgresql, but also because using SQL would allow me to easily swap databases without changing a lot of code. In the case that the code should need to be changed to work with a NoSQL database, this would not be a large problem due to a layer of abstraction I added between the server and the database (`db.js`).


[1]: https://github.com/TandaHQ/work-samples/tree/master/pings%20(backend)
