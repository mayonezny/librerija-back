// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { Payload } from './auth.interfaces';
import { Tokens } from './auth.interfaces';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private getTokens(payload: Payload) {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
    const tokens: Tokens = { accessToken, refreshToken };
    return tokens;
  }

  async register(dto: RegisterDto): Promise<Tokens> {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      ...dto,
      password: hashed,
    });
    return this.getTokens({ uuid: user.uuid, email: user.email });
  }

  login(user: Payload) {
    return this.getTokens({ uuid: user.uuid, email: user.email });
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials', 'Invalid Password');
    return user;
  }

  async refresh(payload: Payload): Promise<Tokens> {
    // Можно дополнительно проверить, что пользователь всё ещё в БД:
    const user = await this.usersService.findOne(payload.uuid);
    if (!user) throw new UnauthorizedException('User Not Found');
    return this.getTokens(payload);
  }

  async logout(): Promise<void> {}
}
