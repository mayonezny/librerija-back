import { IsString, IsEmail, Length, IsOptional, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 20)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
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
