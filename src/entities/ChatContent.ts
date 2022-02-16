import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChatList } from './chatList';
import { AutoDateEntity } from './Entity';

@Entity({ name: 'chat_contents' })
export class ChatContent extends AutoDateEntity {
  @Column('varchar', { name: 'content', length: 100 })
  content?: string | null;

  @Column('varchar', { name: 'image', length: 100 })
  image?: string | null;

  @Column('boolean', { name: 'deleted', default: false })
  deleted?: boolean | null;

  @ManyToOne(() => ChatList, (chatContents) => chatContents.ChatContents)
  @JoinColumn({ name: 'chat_list_id' })
  ChatList?: ChatList;
}
