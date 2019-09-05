import express from 'express'
const router = express.Router();
import Auth from  '../controller/admin/auth'
import User from '../controller/admin/user'
import Company from '../controller/v1/company'

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });
router.get('/login', User.wxLogin);     //用户登录/ user_login  /auth/user_login
router.post('/addCompanyUser', Company.addCompany);
router.get('/getCompanyUser', Company.getCompanyList);
module.exports = router;

// import express from 'express'
// import Auth from  '../controller/admin/auth'
// import Admin from '../controller/admin/admin'

// const router = express.Router()
// router.post('/login', Admin.adminLogin);     //管理端用戶登录/ user_login  /auth/login
// router.get('/admin_info', Auth.authAdmin, Admin.userInfo);           //获取用户信息
