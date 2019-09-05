import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    id: Number,			//id
    user_id: Number,     //用户id
    user_name: String,   //用户名
    avatar: String,          //头像
//     restaurant: {type: Schema.ObjectId, ref: 'Restaurant'},
//     restaurant_id: Number,
    good: {type: Schema.ObjectId, ref: 'Goods'},
    good_id: Number,
    comment_time: {type: Date, default: new Date()},
    add_comment_list: [{
        content: String,
        time: {type: Date, default: new Date()}
    }],
    comment_data: String,
    order_id: Number,
    name: String,
    good_score: Number,//商品（配送员服务，物流发货，商品）
    delivery_score: Number,//配送，物流
    quality_score: Number,//质量
    pack_score: Number,
    pic_url: []      //图片url

})

commentSchema.index({id: 1});

const Comment = mongoose.model('Comment', commentSchema);


export default Comment
