import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';
import { ChatContent } from '../entities/chatContent';
import { ChatUser } from '../entities/chatUser';

@EntityRepository(ChatUser)
export class ChatUserRepository extends Repository<ChatUser> {
  /**
   * 유저의 채팅정보를 호출한다.
   * @param id userId
   * @param chatId chatId
   * @returns
   */
  async findByUserIdAndChatId(id: number, chatId: number) {
    return await this.createQueryBuilder('chatUser')
      .where('user_id = :id', { id })
      .andWhere('chat_list_id = :chatId', { chatId })
      .getOne();
  }

  async findChatListById(id: number) {
    const chatUser = await this.createQueryBuilder('chatUser')
      .leftJoinAndSelect('chatUser.ChatList', 'chatList')
      .where('chatUser.user_id = :id', { id })
      .getMany();

    return chatUser;
  }

  /**
   * 트랜잭션을 적용하여 저장한다.
   * @param transactionManager 트랜잭션
   * @param chatUser chatUser Entity
   */
  async transactionSave(
    @TransactionManager() transactionManager: EntityManager,
    chatUser: ChatUser
  ) {
    return await transactionManager.save(chatUser);
  }
}
