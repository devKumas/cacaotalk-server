import { Action, UnauthorizedError } from 'routing-controllers';
import jwt from 'jsonwebtoken';
import { env } from '../env';
import { User } from '../entities/User';

/**
 * AceessToken을 검증한다.
 * @param action
 * @param roles
 * @returns
 */
export const authorizationChecker = async (action: Action, roles: string[]) => {
  const getToken = extractAccessToken(action.request.headers['authorization']);

  if (!getToken) return false;
  checkAccessToken(getToken);

  return true;
};

/**
 * AcessToken해독하여 컨트롤러에 전달한다.
 * @param action
 * @returns
 */
export const currentUserChecker = async (action: Action) => {
  const getToken = extractAccessToken(action.request.headers['authorization']);

  return checkAccessToken(getToken!);
};

/**
 * authorization에서 AccessToken을 추출한다.
 * @param authorization
 * @returns
 */
const extractAccessToken = (authorization: string) => {
  if (authorization && authorization.split(' ')[0] === 'Bearer') return authorization.split(' ')[1];
};

/**
 * JWT AccessToken을 체크한다.
 * @param token
 * @returns
 */
export const checkAccessToken = (token: string) => {
  try {
    const jwtToken = jwt.verify(token, env.app.jwtAccessSecret);

    if (typeof jwtToken !== 'object') throw new UnauthorizedError('Invalid or Missing JWT token.');

    return jwtToken;
  } catch (error) {
    throw new UnauthorizedError('Invalid or Missing JWT token.');
  }
};

/**
 * JWT RefreshToken을 체크한다.
 * @param token
 * @returns
 */
export const checkRefreshToken = (token: string) => {
  try {
    const jwtToken = jwt.verify(token, env.app.jwtRefreshSecret);

    if (typeof jwtToken !== 'object') throw new UnauthorizedError('Invalid or Missing JWT token.');

    return jwtToken;
  } catch (error) {
    throw new UnauthorizedError('Invalid or Missing JWT token.');
  }
};

/**
 * JWT AccessToken을 만든다.
 * @param user
 */
export const createAccessToken = (user: User) => {
  const { id, email, name } = user;
  return jwt.sign({ id, email, name }, env.app.jwtAccessSecret, {
    expiresIn: '30m',
  });
};

/**
 * JWT RefreshToken을 만든다.
 * @param user
 */
export const createRefreshToken = (user: User) => {
  const { id } = user;
  return jwt.sign({ id }, env.app.jwtRefreshSecret, {
    expiresIn: '14d',
  });
};
