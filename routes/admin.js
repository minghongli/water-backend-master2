import express from 'express'
import Auth from  '../controller/admin/auth'
import Admin from '../controller/admin/admin'
import User from '../controller/admin/user'

const router = express.Router()
router.post('/login', Admin.adminLogin);     //管理端用戶登录/ user_login  /auth/login
router.get('/admin_info', Auth.authAdmin, Admin.userInfo);           //获取用户信息

router.post('/user_login', Admin.userLogin);     //用户登录/ user_login  /auth/user_login
router.get('/user_info', Auth.authUser, Admin.userInfo);           //获取用户信息
router.post('/change_avatar', Auth.authUser, Admin.changeAvatar)  //改头像
router.post('/logout', Admin.logout);   //退出
router.post('/address', Auth.authUser, Admin.addAddress);      //添加收货地址
router.get('/all_address', Auth.authUser, Admin.getAllAddress)        //获取用户所有地址
router.get('/address', Auth.authAdmin, Admin.getAddress);             //管理端获取所有地址
router.post('/update_address', Auth.authUser, Admin.updateAddress);   //更新地址
router.delete('/address', Auth.authUser, Admin.deleteAddress);      //删除收获地址
router.get('/user_statistic', Auth.authAdmin, Admin.userStatistic);      //用户信息

router.get('/wx_login', User.wxLogin);     //用户登录/ user_login  /auth/user_login
export default router;