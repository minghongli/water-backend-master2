
import promiseReq from  'request-promise'
export async function HttpGet(url, headers){
    var options = {
        url: url,
        headers: headers
    };
    var req = await promiseReq(options);
    return req;

};

export async function HttpPost(url, key, body) {
    var options = {
        method: 'POST',
        uri: url,
        headers: {"Authorization": key },
        body: body,
        json: true
    }
    var req = await promiseReq(options)
    return req
}

