import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entities/User';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  /**
   * 사용자의 정보를 조회한다.
   * @param id userId
   * @returns
   */
  public async findUserById(id: number) {
    return await this.createQueryBuilder('user').where('user.id = :id', { id }).getOne();
  }

  /**
   * 사용자의 비밀번호를 포함한 정보를 조회한다.
   * @param id userId
   * @returns
   */
  public async findFullUserById(id: number) {
    return await this.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
  }

  /**
   * 사용자의 정보를 조회한다.
   * @param email userEmail
   * @returns
   */
  public async findUserByEmail(email: string) {
    return await this.createQueryBuilder('user').where('user.email = :email', { email }).getOne();
  }

  /**
   * 사용자의 비밀번호를 포함한 정보를 조회한다.
   * @param email userEmail
   * @returns
   */
  public async findFullUserByEmail(email: string) {
    return await this.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  /**
   * 사용자의 토큰은 조회한다.
   * @param id userId
   * @returns
   */
  public async findUserToken(id: number) {
    return await this.createQueryBuilder('user')
      .addSelect('user.refreshToken')
      .where('user.id = :id', { id })
      .getOne();
  }

  /**
   * 사용자의 친구를 모두 조회한다.
   * @param id userId
   * @returns
   */
  public async findFriends(id: number) {
    return (
      (
        await this.createQueryBuilder('user')
          .leftJoinAndSelect('user.Friends', 'friend')
          .where('user.id = :id', { id })
          .getOne()
      )?.Friends ?? []
    );
  }

  /**
   * 사용자의 친구중 특정 ID를 조회한다.
   * @param id userId
   * @returns
   */
  public async findFriend(id: number, targetId: number) {
    return (
      (
        await this.createQueryBuilder('user')
          .leftJoinAndSelect('user.Friends', 'friend')
          .where('user.id = :id', { id })
          .andWhere('friend.id = :targetId', { targetId })
          .getOne()
      )?.Friends ?? []
    );
  }
}
