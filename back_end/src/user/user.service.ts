import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignUpUserDto } from './dto/signup-user.dto';
import { UserDocument } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserStatus } from './enum/status.enum';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/auth/enum/role.enum';
import { ViewUserDto } from './dto/view-user.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('user')
    private readonly UserModel: Model<UserDocument>,
  ) {}

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const currentHashedRefreshToken = await this.hash(refreshToken);
    await this.UserModel.findByIdAndUpdate(userId, {
      currentHashedRefreshToken: `${currentHashedRefreshToken}`,
    });
  }

  async removeRefreshToken(userId: string) {
    await this.UserModel.findByIdAndUpdate(userId, {
      currentHashedRefreshToken: null,
    });
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new HttpException(
        'User with this id does not exist',
        HttpStatus.NOT_FOUND,
      );
    }
    if (await this.compareHash(refreshToken, user.currentHashedRefreshToken)) {
      return user;
    }
  }

  async create(signUpUserDto: SignUpUserDto) {
    const user = await this.findByEmail(signUpUserDto.email);
    if (user) {
      throw new HttpException('Email is exists!', HttpStatus.BAD_REQUEST);
    }
    const name = `${signUpUserDto.firstName}${signUpUserDto.lastName}`
      .split('.')
      .join('');
    let userName = await this.getUserName(name);
    const newUser = new this.UserModel({
      ...signUpUserDto,
      userName,
      updatedUser: userName,
      createdUser: userName,
      point: '100',
      tokenActiveEmail: uuidv4(8),
      password: await this.hash(signUpUserDto.password)
    });
    const userFromDB = await newUser.save();
    return userFromDB.toJSON();
  }

  async createAdmin(createUserAdminDto: CreateUserAdminDto) {
    const user = await this.findByEmail(createUserAdminDto.email)
    if (user) {
      throw new HttpException('Email is exists!', HttpStatus.BAD_REQUEST);
    }
    const name = `${createUserAdminDto.firstName}${createUserAdminDto.lastName}`.split('.').join('')
    let adminUserName = await this.getUserName(name);
    const newUser = new this.UserModel({
      ...createUserAdminDto,
      adminUserName,
      updatedUser: adminUserName,
      createdUser: adminUserName,
      tokenActiveEmail: uuidv4(8),
      password: await this.hash(createUserAdminDto.password)
    });
    const adminUserFromDB = await newUser.save();
    return adminUserFromDB.toJSON();
  }

  async getUserName(name: string) {
    const user = await this.findOne({
      userName: name,
    });
    if (user) {
      const _name = `${name}${this.randomString(4)}`;
      return this.getUserName(_name);
    }
    return name;
  }

  randomString(length) {
    let result = '';
    let characters = '0123456789';
    let charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async updateGithub(githubUserDto: any) {
    const userName = await this.getUserName(githubUserDto.login_name);
    const website = this._getWebsite(githubUserDto.website);
    return this.UserModel.findOneAndUpdate(
      {
        email: githubUserDto.email,
      },
      {
        firstName: githubUserDto.login_name,
        userName,
        bio: githubUserDto.bio,
        avatar_link: githubUserDto.avatar_link,
        github: githubUserDto.profileUrl?.replace('https://github.com/', ''),
        isConnectGithub: true,
        twitter: githubUserDto.twitter,
        website,
      },
      { upsert: true, new: true },
    );
  }

  _getWebsite(link: string) {
    if (!link) {
      return '';
    }
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return link;
    }
    return `http://${link}`;
  }

  async updateConnectGithub(userId: string, isConnectGithub: boolean) {
    await this.UserModel.findByIdAndUpdate(userId, { isConnectGithub });
  }

  async findById(userId: string) {
    const user = await this.UserModel.findOne({
      _id: userId,
    }).exec();
    console.log(user);
    if (user.status !== UserStatus.Active) {
      throw new HttpException('User does not active', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findByUserName(userName: string) {
    return this.UserModel.findOne({
      userName: userName,
    }).exec();
  }

  async updateById(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
    }
    const name = `${updateUserDto.firstName}${updateUserDto.lastName}`.split('.').join('')
    const updatedUser = await this.getUserName(name);
    const updatedDatetime = new Date().getTime();
    return this.UserModel.findByIdAndUpdate(userId,
      {
        $set: {
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.firstName,
          email: updateUserDto.email,
          address: updateUserDto.address,
          phone: updateUserDto.phone,
          updatedUser,
          updatedDatetime
        }
      },
      { upsert: true, new: true });
  }

  async deleteById(userId: string) {
    return this.UserModel.findByIdAndDelete(userId);
  }

  async deleteByAminRole(userId: string) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
    }
    //deleteManagerOfAllStore(userId);
    const updatedDatetime = new Date(new Date().getTime());
    return this.UserModel.findByIdAndUpdate(
      userId,
      { $set: { updatedDatetime, status: UserStatus.Delete } },
      { new: true });
  }

  async findByEmail(email: string) {
    return this.UserModel.findOne({ email: email }).exec();
  }

  async findByIds(ids: string[], options = {}) {
    return this.UserModel.find(
      {
        _id: {
          $in: ids,
        },
      },
      options,
    );
  }

  async updateStatusAndToken(email, status: string, token?: string) {
    await this.UserModel.findOneAndUpdate(
      {
        email: email,
      },
      {
        status,
        tokenActiveEmail: token,
      },
    );
  }

  async updateFirstLogin(email, isFirstLogin: boolean) {
    await this.UserModel.findOneAndUpdate(
      {
        email,
      },
      {
        isFirstLogin,
      },
    );
  }

  async updateIsMember(_id, isMember: boolean,) {
    return this.UserModel.findOneAndUpdate({ _id }, { isMember })
  }

  async updateRoleOfUser(userId: string, dataRole: any) {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
    }
    const updatedDatetime = new Date().getTime();
    return this.UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          roles: dataRole.roles,
          updatedUser: Role.Admin,
          updatedDatetime
        }
      },
      { new: true });
  }

  async updateVerifyEmailToken(email, token?: string) {
    await this.UserModel.findOneAndUpdate(
      {
        email: email,
      },
      { tokenActiveEmail: token },
    );
  }

  async Active() {
    return this.UserModel.find({
      status: UserStatus.Active,
    });
  }

  async setInActive(userId: string) {
    const user = await this.UserModel.findById(userId);
    if (!user || user.status !== UserStatus.Active) {
      throw new HttpException('User with this id does not exist', HttpStatus.NOT_FOUND);
    }
    return this.UserModel.findByIdAndUpdate(
      userId,
      { status: UserStatus.InActive },
      { new: true });
  }

  async findAll(viewUserDto: ViewUserDto) {
    const { userName,
      phone,
      status,
      roles,
    } = viewUserDto;
    return this.UserModel.find({
      ...userName && { userName },
      ...phone && { phone },
      ...status && { status },
      ...roles && { roles },
    });
  }

  async hash(password) {
    const hash = await bcrypt.hash(password, 12);
    return hash;
  }

  async compareHash(password: string, hash: string) {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  }

  async findOne(conditions) {
    return this.UserModel.findOne(conditions);
  }

  async getPoint(userId: string) {
    try {
      //todo
    } catch (error) {
      return new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async updateInfoUser(userId: string, data: any) {
    if (data.password) {
      data.password = await this.hash(data.password);
    }
    return this.UserModel.findByIdAndUpdate(userId,
      { $set: { ...data } },
      { new: true });
  }

  //(STR) 11-10-2021 PhongTHD add method search info User
  async findAllUser() {
    return await this.UserModel.find({});
  }

  async findAllUserInStore(storeId: string) {
    return await this.UserModel.find({ storeId: storeId });
  }

  async isExistInfoUserstore(storeId: string, updatePointUserDto: any) {
    const {userName, email, phone} = updatePointUserDto;
    return await this.UserModel.exists({
      ...userName && {userName},
      ...email && {email},
      ...phone && {phone},
      storeId: storeId,
    });
  }

  async updatePointUser(point: number, infoUser: any, opts?: any) {
    console.log('Point now is ' + point);
    const userName = infoUser.userName;
    const email = infoUser.email;
    const phone = infoUser.phone;
    console.log(userName + ": " + email + ": " + phone);
    return this.UserModel.findOneAndUpdate(
      {
        ...userName && {userName},
        ...email && {email},
        ...phone && {phone}
      },
      {
        point: point,
      },
      opts,
    );
  }
  //(END) 11-10-2021 PhongTHD add method search info User
}
