import * as Joi from 'joi';

/**
 * Validation schema for database environment variables
 */
export const databaseSchema = Joi.object({
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().when('NODE_ENV', {
    is: 'test',
    then: Joi.string().default('test'),
    otherwise: Joi.string().required(),
  }),
  DB_PASSWORD: Joi.string().when('NODE_ENV', {
    is: 'test',
    then: Joi.string().default('test'),
    otherwise: Joi.string().required(),
  }),
  DB_NAME: Joi.string().when('NODE_ENV', {
    is: 'test',
    then: Joi.string().default('test_db'),
    otherwise: Joi.string().required(),
  }),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
});
