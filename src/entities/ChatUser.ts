import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChatList } from './chatList';
import { AutoDateEntity } from './Entity';
import { User } from './User';

@Entity({ name: 'chat_users' })
export class ChatUser extends AutoDateEntity {
  @Column('varchar', { name: 'titie', length: 100, nullable: true })
  title?: string | null;

  @ManyToOne(() => ChatList, (chatList) => chatList.ChatUsers)
  @JoinColumn({ name: 'chat_list_id' })
  ChatList?: ChatList;

  @ManyToOne(() => User, (user) => user.ChatUsers)
  @JoinColumn({ name: 'user_id' })
  User?: User;
}
