import { createLogger as winstonCreateLogger, Logger, format, transports } from 'winston';

const createLogger = (name: string): Logger => winstonCreateLogger({
  level: process.env.NODE_ENV ===  'development' ? 'debug' : 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.align(),
    format.printf((info) => `${info.timestamp} ${name} ${info.level}: ${info.message}`),
  ),
  transports: [
    // new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.Console(),
  ],
});

export default createLogger;
