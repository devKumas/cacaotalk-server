import { ForbiddenError, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { getConnection } from 'typeorm';
import { filter, head, pipe } from '@fxts/core';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { CreateChatDto, CreateMessageDto, UpdateChatDto } from '../dtos/ChatDto';
import { ChatListRepository } from '../repositories/ChatListRepository';
import { ChatUserRepository } from '../repositories/ChatUserRepository';
import { ChatContentRepository } from '../repositories/ChatContentRepository';
import { ChatContent } from '../entities/ChatContent';
import { UserService } from './UserService';

@Service()
export class ChatService {
  constructor(
    @InjectRepository() private chatListRepository: ChatListRepository,
    @InjectRepository() private chatUserRepository: ChatUserRepository,
    @InjectRepository() private chatContentRepository: ChatContentRepository,
    private userService: UserService
  ) {}

  /**
   * 사용자의 채팅목록을 반환한다.
   * @param id userId
   */
  async getChatLists(id: number) {
    const chats = await this.chatListRepository.findByUserId(id);
    const messages = await this.chatContentRepository.findLastChatContentByIds(
      chats.map((v) => v.id)
    );

    return chats.map((v) => {
      const { id: chatId } = v;
      const { title } = v.ChatUsers?.filter((v) => v.User?.id === id)[0]!;
      const chatContents: ChatContent[] = messages
        .filter((v) => v.chat_list_id === chatId)
        .map((v) => {
          const chatContent = new ChatContent();
          chatContent.id = v.id;
          chatContent.content = v.content;
          chatContent.image = v.image;
          chatContent.deleted = v.deleted;

          return chatContent;
        });
      const users = v.ChatUsers?.filter((v) => v.User?.id !== id).map((v) => {
        return { id: v.User?.id, name: v.User?.name };
      });

      return { id: chatId, title, Users: users, ChatContents: chatContents };
    });
  }

  /**
   * 채팅을 생성합니다.
   * @param id userId
   * @param createChatDto 채팅 생성 DTO
   * @returns
   */
  async createChat(id: number, createChatDto: CreateChatDto) {
    const targetUser = await this.userService.getUserById(createChatDto.targetId);

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

  /**
   * 사용자의 채팅을 확인한다.
   * @param id userId
   * @param chatId chatId
   */
  async getChatUser(id: number, chatId: number) {
    const chatUser = await this.chatUserRepository.findByUserIdAndChatId(id, chatId);

    if (!chatUser) throw new NotFoundError('There is no matching information.');

    return chatUser;
  }

  async updateChat(id: number, updateChatDto: UpdateChatDto, chatId: number) {
    const chatUser = await this.getChatUser(id, chatId);

    chatUser.title = updateChatDto.title;

    return await this.chatUserRepository.save(chatUser);
  }

  /**
   * 채팅을 삭제한다.
   * @param id userId
   * @param chatId chatId
   */
  async deleteChat(id: number, chatId: number) {
    const chatUser = await this.getChatUser(id, chatId);

    return !!(await this.chatUserRepository.delete(chatUser));
  }

  /**
   * 채팅의 메시지 내용을 호출한다.
   * @param id userId
   * @param chatId chatId
   * @returns
   */
  async getChatMessages(id: number, chatId: number) {
    await this.getChatUser(id, chatId);

    return await this.chatContentRepository.findChatContentById(chatId);
  }

  /**
   *
   * @param id userId
   * @param chatId chatId
   * @param createMessageDto 메시지 생성 DTO
   * @returns
   */
  async createChatMessage(id: number, chatId: number, createMessageDto: CreateMessageDto) {
    const chatList = await this.chatListRepository.findById(chatId);

    if (!chatList) throw new NotFoundError('There is no matching information.');

    if (!chatList.ChatUsers || !chatList.ChatUsers.filter((v) => v.User?.id === id).length)
      throw new ForbiddenError('The request is invalid.');

    const message = createMessageDto.toEntity(id);

    chatList.ChatContents = [...(chatList.ChatContents || []), message];

    return await getConnection().transaction(async (transactionalEntityManager) => {
      const result = await this.chatContentRepository.transactionSave(
        transactionalEntityManager,
        message
      );
      await this.chatListRepository.transactionSave(transactionalEntityManager, chatList);
      return result;
    });
  }

  /**
   * 사용자의 메시지를 삭제한다.
   * @param id userId
   * @param chatId chatId
   * @param messageId messageId
   */
  async deleteChatMessage(id: number, chatId: number, messageId: number) {
    const message = await this.chatContentRepository.findById(messageId, chatId);

    if (!message) throw new NotFoundError('There is no matching information.');

    if (message?.User?.id !== id || message.deleted)
      throw new ForbiddenError('The request is invalid.');

    message.content = null;
    message.image = null;
    message.deleted = true;

    return !!(await this.chatContentRepository.save(message));
  }
}
