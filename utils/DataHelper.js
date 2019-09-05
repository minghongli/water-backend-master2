/**
 * Created by Fan on 2016/6/27.
 */
var cr = require('crypto');


// //加密
// exports.Encryption = function (password) {
//     var md5sum = cr.createHmac('sha1',passKey);
//     //将字符串相加
//     md5sum.update(password);
//     //将字符串加密返回
//     var str = md5sum.digest('hex');
//     return str;
// }

//加密
exports.Encryption = function (str) {
    var cipher = cr.createCipher('blowfish', 'minghong');
    var enc = cipher.update(str, "utf8", "hex");
    enc += cipher.final('hex');
    return enc;
}

//解密
exports.Decryption = function (str) {
    try {
        var decipher = cr.createDecipher('blowfish', 'minghong');
        var decrypted = decipher.update(str, "hex", "utf8");
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        return "";
    }
}