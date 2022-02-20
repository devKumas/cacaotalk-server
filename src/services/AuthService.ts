import { NotFoundError, UnauthorizedError } from 'routing-controllers';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { LoginUserDto } from '../dtos/UserDto';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

@Service()
export class AuthService {
  constructor(@InjectRepository() private userRepository: UserRepository) {}

  /**
   * 로그인 정보를 확인하여 일치하는 정보를 반환한다.
   * @param loginUserDto 로그인 정보 DTO
   */
  public async login(loginUserDto: LoginUserDto): Promise<User> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findFullUserByEmail(email);

    if (!user) throw new NotFoundError('There is no matching information.');

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) throw new NotFoundError('There is no matching information.');

    return user;
  }

  /**
   * RefreshToken을 사용자에게 저장한다.
   * @param user User
   * @param token RefreshToken
   */
  public async saveRefreshToken(user: User, token: string): Promise<User> {
    user.refreshToken = token;
    return await this.userRepository.save(user);
  }

  /**
   * RefreshToken을 검증한다.
   * @param id userId
   * @param token Refresh Token
   * @returns
   */
  public async checkUserToken(id: number, token: string): Promise<User> {
    const user = await this.userRepository.findUserToken(id);

    if (!user || user.refreshToken !== token)
      throw new UnauthorizedError('Invalid or Missing JWT token.');

    return user;
  }
}
