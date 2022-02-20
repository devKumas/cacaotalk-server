import {
  BadRequestError,
  Body,
  CurrentUser,
  ForbiddenError,
  HttpCode,
  JsonController,
  Post,
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { CreateUserDto, JWTUser, LoginUserDto, ReissuanceAccessTokenDto } from '../dtos/UserDto';
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
  public async logout(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.login(loginUserDto);

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await this.authService.saveRefreshToken(user, refreshToken);

    return { tokenType: 'bearer', accessToken, refreshToken };
  }

  @OpenAPI({
    summary: '사용자 등록',
    description: '사용자를 등록하여 반환합니다.',
    statuscode: '201',
  })
  @HttpCode(201)
  @Post('/register')
  public async register(@Body() createUserDto: CreateUserDto) {
    const isDuplicateUser = await this.userService.isDuplicateUser(createUserDto.email);

    if (isDuplicateUser) throw new BadRequestError('This is the email used.');

    return await this.userService.createUser(createUserDto);
  }

  @OpenAPI({
    summary: 'Access Token 재발급',
    description: '사용자의 Refresh Token을 체크하여 Access Token을 재발급 합니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
    security: [{ bearerAuth: [] }],
  })
  @Post('/token')
  public async reissuanceAccessToken(@Body() reissuanceAccessToken: ReissuanceAccessTokenDto) {
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
