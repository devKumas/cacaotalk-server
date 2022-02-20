import { IsInt, Length } from 'class-validator';
import { ChatList } from '../entities/chatList';
import { ChatUser } from '../entities/chatUser';
import { User } from '../entities/User';

/**
 * 사용자 생성 DTO
 */
export class CreateChatDto {
  @IsInt()
  public targetId!: number;

  public toEntity(id: number) {
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
  public title!: string;
}
