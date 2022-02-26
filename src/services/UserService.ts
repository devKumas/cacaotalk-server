import { BadRequestError, InternalServerError, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { CreateUserDto, UpdateUserDto } from '../dtos/UserDto';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcrypt';

@Service()
export class UserService {
  constructor(@InjectRepository() private userRepository: UserRepository) {}

  /**
   * 사용자의 정보를 조회한다.
   * @param id 사용자 id
   */
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundError('There is no matching information.');

    return user;
  }

  /**
   * 사용자의 비밀번호를 포함한 정보를 조회한다.
   * @param id 사용자 id
   */
  async getUserPasswordById(id: number): Promise<User> {
    const user = await this.userRepository.findAndPasswordById(id);

    if (!user) throw new NotFoundError('There is no matching information.');

    return user;
  }

  /**
   * 사용자의 정보를 조회한다.
   * @param email 사용자 email
   */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findUserByEmail(email);

    if (!user) throw new NotFoundError('There is no matching information.');

    return user;
  }

  /**
   * 사용자를 생성한다.
   * @param createuserDto 사용자 생성 DTO
   */
  async createUser(createuserDto: CreateUserDto): Promise<User> {
    try {
      const user = createuserDto.toEntity();
      return await this.userRepository.save(user);
    } catch (error: any) {
      if ([1062, 19].includes(error.errno)) throw new BadRequestError('This is the email used.');
      throw new InternalServerError('Server Error');
    }
  }

  /**
   * 사용자의 정보를 수정한다.
   * @param id userId
   * @param updateUserDto 사용자 수정정보 DTO
   */
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(id);

    const { email, password, name } = updateUserDto;

    if (email) user.email = email;
    if (password) user.password = bcrypt.hashSync(password, 10);
    if (name) user.name = name;

    try {
      return await this.userRepository.save(user);
    } catch (error: any) {
      if ([1062, 19].includes(error.errno)) throw new BadRequestError('This is the email used.');
      throw new InternalServerError('Server Error');
    }
  }

  /**
   * 사용자의 이미지를 변경한다.
   * @param id userId
   * @param image imagePath
   * @returns
   */
  async updateUserImage(id: number, image?: string | null): Promise<User> {
    const user = await this.getUserById(id);

    if (image) user.profileImage = `img/${image}`;
    else user.profileImage = null;

    return await this.userRepository.save(user);
  }
}
