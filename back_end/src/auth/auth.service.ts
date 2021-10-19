import { SignInDto } from './dto/sign-in.dto';
import { HttpException, HttpStatus, Injectable,BadRequestException,UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token-payload.interface';
import { UserStatus } from 'src/user/enum/status.enum';
import {ChangePasswordDto} from './dto/change-password.dto';
import {ConfirmAccountDto} from './dto/confirm-account.dto'
import { SignUpUserDto } from '../user/dto/signup-user.dto';

import { MailService } from 'src/mail/mail.service';


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,

  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await this.userService.compareHash(password, user.password)) {
      if (user.status !== UserStatus.Active) {
        throw new HttpException('Oops! It looks like you haven’t confirmed your email yet!', HttpStatus.UNAUTHORIZED);
      }
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserAdmin(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await this.userService.compareHash(password, user.password) && (user as any).role === 'admin') {
      if (user.status !== UserStatus.Active) {
        throw new HttpException('Oops! It looks like you haven’t confirmed your email yet!', HttpStatus.UNAUTHORIZED);
      }
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signUp(signUpUserDto: SignUpUserDto): Promise<any> {
    const user = await this.userService.create(signUpUserDto);
    await this.sendConfirmation(user);
    return user;
}


  async signIn(signInDto : SignInDto, accessTokenCookie: string){
    const user = await this.userService.findByEmail(signInDto.email)
    if(user.isFirstLogin){
      this.userService.updateFirstLogin(signInDto.email,false)
    }
    const userLogin = {
      email: user.email,
      lastName: user.lastName,
      firstName: user.firstName,
      userName: user.userName,
      status: user.status,
      isMember: user.isMember,
      token: accessTokenCookie
    }
    return userLogin
  }

  public getCookieWithJwtAccessToken(userId: string) {
    const payload: TokenPayload = { userId };
    // console.log(`${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`)
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`
    });
    return `Authentication=${token}; HttpOnly; Path=/;`;
  }
 
  public getCookieWithJwtRefreshToken(userId: string) {
    const payload: TokenPayload = { userId };
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`
    });
    const refreshCookie = `Refresh=${refreshToken}; HttpOnly; Path=/; `;
    return {
      refreshCookie,
      refreshToken
    }
  }

  public getCookiesForLogOut() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0'
    ];
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    await this.userService.updateInfoUser(userId, changePasswordDto)
    return {
      success : true,
      message: 'Change password successfully',
    }
  }

  async confirm(data: any) {
    const user = await this.userService.findByEmail(data.email);
    const compare = data.token === user.tokenActiveEmail

    if (compare && user && user.status === "InActive") {
        user.status = "Active";
        return user.save();
    }
    throw new BadRequestException('Confirmation error');
}

  async forgotPassword(forgotPasswordDto) {
    const user = await this.userService.findByEmail(forgotPasswordDto.email);
    if (!user) {
        throw new BadRequestException('Invalid email');
    }
    const token = await this.getCookieWithJwtAccessToken(user._id);
    const forgotLink = `http://localhost:9000/auth/forgotPassword?token=${token}`;

    await this.mailService.verifyEmailAddress(forgotPasswordDto.email, forgotLink);
  }

  async sendConfirmation(user) {
    const token = await this.getCookieWithJwtAccessToken(user._id);
    const confirmLink = `http://localhost:9000/auth/confirmEmail?token=${token}`;

    await this.mailService.verifyEmailAddress(user.email, confirmLink) ;
    }
}