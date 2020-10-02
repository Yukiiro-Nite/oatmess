const path = require('path')
const expressStarter = require('express-starter')
const port = process.env.PORT || 3000

expressStarter.start(
  port,
  (express, app, io) => {
    app.use(express.static('src'))
  },
  () => {},
  path.resolve(__dirname, '../../dist/')
);