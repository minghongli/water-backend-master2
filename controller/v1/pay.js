import md5 from 'blueimp-md5'
import crypto from 'crypto'
import BaseClass from '../../prototype/baseClass'
import OrderModel from '../../models/v1/order'
import PayModel from '../../models/v1/pay'
import fetch from 'node-fetch';
import FormData from 'form-data';
import config from '../../config'
import wxConfig from '../../wx_config'
//import request from 'request'
var request = require('co-request');

import {getTokenByCode} from '../../utils/wxService'
var parseString = require('xml2js').parseString; // xml转js对象

class Pay extends BaseClass {
    constructor() {
        super();
        this.appkey = '55388a820c3644aa8eaef76f9f89ecdb'
        this.appSceret = '8254867c1af642a39f473a2341b91a70'
        this.initPay = this.initPay.bind(this)
        this.payNotice = this.payNotice.bind(this)
    }

    //调用支付统一下单API
    async wxpayUnifiedorder(openid,total_fee) {
        // var param = req.query || req.params;
        // //var openid = param.openid;
        // var openid = payuserid;

        var spbill_create_ip = req.ip.replace(/::ffff:/, ''); // 获取客户端ip
        var body = '水递夫商品'; // 商品描述
        var notify_url = `${config.synNotifyUrl}/#/order_detail?id=${order_id}` // 支付成功的回调地址  可访问 不带参数
        var nonce_str = createNonceStr(); // 随机字符串
        var out_trade_no = wxConfig.getWxPayOrdrID(); // 商户订单号
        var total_fee = '1'; // 订单价格 单位是 分
        var timestamp = Math.round(new Date().getTime() / 1000); // 当前时间

        var bodyData = '<xml>';
        bodyData += '<appid>' + wxConfig.AppID + '</appid>';  // 小程序ID
        bodyData += '<body>' + body + '</body>'; // 商品描述
        bodyData += '<mch_id>' + wxConfig.Mch_id + '</mch_id>'; // 商户号
        bodyData += '<nonce_str>' + nonce_str + '</nonce_str>'; // 随机字符串
        bodyData += '<notify_url>' + notify_url + '</notify_url>'; // 支付成功的回调地址 
        bodyData += '<openid>' + openid + '</openid>'; // 用户标识
        bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>'; // 商户订单号
        bodyData += '<spbill_create_ip>' + spbill_create_ip + '</spbill_create_ip>'; // 终端IP
        bodyData += '<total_fee>' + total_fee + '</total_fee>'; // 总金额 单位为分
        bodyData += '<trade_type>JSAPI</trade_type>'; // 交易类型 小程序取值如下：JSAPI
        // 签名
        var sign = paysignjsapi(
            wxConfig.AppID,
            body,
            wxConfig.Mch_id,
            nonce_str,
            notify_url,
            openid,
            out_trade_no,
            spbill_create_ip,
            total_fee
        );
        bodyData += '<sign>' + sign + '</sign>';
        bodyData += '</xml>';
        // 微信小程序统一下单接口
        var urlStr = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
        var options = {
            method: 'POST',
            url: urlStr,
            // headers: headers,
            //body: bodyData
            form: body
        };
        var req = await request(options);
        // if(req.statusCode==200){

        // }
        var result = fastXmlParser.parse(req.body).xml;
        if (result.return_code[0] == 'SUCCESS') {
            returnValue.msg = '操作成功';
            returnValue.status = '100';
            returnValue.out_trade_no = out_trade_no;  // 商户订单号
            // 小程序 客户端支付需要 nonceStr,timestamp,package,paySign  这四个参数
            returnValue.nonceStr = result.nonce_str[0]; // 随机字符串
            returnValue.timestamp = timestamp.toString(); // 时间戳
            returnValue.package = 'prepay_id=' + result.prepay_id[0]; // 统一下单接口返回的 prepay_id 参数值
            returnValue.paySign = paysignjs(wxConfig.AppID, returnValue.nonceStr, returnValue.package, 'MD5', timestamp); // 签名
            //res.end(JSON.stringify(returnValue));
            return returnValue;
        } else {
            returnValue.msg = result.return_msg[0];
            returnValue.status = '102';
            //res.end(JSON.stringify(returnValue));
            return returnValue;
        }

        // request({
        //     url: urlStr,
        //     method: 'POST',
        //     body: bodyData
        // }, function (error, response, body) {
        //     if (!error && response.statusCode == 200) {
        //         var returnValue = {};
        //         parseString(body, function (err, result) {
        //             if (result.xml.return_code[0] == 'SUCCESS') {
        //                 returnValue.msg = '操作成功';
        //                 returnValue.status = '100';
        //                 returnValue.out_trade_no = out_trade_no;  // 商户订单号
        //                 // 小程序 客户端支付需要 nonceStr,timestamp,package,paySign  这四个参数
        //                 returnValue.nonceStr = result.xml.nonce_str[0]; // 随机字符串
        //                 returnValue.timestamp = timestamp.toString(); // 时间戳
        //                 returnValue.package = 'prepay_id=' + result.xml.prepay_id[0]; // 统一下单接口返回的 prepay_id 参数值
        //                 returnValue.paySign = paysignjs(wxConfig.AppID, returnValue.nonceStr, returnValue.package, 'MD5', timestamp); // 签名
        //                 //res.end(JSON.stringify(returnValue));
        //                 return returnValue;
        //             } else {
        //                 returnValue.msg = result.xml.return_msg[0];
        //                 returnValue.status = '102';
        //                 //res.end(JSON.stringify(returnValue));
        //                 return returnValue;
        //             }
        //         });
        //     }
        // })
    }

    //准备支付
    async initPay(req, res, next) {
        //传入订单 和支付方式
        //let {order_id, payType = '1', method = 'trpay.trade.create.scan'} = req.body;
        //method=wap;
        let { order_id, payType, method = 'WeChatApplet', payuserid } = req.body;
        if (!order_id) {
            res.send({
                status: -1,
                message: '初始化支付失败参数有误'
            })
            return;
        }
        try {
            let pay = await PayModel.findOne({ order_id });
            if (pay && pay.code === 200) {
                res.send({
                    status: 302,
                    message: '该订单已完成支付！'
                })
                return;
            }
            if (pay) {      //如果该订单已经提交 但是没有支付 重新初始化订单
                pay.remove();
            }
            //let id = await this.getId('pay_id');
            //let payuserid = req.session.user_id
            let payData = {
                amount: '1',       //这里都是设置1分钱支付
                tradeName: '外卖订单支付',  //商户自定义订单标题
                outTradeNo: id + '',   //商户自主生成的订单号
                payType: payType,    //支付渠道
                payuserid,            //商家支付id
                notifyUrl: config.notifyUrl, //服务器异步通知
                appkey: this.appkey,          //appKey
                method,
                timestamp: new Date().getTime() + '',
                version: '1.0'
            }
            let sign = ''
            if (method === 'trpay.trade.create.scan') {     //扫码支付
                sign = this.sign(payData);
                payData['sign'] = sign;
                let result = await this.scanPay(res, payData);
                if (result.code !== '0000') {
                    res.send({
                        status: -1,
                        message: '支付接口出错，请更改支付方式'
                    })
                    return;
                }
                await saveDB({ method: 'scan', id, order_id, payType })
                res.send({
                    status: 1,
                    data: { ...result, ...payData, order_id },
                    message: '获取二维码成功，请扫码支付'
                })
            } else if (method == 'WeChatApplet') {//微信小程序
                let result=await this.wxpayUnifiedorder(openid,total_fee);
                await saveDB({ method: 'WeChatApplet', order_id, payType, code: 0 });
                res.send({
                    status: 1,
                    data: result,
                    message: '支付订单已生成，请支付'
                })
            } else {                                                             //调用app支付
                payData.synNotifyUrl = `${config.synNotifyUrl}/#/order_detail?id=${order_id}`;            //客户端同步跳转
                sign = this.sign(payData);
                payData['sign'] = sign;
                //await saveDB({method: 'wap', id, order_id, payType, code: 0});
                await saveDB({ method: 'wap', order_id, payType, code: 0 });
                res.send({
                    status: 200,
                    data: payData,
                    message: '调用app支付初始化成功'
                })
            }

            async function saveDB(obj) {
                //let payType = obj.payType;
                //let payType = obj.payType === '1' ? '支付宝' : '微信'
                let
                    save_db = {     //存入数据库数据
                        amount: 1,       //这里都是设置1分钱支付
                        tradeName: '订单支付',  //商户自定义订单标题
                        //payType,    //支付渠道
                        status: '未支付',
                        ...obj
                    }
                let init_pay = new PayModel(save_db);
                await init_pay.save();
            }
        } catch (err) {
            console.log('初始化支付失败', err);
            res.send({
                status: -1,
                message: '初始化支付失败'
            })
        }
    }

    //扫码支付
    async scanPay(res, payData) {
        let formData = new FormData();
        for (let key in payData) {
            formData.append(key, payData[key]);
        }
        let result = await fetch('http://pay.trsoft.xin/order/trpayGetWay', {
            method: 'POST',
            body: formData
        })
        return result = await result.json();
    }

    //生成签名
    sign(payData) {
        let keys = Object.keys(payData);
        keys = keys.sort();
        let string = '';
        for (let i = 0; i < keys.length; i++) {
            string = string + keys[i] + '=' + payData[keys[i]] + '&'
        }
        string = string + "appSceret=" + this.appSceret;
        return md5(string).toUpperCase();
    }

    //支付异步通知
    async payNotice(req, res, next) {
        let noticeData = req.body;
        console.log('noticeData', noticeData)
        try {
            let sign = noticeData.sign;
            delete noticeData.sign;
            let verifySign = this.sign(noticeData)
            console.log('verifySign === sign', verifySign === sign)
            if (verifySign === sign && noticeData.status === '2') {
                let pay = await PayModel.findOne({ id: noticeData.outTradeNo });
                pay.status = '支付成功';
                pay.code = 200;
                let Order = await OrderModel.findOne({ id: pay.order_id });
                Order.status = '支付成功';
                Order.code = 200;
                await pay.save();
                await Order.save();
                res.send(200);
            }
        } catch (err) {
            console.log('支付失败', err);
        }
    }

    //扫码支付实时监听
    async listenStatus(req, res, next) {
        let outTradeNo = req.query.outTradeNo;
        try {
            let pay = await PayModel.findOne({ id: outTradeNo });
            console.log('pay', pay)
            if (pay.code === 200) {
                res.send({
                    status: 200,
                    message: '支付完成'
                })
            } else {
                res.send({
                    status: -1,
                    message: '未支付'
                })
            }
        } catch (err) {
            console.log('监听扫码状态失败', err);
            res.send({
                status: -1,
                message: '监听状态失败'
            })
        }
    }


    // 生成签名
    paysign(appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee) {
        var ret = {
            appid: appid,
            body: body,
            mch_id: mch_id,
            nonce_str: nonce_str,
            notify_url: notify_url,
            openid: openid,
            out_trade_no: out_trade_no,
            spbill_create_ip: spbill_create_ip,
            total_fee: total_fee,
            trade_type: 'JSAPI'
        };
        var str = this.raw(ret);
        var key = '密钥'; //微信商户密钥
        str = str + '&key=' + key;//key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
        var md5Str = crypto.createHash('md5').update(str).digest('hex');
        md5Str = md5Str.toUpperCase();
        return md5Str;
    }
    raw(args) {
        var keys = Object.keys(args);
        keys = keys.sort();
        var newArgs = {};
        keys.forEach(function (key) {
            newArgs[key.toLowerCase()] = args[key];
        });

        var str = '';
        for (var k in newArgs) {
            str += '&' + k + '=' + newArgs[k];
        }
        str = str.substr(1);
        return str;
    }
    paysignjs(appid, nonceStr, package1, signType, timeStamp) {
        var ret = {
            appId: appid,
            nonceStr: nonceStr,
            package: package1,
            signType: signType,
            timeStamp: timeStamp
        };
        var str = this.raw1(ret);
        str = str + '&key='+key;
        return cryptoMO.createHash('md5').update(str).digest('hex');
    }
    
    raw1(args) {
        var keys = Object.keys(args);
        keys = keys.sort()
        var newArgs = {};
        keys.forEach(function(key) {
            newArgs[key] = args[key];
        });
    
        var str = '';
        for(var k in newArgs) {
            str += '&' + k + '=' + newArgs[k];
        }
        str = str.substr(1);
        return str;
    };
    // 随机字符串产生函数
    createNonceStr() {

        return Math.random().toString(36).substr(2, 15);

    };
}

export default new Pay();