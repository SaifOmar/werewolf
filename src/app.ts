import express from 'express';
import Logger from './entities/manager';

const app = express();

const logger = Logger.getInstance();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
      logger.log(`Request: ${req.method} ${req.url}`);
      if (req.method === 'POST') {
            logger.log(`Body: ${JSON.stringify(req.body)}`);
      }
      if (req.errored) {
            logger.error(`Error: ${req.errored}`);
      }
      next();
});
export default app;
