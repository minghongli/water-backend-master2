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
		let {
			companyName, userName, sex, phone,
			address,
			invoice,
			demandOfMonth,singleNumber,brand
		} = req.body;
		if (!companyName) {
			res.send({
				status: -1,
				message: '添加公司用户失败，参数有误!'
			})
			return;
		}
		try {
			let company_data = {
				companyName, userName, sex, phone,address,invoice,demandOfMonth,singleNumber,brand
			}
			let addCompany = new CompanyModel(company_data,false);
			console.log(2222);
			console.info(addGoods)
			await addCompany.save();
			console.log(333);
			res.send({
				status: 200,
				message: '添加公司用户成功',
				// food_id
			})

		} catch (err) {

		}
	}

	//获取公司用户列表
	async getCompanyList(req, res, next) {
		let companys=[];
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

}
export default new Company();