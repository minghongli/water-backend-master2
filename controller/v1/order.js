import BaseClass from "../../prototype/baseClass"
import OrderModel from "../../models/v1/order"
import AddressModel from '../../models/admin/address'
import GoodsModel from '../../models/v1/goods'
import AdminModel from '../../models/admin/admin'
import { getTokenByCode } from '../../utils/wxService'
import { ValidateToken } from '../../utils/token'

class Order extends BaseClass {
    constructor() {
        super();
        this.makeOrder = this.makeOrder.bind(this);
        this.getOrder = this.getOrder.bind(this);
        this.getOrders = this.getOrders.bind(this);
    }

    //下订单
    async makeOrder(req, res, next) {
        let key = req.headers.authorization;
        //console.info(key);
        var result = await ValidateToken(key);
        if (!result) {
            res.send({
                status: '-1',
                message: 'token有误'
            })
            return;
        }
        let { goods, address, remark = '' } = req.body;
        if (!goods || !address) {
            res.send({
                status: -1,
                message: '下订单失败，参数有误'
            })
            return
        }
        try {
            let promiseArr = [];
            goods = JSON.parse(goods);//由于小程序传对象会变成object,所以这样处理
            //let restaurant = await RestaurantModel.findOne({id: restaurant_id});     //找到该餐馆
            promiseArr.push(this._calcTotalPrice(goods));       //计算总价格
            //promiseArr.push(AddressModel.findOne({id: address_id}));                       //地址信息
            //promiseArr.push(AdminModel.findOne({ id: '5d10e28a1328ca434ce0ff00' }));  //req.session.user_id             //用户信息
            //promiseArr.push(getTokenByCode(code));
            //promiseArr.push(this.getId('order_id'));                                    //订单号
            Promise.all(promiseArr).then(async (values) => {
                let order_data = {
                    number: Math.random().toString(9).substr(2),//订单编号
                    total_price: values[0].total_price,
                    goods: values[0].order_goods,
                    address: address,
                    user_id: result.openid,//values[2]._id
                    //id: values[3],
                    remark,
                    status: '未支付',
                    code: 0,
                    delivery_state: 0,//配送状态
                    //shipping_fee: restaurant.shipping_fee,
                    create_time_timestamp: Math.floor(new Date().getTime() / 1000)
                }
                let order = new OrderModel(order_data);
                await order.save();
                let order_id = order.get("id");
                res.send({
                    status: 200,
                    message: '提交订单成功，请尽快支付',
                    order_id: order_id,//values[3],
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
    async updateOrder(req, res, next) {
        let { orderId, state } = req.body;
        if (!orderId || !state) {
            res.send({
                status: -1,
                message: '更新订单状态失败，参数有误'
            })
        }
        try {
            console.info(11);
            let order = await OrderModel.findOne({ _id: orderId });
            console.info(order);
            //order.status = '支付成功';
            order.delivery_state = state;
            await order.save();
            res.send({
                status: 200,
                message: '更新订单成功',
                order_id: orderId
            })
        } catch (err) {
            console.log('更新订单失败', err);
            res.send({
                status: -1,
                message: '更新订单失败'
            })
        }
    }
    //获取所有订单列表
    async getOrders(req, res, next) {
        let { page = 0, limit = 10 } = req.query;
        //let {offset = 0, limit = 10} = req.query;
        try {
            let orders = await OrderModel.find({
                code: 0
            }, '-_id').skip(Number(page) * (Number(limit))).limit(Number(limit)).sort({ '_id': -1 });
            //.sort({'_id':-1}).exec(cb);
            //await RestaurantModel.find({}, '-_id').limit(Number(limit)).skip(Number(offset)).sort({sort_type: 1});


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
        let key = req.headers.authorization;
        //console.info(key);
        var result = await ValidateToken(key);
        if (!result) {
            res.send({
                status: '-1',
                message: 'token有误'
            })
            return;
        }
        //let { offset = 0, limit = 10 } = req.query;
        //let { page = 0, limit = 10, state = -1 } = req.query;
        let { state } = req.body;
        try {
            //待付款0", "待发货"1, "待收货"10, "待评价"20, "已完成"30   -1是所有订单

            //let userInfo = await AdminModel.findOne({ id: req.session.user_id });
            //console.log(userInfo)
            let orders;
            if (state == -1) {
                //所有订单
                // orders = await OrderModel.find({
                //     code: 200,
                //     user_id: result.openid
                // }, '-_id')
                orders = await OrderModel.find({
                    code: 200,
                    user_id: result.openid
                })//.limit(Number(limit)).skip(Number(page) * (Number(limit)));//.populate([{path: 'restaurant'}])

            } else if (state == 0) {
                //未付款订单
                orders = await OrderModel.find({
                    code: 0,
                    user_id: result.openid
                });//.populate([{path: 'restaurant'}])
            } else {
                orders = await OrderModel.find({
                    delivery_state: state,
                    code: 200,
                    user_id: result.openid
                })//.limit(Number(limit)).skip(Number(page) * (Number(limit)));//.populate([{path: 'restaurant'}])
            }
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
        console.info(order_id);
        if (!order_id) {
            res.send({
                status: -1,
                message: '获取指定订单失败，参数有误!'
            })
            return;
        }
        try {
            let order = await OrderModel.findOne({ _id: order_id })//.populate([{path: 'address'}]);
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
        console.info(goods);
        let total_price = 0, order_goods = [];
        for (let i = 0; i < goods.length; i++) {
            let good = await GoodsModel.findOne({ '_id': goods[i]['id'] });
            // let good = await GoodsModel.findOne({'skus.id': goods[i]['skus_id']});  //根据sku_id找到food
            // let sku = good.skus.filter(sku => {
            //     return sku.id == goods[i]['skus_id']
            // })
            order_goods.push({
                name: good['name'],
                price: good['price'],
                num: goods[i]['num'],
                total_price: Number(good['price']) * Number(goods[i]['num']),
                //spec: sku[0]['spec'] || '',//规格描述
                pic_url: good['pic_url']
            })
            total_price += Number(good['price']) * Number(goods[i]['num']);
        }
        return { total_price, order_goods };
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