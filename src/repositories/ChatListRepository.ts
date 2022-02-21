import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';
import { ChatList } from '../entities/chatList';

@EntityRepository(ChatList)
export class ChatListRepository extends Repository<ChatList> {
  /**
   * 사용자의 채팅목록을 조회한다.
   * @param id userId
   */
  public async findByUserId(id: number) {
    return await this.createQueryBuilder('chatList')
      .leftJoinAndSelect('chatList.ChatUsers', 'chatUsers')
      .leftJoinAndSelect('chatUsers.User', 'user')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('chatList.id')
          .from(ChatList, 'chatList')
          .leftJoin('chatList.ChatUsers', 'chatUsers')
          .leftJoin('chatUsers.User', 'user')
          .where('user_id = :id', { id })
          .getQuery();
        return 'chatList.id IN ' + subQuery;
      })
      .getMany();
  }

  public async findById(id: number) {
    return await this.createQueryBuilder('chatList')
      .leftJoinAndSelect('chatList.ChatContents', 'chatContents')
      .leftJoinAndSelect('chatList.ChatUsers', 'chatUsers')
      .leftJoinAndSelect('chatUsers.User', 'user')
      .where('chatList.id = :id', { id })
      .getOne();
  }

  /**
   * 트랜잭션을 적용하여 저장한다.
   * @param transactionManager 트랜잭션
   * @param chatList chatList Entity
   */
  public async transactionSave(
    @TransactionManager() transactionManager: EntityManager,
    chatList: ChatList
  ) {
    return await transactionManager.save(chatList);
  }
}
