import { EntityManager, EntityRepository, Repository, TransactionManager } from 'typeorm';
import { ChatContent } from '../entities/ChatContent';

@EntityRepository(ChatContent)
export class ChatContentRepository extends Repository<ChatContent> {
  async findChatContentById(chatId: number, skip: number = 0) {
    return await this.createQueryBuilder('chatContents')
      .addSelect(['user.id', 'user.name'])
      .leftJoin('chatContents.User', 'user')
      .where('chat_list_id = :chatId', { chatId })
      .take(100)
      .skip(skip)
      .getMany();
  }

  async findById(id: number, chatId: number) {
    return await this.createQueryBuilder('chatContents')
      .addSelect(['user.id'])
      .leftJoin('chatContents.ChatList', 'chatList')
      .leftJoin('chatContents.User', 'user')
      .where('chatContents.id = :id', { id })
      .andWhere('chatList.id = :chatId', { chatId })
      .getOne();
  }

  async findLastChatContentByIds(chatIds: number[]) {
    return await this.createQueryBuilder()
      .subQuery()
      .from((qb) => {
        return qb
          .subQuery()
          .select(['id', 'content', 'image', 'deleted', 'chat_list_id'])
          .addSelect(
            'ROW_NUMBER() OVER(PARTITION BY chat_list_id ORDER BY created_at DESC)',
            'RowIdx'
          )
          .from(ChatContent, 'c');
      }, 'f')
      .where('RowIdx = 1')

      .getRawMany();
  }

  /**
   * 트랜잭션을 적용하여 저장한다.
   * @param transactionManager 트랜잭션
   * @param chatUser chatContent Entity
   */
  async transactionSave(
    @TransactionManager() transactionManager: EntityManager,
    chatContent: ChatContent
  ) {
    return await transactionManager.save(chatContent);
  }
}
