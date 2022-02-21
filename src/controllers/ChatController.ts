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
  public async getChats(@CurrentUser() jwtUser: JWTUser) {
    return (await this.chatService.getChatLists(jwtUser.id)).map((v) => {
      const { id } = v;
      const { title } = v.ChatUsers?.filter((v) => v.User?.id === jwtUser.id)[0]!;
      const users = v.ChatUsers?.filter((v) => v.User?.id !== jwtUser.id).map((v) => {
        return { id: v.User?.id, name: v.User?.name };
      });

      return { id, title, users };
    });
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
  public async addChat(@CurrentUser() jwtUser: JWTUser, @Body() createChatDto: CreateChatDto) {
    // 자신의 아이디를 등록하는 경우
    if (jwtUser.id === createChatDto.targetId) throw new ForbiddenError('The request is invalid.');

    const chat = await this.chatService.createChat(jwtUser.id, createChatDto);
    const { id } = chat;
    const { title } = chat.ChatUsers?.filter((chat) => chat.User?.id === jwtUser.id)[0]!;
    const users = chat.ChatUsers?.filter((chat) => chat.User?.id !== jwtUser.id).map((chat) => {
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
  public async editChat(
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
  public async removeChat(@CurrentUser() jwtUser: JWTUser, @Param('chatId') chatId: number) {
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
  public async getMessages(@CurrentUser() jwtUser: JWTUser, @Param('chatId') chatId: number) {
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
  public async addMessage(
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
  public async removeMessage(
    @CurrentUser() jwtUser: JWTUser,
    @Param('chatId') chatId: number,
    @Param('messageId') messageId: number
  ) {
    return await this.chatService.deleteChatMessage(jwtUser.id, chatId, messageId);
  }
}
