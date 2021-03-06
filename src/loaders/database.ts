import Container from 'typedi';
import { createConnection, ConnectionOptions, useContainer } from 'typeorm';
import { env } from '../env';
import { User } from '../entities/User';
import { ChatList } from '../entities/ChatList';
import { ChatContent } from '../entities/ChatContent';
import { ChatUser } from '../entities/ChatUser';

export async function createDatabaseConnection(): Promise<void> {
  try {
    const connectionOpts: ConnectionOptions = {
      type: 'mysql',
      host: env.database.host,
      port: env.database.port,
      username: env.database.usename,
      password: env.database.password,
      database: env.database.name,
      synchronize: env.database.synchronize,
      logging: env.database.logging,
      entities: [User, ChatList, ChatContent, ChatUser],
    };

    useContainer(Container);
    await createConnection(connectionOpts);
  } catch (error) {
    throw error;
  }
}
