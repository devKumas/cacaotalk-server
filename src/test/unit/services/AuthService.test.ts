import { Connection } from 'typeorm';
import { LoginUserDto } from '../../../dtos/UserDto';
import { User } from '../../../entities/User';
import { UserRepository } from '../../../repositories/UserRepository';
import { AuthService } from '../../../services/AuthService';
import { UserService } from '../../../services/UserService';
import { createMemoryDatabase } from '../../utils/CreateMemoryDatabase';
import { userSeed } from '../../utils/seeds/UserTestSeed';
import jwt from 'jsonwebtoken';
import { env } from '../../../env';

let db: Connection;
let userRepository: UserRepository;
let userService: UserService;
let authService: AuthService;
let user: User;
let newRefreshToken: string;

beforeAll(async () => {
  db = await createMemoryDatabase();
  userRepository = db.getCustomRepository(UserRepository);
  [user] = await userRepository.save(userSeed);
  userService = new UserService(userRepository);
  authService = new AuthService(userRepository, userService);
});

afterAll(() => db.close());

describe('login', () => {
  it('로그인에 성공하면 유저정보를 반환한다.', async () => {
    const loginUserDto = new LoginUserDto();
    loginUserDto.email = 'user1@kumas.dev';
    loginUserDto.password = 'password';

    const login = await authService.login(loginUserDto);

    expect(login.tokenType).toBe('bearer');
    expect(login.accessToken).toBeTruthy();
    expect(login.refreshToken).toBeTruthy();
  });

  it('비밀번호가 틀리면 404오류를 발생시킨다.', async () => {
    try {
      const loginUserDto = new LoginUserDto();
      loginUserDto.email = 'user1@kumas.dev';
      loginUserDto.password = 'password1';

      await authService.login(loginUserDto);
    } catch ({ httpCode }) {
      expect(httpCode).toBe(404);
    }
  });
});

describe('logout', () => {
  it('로그아웃에 성공하면 true을 반환한다.', async () => {
    const logout = await authService.logout(user.id);

    expect(logout).toBeTruthy();
  });
});

describe('saveRefreshToken', () => {
  it('사용자에 RefreshToken을 저장한다.', async () => {
    newRefreshToken = jwt.sign({ id: user.id }, env.app.jwtRefreshSecret, {
      expiresIn: '12h',
    });
    const newUser = await authService.saveRefreshToken(user, newRefreshToken);

    expect(newUser.refreshToken).toBe(newRefreshToken);
  });
});

describe('checkUserToken', () => {
  it('RefreshToken을 검증하고 토큰을 반환한다.', async () => {
    newRefreshToken = jwt.sign({ id: user.id }, env.app.jwtRefreshSecret, {
      expiresIn: '12h',
    });
    const newUser = await authService.checkUserToken(newRefreshToken);

    expect(newUser.accessToken).toBeTruthy();
    expect(newUser.refhreshToken).toBeTruthy();
  });

  it('RefreshToken가 일치하지않으면 401 오류를 발생시킨다. ', async () => {
    try {
      newRefreshToken = jwt.sign({ id: user.id }, env.app.jwtRefreshSecret, {
        expiresIn: '12h',
      });
      await authService.checkUserToken(newRefreshToken);
    } catch ({ httpCode }) {
      expect(httpCode).toBe(401);
    }
  });
});
