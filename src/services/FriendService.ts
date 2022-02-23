import { BadRequestError, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

@Service()
export class FriendService {
  constructor(@InjectRepository() private userRepository: UserRepository) {}

  /**
   * 친구를 호출한다.
   * @param loginUserDto 로그인 정보 DTO
   */
  async getFriends(id: number): Promise<User[]> {
    const friends = await this.userRepository.findFriends(id);

    if (!friends) throw new NotFoundError('There is no matching information.');

    return friends || [];
  }

  /**
   * 친구를 등록한다.
   * @param id userId
   * @param targetId targetId
   * @returns
   */
  async createFriend(id: number, targetId: number): Promise<User> {
    const targetUser = await this.userRepository.findById(targetId);

    // 입력된 유저의 정보가 존재하는지 체크
    if (!targetUser) throw new NotFoundError('There is no matching information.');

    const friends = await this.userRepository.findFriends(id);

    const getFriend = friends?.filter((user) => user.id === targetId);

    // 친구상태인지 체크
    if (getFriend.length) throw new BadRequestError("It's already registered.");

    const addedFriends = [...friends, targetUser];

    const user = new User();
    user.id = id;
    user.Friends = addedFriends;

    return this.userRepository.save(user);
  }

  /**
   * 친구를 삭제한다.
   * @param id userId
   * @param targetId targetId
   */
  async deleteFriend(id: number, targetId: number): Promise<void> {
    const targetUser = await this.userRepository.findById(targetId);

    // 입력된 유저의 정보가 존재하는지 체크
    if (!targetUser) throw new NotFoundError('There is no matching information.');

    const friends = await this.userRepository.findFriends(id);

    const deletedFriends = friends?.filter((user) => user.id !== targetId);

    // 친구상태인지 체크
    if (friends.length === deletedFriends.length) throw new BadRequestError("It's not registered.");

    const user = new User();
    user.id = id;
    user.Friends = deletedFriends;

    await this.userRepository.save(user);
  }
}
