import mongoose from 'mongoose'
import { stringify } from 'querystring';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    openid: String,
    session_key: String,
    phone: String,
    create_time: {
        type: Date,
        default: new Date()
    },	//创建日期
    city: String,	//城市
})

// userSchema.index({id: 1});

const User = mongoose.model('User', userSchema);


export default User