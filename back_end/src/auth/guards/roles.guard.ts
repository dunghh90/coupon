import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userLogin = await this.userService.findById(user.userId);
    
    if(roles.findIndex((e) => e === userLogin.roles) !== -1) {
      return user ;
    } else {
      throw new HttpException('Role is Invalid!', HttpStatus.UNAUTHORIZED);
    }
  }
}

