var dataHelper = require('./DataHelper')
export function ValidateToken(key){
    // exports.ValidateToken = async (key) => {
    try {
        var keys = dataHelper.Decryption(key).split(':');
        console.info(keys);
        if (keys.length == 2) {
            var result = {};
            result.openid = keys[0];
            result.session_key = keys[1];
            // result.userName = keys[2];
            // result.languageCode = keys[3];
            // result.companyName = keys[4];
            // result.companyCode = keys[5];
            // result.expireTime = keys[6];
            return result;
        } else
            return null;
    } catch (e) {
        return null;
    }
}
