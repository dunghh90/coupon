import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export default class JwtAccessAuthGuard extends AuthGuard('jwt-access-token') {}