import BaseClass from '../../prototype/baseClass'
import crypto from 'crypto'
import UserModel from '../../models/admin/user'
import AddressModel from '../../models/admin/address'
import { getTokenByCode } from '../../utils/wxService'
import { Encryption, Decryption } from '../../utils/dataHelper'
import { ValidateToken } from '../../utils/token'

class User extends BaseClass {
    constructor() {
        super();
        this.wxLogin = this.wxLogin.bind(this);
    }

    //微信登录
    async wxLogin(req, res, next) {
        const code = req.query.code;
        //const md5password = this.encryption(password);
        try {
            let obj = await getTokenByCode(code);
            console.info(obj);
            let { openid, session_key, uid } = obj;
            let doc = await UserModel.find({ openid: openid });
            console.info(doc);
            //判断数据库是否存在数据
            if (!doc || doc.length == 0) {
                console.info(0)
                const data = {          //创建一个新账号
                    openid,
                    session_key,
                    city: '北京市',         //登录城市
                }
                console.info(data);
                await new UserModel(data).save();
                //req.session.user_id = openid;    //设置session
            }
            console.info(1)
            let str = openid + ':' + session_key;
            let token = Encryption(str);
            let result = {
                openid,
                session_key,
                token,
                uid
            }
            console.info(result);
            res.send({
                status: 0,
                message: '用户登录成功',
                result: result
            })
        } catch (err) {
            console.log('用户登录失败', err);
            res.send({
                status: -1,
                message: '用户登录失败',
            })
        }
    }


    //前台登录
    async userLogin(req, res, next) {
        const { username, password } = req.body;
        const md5password = req.password;
        //const md5password = this.encryption(password);
        try {
            const user = await AdminModel.findOne({ username, status: 1 });

            if (!user) {     //因为前端没有写注册功能 所以这里如果用户输入的账号名是不存在的 就创建一个新的账号
                const user_id = await this.getId('user_id');
                //const cityInfo = await this.getLocation(req, res);
                const createData = {          //创建一个新账号
                    username,                   //用户名
                    password: md5password,     //用户密码
                    id: user_id,                //用户id
                    status: 1,                  //1:普通用户、 2:普通管理员
                    city: '北京市',         //登录城市cityInfo.city
                    avatar: 'http://i.waimai.meituan.com/static/img/default-avatar.png'
                }
                await new AdminModel(createData).save();
                req.session.user_id = user_id;    //设置session
                res.send({
                    status: 200,
                    success: '注册用户并登录成功',
                })
            } else if (md5password === user.password) {  //用户输入的账号存在并且密码正确
                req.session.user_id = user.id;
                res.send({
                    status: 200,
                    success: '登录成功',
                    username: user.username,              //用户名
                    avatar: user.avatar      //用户头像
                })
            } else {
                res.send({
                    status: -1,
                    message: '该用户已存在，密码输入错误',
                })
            }
        } catch (err) {
            console.log('用户登录失败', err);
            res.send({
                status: -1,
                message: '用户登录失败',
            })
        }
    }


    //新增收货地址
    async addAddress(req, res, next) {
        console.info(req);
        console.info(req.headers.authorization);//req.header('Authorization')
        let key = req.headers.authorization;
        var result = ValidateToken(key);
        if (!result) {
            res.send({
                status: '-1',
                message: 'token有误'
            })
            return;
        }
        let data = req.body;
        let { name, phone, address, address_detail } = data;
        if (!name || !phone || !address || !address_detail) {
            res.send({
                status: '-1',
                message: '添加地址失败，参数有误'
            })
            return;
        }
        try {
            //const address_id = await this.getId('address_id');
            let addressData = {
                ...data,
                //id: address_id,
                user_id: result.openid
                //user_id: req.session.user_id
            }
            await new AddressModel(addressData).save();
            res.send({
                status: 200,
                success: '添加收货地址成功'
            })
        } catch (err) {
            console.log('添加收货地址失败', err);
            res.send({
                status: -1,
                type: 'ADD_ADDRESS_FAILED',
                message: '添加收货地址失败'
            })
        }
    }

    //获取用户的默认收货地址
    async getDefaultAddress(req, res, next) {
        try {
            let key = req.headers.authorization;
            var result = await ValidateToken(key);
            if (!result) {
                res.send({
                    status: '-1',
                    message: 'token有误'
                })
                return;
            }
            //let address = await AddressModel.find({ user_id: req.session.user_id });
            let address = await AddressModel.find({ user_id: result.openid });
            res.send({
                status: 200,
                address: address?address[0]:"",
                message: '获取地址成功'
            })
        } catch (err) {
            console.log('获取收货地址失败', err);
            res.send({
                status: -1,
                message: '获取收货地址失败',
            })
        }
    }

    //获取用户所有收货地址
    async getAllAddress(req, res, next) {
        try {
            let key = req.headers.authorization;
            var result = await ValidateToken(key);
            if (!result) {
                res.send({
                    status: '-1',
                    message: 'token有误'
                })
                return;
            }
            //let address = await AddressModel.find({ user_id: req.session.user_id });
            let address = await AddressModel.find({ user_id: result.openid });
            res.send({
                status: 200,
                address: address,
                message: '获取地址成功'
            })
        } catch (err) {
            console.log('获取收货地址失败', err);
            res.send({
                status: -1,
                message: '获取收货地址失败',
            })
        }
    }

    //获取指定收货地址
    async getAddressDetail(req, res, next) {
        let key = req.headers.authorization;
        var result = await ValidateToken(key);
        if (!result) {
            res.send({
                status: '-1',
                message: 'token有误'
            })
            return;
        }
        //let { address_id } = req.query;
        let { id } = req.query;
        if (!id) {
            res.send({
                code: -1,
                message: '获取指定地址失败，参数有误'
            })
            return;
        }
        try {
            //let address = await AddressModel.findOne({ id: address_id, user_id: req.session.user_id }, '-_id');
            //let address = await AddressModel.findOne({ _id: id, user_id: result.openid }, '-_id');
            let address = await AddressModel.findOne({ _id: id, user_id: result.openid });
            res.send({
                code: 0,
                data: address,
                message: '获取地址成功'
            })
        } catch (err) {
            console.log('获取收货地址失败', err);
            res.send({
                code: -1,
                message: '获取收货地址失败',
            })
        }
    }

    //删除收货地址
    async deleteAddress(req, res, next) {
        let key = req.headers.authorization;
        var result = await ValidateToken(key);
        if (!result) {
            res.send({
                status: '-1',
                message: 'token有误'
            })
            return;
        }
        // console.info(req.body);
        // console.info(req.query);
        let { id } = req.body;
        if (!id) {
            res.send({
                status: -1,
                message: '删除地址失败，参数有误'
            })
            return;
        }
        try {
            //let address = await AddressModel.update({ id: address_id, user_id: req.session.user_id }, { user_id: null });
            let address = await AddressModel.remove({ _id: id, user_id: result.openid });
            res.send({
                status: 200,
                message: '删除收获地址成功'
            })
        } catch (err) {
            console.log('删除收获地址失败', err);
            res.send({
                status: -1,
                message: '删除收获地址失败',
            })
        }
    }

    async updateAddress(req, res, next) {
        let key = req.headers.authorization;
        console.info(key);
        var result = await ValidateToken(key);
        if (!result) {
            res.send({
                status: '-1',
                message: 'token有误'
            })
            return;
        }
        let data = req.body;
        let id = data.id;
        if (!id) {
            res.send({
                status: -1,
                message: '更新地址失败，参数有误'
            })
            return;
        }
        try {
            console.info(id);
            console.info(result);
            console.info(data);
            //delete data.id;
            let result1 = await AddressModel.update({ _id: id, user_id: result.openid }, data);
            if (result1) {
                res.send({
                    status: 200,
                    success: '更新地址成功'
                })
            } else {
                res.send({
                    status: -1,
                    message: '更新地址失败'
                })
            }
        } catch (err) {
            console.log('更新地址失败', err);
            res.send({
                status: -1,
                message: '更新地址失败'
            })
        }
    }

    encryption(password) {
        const md5password = this.Md5(this.Md5(password));
        return md5password
    }

    //md5加密
    Md5(password) {
        const md5 = crypto.createHash('md5');
        return md5.update(password).digest('base64');
    }

    //获取用户信息
    async userInfo(req, res, next) {
        try {
            console.info(222);
            console.info(req.session);
            debugger;
            //req.session.admin_id
            let user_info = await AdminModel.findOne({ id: 1 }, 'username id avatar status create_time');
            const userInfo = {
                'id': '4291d7da9005377ec9aec4a71ea837f',
                'name': 'admin',
                'username': user_info.username,
                'password': '',
                'avatar': user_info.avatar,
                'status': 1,
                'telephone': '',
                'lastLoginIp': '27.154.74.117',
                'lastLoginTime': 1534837621348,
                'creatorId': 'admin',
                'createTime': 1497160610259,//user_info.create_time,//
                'merchantCode': 'TLif2btpzg079h15bk',
                'deleted': 0,
                'roleId': 'admin',
                'role': {}
            }
            res.send({
                status: 200,
                result: userInfo,//user_info,
                message: '获取用户信息成功'
            })
        } catch (err) {
            console.log('获取用户信息失败', err);
            res.send({
                status: -1,
                message: '获取用户信息失败'
            })
        }
    }

    //更改头像
    async changeAvatar(req, res, next) {
        let { pic_url } = req.body;
        if (!pic_url) {
            res.send({
                status: -1,
                message: '更改头像失败，参数有误!'
            })
            return;
        }
        try {
            await AdminModel.update({ id: req.session.user_id }, { avatar: pic_url });
            res.send({
                status: 200,
                message: '更改头像成功'
            })
        } catch (err) {
            console.log('更改头像失败', err);
            res.send({
                status: -1,
                message: '更改头像失败'
            })
        }
    }

    //管理端获取用户数据
    async userStatistic(req, res, next) {
        let { limit = 10, offset = 0 } = req.query;
        try {
            let data = await AdminModel.find({ status: 2 }, 'username create_time city -_id').limit(limit).skip(offset * limit);
            res.send({
                status: 200,
                message: '获取用户数据成功',
                data
            })
        } catch (err) {
            console.log('获取用户数据失败', err);
            res.send({
                status: -1,
                message: '获取用户数据失败'
            })
        }
    }
}

export default new User();