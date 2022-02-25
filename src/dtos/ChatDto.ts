import { IsInt, Length } from 'class-validator';
import { ChatContent } from '../entities/ChatContent';
import { ChatList } from '../entities/ChatList';
import { ChatUser } from '../entities/ChatUser';
import { User } from '../entities/User';

/**
 * 사용자 생성 DTO
 */
export class CreateChatDto {
  @IsInt()
  targetId!: number;

  toEntity(id: number) {
    const user = new User();
    user.id = id;

    const targetUser = new User();
    targetUser.id = this.targetId;

    const chatUser = new ChatUser();
    chatUser.User = user;

    const chatTargetUser = new ChatUser();
    chatTargetUser.User = targetUser;

    const chatList = new ChatList();
    chatList.ChatUsers = [chatUser, chatTargetUser];

    return { chatList, chatUser, chatTargetUser };
  }
}

export class UpdateChatDto {
  @Length(1, 100)
  title!: string;
}

export class CreateMessageDto {
  @Length(1, 100)
  content!: string;

  toEntity(id: number) {
    const user = new User();
    user.id = id;
    const message = new ChatContent();
    message.content = this.content;
    message.User = user;
    return message;
  }
}
