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
import { CreateChatDto, UpdateChatDto } from '../dtos/ChatDto';
import { JWTUser } from '../dtos/UserDto';
import { ChatService } from '../services/ChatService';

@OpenAPI({
  tags: ['Chat'],
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
    security: [{ bearerAuth: [] }],
  })
  @Get('')
  public async getChats(@CurrentUser() jwtUser: JWTUser) {
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
    security: [{ bearerAuth: [] }],
  })
  @Post('')
  public async addChat(@CurrentUser() jwtUser: JWTUser, @Body() createChatDto: CreateChatDto) {
    // 자신의 아이디를 등록하는 경우
    if (jwtUser.id === createChatDto.targetId) throw new ForbiddenError('The request is invalid.');

    return await this.chatService.createChat(jwtUser.id, createChatDto);
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
    security: [{ bearerAuth: [] }],
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
    security: [{ bearerAuth: [] }],
  })
  @Delete('/:chatId')
  public async removeChat(@CurrentUser() jwtUser: JWTUser, @Param('chatId') chatId: number) {
    return await this.chatService.deleteChat(jwtUser.id, chatId);
  }
}
