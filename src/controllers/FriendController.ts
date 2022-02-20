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
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { FriendDto, JWTUser } from '../dtos/UserDto';
import { FriendService } from '../services/FriendService';

@OpenAPI({
  tags: ['Friend'],
  security: [{ bearerAuth: [] }],
})
@Authorized()
@JsonController('/friends')
export class FriendController {
  constructor(private friendService: FriendService) {}

  @OpenAPI({
    summary: '친구 조회',
    description: '친구 목록을 조회하여 반환합니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Get('')
  public async getFriends(@CurrentUser() jwtUser: JWTUser) {
    return await this.friendService.getFriends(jwtUser.id);
  }

  @OpenAPI({
    summary: '친구 등록',
    description: '친구를 등록합니다.',
    statusCode: '201',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Post('')
  public async addFriend(@CurrentUser() jwtUser: JWTUser, @Body() friendDto: FriendDto) {
    // 자신의 아이디를 등록하는 경우
    if (jwtUser.id === friendDto.targetId) throw new ForbiddenError('The request is invalid.');

    return await this.friendService.createFriend(jwtUser.id, friendDto.targetId);
  }

  @OpenAPI({
    summary: '친구 삭제',
    description: '등록된 친구를 삭제합니다.',
    statusCode: '201',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Delete('/:id')
  public async removeFriend(@CurrentUser() jwtUser: JWTUser, @Param('id') targetId: number) {
    // 자신의 아이디를 삭제하는 경우
    if (jwtUser.id === targetId) throw new ForbiddenError('The request is invalid.');

    return await this.friendService.deleteFriend(jwtUser.id, targetId);
  }
}
