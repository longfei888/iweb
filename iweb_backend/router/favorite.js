const pool = require('../pool')
const express = require('express')
let router = express.Router()
module.exports = router


/**
 * 
 *1.5	添加收藏
 *接口URL
 *	{{url}}/favorite/add
 *请求方式
 *	POST
 *请求 Content-Type
 *	application/x-www-form-urlencoded
 *请求Body参数
 *	uid	3	必填	-用户id 从session中读取登录的用户编号即可
 *	cid	7	必填	-课程id
 *成功响应示例
 *	{
 *   	"code": 200,
 *   	"msg": "success",
 *		"data": {
 *        	"fid": 2
 *    	}
 *	}
 *失败响应示例
 *	{
 *    	"code": 403,
 *    	"msg": "failed"
 *	}
 */
router.post('/add', (req, res, next)=>{
	let output = {}
	let cid = req.body.cid
	if(!cid){
		output.code = 401
		output.msg = 'cid required'
		res.send(output)
		return
	}
	if(!req.session.user){
		output.code = 402
		output.msg = 'login required'
		res.send(output)
		return
	}
	//验证cid是否存在
	let sql = 'SELECT cid FROM course WHERE cid=?'
	pool.query(sql, cid, (err, result)=>{
		if(err)next(err)
		if(result.length==0){
			output.code = 404
			output.msg = 'course not exists'
			res.send(output)
			return
		}
		//cid存在，添加收藏夹项
		let uid = req.session.user.uid
		let sql = 'INSERT INTO favorite VALUES(NULL, ?, ?, ?)'
		pool.query(sql,[uid, cid, new Date().getTime()], (err, result)=>{
			if(err)next(err)
			output.code = 200
			output.msg = 'success'
			output.data = {
				fid: result.insertId
			}
			res.send(output)
		})
	})
})

/**
 * 1.6	收藏列表
 *接口URL
 *	{{url}}/favorite/list
 *请求方式
 *	GET
 *请求 Content-Type
 *	application/x-www-form-urlencoded
 *请求Body参数
 *	uid	4	必填	-用户id从session中读取登录的用户编号即可
 *成功响应示例
 *{
 *    "code": 200,
 *    "msg": "success",
 *    "data": [
 *        {
 *            "title": "07HTML零基础入门",
 *            "pic": "img-course\/06.png",
 *            "price": 399,
 *            "courseId": 7,
 *            "fid": 2,
 *            "fTime": 1578015036
 *        },
 *        {
 *            "title": "04HTML零基础入门",
 *            "pic": "img-course\/04.png",
 *            "price": 399,
 *            "courseId": 4,
 *            "fid": 1,
 *            "fTime": 1578014981
 *        }
 *    ]
 *}
 *失败响应示例
 *{
 *    "code": 405,
 *    "msg": "no favorite"
 *}
 */
router.get('/list', (req, res, next)=>{
	let output = {}
	//验证用户是否已经登录
	if(!req.session.user){
		output.code = 401
		output.msg = 'login required'
		res.send(output)
		return
	}
	//根据用户编号查询其收藏夹内容
	let sql = 'SELECT title,pic,price,courseId,fid,fTime FROM favorite AS f,course AS c WHERE f.courseId=c.cid AND f.userId=? ORDER BY f.fTime DESC'
	pool.query(sql, req.session.user.uid, (err, result)=>{
		if(err)next(err)
		if(result.length==0){
			output.code = 405
			output.msg = 'no favorite'
		}else {
			output.code = 200
			output.msg = 'success'
			output.data = result
		}
		res.send(output)
	})
})
