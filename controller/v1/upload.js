var upload = require('jquery-file-upload-middleware');

// upload.configure({
//     uploadDir: __dirname + '/uploads',
//     uploadUrl: '/v1/uploadImg',
//     imageVersions: {
//         thumbnail: {
//             width: 80,
//             height: 80
//         }
//     }
// });
class Upload {
    constructor() {

    }

    //上传图片
    async uploadImg(req, res, next) {
        upload.fileHandler({
            uploadDir: function () {
                return './uploads/'  //__dirname + 
            },
            uploadUrl: function () {
                return '/uploads'
            }
        })(req, res, next);

        upload.on('begin', function (fileInfo, req, res) {
            console.log('begin11');
            // res.send({
            //     status: -1,
            //     message: '获取获取上传图片失败，参数有误!'
            // })
            // fileInfo structure is the same as returned to browser
            // { 
            //     name: '3 (3).jpg',
            //     originalName: '3.jpg',
            //     size: 79262,
            //     type: 'image/jpeg',
            //     delete_type: 'DELETE',
            //     delete_url: 'http://yourhost/upload/3%20(3).jpg',
            //     url: 'http://yourhost/uploads/3%20(3).jpg',
            //     thumbnail_url: 'http://youhost/uploads/thumbnail/3%20(3).jpg' 
            // }
        });
        upload.on('abort', function (fileInfo, req, res) {
            console.log('abort'); 
            //中止
        });
        upload.on('end', function (fileInfo, req, res) {
            console.log('end')
            res.send({
                status: -1,
                message: '获取获取上传图片失败，参数有误!'
            })
        });
        upload.on('delete', function (fileInfo, req, res) {
            res.send({
                status: -2,
                message: '获取获取上传图片失败，参数有误!'
            })
        });
        upload.on('error', function (e, req, res) {
            res.send({
                status: -3,
                message: '获取获取上传图片失败，参数有误!'
            })
        });
        console.log(123211);
        //console.info(req);
        // res.send({
        //     status: -1,
        //     message: '获取获取上传图片失败，参数有误!'
        // })
        //let id = req.query.id;
        // let id = req.params.good_id;
        // if (!id) {
        //     res.send({
        //         status: -1,
        //         message: '获取获取上传图片失败，参数有误!'
        //     })
        //     return;
        // }
        // let goods={};
        // try {
        // 	goods = await GoodModel.find({_id: id});//.limit(Number(limit)).skip(Number(offset));
        // 	res.send({
        // 		status: 200,
        // 		message: '获取商品详情成功',
        // 		result: goods[0]
        // 	})
        // } catch (err) {
        // 	console.log('获取商品详情失败', err);
        // 	res.send({
        // 		status: -1,
        // 		message: '获取商品详情失败'
        // 	})
        // }
    }
}
export default new Upload();