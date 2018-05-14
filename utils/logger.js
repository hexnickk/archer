const { createLogger, format, transports } = require('winston');

const myFormat = format.combine(
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
);

const logger = createLogger({
  level: 'info',
  format: myFormat,
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.Console(),
  ]
});

module.exports = logger;