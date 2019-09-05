// var express = require('express')
// var router = express.Router()
// var co = require('co')
// var fs = require('fs')
// var config = JSON.parse(fs.readFileSync('config.json', 'utf8'))
// var Authorization = config.Authorization
// var wechatLanguage = config.weChatApplet.wechatLanguage
// var wechatDataService = require('../Data/WechatDataService')
// var dataHelper = require('../Helper/DataHelper')
// var logHelper = require('../Helper/LogHelper')
// var requestHelper = require('../Helper/RequestHelper')
// var tokenHelper = require('../Helper/TokenHelper')
// var WXBizDataCrypt = require('../Helper/WXBizDataCrypt')
// var positionUrl = config.positionUrl
// var appId = config.weChatApplet.appid
// var gmicCompanyName = '北京启烨数码科技有限公司'
// var gmiCompanyCode = 'eVSRYE'
// var gmicPositionId = '5acd854ba3407b256b713a4e'

import {HttpGet} from './request'

const appid="wxa206ec8dabc0e9d0";
const secret="ab5c7a83f1fbe72198ee86dbf9d0650d";

//根据登录唯一凭证Code获取token
export async function getTokenByCode(code){
    try {
        //if (key == Authorization) {
            var url =
                'https://api.weixin.qq.com/sns/jscode2session?appid=' +
                appid +
                '&secret=' +
                secret +
                '&js_code=' +
                code +
                '&grant_type=authorization_code'
            var requestData = await HttpGet(url, null);
            console.info(3333)
            console.info(requestData)
            let {openid,session_key,unionid}=JSON.parse(requestData);//JSON.parse(requestData.body);
            //console.info(JSON.parse(requestData.body));
            if (openid && session_key) {
                let obj={
                    openid: openid,
                    session_key: session_key
                  }
                // var userId = ''
                // var userName = ''
                // var expireTime = Date.parse(new Date('9999-12-31 23:59:59'))
                // //判断数据库是否存在数据
                // var doc = yield wechatDataService.GetCompanyUserByOpenid(
                //     openid
                // )
                // if (doc) {
                //     userId = doc.userId
                //     userName = doc.userName
                // } else {
                //     userId = gmiCompanyCode + dataHelper.Guid()
                //     yield wechatDataService.InsertCompanyUser(
                //         userId,
                //         openid,
                //         userName,
                //         gmicCompanyName,
                //         gmiCompanyCode
                //     )
                //     var url = positionUrl + '/PushRegulators'
                //     var data = {}
                //     data.positionId = gmicPositionId
                //     data.email = ''
                //     data.userId = userId
                //     data.userName = userName
                //     yield requestHelper.HttpPost(url, key, data)
                // }
                // var str =
                //     userId +
                //     ':' +
                //     session_key +
                //     ':' +
                //     userName +
                //     ':' +
                //     wechatLanguage +
                //     ':' +
                //     gmicCompanyName +
                //     ':' +
                //     gmiCompanyCode +
                //     ':' +
                //     expireTime
                // var token = dataHelper.Encryption(str)

                return obj;
            } else{
                return "";
            }
    } catch (err) {
        // yield logHelper.InsertErrorLog(req, err.message)
        // res.send(dataHelper.resultFormat('systemError', null))
        return "";
    }
}

// //根据登录唯一凭证Code获取token
// router.post('/GetTokenByCode', function (req, res) {
//     var key = req.header('Authorization')
//     var code = req.body.code
//     co(function* () {

//     })
// })

// //修改游客的微信信息
// router.post('/UpdateWeChatInfo', function (req, res) {
//     var key = req.header('Authorization')
//     var encryptedData = decodeURIComponent(req.body.encryptedData)
//     var iv = decodeURIComponent(req.body.iv)
//     co(function* () {
//         try {
//             var result = yield tokenHelper.ValidateToken(key)
//             if (result) {
//                 var sessionKey = result.email
//                 var pc = new WXBizDataCrypt(appId, sessionKey)
//                 var weChatInfo = pc.decryptData(encryptedData, iv)
//                 yield wechatDataService.UpdateWeChatInfo(
//                     result.userId,
//                     gmiCompanyCode,
//                     weChatInfo
//                 )
//                 var str =
//                     result.userId +
//                     ':' +
//                     result.email +
//                     ':' +
//                     weChatInfo.nickName +
//                     ':' +
//                     result.languageCode +
//                     ':' +
//                     result.companyName +
//                     ':' +
//                     result.companyCode +
//                     ':' +
//                     result.expireTime
//                 var token = dataHelper.Encryption(str)
//                 var url = positionUrl + '/UpdateRegulators'
//                 yield requestHelper.HttpPost(url, token, {
//                     positionId: gmicPositionId
//                 })
//                 res.send(dataHelper.resultFormat(null, '1'))
//             } else res.send(dataHelper.resultFormat('authenticationFailed', '0'))
//         } catch (err) {
//             yield logHelper.InsertErrorLog(req, err.message)
//             if (err.message == '‌Illegal Buffer')
//                 res.send(dataHelper.resultFormat('tokenInvalid', '0'))
//             else res.send(dataHelper.resultFormat('systemError', '0'))
//         }
//     })
// })

// //修改游客手机号
// router.post('/UpdatePhoneNumber', function (req, res) {
//     var key = req.header('Authorization')
//     var encryptedData = decodeURIComponent(req.body.encryptedData)
//     var iv = decodeURIComponent(req.body.iv)
//     co(function* () {
//         try {
//             var result = yield tokenHelper.ValidateToken(key)
//             if (result) {
//                 var phoneInfo = null
//                 if (encryptedData && iv) {
//                     var sessionKey = result.email
//                     var pc = new WXBizDataCrypt(appId, sessionKey)
//                     phoneInfo = pc.decryptData(encryptedData, iv)
//                 }
//                 yield wechatDataService.UpdatePhoneNumber(result.userId, phoneInfo)
//                 res.send(dataHelper.resultFormat(null, '1'))
//             } else res.send(dataHelper.resultFormat('authenticationFailed', '0'))
//         } catch (err) {
//             yield logHelper.InsertErrorLog(req, err.message)
//             console.log(err.message)
//             if (err.message == '‌Illegal Buffer')
//                 res.send(dataHelper.resultFormat('tokenInvalid', '0'))
//             else res.send(dataHelper.resultFormat('systemError', '0'))
//         }
//     })
// })

// //根据userId获取用户信息
// router.post('/GetUserNameAndBusinessCard', function (req, res) {
//     var key = req.header('Authorization')
//     co(function* () {
//         var result = yield tokenHelper.ValidateToken(key)
//         if (result) {
//             try {
//                 var data = {}
//                 data.wechatUserName = ''
//                 data.phoneNumber = ''
//                 data.businessCard = ''
//                 var doc = yield wechatDataService.GetUserNameAndBusinessCard(
//                     result.userId,
//                     result.companyCode
//                 )
//                 if (doc.length > 0) {
//                     if (doc[0].companys) {
//                         data.wechatUserName = doc[0].companys.wechatUserName
//                         data.businessCard = doc[0].companys.businessCard
//                     }
//                     if (doc[0].phoneInfo) {
//                         data.phoneNumber = doc[0].phoneInfo.phoneNumber
//                     }
//                 }
//                 res.send(dataHelper.resultFormat(null, data))
//             } catch (e) {
//                 yield logHelper.InsertErrorLog(req, e.message)
//                 res.send(dataHelper.resultFormat('systemError', null))
//             }
//         } else res.send(dataHelper.resultFormat('authenticationFailed', null))
//     })
// })

// //修改用户信息
// router.post('/UpdateUserInfo', function (req, res) {
//     var key = req.header('Authorization')
//     var wechatUserName = req.body.wechatUserName
//     var phoneInfo = req.body.phoneInfo
//     var businessCard = req.body.businessCard
//     co(function* () {
//         var result = yield tokenHelper.ValidateToken(key)
//         if (result) {
//             try {
//                 var doc = yield wechatDataService.UpdateUserInfo(
//                     result.userId,
//                     result.companyCode,
//                     wechatUserName,
//                     phoneInfo,
//                     businessCard
//                 )
//                 res.send(dataHelper.resultFormat(null, doc))
//             } catch (e) {
//                 yield logHelper.InsertErrorLog(req, e.message)
//                 res.send(dataHelper.resultFormat('systemError', null))
//             }
//         } else res.send(dataHelper.resultFormat('authenticationFailed', null))
//     })
// })

// module.exports = router