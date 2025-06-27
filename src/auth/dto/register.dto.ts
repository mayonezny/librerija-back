// src/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @Length(10, 200)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 50)
  password: string;
}
