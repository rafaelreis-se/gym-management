import * as Joi from 'joi';

/**
 * Validation schema for application environment variables
 */
export const applicationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  SERVICE_NAME: Joi.string().default('gym-management-api'),
  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal')
    .default('info'),
  LOG_FORMAT: Joi.string().valid('json', 'pretty').default('pretty'),
});

