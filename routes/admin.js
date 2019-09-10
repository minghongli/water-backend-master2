import express from 'express'
import Auth from  '../controller/admin/auth'
import Admin from '../controller/admin/admin'
import User from '../controller/admin/user'
import Company from '../controller/v1/company'
const router = express.Router()
router.post('/login', Admin.adminLogin);     //管理端用戶登录/ user_login  /auth/login

// router.get('/admin_info', Auth.authAdmin, Admin.userInfo);           //获取用户信息
// router.get('/user_info', Auth.authUser, Admin.userInfo);           //获取用户信息
// router.post('/change_avatar', Auth.authUser, Admin.changeAvatar)  //改头像
router.post('/logout', Admin.logout);   //退出

router.get('/getCompanyUser', Company.getCompanyList); //获取公司用户列表

//router.get('/wx_login', User.wxLogin);     //用户登录/ user_login  /auth/user_login
export default router;