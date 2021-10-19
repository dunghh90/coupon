import {
  Controller,
  Get,
  UseGuards,
  Post,
  Put,
  Body,
  Param,
  Request,
  Delete,
  Patch,
  HttpCode,
  Query,
  Response
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import JwtAccessAuthGuard from 'src/auth/guards/jwt-access-auth.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { User, UserDto } from 'src/decorators/user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/enum/role.enum';
import { SignUpUserDto } from './dto/signup-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ViewUserDto } from './dto/view-user.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) { }


  @Post('/create')
  async createUser(
    @Body() signUpUserDto: SignUpUserDto,
  ) {
    return this.userService.create(signUpUserDto);
  }

  @Post('/create_admin')
  async createAdmin(
    @Body() createUserAdminDto: CreateUserAdminDto,
  ) {
    return this.userService.createAdmin(createUserAdminDto);
  }

  @Get('/find_all')
  @Roles(Role.Admin)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  async findAllUser(
    @Query() viewUserDto: ViewUserDto,
  ) {
    return this.userService.findAll(viewUserDto);
  }

  @Get(':userId')
  @UseGuards(JwtAccessAuthGuard)
  async getUser(
    @Param('userId') userId: string,
  ) {
    return this.userService.findById(userId);
  }

  @Put('/update/:userId')
  @UseGuards(JwtAccessAuthGuard)
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateById(userId, updateUserDto);
  }

  @Put('/inactive/:userId')
  @UseGuards(JwtAccessAuthGuard)
  async inActiveUser(
    @Param('userId') userId: string,
  ) {
    return this.userService.setInActive(userId);
  }

  @Delete('/delete/:userId')
  @Roles(Role.Admin)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  async deleteUser(
    @Param('userId') userId: string,
  ) {
    return this.userService.deleteByAminRole(userId);
  }


  @Patch('/exit_member')
  @HttpCode(204)
  @UseGuards(JwtAccessAuthGuard)
  async exitMember(
    @User() user: UserDto,
    @Request() req, @Response() res
  ) {
    await this.userService.updateIsMember(user.userId, false);
    res.json('Exit member successfully')
  }

  @Patch('/update_info')
  @UseGuards(JwtAccessAuthGuard)
  async updateInfoUser(
    @User() user: UserDto,
    @Body() infoUpdate: any,
  ) {
    return this.userService.updateInfoUser(user.userId, infoUpdate);
  }

  @Put('/update_role/:userId')
  @Roles(Role.Admin)
  @UseGuards(JwtAccessAuthGuard, RolesGuard)
  async updateRoleUser(
    @Param('userId') userId: string,
    @Body() dataRole: any,
  ) {
    return this.userService.updateRoleOfUser(userId, dataRole);
  }
}

