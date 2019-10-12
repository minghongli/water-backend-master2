import CompanyModel from '../../models/v1/company'
import BrandModel from '../../models/v1/brand'
import BaseClass from "../../prototype/baseClass";
class Company extends BaseClass {
	constructor() {
		super();
		//this.addBrand = this.addBrand.bind(this);
		this.addCompany = this.addCompany.bind(this);
		this.getCompanyList = this.getCompanyList.bind(this);
	}

	//添加公司用户
	async addCompany(req, res, next) {
		// let key = req.headers.authorization;
		// //console.info(key);
		// var result = await ValidateToken(key);
		// if(!result){
		//     res.send({
		//         status: '-1',
		//         message: 'token有误'
		//     })
		//     return; 
		// }
		let {
			companyName, userName, sex, phone,
			address,
			invoice,
			demandOfMonth, singleNumber, brand
		} = req.body;
		console.info(req.body);
		if (!companyName) {
			res.send({
				status: -1,
				message: '添加公司用户失败，参数有误!!'
			})
			return;
		}
		try {
			console.info(111);
			let company_data = {
				//user_id: result.openid,
				companyName, userName, sex: "保密", phone, address,
				invoice, demandOfMonth, singleNumber, brand,
				update_time: "",
				status: 0,//状态 0未联系 1已联系
				remark: "",//备注
			}
			console.info(222);
			console.info(company_data);
			let addCompany = new CompanyModel(company_data, false);
			console.log(2222);
			console.info(addCompany)
			await addCompany.save();
			console.log(333);
			res.send({
				status: 200,
				message: '添加公司用户成功',
				// food_id
			})

		} catch (err) {
			res.send({
				status: -1,
				message: '添加公司用户失败，参数有误!'
			})
		}
	}

	//获取公司用户列表
	async getCompanyList(req, res, next) {
		let companys = [];
		try {
			companys = await CompanyModel.find({})
			res.send({
				status: 200,
				message: '获取公司用户列表成功',
				result: companys
			})
		} catch (err) {
			console.log('获取公司用户列表失败', err);
			res.send({
				status: -1,
				message: '获取公司用户列表失败'
			})
		}
	}
	async getCompanyDetail(req, res, next) {
		let id = req.query.id;
		console.info(id);
		//let id=req.params.good_id;
		if (!id) {
			res.send({
				status: -1,
				message: '获取公司用户详情失败，参数有误!'
			})
			return;
		}
		let company = {};
		try {
			company = await CompanyModel.find({ _id: id });//.limit(Number(limit)).skip(Number(offset));
			res.send({
				code: 0,
				message: '获取公司用户详情成功',
				data: company[0]
			})
		} catch (err) {
			console.log('获取公司用户详情失败', err);
			res.send({
				status: -1,
				message: '获取公司用户详情失败'
			})
		}
	}
}
export default new Company();