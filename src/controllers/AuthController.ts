import { Authorized, Body, CurrentUser, JsonController, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { JWTUser, LoginUserDto, ReissuanceAccessTokenDto } from '../dtos/UserDto';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { createAccessToken, createRefreshToken, checkRefreshToken } from '../utils/Auth';

@OpenAPI({
  tags: ['Auth'],
})
@JsonController('/auth')
export class AuthController {
  constructor(private authService: AuthService, private userService: UserService) {}

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
    const user = await this.authService.login(loginUserDto);

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await this.authService.saveRefreshToken(user, refreshToken);

    return { tokenType: 'bearer', accessToken, refreshToken };
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
    await this.authService.logout(jwtUser.id);
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
    const refreshToken = checkRefreshToken(reissuanceAccessToken.refreshToken);

    let newRefhreshToken;
    const user = await this.authService.checkUserToken(
      refreshToken.id,
      reissuanceAccessToken.refreshToken
    );

    const newAccessToken = createAccessToken(user);

    // refreshToken 기간이 1일 이내라면 갱신
    if (refreshToken.exp! < Math.floor(Date.now() / 1000) + 1 * 24 * 60 * 60) {
      newRefhreshToken = createRefreshToken(user);
      await this.authService.saveRefreshToken(user, newRefhreshToken);
    }

    return { tokenType: 'bearer', accessToken: newAccessToken, refhreshToken: newRefhreshToken };
  }
}
