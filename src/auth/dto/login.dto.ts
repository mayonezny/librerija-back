// src/auth/dto/login.dto.ts
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @Length(10, 200)
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 50)
  password: string;
}
