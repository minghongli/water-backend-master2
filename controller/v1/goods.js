import GoodModel from '../../models/v1/goods'
import BrandModel from '../../models/v1/brand'
import BaseClass from "../../prototype/baseClass";

class Goods extends BaseClass {
	constructor() {
		super();
		//this.addBrand = this.addBrand.bind(this);
		//this.addGood = this.addGood.bind(this);
	}

		// //添加品牌
		// async addBrand(req, res, next) {
		// 	let {
		// 		name, brand, capacity, package_type,
		// 		price,
		// 		description,
		// 		pic_url,
		// 		skus
		// 	} = req.body;
		// 	if (name) {
		// 		res.send({
		// 			status: -1,
		// 			message: '添加食物失败，参数有误!'
		// 		})
		// 		return;
		// 	}
		// 	try {
		// 		// for (let i = 0; i < skus.length; i++) {
		// 		// 	let sku_id = await this.getId('sku_id');
		// 		// 	skus[i]['id'] = sku_id;
		// 		// }
		// 		// let month_saled = 0; //Math.ceil(Math.random() * 50);  //随机生成一个月售数量
		// 		// let good_id = await this.getId('good_id');
		// 		// let good_data = {
		// 		// 	id: good_id,
		// 		// 	name: brand, capacity, package_type,
		// 		// 	month_saled,
		// 		// 	month_saled_content: `${month_saled}`,
		// 		// 	price,
		// 		// 	description,
		// 		// 	pic_url,
		// 		// 	skus
		// 		// }
		// 		// let addGoods = await new GoodModel(good_data).save();
		// 		// await addGoods.save();
		// 		res.send({
		// 			status: 200,
		// 			message: '添加商品成功',
		// 			food_id
		// 		})
	
		// 	} catch (err) {
	
		// 	}
		// }
		// //获取商品列表
		// async getBrandList(req, res, next) {
		// 	const goods_id = req.params.goods_id;
		// 	if (!goods_id) {
		// 		res.send({
		// 			status: -1,
		// 			message: '获取商品列表失败，参数有误'
		// 		})
		// 		return;
		// 	}
		// 	try {
		// 		let foods = await GoodModel.find({ goods_id }, '-_id').populate({
		// 			path: 'spus',
		// 		});
		// 		res.send({
		// 			status: 200,
		// 			message: '获取商品列表成功',
		// 			data: foods
		// 		})
		// 	} catch (err) {
		// 		console.log('获取商品食物失败', err);
		// 		res.send({
		// 			status: -1,
		// 			message: '获取商品食物失败'
		// 		})
		// 	}
		// }
	

	//添加商品
	async addGood(req, res, next) {
		console.info(req.body);
		let {
			name, brand, capacity, package_type,
			price,
			description,
			pic_url,
			//skus
		} = req.body;
		if (!name) {
			res.send({
				status: -1,
				message: '添加商品失败，参数有误!'
			})
			return;
		}
		try {
			// for (let i = 0; i < skus.length; i++) {
			// 	let sku_id = await this.getId('sku_id');
			// 	skus[i]['id'] = sku_id;
			// }	
			console.log(11)
			let month_saled = 0; //Math.ceil(Math.random() * 50);  //随机生成一个月售数量
			//let good_id = await this.getId('good_id');
			console.log(11)
			//console.log(good_id);
			let good_data = {
				id: 1,//good_id
				//category_id:1,
				brand:1,
				name, capacity:1, package_type:1,
				price,
				description,
				pic_url:'',
				sequence:1,
				month_saled:0,
				month_saled_content: `${month_saled}`,
				comment_number:0
			}
			console.log(good_data);
			let addGoods = new GoodModel(good_data,false);
			console.log(2222);
			console.info(addGoods)
			await addGoods.save();
			console.log(333);
			res.send({
				status: 200,
				message: '添加商品成功',
				// food_id
			})

		} catch (err) {

		}
	}

	//删除商品
	async deleteGood(req, res, next) {
		let good_id = req.params.good_id;
		if (!good_id) {
			res.send({
				status: -1,
				message: '删除商品失败，参数有误'
			})
			return;
		}
		try {
			let good = await GoodModel.findOne({ id: food_id });
			await good.remove()
			res.send({
				status: 200,
				message: '删除商品成功'
			})

		} catch (err) {
			res.send({
				status: -1,
				message: '删除商品失败'
			})
		}
	}

	//获取商品列表
	async getGoodsList(req, res, next) {
		//const brand_id = req.params.brand_id;
		// const goods_id = req.params.goods_id;
		// if (!goods_id) {
		// 	res.send({
		// 		status: -1,
		// 		message: '获取商品列表失败，参数有误'
		// 	})
		// 	return;
		// }
		let package_type = req.query.package_type;
		console.info(package_type)
		let goods=[];
		try {
			if(!package_type){
				goods = await GoodModel.find({})
			}else{
				goods = await GoodModel.find({package_type: package_type});//.limit(Number(limit)).skip(Number(offset));
			}
			res.send({
				status: 200,
				message: '获取商品列表成功',
				result: goods
			})
		} catch (err) {
			console.log('获取商品列表失败', err);
			res.send({
				status: -1,
				message: '获取商品列表失败'
			})
		}
	}

	//获取商品详情
	async getGoodsDetail(req,res,next){
		console.info(req);
		//let id = req.query.id;
		let id=req.params.good_id;
		if (!id) {
			res.send({
				status: -1,
				message: '获取商品详情失败，参数有误!'
			})
			return;
		}
		let goods={};
		try {
			goods = await GoodModel.find({_id: id});//.limit(Number(limit)).skip(Number(offset));
			res.send({
				status: 200,
				message: '获取商品详情成功',
				result: goods[0]
			})
		} catch (err) {
			console.log('获取商品详情失败', err);
			res.send({
				status: -1,
				message: '获取商品详情失败'
			})
		}
	}

}
export default new Goods();