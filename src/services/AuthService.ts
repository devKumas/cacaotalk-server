import { NotFoundError, UnauthorizedError } from 'routing-controllers';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { LoginUserDto } from '../dtos/UserDto';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import { checkRefreshToken, createAccessToken, createRefreshToken } from '../utils/Auth';
import { UserService } from './UserService';

@Service()
export class AuthService {
  constructor(
    @InjectRepository() private userRepository: UserRepository,
    private userService: UserService
  ) {}

  /**
   * 로그인 정보를 확인하여 일치하는 정보를 반환한다.
   * @param loginUserDto 로그인 정보 DTO
   */
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userService.getUserByEmail(email, true);

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) throw new NotFoundError('There is no matching information.');

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    await this.saveRefreshToken(user, refreshToken);

    return { tokenType: 'bearer', accessToken, refreshToken };
  }

  /**
   * 사용자의 RefreshToken을 제거한다.
   * @param id userId
   */
  async logout(id: number) {
    const user = await this.userService.getUserById(id);

    return !!(await this.saveRefreshToken(user, null));
  }

  /**
   * RefreshToken을 사용자에게 저장한다.
   * @param user User
   * @param token RefreshToken
   */
  async saveRefreshToken(user: User, token: string | null) {
    user.refreshToken = token;
    return await this.userRepository.save(user);
  }

  /**
   * RefreshToken을 검증하여 토큰을 반환한다.
   * @param id userId
   * @param token Refresh Token
   * @returns
   */
  async checkUserToken(refreshToken: string) {
    const { id, exp } = checkRefreshToken(refreshToken);

    let newRefhreshToken;

    const user = await this.userRepository.findUserToken(id);

    if (!user || user.refreshToken !== refreshToken)
      throw new UnauthorizedError('Invalid or Missing JWT token.');

    const newAccessToken = createAccessToken(user);

    // refreshToken 기간이 1일 이내라면 갱신
    if (exp! < Math.floor(Date.now() / 1000) + 1 * 24 * 60 * 60) {
      newRefhreshToken = createRefreshToken(user);
      await this.saveRefreshToken(user, newRefhreshToken);
    }
    return { tokenType: 'bearer', accessToken: newAccessToken, refhreshToken: newRefhreshToken };
  }
}
