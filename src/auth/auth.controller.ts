import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { RefreshTokenGuard } from './guard/bearer-token.guard';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './type/type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request & User) {
    const googleResult = this.authService.googleLogin(req);
    const userToken = await this.authService.loginWithGoogle(googleResult);
    return userToken;
  }

  @Post('register/email')
  registerWithEmail(@Body() body: RegisterUserDto) {
    return this.authService.registerWithEmail(body);
  }

  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  loginWithEmail(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    const { email, password } = this.authService.decodeBase64(token);

    return this.authService.loginWithEmail({ email, password });
  }

  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    const newToken = this.authService.rotateToken(token, false);
    return { accessToken: newToken };
  }
  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers('authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);
    const newToken = this.authService.rotateToken(token, true);
    return { refreshToken: newToken };
  }

  @Post('/verify/email')
  verifyEmail(@Body('email') email: string) {
    return this.authService.sendVerificationCode(email);
  }

  @Post('/confirm/email')
  confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    return this.authService.confirmVerificationCode(
      confirmEmailDto.email,
      confirmEmailDto.code,
    );
  }
}
