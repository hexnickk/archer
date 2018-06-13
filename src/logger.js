import { createLogger, format, transports } from 'winston';

export default (name) => createLogger({
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
