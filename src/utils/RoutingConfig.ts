import { env } from '../env';
import { authorizationChecker, currentUserChecker } from './Auth';

/**
 * routing-controllers 설정
 */
export const routingControllerOptions = {
  defaultErrorHandler: false,
  cors: true,
  routePrefix: env.app.apiPrefix,
  controllers: [`${__dirname}/../controllers/*{.ts,.js}`],
  middlewares: [`${__dirname}/../middlewares/*{.ts,.js}`],
  interceptors: [`${__dirname}/../interceptors/*{.ts,.js}`],

  authorizationChecker,
  currentUserChecker,
};
