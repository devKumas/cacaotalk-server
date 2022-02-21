import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChatList } from './chatList';
import { AutoDateEntity } from './Entity';
import { User } from './User';

@Entity({ name: 'chat_contents' })
export class ChatContent extends AutoDateEntity {
  @Column('varchar', { name: 'content', length: 100, nullable: true })
  content?: string | null;

  @Column('varchar', { name: 'image', length: 100, nullable: true })
  image?: string | null;

  @Column('boolean', { name: 'deleted', default: false })
  deleted?: boolean | null;

  @ManyToOne(() => ChatList, (chatList) => chatList.ChatContents)
  @JoinColumn({ name: 'chat_list_id' })
  ChatList?: ChatList;

  @ManyToOne(() => User, (user) => user.ChatContents)
  @JoinColumn({ name: 'user_id' })
  User?: User;
}
