const port = process.env.PORT || 3000;
const server = require('./server/server');

server.listen(port, () => console.log(`Listening on port ${port}`));