import { IsString, IsEmail, IsNotEmpty, Length, IsOptional, IsUrl } from 'class-validator';

export class CreateUserDto {
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
  @Length(8, 256)
  password: string;

  //в приложении пока нет возможности прикрепить фотку при создании - возможно появится позже
  @IsOptional()
  @IsUrl()
  profilePic?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  picFilename?: string;
}
