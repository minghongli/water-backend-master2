import mongoose from 'mongoose'
import { stringify } from 'querystring';

const Schema = mongoose.Schema;

const addressSchema = new Schema({
    //id: Number,
    user_id: String,  //userId(目前是用户的openid)
    name: String,  //收货人姓名
    phone: String,  //联系电话
    address: String,  //地址
    address_detail: String,  //详细地址，门牌号
    // gender: String,  //性别
    // province: String,  //省
    // city: String,  //市
    // district: String,  //区
    // house_number : String     //门牌号
    // lng: String, //经度
    // lat: String,//纬度
    created_at: {type: Date, default: Date.now()},
})

addressSchema.index({id: 1});

const Address = mongoose.model('Address', addressSchema);

export default Address