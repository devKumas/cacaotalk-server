import {
  Authorized,
  Body,
  CurrentUser,
  Delete,
  ForbiddenError,
  Get,
  JsonController,
  Param,
  Post,
  Put,
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { CreateChatDto, CreateMessageDto, UpdateChatDto } from '../dtos/ChatDto';
import { JWTUser } from '../dtos/UserDto';
import { ChatService } from '../services/ChatService';

@OpenAPI({
  tags: ['Chat'],
  security: [{ bearerAuth: [] }],
})
@Authorized()
@JsonController('/chats')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @OpenAPI({
    summary: '채팅 조회',
    description: '채팅 목록을 조회하여 반환합니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Get('')
  async getChats(@CurrentUser() jwtUser: JWTUser) {
    return await this.chatService.getChatLists(jwtUser.id);
  }

  @OpenAPI({
    summary: '채팅 등록',
    description: '채팅을 생성 합니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Post('')
  async addChat(@CurrentUser() jwtUser: JWTUser, @Body() createChatDto: CreateChatDto) {
    // 자신의 아이디를 등록하는 경우
    if (jwtUser.id === createChatDto.targetId) throw new ForbiddenError('The request is invalid.');

    const chats = await this.chatService.createChat(jwtUser.id, createChatDto);
    const { id } = chats;
    const { title } = chats.ChatUsers?.filter((chat) => chat.User?.id === jwtUser.id)[0]!;
    const users = chats.ChatUsers?.filter((chat) => chat.User?.id !== jwtUser.id).map((chat) => {
      return { id: chat.User?.id, name: chat.User?.name };
    });

    return { id, title, users };
  }

  @OpenAPI({
    summary: '채팅 수정',
    description: '채팅을 수정 합니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Put('/:chatId')
  async editChat(
    @CurrentUser() jwtUser: JWTUser,
    @Body() updateChatDto: UpdateChatDto,
    @Param('chatId') chatId: number
  ) {
    return await this.chatService.updateChat(jwtUser.id, updateChatDto, chatId);
  }

  @OpenAPI({
    summary: '채팅 삭제',
    description: '채팅을 삭제 합니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Delete('/:chatId')
  async removeChat(@CurrentUser() jwtUser: JWTUser, @Param('chatId') chatId: number) {
    return await this.chatService.deleteChat(jwtUser.id, chatId);
  }

  @OpenAPI({
    summary: '메시지 조회',
    description: '채팅내 메시지를 조회합니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Get('/:chatId/messages')
  async getMessages(@CurrentUser() jwtUser: JWTUser, @Param('chatId') chatId: number) {
    return await this.chatService.getChatMessages(jwtUser.id, chatId);
  }

  @OpenAPI({
    summary: '메시지 등록',
    description: '메시지를 등록합니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Post('/:chatId/messages')
  async addMessage(
    @CurrentUser() jwtUser: JWTUser,
    @Param('chatId') chatId: number,
    @Body() createMessageDto: CreateMessageDto
  ) {
    return await this.chatService.createChatMessage(jwtUser.id, chatId, createMessageDto);
  }

  @OpenAPI({
    summary: '메시지 삭제',
    description: '메시지를 삭제합니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Delete('/:chatId/messages/:messageId')
  async removeMessage(
    @CurrentUser() jwtUser: JWTUser,
    @Param('chatId') chatId: number,
    @Param('messageId') messageId: number
  ) {
    return await this.chatService.deleteChatMessage(jwtUser.id, chatId, messageId);
  }
}
