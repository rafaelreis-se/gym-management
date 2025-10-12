import * as Joi from 'joi';

/**
 * Validation schema for authentication environment variables
 */
export const authSchema = Joi.object({
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  BCRYPT_ROUNDS: Joi.number().default(10),

  // OAuth2 - Google
  GOOGLE_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').optional(),
  GOOGLE_CALLBACK_URL: Joi.string().optional(),

  // OAuth2 - Facebook
  FACEBOOK_APP_ID: Joi.string().allow('').optional(),
  FACEBOOK_APP_SECRET: Joi.string().allow('').optional(),
  FACEBOOK_CALLBACK_URL: Joi.string().optional(),
});

