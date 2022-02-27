import { Connection } from 'typeorm';
import { User } from '../../../entities/User';
import { UserRepository } from '../../../repositories/UserRepository';
import { FriendService } from '../../../services/FriendService';
import { UserService } from '../../../services/UserService';
import { createMemoryDatabase } from '../../utils/CreateMemoryDatabase';
import { userSeed } from '../../utils/seeds/UserTestSeed';

let db: Connection;
let userRepository: UserRepository;
let userService: UserService;
let friendService: FriendService;
let user: User;
let targetUser: User;

beforeAll(async () => {
  db = await createMemoryDatabase();
  userRepository = db.getCustomRepository(UserRepository);
  [user, targetUser] = await userRepository.save(userSeed);
  userService = new UserService(userRepository);
  friendService = new FriendService(userRepository, userService);
});

afterAll(() => db.close());

describe('createFriend', () => {
  it('친구를 등록하고 정보를 반환한다.', async () => {
    const friend = await friendService.createFriend(user.id, targetUser.id);

    expect(friend.id).toBe(targetUser.id);
  });

  it('이미 등록된 친구라면 400 오류를 발생시킨다.', async () => {
    try {
      await friendService.createFriend(user.id, targetUser.id);
    } catch ({ httpCode }) {
      expect(httpCode).toBe(400);
    }
  });
});

describe('getFriends', () => {
  it('친구를 조회하고 목록을 반환한다.', async () => {
    const friend = await friendService.getFriends(user.id);
    expect(friend).toBeTruthy();
  });
});

describe('deleteFriend', () => {
  it('친구 삭제하고 true을 반환한다.', async () => {
    const friend = await friendService.deleteFriend(user.id, targetUser.id);

    expect(friend).toBeTruthy();
  });

  it('등록되지 않은 친구라면 400 오류를 발생시킨다.', async () => {
    try {
      await friendService.deleteFriend(user.id, targetUser.id);
    } catch ({ httpCode }) {
      expect(httpCode).toBe(400);
    }
  });
});
