import { Authorized, Body, CurrentUser, JsonController, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { JWTUser, LoginUserDto, ReissuanceAccessTokenDto } from '../dtos/UserDto';
import { AuthService } from '../services/AuthService';

@OpenAPI({
  tags: ['Auth'],
})
@JsonController('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @OpenAPI({
    summary: '로그인',
    description: '사용자 정보를 입력하여 로그인을 합니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.authService.login(loginUserDto);
  }

  @OpenAPI({
    summary: '로그아웃',
    description: '저장된 Refresh Token을 삭제합니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
    security: [{ bearerAuth: [] }],
  })
  @Authorized()
  @Post('/logout')
  async logout(@CurrentUser() jwtUser: JWTUser) {
    return await this.authService.logout(jwtUser.id);
  }

  @OpenAPI({
    summary: '토큰 재발급',
    description:
      '사용자의 Refresh Token을 체크하여 Access Token을 재발급 합니다. Refresh Token의 기간이 하루 미만 이면 함께 재발급 됩니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Post('/token')
  async reissuanceAccessToken(@Body() reissuanceAccessToken: ReissuanceAccessTokenDto) {
    return await this.authService.checkUserToken(reissuanceAccessToken.refreshToken);
  }
}
