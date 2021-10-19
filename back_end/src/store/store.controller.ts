import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/enum/role.enum';
import JwtAccessAuthGuard from 'src/auth/guards/jwt-access-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User, UserDto } from 'src/decorators/user.decorator';
import { StoreAddManagerDto } from './dto/store-addManager.dto';
import { StoreCreateDto } from './dto/store-create.dto';
import { StoreDeleteManagerDto } from './dto/store-deleteManager.dto';
import { StoreUpdateDto } from './dto/store-update.dto';
import { StoreViewDto } from './dto/store-view.dto';
import { StoreService } from './store.service';

@ApiTags('store')
@Controller('store')
export class StoreController {
    constructor(
        private readonly storeService: StoreService,
    ) {}

    @Get()
    @UseGuards(JwtAccessAuthGuard)
    async viewStoreAll(
        @Query() storeViewDto: StoreViewDto
    ) {
        return await this.storeService.findAll(storeViewDto);
    }

    @Get(':id')
    @UseGuards(JwtAccessAuthGuard)
    async getDetailStore(
        @Param('id') id: string
    ) {
        return await this.storeService.findById(id);
    }
    
    @Post('/create')
    @Roles(Role.Admin, Role.Shop)
    @UseGuards(JwtAccessAuthGuard, RolesGuard)
    async createStore(
        @User() user: UserDto,
        @Body() storeDto: StoreCreateDto
    ) {
        return await this.storeService.createStore(user.userId, storeDto);
    }

    @Put('/setDisable/:id')
    @Roles(Role.Admin, Role.Shop)
    @UseGuards(JwtAccessAuthGuard, RolesGuard)
    async setDisableStore(@Param('id') id: string) {
        return await this.storeService.setDisable(id);
    }

    @Put('/addManager/:id')
    @Roles(Role.Admin)
    @UseGuards(JwtAccessAuthGuard, RolesGuard)
    async addUserManagerByMail(
        @Param('id') id: string,
        @Body() storeAddManagerDto: StoreAddManagerDto 
    ) {
        return await this.storeService.addUserManager(id, storeAddManagerDto.email);
    }

    @Put('update/:id')
    @Roles(Role.Admin, Role.Shop)
    @UseGuards(JwtAccessAuthGuard, RolesGuard)
    async updateStore(
        @Param('id') id: string,
        @User() user: UserDto,
        @Body() storeDto: StoreUpdateDto
    ) {
        return await this.storeService.updateStore(id, user.userId, storeDto);
    }

    @Delete('/deleteManager/:storeId')
    @Roles(Role.Admin)
    @UseGuards(JwtAccessAuthGuard, RolesGuard)
    async deleteUserManagerByMail(
        @Param('storeId') storeId: string,
        @Body() storeDto: StoreDeleteManagerDto
    ) {
        return await this.storeService.deleteUserManager(storeId, storeDto.userId);
    }
}
