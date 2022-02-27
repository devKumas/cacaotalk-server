import { Connection } from 'typeorm';
import { CreateUserDto, Gender, UpdateUserDto } from '../../../dtos/UserDto';
import { User } from '../../../entities/User';
import { UserRepository } from '../../../repositories/UserRepository';
import { UserService } from '../../../services/UserService';
import { createMemoryDatabase } from '../../utils/CreateMemoryDatabase';

let db: Connection;
let userRepository: UserRepository;
let userService: UserService;

beforeAll(async () => {
  db = await createMemoryDatabase();
  userRepository = db.getCustomRepository(UserRepository);
  userService = new UserService(userRepository);
});

afterAll(() => db.close());

let newUser: User;

describe('createUser', () => {
  const createUser = new CreateUserDto();
  createUser.email = 'user@kumas.dev';
  createUser.password = 'password';
  createUser.name = '홍길동';
  createUser.gender = Gender.F;

  it('사용자를 생성하고 정보를 반환한다.', async () => {
    const user = await userService.createUser(createUser);
    expect(user.email).toBe(createUser.email);
    expect(user.name).toBe(createUser.name);
    expect(user.gender).toBe(createUser.gender);

    newUser = user;
  });

  it('이메일이 중복된다면 오류를 400오류를 발생시킨다.', async () => {
    try {
      await userService.createUser(createUser);
    } catch ({ httpCode }) {
      expect(httpCode).toBe(400);
    }
  });
});

describe('updateUser', () => {
  const updateUser = new UpdateUserDto();
  updateUser.name = '고길동';

  it('사용자를 수정하고 정보를 반환한다.', async () => {
    const user = await userService.updateUser(newUser.id, updateUser);
    expect(user.name).toBe(updateUser.name);
    newUser.name = user.name;
  });

  it('이메일이 중복된다면 오류를 400오류를 발생시킨다.', async () => {
    try {
      await userService.updateUser(newUser.id, updateUser);
    } catch ({ httpCode }) {
      expect(httpCode).toBe(400);
    }
  });
});

describe('updateUserImage', () => {
  const image = 'profileImage.png';
  it('사용자의 프로필 이미지를 변경한다.', async () => {
    const user = await userService.updateUserImage(newUser.id, image);
    expect(user.profileImage).toBe(`img/${image}`);
  });

  it('사용자의 프로필 삭제한다.', async () => {
    const user = await userService.updateUserImage(newUser.id);
    expect(user.profileImage).toBe(null);
  });
});

describe('getUserById', () => {
  it('사용자의 정보를 조회한뒤 정보를 반환한다.', async () => {
    const user = await userService.getUserById(newUser.id);
    expect(user.email).toBe(newUser.email);
    expect(user.name).toBe(newUser.name);
    expect(user.gender).toBe(newUser.gender);
  });

  it('비밀번호를 함께 요청하는 경우에는 포함하여 반환한다.', async () => {
    const user = await userService.getUserById(newUser.id, true);
    expect(user.email).toBe(newUser.email);
    expect(user.name).toBe(newUser.name);
    expect(user.gender).toBe(newUser.gender);
    expect(user.password).toBeTruthy();
  });

  it('사용자를 찾을 수 없다면 404오류를 발생시킨다.', async () => {
    try {
      await userService.getUserById(0);
    } catch ({ httpCode }) {
      expect(httpCode).toBe(404);
    }
  });
});

describe('getUserByEmail', () => {
  it('사용자의 정보를 조회한뒤 정보를 반환한다.', async () => {
    const user = await userService.getUserByEmail(newUser.email!);
    expect(user.email).toBe(newUser.email);
    expect(user.name).toBe(newUser.name);
    expect(user.gender).toBe(newUser.gender);
  });

  it('비밀번호를 함께 요청하는 경우에는 포함하여 반환한다.', async () => {
    const user = await userService.getUserByEmail(newUser.email!, true);
    expect(user.email).toBe(newUser.email);
    expect(user.name).toBe(newUser.name);
    expect(user.gender).toBe(newUser.gender);
    expect(user.password).toBeTruthy();
  });

  it('사용자를 찾을 수 없다면 404오류를 발생시킨다.', async () => {
    try {
      await userService.getUserByEmail('');
    } catch ({ httpCode }) {
      expect(httpCode).toBe(404);
    }
  });
});
