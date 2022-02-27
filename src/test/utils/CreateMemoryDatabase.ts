import { Container } from 'typedi';
import { createConnection, useContainer } from 'typeorm';
import { ChatContent } from '../../entities/ChatContent';
import { ChatList } from '../../entities/ChatList';
import { ChatUser } from '../../entities/ChatUser';
import { User } from '../../entities/User';

/**
 * 테스트에 사용할 In-memory Database를 만든다
 * @param entities
 */
export async function createMemoryDatabase() {
  useContainer(Container);
  return createConnection({
    type: 'sqlite',
    database: ':memory:',
    entities: [User, ChatList, ChatContent, ChatUser],
    dropSchema: true,
    synchronize: true,
    logging: false,
  });
}
