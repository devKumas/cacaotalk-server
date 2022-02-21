import { Length, IsEmail, IsEnum, IsOptional, isInt, IsInt } from 'class-validator';
import { Gender, User } from '../entities/User';
import { JwtPayload } from 'jsonwebtoken';

/**
 * 사용자 생성 DTO
 */
export class CreateUserDto {
  @Length(1, 30)
  @IsEmail()
  public email!: string;

  @Length(1, 100)
  public password!: string;

  @Length(1, 10)
  public name!: string;

  @IsEnum(Gender)
  public gender!: Gender;

  public toEntity(): User {
    const { email, password, name, gender } = this;

    const user = new User();
    user.email = email;
    user.password = password;
    user.name = name;
    user.gender = gender;

    return user;
  }
}

/**
 * 사용자 수정 DTO
 */
export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  public email!: string;

  @Length(1, 100)
  @IsOptional()
  public password!: string;

  @Length(1, 10)
  @IsOptional()
  public name!: string;

  @IsEnum(Gender)
  @IsOptional()
  public gender!: Gender;
}

/**
 * 로그인 DTO
 */
export class LoginUserDto {
  @IsEmail()
  public email!: string;

  @Length(1, 100)
  public password!: string;
}

/**
 * Token 갱신 DTO
 */
export class ReissuanceAccessTokenDto {
  @Length(0, 500)
  public refreshToken!: string;
}

export class FriendDto {
  @IsInt()
  public targetId!: number;
}

/**
 * JWT USER
 */
export class JWTUser implements JwtPayload {
  public id!: number;
  public email?: string;
  public name?: string;
  public iat!: number | undefined;
  public exp!: number | undefined;
}
