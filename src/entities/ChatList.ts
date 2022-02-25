import { Column, Entity, OneToMany } from 'typeorm';
import { ChatContent } from './ChatContent';
import { ChatUser } from './ChatUser';
import { AutoDateEntity } from './Entity';

@Entity({ name: 'chat_lists' })
export class ChatList extends AutoDateEntity {
  @Column('boolean', { name: 'group', default: false })
  group?: boolean;

  @OneToMany(() => ChatContent, (chatContents) => chatContents.ChatList)
  ChatContents?: ChatContent[];

  @OneToMany(() => ChatUser, (chatUsers) => chatUsers.ChatList)
  ChatUsers?: ChatUser[];
}
