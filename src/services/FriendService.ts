import { BadRequestError } from 'routing-controllers';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import { UserService } from './UserService';

@Service()
export class FriendService {
  constructor(
    @InjectRepository() private userRepository: UserRepository,
    private userService: UserService
  ) {}

  /**
   * 친구를 호출한다.
   * @param loginUserDto 로그인 정보 DTO
   */
  async getFriends(id: number) {
    const friends = await this.userRepository.findFriends(id);

    return friends;
  }

  /**
   * 친구를 등록한다.
   * @param id userId
   * @param targetId targetId
   * @returns
   */
  async createFriend(id: number, targetId: number) {
    const targetUser = await this.userService.getUserById(targetId);

    const friends = await this.userRepository.findFriends(id);

    const getFriend = friends?.filter((user) => user.id === targetId);

    // 친구상태인지 체크
    if (getFriend.length) throw new BadRequestError("It's already registered.");

    const addedFriends = [...friends, targetUser];

    const user = new User();
    user.id = id;
    user.Friends = addedFriends;
    await this.userRepository.save(user);

    return targetUser;
  }

  /**
   * 친구를 삭제한다.
   * @param id userId
   * @param targetId targetId
   */
  async deleteFriend(id: number, targetId: number) {
    const targetUser = await this.userService.getUserById(targetId);

    const friends = await this.userRepository.findFriends(id);

    const deletedFriends = friends?.filter((user) => user.id !== targetUser.id);

    // 친구상태인지 체크
    if (friends.length === deletedFriends.length) throw new BadRequestError("It's not registered.");

    const user = new User();
    user.id = id;
    user.Friends = deletedFriends;

    return !!(await this.userRepository.save(user));
  }
}
