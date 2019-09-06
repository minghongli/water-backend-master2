import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const orderSchema = new Schema({
	user_id:String,
	// user_id: {
	// 	type: Schema.ObjectId,
	// 	ref: 'Admin'
	// }, //用户id


	//     restaurant: {type: Schema.ObjectId, ref: 'Restaurant'},
	//     restaurant_id: Number,
	total_price: Number,
	goods: [{
		good_id: Number,
		// sku_id: Number,
		num: Number,
		price: Number,
		name: String,
		pic_url: String,
		total_price: String,
		spec: String,
		has_comment: {
			type: Boolean,
			default: false
		} //是否已经评价该订单了
	}],
	//shipping_fee: Number,
// 	address: {
// 		type: Schema.ObjectId,
// 		ref: 'Address'
// 	},
	address: {
		name: String,
		phone: String,
		address_all: String,
	},

	remark: String,
	status: String,//支付状态 未支付 和 已支付
	code: Number, //支付状态码 未支付0 和 已支付200
	create_time: {
		type: Date,
		default: new Date()
	}, //订单创建时间
	create_time_timestamp: {
		type: String
	}, //订单创建时间戳
	pay_remain_time: String //支付剩余时间
})

orderSchema.index({
	id: 1
});

const Order = mongoose.model('Order', orderSchema);


export default Order