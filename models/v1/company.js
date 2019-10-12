import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const companySchema = new Schema({
	// user_id: String,
	//id: Number,
	// brand: Number, //品牌1:普通用户、 2:普通管理员 3：超级管理员
	// capacity: Number, //容量1:普通用户、 2:普通管理员 3：超级管理员
	// package_type: Number, //包装类型1:桶装、 2:会议用瓶装 3：泡茶
	companyName: String, //名称
	userName: String, //收货人姓名
	sex: String, //性别
	phone: String, //联系电话
	address: String, //公司地址
	invoice: String, // 发票类型0不开发票1普通发票2专用发票
	demandOfMonth: String,//月需求量
	singleNumber: String,//单词送水
	brand: String,//品牌
	status: Number,//状态 0未联系 1已联系
	remark: String,//备注
	created_at: {
		type: Date,
		default: new Date()
	},
	update_time: String,
})
// goodsSchema.index({
// 	id: 1
// });
const Company = mongoose.model('Company', companySchema)

export default Company