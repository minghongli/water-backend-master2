import BaseClass from '../../prototype/baseClass'
import crypto from 'crypto'
import UserModel from '../../models/admin/user'
import {getTokenByCode} from '../../utils/wxService'

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
            let {openid,session_key}=obj;
            let doc=await UserModel.find({openid:openid});
            console.info(doc);
            //判断数据库是否存在数据
            if(!doc||doc.length==0){
                console.info(0)
                const data = {          //创建一个新账号
                    openid,              
                    session_key,
                    city: '北京市',         //登录城市
                }
                console.info(data);
                await new UserModel(data).save();
                req.session.user_id = openid;    //设置session
            }
            console.info(1)
            let result={
                openid,              
                session_key,       
            }
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
}

export default new User();