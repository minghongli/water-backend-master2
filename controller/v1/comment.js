import BaseClass from '../../prototype/baseClass'
import OrderModel from '../../models/v1/order'
import CommentModel from '../../models/v1/comment'
import GoodModel from '../../models/v1/goods'

class Comment extends BaseClass {
	constructor() {
		super();
		this.makeComment = this.makeComment.bind(this);
	}

	//评论
	async makeComment(req, res, next) {
		let {
			order_id,
			good_id,
			comment_data,
			good_score = 0,
			delivery_score = 0,
			quality_score = 0,
			pic_url = []
		} = req.body;
		if (!order_id || !comment_data) {
			res.send({
				status: -1,
				message: '评论失败，参数有误'
			})
			return;
		}
		try {
// 			let order = await OrderModel.findOne({
// 				id: order_id
// 			}, '-_id').populate([{
// 				path: 'restaurant'
// 			}, {
// 				path: 'user_id'
// 			}]);
			let order = await OrderModel.findOne({
				id: order_id
			}, '-_id').populate([{
				path: 'user_id'
			}]);
			let good = await GoodModel.findOne({
				id: good_id
			}, '-_id').populate([{
				path: 'user_id'
			}])
			//判断订单能否评价
			let user = order.user_id;
			let user_id = req.session.user_id;
			if (user.id !== user_id || order.code !== 200) {//order.code支付状态
				res.send({
					status: -1,
					message: '评价失败，该订单不能评论!'
				})
				return;
			}
			let comment_id = await this.getId('comment_id');
			let data = {
				user_id,
				id: comment_id,
				user_name: user.username,
				avatar: user.avatar,
				good_id: good.id,
				good: good._id,
				comment_data,
				order_id,
				good_score,
				delivery_score,
				pic_url
			}
			let comment = await new CommentModel(data).save();
			/*修改商品评分begin*/
// 			let restaurant = order.restaurant;
// 			let comment_number = restaurant.comment_number;
// 			restaurant.wm_poi_score = ((restaurant.wm_poi_score * comment_number + food_score) / (comment_number + 1)).toFixed(
// 				1);
// 			restaurant.delivery_score = ((restaurant.delivery_score * comment_number + delivery_score) / (comment_number + 1)).toFixed(
// 				1);
// 			restaurant.comment_number++;
// 			await restaurant.save();
			/*修改商品评分end*/
			/* order.has_comment =  !order.has_comment;
			 await order.save();*/
			await OrderModel.update({
				id: order_id
			}, {
				has_comment: true
			})
			res.send({
				status: 200,
				message: '评论成功'
			})
		} catch (err) {
			console.log('评论失败', err);
			res.send({
				status: -1,
				message: '评论失败'
			})
		}
	}

	//获取商品评论
	async getComment(req, res, next) {
		let {
			good_id,
			offset = 0,
			limit = 5
		} = req.query;
		if (!good_id) {
			res.send({
				status: -1,
				message: '获取商品评论失败，参数有误！'
			})
			return;
		}
		try {
			let comments = await CommentModel.find({
				good_id
			}, '-_id').skip(offset * limit).limit(Number(limit)).sort({
				'comment_time': -1
			});
			res.send({
				status: 200,
				message: '获取商品评论成功',
				data: comments
			})
		} catch (err) {
			console.log('获取商品评论失败', err);
			res.send({
				status: -1,
				message: '获取商品评论失败'
			})
		}
	}

	//获取我的评论
	async myComment(req, res, next) {
		try {
			let comments = await CommentModel.find({
				user_id: req.session.user_id
			}).populate({
				path: 'good'
			});
			res.send({
				status: 200,
				data: comments,
				message: '获取我的评论成功'
			})
		} catch (err) {
			console.log('获取我的评论失败', err);
			res.send({
				status: -1,
				message: '获取我的评论失败'
			})
		}
	}

	//回复评论
	async replyComment(req, res, next) {
		let {
			content,
			comment_id
		} = req.body;
		if (!content || !comment_id) {
			res.send({
				status: -1,
				message: '回复评论有误，参数有误!'
			})
			return;
		}
		let comments = await CommentModel.findOne({
			id: comment_id
		});
		comments.add_comment_list.push({
			comment
		});
		await comments.save();
		res.send({
			status: 200,
			message: '回复评论成功'
		})
	}

	//获取商品评论数
	async commentCount(req, res, nexy) {
		let {
			good_id
		} = req.query;
		if (!good_id) {
			res.send({
				status: -1,
				message: '获取评论数量失败，参数有误!'
			})
			return;
		}
		try {
			let good = await GoodModel.findOne({
				id: good_id
			}, '-_id');
			res.send({
				status: 200,
				data: good.comment_number,
				message: '获取评论数量成功'
			})
		} catch (err) {
			console.log('获取评论数量失败', err);
			res.send({
				status: -1,
				message: '获取评论数量失败'
			})
		}
	}

	async deleteComment(req, res, next) {
		let {
			id
		} = req.body;
		if (!id) {
			res.send({
				status: -1,
				message: '删除评论失败，参数有误'
			})
			return
		}
		try {
			let result = await CommentModel.remove({
				id,
				user_id: req.session.user_id
			});
			if (result) {
				res.send({
					status: 200,
					message: '删除成功'
				})
			} else {
				res.send({
					status: -1,
					message: '删除失败'
				})
			}
		} catch (err) {
			console.log('删除评论失败', err);
			res.send({
				status: -1,
				message: '删除评论失败'
			})
		}
	}
}

export default new Comment();
