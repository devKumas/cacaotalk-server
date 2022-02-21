import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';
import { ChatContent } from '../entities/chatContent';

@EntityRepository(ChatContent)
export class ChatContentRepository extends Repository<ChatContent> {
  public async findByChatListId(chatId: number) {
    return await this.createQueryBuilder('chatContents')
      .addSelect(['user.id', 'user.name'])
      .leftJoin('chatContents.User', 'user')
      .where('chat_list_id = :chatId', { chatId })
      .getMany();
  }

  public async findById(id: number, chatId: number) {
    return await this.createQueryBuilder('chatContents')
      .addSelect(['user.id'])
      .leftJoin('chatContents.ChatList', 'chatList')
      .leftJoin('chatContents.User', 'user')
      .where('chatContents.id = :id', { id })
      .andWhere('chatList.id = :chatId', { chatId })
      .getOne();
  }

  /**
   * 트랜잭션을 적용하여 저장한다.
   * @param transactionManager 트랜잭션
   * @param chatUser chatContent Entity
   */
  public async transactionSave(
    @TransactionManager() transactionManager: EntityManager,
    chatContent: ChatContent
  ) {
    return await transactionManager.save(chatContent);
  }
}
