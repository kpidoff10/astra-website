import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino(
  {
    level: isDev ? 'debug' : 'info',
    transport: isDev
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            singleLine: false,
          },
        }
      : undefined,
  },
  pino.destination(process.stdout)
);

export const logPIIViolation = (
  agentId: string | undefined,
  piiType: string,
  endpoint: string,
  ipAddress: string | undefined
) => {
  logger.warn(
    {
      agentId,
      piiType,
      endpoint,
      ipAddress,
      type: 'PII_VIOLATION',
    },
    'PII detection triggered'
  );
};

export const logAgentAction = (
  agentId: string,
  action: string,
  details?: Record<string, unknown>
) => {
  logger.info(
    {
      agentId,
      action,
      details,
    },
    'Agent action logged'
  );
};
