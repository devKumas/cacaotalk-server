import { Length, IsEmail, IsEnum, IsOptional, isInt, IsInt } from 'class-validator';
import { User } from '../entities/User';
import { JwtPayload } from 'jsonwebtoken';

export enum Gender {
  M = 'M',
  F = 'F',
}

/**
 * 사용자 생성 DTO
 */
export class CreateUserDto {
  @Length(1, 30)
  @IsEmail()
  email!: string;

  @Length(1, 100)
  password!: string;

  @Length(1, 10)
  name!: string;

  @IsEnum(Gender, { message: 'gender must be a valid enum values(M, F)' })
  gender!: Gender;

  toEntity(): User {
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
  email!: string;

  @Length(1, 100)
  @IsOptional()
  password!: string;

  @Length(1, 10)
  @IsOptional()
  name!: string;

  @IsEnum(Gender)
  @IsOptional()
  gender!: Gender;
}

/**
 * 로그인 DTO
 */
export class LoginUserDto {
  @IsEmail()
  email!: string;

  @Length(1, 100)
  password!: string;
}

/**
 * Token 갱신 DTO
 */
export class ReissuanceAccessTokenDto {
  @Length(0, 500)
  refreshToken!: string;
}

export class FriendDto {
  @IsInt()
  targetId!: number;
}

/**
 * JWT USER
 */
export class JWTUser implements JwtPayload {
  id!: number;
  email?: string;
  name?: string;
  iat!: number | undefined;
  exp!: number | undefined;
}
