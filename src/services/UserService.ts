import { NotFoundError } from 'routing-controllers';
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
  public async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundError('There is no matching information.');

    return user;
  }

  /**
   * 사용자의 비밀번호를 포함한 정보를 조회한다.
   * @param id 사용자 id
   */
  public async getUserPasswordById(id: number): Promise<User> {
    const user = await this.userRepository.findAndPasswordById(id);

    if (!user) throw new NotFoundError('There is no matching information.');

    return user;
  }

  /**
   * 사용자의 정보를 조회한다.
   * @param email 사용자 email
   */
  public async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findUserByEmail(email);

    if (!user) throw new NotFoundError('There is no matching information.');

    return user;
  }

  /**
   * 사용자의 비밀번호를 포함한 정보를 조회한다.
   * @param email 사용자 email
   */
  public async isDuplicateUser(email: string): Promise<boolean> {
    const user = await this.userRepository.findUserByEmail(email);

    if (user) {
      return true;
    }

    return false;
  }

  /**
   * 사용자를 생성한다.
   * @param createuserDto 사용자 생성 DTO
   */
  public async createUser(createuserDto: CreateUserDto): Promise<User> {
    const user = createuserDto.toEntity();
    return await this.userRepository.save(user);
  }

  /**
   * 사용자의 정보를 수정한다.
   * @param id userId
   * @param updateUserDto 사용자 수정정보 DTO
   */
  public async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundError('There is no matching information.');

    const { email, password, name } = updateUserDto;

    if (email) user.email = email;
    if (password) user.password = bcrypt.hashSync(password, 10);
    if (name) user.name = name;

    return await this.userRepository.save(user);
  }

  public async updateUserImage(id: number, image?: string | null) {
    const user = await this.userRepository.findById(id);

    if (!user) throw new NotFoundError('There is no matching information.');

    console.log(image);
    if (image) user.profileImage = `img/${image}`;
    else user.profileImage = null;

    return await this.userRepository.save(user);
  }
}
