module.exports = {
    appid: 'wxa206ec8dabc0e9d0',// 小程序ID  
    secret: 'ab5c7a83f1fbe72198ee86dbf9d0650d',// 小程序Secret
    mch_id: "**********", // 商户号
    mch_key: "********************", // 商户key

   //'密钥'; //微信商户密钥//key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
    // 生成商户订单号
    getWxPayOrdrID: function () {
        var myDate = new Date();
        var year = myDate.getFullYear();
        var mouth = myDate.getMonth() + 1;
        var day = myDate.getDate();
        var hour = myDate.getHours();
        var minute = myDate.getMinutes();
        var second = myDate.getSeconds();
        var msecond = myDate.getMilliseconds(); //获取当前毫秒数(0-999)
        if (mouth < 10) { /*月份小于10  就在前面加个0*/
            mouth = String(String(0) + String(mouth));
        }
        if (day < 10) { /*日期小于10  就在前面加个0*/
            day = String(String(0) + String(day));
        }
        if (hour < 10) { /*时小于10  就在前面加个0*/
            hour = String(String(0) + String(hour));
        }
        if (minute < 10) { /*分小于10  就在前面加个0*/
            minute = String(String(0) + String(minute));
        }
        if (second < 10) { /*秒小于10  就在前面加个0*/
            second = String(String(0) + String(second));
        }
        if (msecond < 10) {
            msecond = String(String('00') + String(second));
        } else if (msecond >= 10 && msecond < 100) {
            msecond = String(String(0) + String(second));
        }

        var currentDate = String(year) + String(mouth) + String(day) + String(hour) + String(minute) + String(second) + String(msecond);
        return currentDate;
    }
}