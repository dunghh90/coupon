import {
  Controller,
  Request,
  Get,
  Post,
  UseGuards,
  Response,
  Body,
  UseFilters,
  HttpCode,
  Patch,
  HttpStatus,
  ValidationPipe,
  Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { SignUpUserDto } from 'src/user/dto/signup-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ConfirmAccountDto } from './dto/confirm-account.dto';
import {VerifyEmailDto} from './dto/verify-email.dto'
import JwtRefreshGuard from './guards/jwt-resfresh-auth.guard';
import JwtAccessAuthGuard from './guards/jwt-access-auth.guard';
import { User, UserDto } from 'src/decorators/user.decorator';
import { SignInDto } from './dto/sign-in.dto';
import {ChangePasswordDto} from './dto/change-password.dto';
import { MailService } from 'src/mail/mail.service';
import { ViewAuthFilter } from './filter/view-auth.filter';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private mailService: MailService,
  ) {}

  @Post('/sign_up')
  async signUp(
    @Body() signUpUserDto: SignUpUserDto,
  ) {
    return this.authService.signUp(signUpUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('sign_in')
  @HttpCode(200)
  async loginLocal(@Body() signInDto: SignInDto, @Request() req, @Response() res) {
    const user = req.user._doc;
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      user._id,
    );
    const { refreshToken, refreshCookie } =
      this.authService.getCookieWithJwtRefreshToken(user._id);
    await this.userService.setCurrentRefreshToken(refreshToken, user._id);
    res.setHeader('Set-Cookie', [accessTokenCookie, refreshCookie]);
    // res.redirect('/');
    const response = await this.authService.signIn(signInDto,accessTokenCookie)
    res.json(response)
  }

  @UseGuards(JwtAccessAuthGuard)
  @Post('log_out')
  @HttpCode(200)
  async logOut(@Response() res, @User() userDto: UserDto) {
    await this.userService.removeRefreshToken(userDto.userId);
    res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
    // res.redirect('/');
    res.json({
      success : true,
      message: 'logout successfully',
    })
  }


  @UseGuards(JwtAccessAuthGuard)
  @Patch('change_password')
  async changePassword(
    @Response() res,
     @User() user: UserDto,
      @Body() changePasswordDto: ChangePasswordDto) {
    return await this.authService.changePassword(user.userId, changePasswordDto);
  }

  @Post('sign_up')
  async signup(@Body() signUpUserDto: SignUpUserDto) {
    const result = await this.userService.create(signUpUserDto);
    this.mailService.verifyEmailAddress(result.email, result.tokenActiveEmail)
    return result;
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh_token')
  async refreshToken(@Request() req) {
    const user = req.user;
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      user._id,
    );
    req.res.setHeader('Set-Cookie', accessTokenCookie);
    return user;
  }

  @Post('/confirm')
  async confirm(@Body(new ValidationPipe()) veifyEmail: VerifyEmailDto){
      await this.authService.confirm(veifyEmail);
      return true;
  }

  @Post('/forgotPassword')
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto){
        return this.authService.forgotPassword(forgotPasswordDto);
    }
  
  // @Get('login/github')
  // @UseGuards(AuthGuard('github'))
  // @UseFilters(ViewAuthFilter)
  // loginGithub() {}

  // @Get('login/github/redirect')
  // @UseGuards(AuthGuard('github'))
  // @UseFilters(ViewAuthFilter)
  // async githubAuthRedirect(@Request() req, @Response() res) {
  //   const user = req.user;
  //   const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
  //     user._id,
  //   );
  //   const { refreshToken, refreshCookie } =
  //     this.authService.getCookieWithJwtRefreshToken(user._id);
  //   await this.userService.setCurrentRefreshToken(refreshToken, user._id);
  //   console.log('accessTokenCookie, cookie', accessTokenCookie, refreshCookie);
  //   res.setHeader('Set-Cookie', [accessTokenCookie, refreshCookie]);
  //   // res.redirect('/');
  // }
  
  @Get('login/facebook')
  @UseGuards(AuthGuard('facebook'))
  loginFacebook() {
    return HttpStatus.OK;
  }

  @Get('login/facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  @UseFilters(ViewAuthFilter)
  facebookAuthRedirect(@Request() req, @Response() res) {
      return {
        statusCode: HttpStatus.OK,
        data: req.user,
      };
  }

  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  async loginGoogle() {
    return HttpStatus.OK;
  }

  @Get('login/google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Request() req, @Response() res) {
      return {
        statusCode: HttpStatus.OK,
        data: req.user,
      };
  }


  @Get('login/linkedin')
  @UseGuards(AuthGuard('linkedin'))
  loginLinkedin() {}

  @Get('login/linkedin/redirect')
  @UseGuards(AuthGuard('linkedin'))
  linkedinAuthRedirect(@Request() req, @Response() res) {
      res.redirect('/dasboard')
  }
}
