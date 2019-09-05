import BaseClass from "../../prototype/baseClass"
import OrderModel from "../../models/v1/order"
import AddressModel from '../../models/admin/address'
import GoodsModel from '../../models/v1/goods'
import AdminModel from '../../models/admin/admin'

class Order extends BaseClass {
    constructor() {
        super();
        this.makeOrder = this.makeOrder.bind(this);
        this.getOrder = this.getOrder.bind(this);
        this.getOrders = this.getOrders.bind(this);
    }

    //下订单
    async makeOrder(req, res, next) {
        let {restaurant_id, goods, address_id, remark = ''} = req.body;
        if (!restaurant_id && !goods && !address_id) {
            res.send({
                status: -1,
                message: '下订单失败，参数有误'
            })
            return
        }
        try {
            let promiseArr = [];
            let restaurant = await RestaurantModel.findOne({id: restaurant_id});     //找到该餐馆
            promiseArr.push(this._calcTotalPrice(restaurant.shipping_fee, goods));       //计算总价格
            promiseArr.push(AddressModel.findOne({id: address_id}));                       //地址信息
            promiseArr.push(AdminModel.findOne({id: req.session.user_id}));               //用户信息
            promiseArr.push(this.getId('order_id'));                                    //订单号
            Promise.all(promiseArr).then(async (values) => {
                let order_data = {
                    total_price: values[0].total_price,
                    goods: values[0].order_goods,
                    address: values[1]._id,
                    user_id: values[2]._id,
                    id: values[3],
                    remark,
                    restaurant_id,
                    status: '未支付',
                    code: 0,
                    restaurant: restaurant._id,
                    shipping_fee: restaurant.shipping_fee,
                    create_time_timestamp: Math.floor(new Date().getTime() / 1000)
                }
                let order = new OrderModel(order_data);
                await order.save();
                res.send({
                    status: 200,
                    message: '提交订单成功，请尽快支付',
                    order_id: values[3],
                    total_price: values[0].total_price,
                })
            });
        } catch (err) {
            console.log('提交订单失败', err);
            res.send({
                status: -1,
                message: '提交订单失败'
            })
        }
    }
	
	
	//修改订单
	async updateOrder(req,res,next){
		
	}
	//获取所有订单列表
	async getOrders(req, res, next) {
	    let {offset = 0, limit = 10} = req.query;
	    try {
	        let orders = await OrderModel.find({
	            code: 200
	        }, '-_id').limit(Number(limit)).skip(Number(offset));
	        res.send({
	            status: 200,
	            data: orders,
	            message: '获取订单列表成功'
	        })
	    } catch (err) {
	        console.log('获取订单列表失败', err);
	        res.send({
	            status: -1,
	            message: '获取订单列表失败'
	        })
	    }
	}

    //获取用户订单列表
    async getUserOrders(req, res, next) {
        let {offset = 0, limit = 10} = req.query;
        try {
            let userInfo = await AdminModel.findOne({id: req.session.user_id});
            console.log(userInfo)
            let orders = await OrderModel.find({
                code: 200,
                user_id: userInfo._id
            }, '-_id').limit(Number(limit)).skip(Number(offset));//.populate([{path: 'restaurant'}])
            res.send({
                status: 200,
                data: orders,
                message: '获取我的订单列表成功'
            })
        } catch (err) {
            console.log('获取订单列表失败', err);
            res.send({
                status: -1,
                message: '获取订单列表失败'
            })
        }
    }

    //获取指定订单信息
    async getOrder(req, res, next) {
        const order_id = req.params.order_id;
        if (!order_id) {
            res.send({
                status: -1,
                message: '获取指定订单失败，参数有误!'
            })
            return;
        }
        try {
            let order = await OrderModel.findOne({id: order_id})//.populate([{path: 'address'}]);
            if (!order) {
                res.send({
                    status: -1,
                    message: '该订单不存在'
                })
                return;
            }
            await this._calcRemainTime(order);  //计算剩余时间
            res.send({
                status: 200,
                data: order,
                message: '获取指定订单成功'
            })
        } catch (err) {
            console.log('获取指定订单失败', err);
            res.send({
                status: -1,
                message: '获取指定订单失败'
            })
        }
    }

    //计算总价格
    async _calcTotalPrice(goods) {////配送费
        let total_price = 0, order_goods = [];
        for (let i = 0; i < goods.length; i++) {
            let good = await GoodsModel.findOne({'skus.id': goods[i]['skus_id']});  //根据sku_id找到food
            let sku = good.skus.filter(sku => {
                return sku.id == goods[i]['skus_id']
            })
            order_goods.push({
                name: food['name'],
                price: sku[0]['price'],
                num: goods[i]['num'],
                total_price: Number(sku[0].price) * Number(goods[i]['num']),
                spec: sku[0]['spec'] || '',
                pic_url: food['pic_url']
            })
            total_price += Number(sku[0].price) * Number(goods[i]['num']);
        }
        return {total_price, order_goods};
    }

    //计算剩余支付时间
    async _calcRemainTime(order) {
        if (order.code !== 200) {
            let fifteen_minutes = 60 * 15;      //15分钟转为秒数
            let now = Math.floor(new Date().getTime() / 1000);      //现在时刻
            let order_time = order.create_time_timestamp;       //订单时刻
            if (now - order_time >= fifteen_minutes) {
                order.status = '超过支付期限'
                order.code = 400;
                order.pay_remain_time = 0;
            } else {
                order.pay_remain_time = fifteen_minutes - (now - order_time);
            }
            await order.save();
            return order;
        }
    }

}

export default new Order();