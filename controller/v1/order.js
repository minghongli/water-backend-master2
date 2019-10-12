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
            address = JSON.parse(address);//由于小程序传对象会变成object,所以这样处理
            //let restaurant = await RestaurantModel.findOne({id: restaurant_id});     //找到该餐馆
            promiseArr.push(this._calcTotalPrice(goods));       //计算总价格
            //promiseArr.push(AddressModel.findOne({id: address_id}));                       //地址信息
            //promiseArr.push(AdminModel.findOne({ id: '5d10e28a1328ca434ce0ff00' }));  //req.session.user_id             //用户信息
            //promiseArr.push(getTokenByCode(code));
            //promiseArr.push(this.getId('order_id'));                                    //订单号
            Promise.all(promiseArr).then(async (values) => {
                let goodsNum = values[0].order_goods.reduce((prev, cur) => prev + cur.num, 0);
                let order_data = {
                    number: Math.random().toString(9).substr(2),//订单编号
                    goodsNum: goodsNum,
                    total_price: values[0].total_price,
                    goods: values[0].order_goods,
                    address: address,
                    user_id: result.openid,//values[2]._id
                    //id: values[3],
                    remark,
                    status: '待付款',
                    pay_status: "未支付",
                    pay_code: 0,//支付状态码 未支付0 和 已支付200  400超过支付期限
                    delivery_code: 0,//配送状态 [未配送0 配送中10 待评价20 已完成30] 
                    order_code: 0,//订单状态码 "待付款0", "待发货"1, "待收货"10, "待评价"20, "已完成"30 -100已取消
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
        let { orderId, state } = req.body; //state:1确认发货 10完成订单
        if (!orderId || !state) {
            res.send({
                code: -1,
                message: '更新订单状态失败，参数有误'
            })
        }
        try {
            console.info(11);
            let order = await OrderModel.findOne({ _id: orderId });
            console.info(order);
            if (state == 1) {
                order.delivery_code = 10;
                order.order_code = 10;
                order.status = "待收货";
            } else if (state == 10) {
                order.delivery_code = 10;
                order.order_code = 30;
                order.status = "已完成";
            }
            await order.save();
            res.send({
                code: 0,
                message: '更新订单成功',
                order_id: orderId
            })
        } catch (err) {
            console.log('更新订单失败', err);
            res.send({
                code: -1,
                message: '更新订单失败'
            })
        }
    }

    //取消订单
    async cancelOrder(req, res, next) {
        let { orderId } = req.body;
        if (!orderId) {
            res.send({
                code: -1,
                message: '取消订单失败，参数有误'
            })
        }
        try {
            console.info(11);
            let order = await OrderModel.findOne({ _id: orderId });
            console.info(order);
            order.status = '已取消';
            order.order_code = -100;
            await order.save();
            res.send({
                code: 0,
                message: '取消订单成功',
                order_id: orderId
            })
        } catch (err) {
            console.log('取消订单失败', err);
            res.send({
                code: -1,
                message: '取消订单失败'
            })
        }
    }
    //获取所有订单列表
    async getOrders(req, res, next) {
        //订单状态order_state:-1全部 1">待发货 10">待收货 30">已完成100">已取消
        //支付状态pay_state: -1全部0未支付200已支付
        //配送状态delivery_state:
        let { page = 0, limit = 10, order_state = -1, pay_state = -1 } = req.query;


        //let {offset = 0, limit = 10} = req.query;
        try {
            let orders;
            if (order_state == -1 && pay_state == -1) {
                orders = await OrderModel.find({
                    // code: 0
                }).skip(Number(page) * (Number(limit))).limit(Number(limit)).sort({ '_id': -1 });
            } else if (order_state == -1 && pay_state != -1) {
                orders = await OrderModel.find({
                    pay_code: pay_state
                }).skip(Number(page) * (Number(limit))).limit(Number(limit)).sort({ '_id': -1 });
            } else if (pay_state == -1 && order_state != -1) {
                if (order_state == 100||order_code==0) {
                    //已取消或未付款
                    orders = await OrderModel.find({
                        order_code: order_state
                    }).skip(Number(page) * (Number(limit))).limit(Number(limit)).sort({ '_id': -1 });
                } else {
                    orders = await OrderModel.find({
                        pay_code: '200',
                        order_code: order_state,
                    }).skip(Number(page) * (Number(limit))).limit(Number(limit)).sort({ '_id': -1 });
                }

            } else {
                orders = await OrderModel.find({
                    pay_code: pay_state,
                    order_code: order_state,
                }).skip(Number(page) * (Number(limit))).limit(Number(limit)).sort({ '_id': -1 });
            }


            // let orders = await OrderModel.find({
            //     code: 0
            // }, '-_id').skip(Number(page) * (Number(limit))).limit(Number(limit)).sort({ '_id': -1 });
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

    //获取待处理订单列表
    async getPendingOrders(req, res, next) {
        let { page = 0, limit = 10, order_code = -1 } = req.query;
        //let {offset = 0, limit = 10} = req.query;
        try {
            //待处理订单
            let obj = {
                pay_code: 200,//已支付
                //delivery_state: { $ne: 30 },//不等于30（已完成）
                order_code: { $in: [1, 10] }//待发货，待收货
            }
            if (order_code != -1) {
                obj.order_code = order_code
            }
            console.info(obj);
            let orders = await OrderModel.find(obj).skip(Number(page) * (Number(limit))).limit(Number(limit)).sort({ '_id': -1 });
            res.send({
                code: 0,
                data: orders,
                message: '获取待处理订单列表成功'
            })
        } catch (err) {
            console.log('获取待处理订单列表失败', err);
            res.send({
                code: -1,
                message: '获取待处理订单列表失败'
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
            //待付款0", "待发货"1, "待收货"10, "待评价"20, "已完成"30   -1是所有订单  400超过支付期限

            //let userInfo = await AdminModel.findOne({ id: req.session.user_id });
            //console.log(userInfo)
            let orders;
            if (state == -1) {
                //所有订单
                orders = await OrderModel.find({
                    //code: 200,
                    user_id: result.openid
                });
            } else if (state == 0) {
                //未付款订单
                orders = await OrderModel.find({
                    pay_code: 0,
                    user_id: result.openid
                });//.populate([{path: 'restaurant'}])
            } else {
                //已支付
                orders = await OrderModel.find({
                    order_code: state,
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
        if (order.pay_code !== 200) {
            let fifteen_minutes = 60 * 30;      //30分钟转为秒数
            let now = Math.floor(new Date().getTime() / 1000);      //现在时刻
            let order_time = order.create_time_timestamp;       //订单时刻
            if (now - order_time >= fifteen_minutes) {
                order.pay_status = '超过支付期限'
                order.pay_code = 400;//支付状态：超过支付期限
                order.order_code = -100;//订单状态 已关闭
                order.status = "已关闭";
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