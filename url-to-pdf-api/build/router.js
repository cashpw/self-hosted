const _ = require('lodash');
const validate = require('express-validation');
const express = require('express');
const render = require('./http/render-http');
const config = require('./config');
const logger = require('./util/logger')(__filename);
const { renderQuerySchema, renderBodySchema, sharedQuerySchema } = require('./util/validation');

function createRouter() {
  const router = express.Router();

  router.use('/*', (req, res, next) => {
    logger.info('new request');
    logger.info(`req.method: ${req.method}`);
    logger.info(`req.originalUrl: ${req.originalUrl}`);
    logger.info(`req.query.apiKey: ${req.query.apiKey}`);
    
    return next();
  });

  if (!_.isEmpty(config.API_TOKENS)) {
    logger.info('x-api-key authentication required');
    logger.info('v7');

    router.use('/api/render', (req, res, next) => {
      logger.info('checking for api key');

      const userToken = (req.query.apiKey) ? req.query.apiKey : req.headers['x-api-key'];
      if (!_.includes(config.API_TOKENS, userToken)) {
        const err = new Error(`Invalid API token in x-api-key header. userToken: "${userToken}". req.method: ${req.method}`);
        err.status = 401;
        return next(err);
      }

      return next();
    });
  } else {
    logger.warn('Warning: no authentication required to use the API');
  }

  const getRenderSchema = {
    query: renderQuerySchema,
    options: {
      allowUnknownBody: false,
      allowUnknownQuery: false,
    },
  };
  router.get('/api/render', validate(getRenderSchema), render.getRender);

  router.head('/*', validate(getRenderSchema), render.headRender);

  const postRenderSchema = {
    body: renderBodySchema,
    query: sharedQuerySchema,
    options: {
      allowUnknownBody: false,
      allowUnknownQuery: false,

      // Without this option, text body causes an error
      // https://github.com/AndrewKeig/express-validation/issues/36
      contextRequest: true,
    },
  };
  router.post('/api/render', validate(postRenderSchema), render.postRender);

  return router;
}

module.exports = createRouter;

