import { NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { getConnection } from 'typeorm';
import { each, filter, head, map, pipe } from '@fxts/core';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { CreateChatDto, UpdateChatDto } from '../dtos/ChatDto';
import { ChatList } from '../entities/chatList';
import { ChatListRepository } from '../repositories/ChatListRepository';
import { ChatUserRepository } from '../repositories/ChatUserRepository';
import { UserRepository } from '../repositories/UserRepository';

@Service()
export class ChatService {
  constructor(
    @InjectRepository() private chatListRepository: ChatListRepository,
    @InjectRepository() private chatUserRepository: ChatUserRepository,
    @InjectRepository() private userRepository: UserRepository
  ) {}

  /**
   * 사용자의 채팅목록을 반환한다.
   * @param id userId
   */
  public async getChatLists(id: number): Promise<ChatList[]> {
    return await this.chatListRepository.findByUserId(id);
  }

  /**
   * 채팅을 생성합니다.
   * @param id userId
   * @param createChatDto 채팅 생성 DTO
   * @returns
   */
  public async createChat(id: number, createChatDto: CreateChatDto) {
    const targetUser = await this.userRepository.findUserById(createChatDto.targetId);

    if (!targetUser) throw new NotFoundError('There is no matching information.');

    const chats = await this.chatListRepository.findByUserId(id);

    const findChatList = pipe(
      chats,
      filter((v) => !v.group),
      filter((v) => v.ChatUsers?.filter((v) => v.User?.id === targetUser.id).length),
      head
    );

    if (findChatList) return findChatList;

    const { chatList, chatUser, chatTargetUser } = createChatDto.toEntity(id);
    return await getConnection().transaction(async (transactionalEntityManager) => {
      await this.chatUserRepository.transactionSave(transactionalEntityManager, chatUser);
      await this.chatUserRepository.transactionSave(transactionalEntityManager, chatTargetUser);
      return await this.chatListRepository.transactionSave(transactionalEntityManager, chatList);
    });
  }

  public async updateChat(id: number, updateChatDto: UpdateChatDto, chatId: number) {
    const chatUser = await this.chatUserRepository.findByUserIdAndChatId(id, chatId);

    if (!chatUser) throw new NotFoundError('There is no matching information.');

    chatUser.title = updateChatDto.title;

    return await this.chatUserRepository.save(chatUser);
  }

  /**
   * 채팅방
   * @param id userId
   * @param chatId chatId
   */
  public async deleteChat(id: number, chatId: number) {
    const chatUser = await this.chatUserRepository.findByUserIdAndChatId(id, chatId);

    if (!chatUser) throw new NotFoundError('There is no matching information.');

    await this.chatUserRepository.delete(chatUser);
  }
}
