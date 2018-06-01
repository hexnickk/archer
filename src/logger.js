const { createLogger, format, transports } = require('winston');

const logger = (name) => createLogger({
  level: process.env.NODE_ENV ===  'development' ? 'debug' : 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.align(),
    format.printf(info => `${info.timestamp} ${name} ${info.level}: ${info.message}`),
  ),
  transports: [
    // new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.Console(),
  ]
});

module.exports = logger;