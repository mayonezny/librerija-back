import { Controller, Post, Body, Req, Res, HttpCode, UseGuards } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RequestWithUser } from './auth.interfaces';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Регистрация нового пользователя
   * Возвращает access и refresh токены в теле и в куке
   */
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) reply: FastifyReply) {
    const { accessToken, refreshToken } = await this.authService.register(dto);
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
      path: '/api/auth/refresh',
      maxAge: 20 * 24 * 60 * 60,
    });
    return { accessToken };
  }

  /**
   * Логин пользователя через LocalStrategy
   * Необычно: сначала LocalAuthGuard проверяет email+password
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: RequestWithUser, @Res({ passthrough: true }) reply: FastifyReply) {
    const { accessToken, refreshToken } = this.authService.login(req.user);
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60,
    });
    return { accessToken };
  }

  /**
   * Обновление токенов по HTTP-only куке (Refresh JWT)
   * JwtRefreshGuard валидирует refreshToken из куки
   */
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: RequestWithUser, @Res({ passthrough: true }) reply: FastifyReply) {
    const user = req.user;
    const { accessToken, refreshToken } = await this.authService.refresh({
      uuid: user.uuid,
      email: user.email,
    });
    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60,
    });
    return { accessToken };
  }

  /**
   * Логаут: очищаем HTTP-only куку
   */
  @UseGuards(JwtAccessGuard)
  @HttpCode(204)
  @Post('logout')
  async logout(@Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    await this.authService.logout(); //мок - перед выкатом на прод удалить
    reply.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  }
}
