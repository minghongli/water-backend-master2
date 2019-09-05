import mongoose from 'mongoose'
import { stringify } from 'querystring';

const Schema = mongoose.Schema;

const adminSchema = new Schema({
    username: String,	//用户名
    password: String,	//密码
    openid:String,
    session_key:String,
    id: Number,			//id
    create_time: {
        type: Date,
        default: new Date()
    },	//创建日期
    status: Number,  //1:普通用户、 2:普通管理员 3：超级管理员
    avatar: {type: String, default: 'default.jpg'},	//头像图片
    city: String,	//城市
})

adminSchema.index({id: 1});

const Admin = mongoose.model('Admin', adminSchema);


export default Admin
