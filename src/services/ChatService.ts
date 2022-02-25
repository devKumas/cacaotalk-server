import { ForbiddenError, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { getConnection } from 'typeorm';
import { filter, head, map, pipe } from '@fxts/core';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { CreateChatDto, CreateMessageDto, UpdateChatDto } from '../dtos/ChatDto';
import { ChatList } from '../entities/chatList';
import { ChatListRepository } from '../repositories/ChatListRepository';
import { ChatUserRepository } from '../repositories/ChatUserRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ChatContentRepository } from '../repositories/ChatContentRepository';
import { ChatContent } from '../entities/ChatContent';

@Service()
export class ChatService {
  constructor(
    @InjectRepository() private chatListRepository: ChatListRepository,
    @InjectRepository() private chatUserRepository: ChatUserRepository,
    @InjectRepository() private chatContentRepository: ChatContentRepository,
    @InjectRepository() private userRepository: UserRepository
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
  async createChat(id: number, createChatDto: CreateChatDto): Promise<ChatList> {
    const targetUser = await this.userRepository.findById(createChatDto.targetId);

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

  async updateChat(id: number, updateChatDto: UpdateChatDto, chatId: number): Promise<ChatList> {
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
  async deleteChat(id: number, chatId: number): Promise<void> {
    const chatUser = await this.chatUserRepository.findByUserIdAndChatId(id, chatId);

    if (!chatUser) throw new NotFoundError('There is no matching information.');

    await this.chatUserRepository.delete(chatUser);
  }

  async getChatMessages(id: number, chatId: number): Promise<ChatContent[]> {
    const chatUser = await this.chatUserRepository.findByUserIdAndChatId(id, chatId);

    if (!chatUser) throw new NotFoundError('There is no matching information.');

    return await this.chatContentRepository.findChatContentById(chatId);
  }

  async createChatMessage(
    id: number,
    chatId: number,
    createMessageDto: CreateMessageDto
  ): Promise<ChatContent> {
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

  async deleteChatMessage(id: number, chatId: number, messageId: number): Promise<void> {
    const message = await this.chatContentRepository.findById(messageId, chatId);

    if (!message) throw new NotFoundError('There is no matching information.');

    if (message?.User?.id !== id || message.deleted)
      throw new ForbiddenError('The request is invalid.');

    message.content = null;
    message.image = null;
    message.deleted = true;

    this.chatContentRepository.save(message);
  }
}
