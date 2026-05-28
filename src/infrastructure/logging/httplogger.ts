import {pinoHttp} from 'pino-http';
import { logger } from './logger.js';

export const httpLogger = pinoHttp({
  logger,

  customLogLevel(req, res, error) {

    if (error || res.statusCode >= 500) {
      return 'error';
    }

    if (res.statusCode >= 400) {
      return 'warn';
    }

    return 'info';
  },

  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} completed`;
  },

  customErrorMessage(req, res, error) {
    return `${req.method} ${req.url} failed`;
  },

  serializers: {
    req(req) {
      return {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      };
    },

    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});