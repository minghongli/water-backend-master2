import express from 'express'
const router = express.Router();
import Auth from  '../controller/admin/auth'
import User from '../controller/admin/user'
import Company from '../controller/v1/company'

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });
router.get('/wx_login', User.wxLogin);     //用户登录/ user_login  /auth/user_login  code=023DSaMk05A0Xr1x4kJk0DhgMk0DSaMW
router.post('/addCompanyUser', Company.addCompany);
router.get('/getCompanyUser', Company.getCompanyList);
router.post('/addAddress', User.addAddress);      //添加收货地址
router.get('/getAllAddress', User.getAllAddress)        //获取用户所有地址
router.post('/update_address', User.updateAddress);   //更新地址
router.delete('/delAddress', User.deleteAddress);      //删除收获地址
module.exports = router;


//router.get('/wx_login', User.wxLogin);     //用户登录/ user_login  /auth/user_login

// import express from 'express'
// import Auth from  '../controller/admin/auth'
// import Admin from '../controller/admin/admin'

// const router = express.Router()
// router.post('/login', Admin.adminLogin);     //管理端用戶登录/ user_login  /auth/login
// router.get('/admin_info', Auth.authAdmin, Admin.userInfo);           //获取用户信息
