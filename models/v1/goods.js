import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const goodsSchema = new Schema({
	id: Number,
	brand: Number, //品牌1:普通用户、 2:普通管理员 3：超级管理员
	capacity: Number, //容量1:普通用户、 2:普通管理员 3：超级管理员
	package_type: Number, //包装类型1:桶装、 2:会议用瓶装 3：泡茶
	name: String, //名称
	price: Number, //价格
	description: String, //描述
	pic_url: String, //图片

	month_saled: Number, //月售数量
	month_saled_content: String, // 月售描述
	sequence: Number,//序号
	// skus: [{
	// 	id: Number,
	// 	spec: String, //规格描述
	// 	description: String, //详细描述
	// 	price: String, //价格
	// }],
	created_at: {
		type: Date,
		default: new Date()
	},
	comment_number: Number,   //评价数量	
})
// goodsSchema.index({
// 	id: 1
// });
const Goods = mongoose.model('Goods', goodsSchema)

export default Goods