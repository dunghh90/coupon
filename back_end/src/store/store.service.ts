import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from 'src/auth/enum/role.enum';
import { UserStatus } from 'src/user/enum/status.enum';
import { UserService } from 'src/user/user.service';
import { StoreCreateDto } from './dto/store-create.dto';
import { StoreUpdateDto } from './dto/store-update.dto';
import { StoreViewDto } from './dto/store-view.dto';
import { StoreConst, StoreStatus } from './enum/status.store.enum';
import { StoreDocument } from './schema/store.schema';

@Injectable()
export class StoreService {
    constructor(
        private userService: UserService,
        @InjectModel('store')
        private readonly StoreModel: Model<StoreDocument>,
    ) {}

    // Create store have status is Enable and user manager is user create store
    async createStore(userId: string, storeDto: StoreCreateDto ) {

        try {
            const user = await this.userService.findById(userId);
    
            const storeIsExist = await this.StoreModel.findOne({ name: storeDto.name, status: StoreStatus.Enable}).exec();
            if (storeIsExist) {
                throw new HttpException('Name store is exists. Please select name store orther!', HttpStatus.BAD_REQUEST);
            }

            const newStore = new this.StoreModel({
                ...storeDto,
                managerStores: [user._id]
            })
    
            const storeFromDB = await newStore.save();
            return storeFromDB.toJSON();
            
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    // Find store by conditions. When conditions is blank, find all store
    async findAll(storeViewDto: StoreViewDto) {
        try {
            const { name,
                    address,
                    phone,
                    status,
                    timeActive
                    } = storeViewDto;
            return this.StoreModel.find({
                                    ...name && { name } ,
                                    ...address && {address},
                                    ...phone && {phone},
                                    ...timeActive && {timeActive},
                                    ...status && {status}
                                    // status: StoreStatus.Enable
                                })
                                .populate({
                                    path: 'managerStores',
                                    select: 'email userName firstName lastName'
                                })
                                .sort({ "updatedAt" : "desc"}).exec();
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    // setting status of store (Enable or Disable)
    async setDisable(storeId: string) {
        try {
            const storeIsExist = await this.StoreModel.exists({_id: storeId});
            if(!storeIsExist) {
                throw new HttpException('Store is not exist', HttpStatus.BAD_REQUEST)
            }
    
            return this.StoreModel.findByIdAndUpdate(storeId, {status: StoreStatus.Disable, del_flg: StoreConst.DELETED}, {new: true}).exec()
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    // update info of store
    async updateStore(storeId: string, userId: string, data: StoreUpdateDto) {
        try {
            const user = await this.userService.findById(userId);
    
            const store = await this.StoreModel.findOne({_id: storeId, status: StoreStatus.Enable}).exec();
            if(!store) {
                throw new HttpException('Store is not exist', HttpStatus.BAD_REQUEST)
            }
    
            // input name store is not exist, but name can same name of store update
            const storeExist = await this.StoreModel.findOne({ name: data.name }).exec();
            if (storeExist && storeExist.name !== store.name && storeExist.status === StoreStatus.Enable) {
                throw new HttpException('Shop is exists!', HttpStatus.BAD_REQUEST);
            }
    
            return this.StoreModel.findByIdAndUpdate(storeId, {
                                            name: data.name,
                                            descipton: data.description || '',
                                            address: data.address,
                                            phone: data.phone,
                                            timeActive: data.timeActive,
                                            updateBy: user._id
                                        }, {new: true})
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    // find store by id
    async findById(storeId: string) {
        try {
            const store = await this.StoreModel.findOne({
                _id: storeId,
                status: StoreStatus.Enable
            })
            .populate({
                path: 'managerStores',
                select: 'email userName firstName lastName'
            })
            .exec();

            if (!store) {
                throw new HttpException('Store is not exist!', HttpStatus.BAD_REQUEST)
            }
            return store;
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    
    // add user manager into store
    async addUserManager(storeId: string, email: string ) {
        try {
            const user = await this.userService.findByEmail(email);
            if (!user || user.status === UserStatus.InActive) {
                throw new HttpException('User is not exist!', HttpStatus.BAD_REQUEST)
            }

            if (user.roles !== Role.Admin && user.roles !== Role.Shop) {
                throw new HttpException('Role of user is incorrect!', HttpStatus.BAD_REQUEST)
            }
            
            const store = await this.StoreModel.findOne({_id: storeId, status : StoreStatus.Enable})
                                                        .populate({
                                                                path: 'managerStores',
                                                                select: 'email userName firstName lastName'
                                                        })
                                                        .exec();
            if (!store) {
                throw new HttpException('Store is not exist!', HttpStatus.BAD_REQUEST)
            }
            
            // Check user is exist in list user manage of store
            const userManagers: any = store.managerStores;

            const flagCheckUserExist = userManagers.findIndex((element) => element._id.equals(user._id))
            if (flagCheckUserExist === -1) {
                return this.StoreModel.findByIdAndUpdate(storeId, { $push: { managerStores: user._id } }, {new: true})
                                            .populate({
                                                path: 'managerStores',
                                                select: 'email userName firstName lastName'
                                            })
                                            .exec();
            } else {
                return store.toJSON();
            }
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    // delete user manage store
    async deleteUserManager(storeId: string, userId: string ) {
        try {
            const store = await this.StoreModel.findOne({_id:storeId, status: StoreStatus.Enable}).populate('managerStores').exec();
            if (!store) {
                throw new HttpException('Store is not exist!', HttpStatus.BAD_REQUEST)
            }

            const managerStores: any = store.managerStores;
            
            // Check user is exist in list user manage of store
            const indexManagerStore = managerStores.findIndex((element) => element._id.equals(userId))

            if (indexManagerStore === -1) {
                throw new HttpException('User is not manager store!', HttpStatus.BAD_REQUEST)
            } else {
                managerStores.splice(indexManagerStore, 1)
                return this.StoreModel.findByIdAndUpdate(storeId, {managerStores}, {new: true})
                                            .populate({
                                                path: 'managerStores',
                                                select: 'email userName firstName lastName'
                                            })
                                            .exec();
            }

        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    // delete user manage store when user was deleted in table user
    async deleteManagerOfAllStore(userId: string ) {
        try {
            const stores = await this.StoreModel.find({status: StoreStatus.Enable}).populate('managerStores', 'email').exec()
            let listUpdate = []
            stores.forEach((item) => {
                const managerStores: any = item.managerStores;
                const indexManagerStore = managerStores.findIndex((element) => element._id.equals(userId))
                
                if (indexManagerStore !== -1) {
                    managerStores.splice(indexManagerStore, 1)
                    listUpdate.push(this.StoreModel.findByIdAndUpdate(item._id, {managerStores}, {new: true}));
                }
            })

            await Promise.all(listUpdate);
        } catch (error) {
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}
