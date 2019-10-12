import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const orderSchema = new Schema({
	number:String,//订单编号
	user_id:String,
	// user_id: {
	// 	type: Schema.ObjectId,
	// 	ref: 'Admin'
	// }, //用户id


	//     restaurant: {type: Schema.ObjectId, ref: 'Restaurant'},
	//     restaurant_id: Number,
	total_price: Number,
	goodsNum:Number,
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
	pay_code:Number,//支付状态码 未支付0 和 已支付200  400超过支付期限
	delivery_code:Number,//配送状态 [未配送0 配送中10 已完成20]//配送中 
	order_code:Number,//订单状态码 "待付款0", "待发货"1, "待收货"10, "待评价"20, "已完成"30 -100已关闭 //-200超过支付期限交易关闭
	pay_status:String,//支付状态码 未支付0 和 已支付200  400超过支付期限
	status: String,//订单状态 "待付款", "待发货", "待收货", "待评价", "已完成" -100已关闭  [订单状态、支付状态、发货状态]
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
