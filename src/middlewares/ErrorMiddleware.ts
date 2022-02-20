import e, { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers';
import { logger } from '../utils/Winston';

@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, req: Request, res: Response, next: NextFunction): void {
    logger.warn(error);

    if (error?.httpCode) {
      const { level, ...e } = error;
      res.status(error?.httpCode).json({
        success: false,
        ...e,
      });
    } else {
      res.status(error.status || 500).json({
        success: false,
        httpCode: error.status || 500,
        name: error.name || 'InternalServerError',
        message: error.message,
        timestamp: error.timestamp,
      });
    }
  }
}
