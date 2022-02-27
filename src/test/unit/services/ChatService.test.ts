import { Connection } from 'typeorm';
import { CreateChatDto, CreateMessageDto, UpdateChatDto } from '../../../dtos/ChatDto';
import { ChatContent } from '../../../entities/ChatContent';
import { ChatList } from '../../../entities/ChatList';
import { User } from '../../../entities/User';
import { ChatContentRepository } from '../../../repositories/ChatContentRepository';
import { ChatListRepository } from '../../../repositories/ChatListRepository';
import { ChatUserRepository } from '../../../repositories/ChatUserRepository';
import { UserRepository } from '../../../repositories/UserRepository';
import { ChatService } from '../../../services/ChatService';
import { UserService } from '../../../services/UserService';
import { createMemoryDatabase } from '../../utils/CreateMemoryDatabase';
import { chatSeed } from '../../utils/seeds/ChatTestSeed';
import { userSeed } from '../../utils/seeds/UserTestSeed';

let db: Connection;
let userRepository: UserRepository;
let userService: UserService;
let chatListRepository: ChatListRepository;
let chatUserRepository: ChatUserRepository;
let chatContentRepository: ChatContentRepository;
let chatService: ChatService;
let user: User;
let targetUser: User;
let chats: ChatList[];
let newChat: ChatList;
let newMessage: ChatContent;

beforeAll(async () => {
  db = await createMemoryDatabase();
  userRepository = db.getCustomRepository(UserRepository);
  [user, targetUser] = await userRepository.save(userSeed);
  chatListRepository = db.getCustomRepository(ChatListRepository);
  chats = await chatListRepository.save(chatSeed);
  chatUserRepository = db.getCustomRepository(ChatUserRepository);
  chatContentRepository = db.getCustomRepository(ChatContentRepository);
  userService = new UserService(userRepository);
  chatService = new ChatService(
    chatListRepository,
    chatUserRepository,
    chatContentRepository,
    userService
  );
});

afterAll(() => db.close());

describe('createChat', () => {
  it('채팅을 등록하고 정보를 반환한다.', async () => {
    const createChatDto = new CreateChatDto();
    createChatDto.targetId = targetUser.id;

    const chat = await chatService.createChat(user.id, createChatDto);
    newChat = chat;

    expect(chat.createdAt).toBeTruthy();
  });

  it('이미 채팅이 있다면 등록되어 있는 채팅정보를 반환한다.', async () => {
    const createChatDto = new CreateChatDto();
    createChatDto.targetId = targetUser.id;

    const chat = await chatService.createChat(user.id, createChatDto);

    expect(chat.createdAt).toBeFalsy();
  });
});

describe('getChatLists', () => {
  it('사용자의 채팅목록을 반환한다.', async () => {
    const chats = await chatService.getChatLists(user.id);

    expect(chats[0].id).toBe(newChat.id);
  });
});

describe('getChatUser', () => {
  it('사용자의 채팅을 확인한다.', async () => {
    const chatUser = await chatService.getChatUser(user.id, newChat.id);

    expect(chatUser).toBeTruthy();
  });

  it('사용자의 채팅이 없다면 404 오류를 발생시킨다.', async () => {
    try {
      await chatService.getChatUser(user.id, 0);
    } catch ({ httpCode }) {
      expect(httpCode).toBe(404);
    }
  });
});

describe('updateChat', () => {
  it('채팅방 이름을 변경한다.', async () => {
    const title = '임의의 채팅';
    const updateChatDto = new UpdateChatDto();
    updateChatDto.title = title;

    const chat = await chatService.updateChat(user.id, updateChatDto, newChat.id);

    expect(chat.title).toBe(title);
  });
});

describe('createChatMessage', () => {
  it('메시지를 등록한다.', async () => {
    const createMessageDto = new CreateMessageDto();
    createMessageDto.content = '메시지 입니다.';
    const message = await chatService.createChatMessage(user.id, newChat.id, createMessageDto);

    expect(message.content).toBe(createMessageDto.content);

    newMessage = message;
  });

  it('없는 채팅에 메시지를 전송하는 경우 404 오류를 발생합니다.', async () => {
    try {
      const createMessageDto = new CreateMessageDto();
      createMessageDto.content = '메시지 입니다.';
      await chatService.createChatMessage(user.id, 0, createMessageDto);
    } catch ({ httpCode }) {
      expect(httpCode).toBe(404);
    }
  });

  it('권한이 없는 채팅에 메시지를 전송하는 경우 403 오류를 발생합니다.', async () => {
    try {
      const createMessageDto = new CreateMessageDto();
      createMessageDto.content = '메시지 입니다.';
      await chatService.createChatMessage(user.id, chats[0].id, createMessageDto);
    } catch ({ httpCode }) {
      expect(httpCode).toBe(403);
    }
  });
});

describe('getChatMessages', () => {
  it('채팅의 메시지를 호출한다.', async () => {
    const message = await chatService.getChatMessages(user.id, newChat.id);

    expect(message).toBeTruthy();
  });
});

describe('deleteChatMessage', () => {
  it('채팅의 메시지를 삭제한다.', async () => {
    const message = await chatService.deleteChatMessage(user.id, newChat.id, newMessage.id);

    expect(message).toBeTruthy();
  });

  it('삭제할 메시지가 없다면 404 오류를 발생시킨다.', async () => {
    try {
      await chatService.deleteChatMessage(user.id, newChat.id, 0);
    } catch ({ httpCode }) {
      expect(httpCode).toBe(404);
    }
  });

  it('이미 삭제된 메시지라면 404 오류를 발생시킨다.', async () => {
    try {
      await chatService.deleteChatMessage(user.id, newChat.id, newMessage.id);
    } catch ({ httpCode }) {
      expect(httpCode).toBe(403);
    }
  });
});

describe('deleteChat', () => {
  it('채팅을 삭제한다.', async () => {
    const message = await chatService.deleteChat(user.id, newChat.id);

    expect(message).toBeTruthy();
  });
});
