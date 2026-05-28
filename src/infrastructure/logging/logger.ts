import pino from 'pino';

const LOG_LEVEL = process.env['LOG_LEVEL'] ?? 'info';
const TIMEZONE = process.env['TZ'] ?? 'America/Sao_Paulo';

export const logger = pino({
  level: LOG_LEVEL,

  formatters: {
    level(label) {
      return { level: label };
    },
  },
  
  timestamp: () => {

    return `,"time":"${new Date().toLocaleString('sv-SE', {
      timeZone: TIMEZONE,
    })}"`;
  },

  base: {
    service: 'filazero-mcp',
    environment: process.env['NODE_ENV'] ?? 'development',
  },
});