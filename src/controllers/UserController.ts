import {
  JsonController,
  Get,
  Param,
  HttpCode,
  Post,
  Body,
  BadRequestError,
  Patch,
  Authorized,
  CurrentUser,
} from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { CreateUserDto, JWTUser, UpdateUserDto } from '../dtos/UserDto';
import { UserService } from '../services/UserService';

@OpenAPI({
  tags: ['User'],
})
@JsonController('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @OpenAPI({
    summary: '사용자 정보 조회',
    description: 'UserId로 사용자 정보를 조회하여 반환합니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Get('/id/:id')
  public async getUserById(@Param('id') id: number) {
    return await this.userService.getUserById(id);
  }

  @OpenAPI({
    summary: '사용자 정보 조회',
    description: 'Email로 사용자 정보를 조회하여 반환합니다.',
    statusCode: '200',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @Get('/email/:email')
  public async getUserByEmail(@Param('email') email: string) {
    return await this.userService.getUserByEmail(email);
  }
  @OpenAPI({
    summary: '사용자 등록',
    description: '사용자를 등록하여 반환합니다.',
    statuscode: '201',
    responses: {
      '400': {
        description: 'Bad request',
      },
    },
  })
  @HttpCode(201)
  @Post('')
  public async register(@Body() createUserDto: CreateUserDto) {
    const isDuplicateUser = await this.userService.isDuplicateUser(createUserDto.email);

    if (isDuplicateUser) throw new BadRequestError('This is the email used.');

    return await this.userService.createUser(createUserDto);
  }

  @OpenAPI({
    summary: '사용자 수정',
    description: '사용자를 정보를 변경하여 반환합니다.',
    statuscode: '200',
    security: [{ bearerAuth: [] }],
  })
  @Authorized()
  @Patch('')
  public async editUser(@CurrentUser() jwtUser: JWTUser, @Body() updateUserDto: UpdateUserDto) {
    const isDuplicateUser = await this.userService.isDuplicateUser(updateUserDto.email);

    if (isDuplicateUser) throw new BadRequestError('This is the email used.');

    const updateUser = await this.userService.getUserById(jwtUser.id);

    return await this.userService.updateUser(updateUser, updateUserDto);
  }
}
