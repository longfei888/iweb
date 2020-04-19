const pool = require('../pool')
const express = require('express')
let router = express.Router()
module.exports = router

/**
 * 3.1	添加购物车
 *接口URL
 *	{{url}}/cart/add
 *请求方式
 *	POST
 *请求 Content-Type
 *	application/x-www-form-urlencoded
 *请求Body参数
 *	uid	2	必需	-用户id 从当前会话中获取
 *	cid	10	必填	-课程id
 *	count	1	非必填	购买数量(默认为1)
 *成功响应示例
 *	{
 *    "code": 200,
 *    "msg": "success"
 *	}
 */
router.post('/add', (req, res, next)=>{
	let output = {}
	//验证客户端提交的数据是否完整
	let cid = req.body.cid
	if(!cid){
		output.code = 401
		output.msg = 'cid required'
		res.send(output)
		return
	}
	let count = req.body.count
	if(!count){
		count = 1
	}else {
		count = parseInt(count)
	}
	let uid = req.session.user.uid	//当前路由之前已经使用loginCheck中间件确保用户登录过了

	//此处省略了“验证指定课程编号是否存在”
	//如果当前购买过该课程，则购买数量+count；否则执行添加操作
	let sql = 'UPDATE cart SET count=count+? WHERE userId=? AND courseId=?'
	pool.query(sql, [count, uid, cid], (err, result)=>{
		if(err)next(err)
		if(result.affectedRows>0){	//当前用户之前购买过该课程
			output.code = 201
			output.msg = 'buy count updated'
			res.send(output)
			return
		}
		//当前用户从未购买过该课程，则执行插入操作
		let sql = 'INSERT INTO cart VALUES(NULL, ?,?,?)'
		pool.query(sql, [uid, cid, count], (err, result)=>{
			if(err)next(err)
			output.code = 200
			output.msg = 'success'
			res.send(output)
		})
	})
})


/**
 * 3.2	查询购物车
 *接口URL
 *	{{url}}/cart/list
 *请求方式
 *	GET
 *请求参数
 *	uid	2	必需	-用户id，从会话中获取用户编号
 *成功响应示例
 *	{
 *    "code": 200,
 *    "msg": "success",
 *    "data": [
 *        {
 *            "ctid": 1,
 *            "courseid": 10,
 *            "count": 1,
 *            "title": "10HTML零基础入门",
 *            "pic": "img-course\/03.png",
 *            "price": 399
 *        }
 *    ]
 *	}
 */
router.get('/list', (req, res, next)=>{
	let uid = req.session.user.uid
	//跨表查询购物车数据及对应的课程基本信息 —— 此处省略了分页查询
	let sql = 'SELECT ctid,courseId,count,title,pic,price FROM cart AS ct, course AS cs WHERE cs.cid=ct.courseId AND userId=? ORDER by ct.ctid DESC'
	pool.query(sql, uid, (err, result)=>{
		if(err)next(err)
		let output = {
			code: 200,
			msg: 'success',
			data: result
		}
		res.send(output)
	})
})


/**
 * 3.3	更新购物车
 *接口URL
 *	{{url}}/cart/update
 *请求方式
 *	POST
 *请求 Content-Type
 *	application/x-www-form-urlencoded
 *请求Body参数
 *	ctid	3	必填	-购物车中的课程id
 *	count	1	必填	-购买数量
 *成功响应示例
 *	{
 *    "code": 200,
 *    "msg": "success"
 *	}
 *失败响应示例
 *	{
 *    "code": 410,
 *    "msg": "failed"
 *	}
 */
router.post('/update', (req, res, next)=>{
	let output = null
	let ctid = req.body.ctid
	if(!ctid){
		output = {
			code: 401,
			msg: 'ctid required'
		}
	}
	let count = req.body.count
	if(!count){
		output = {
			code: 402,
			msg: 'count required'
		}
	}
	if(output){
		res.send(output)
		return
	}
	let uid = req.session.user.uid
	
	//修改当前登录用户所具有的指定购物车条目
	let sql = 'UPDATE cart SET count=? WHERE ctid=? AND userId=?'
	pool.query(sql, [count, ctid, uid], (err, result)=>{
		if(err)next(err)
		if(result.affectedRows===0){		//SQL影响的行数为0，即ctid或者uid不存在
			output = {
				code: 400,
				msg: 'ctid or uid error'
			}
		}else if(result.changedRows===0){	//SQL影响了行，但改变的行数为0，即count与之前的值相同
			output = {
				code: 201,
				msg: 'count not changed'
			}
		}else {
			output = {
				code: 200,
				msg: 'success'
			}
		} 
		res.send(output)
	})
})


/**
 * 3.4	清空购物车
 *接口URL
 *	{{url}}/cart/empty
 *请求方式
 *	POST
 *请求参数
 *	uid	2	必填	-用户id，从会话中读取
 *成功响应示例
 *	{
 *    "code": 200,
 *    "msg": "success"
 *	}
 *失败响应示例
 *	{
 *    "code":411,
 *    "msg":'uid required'
 *	}
 */
router.post('/empty', (req, res, next)=>{
	let uid = req.session.user.uid
	let sql = 'DELETE FROM cart WHERE userId=?'
	pool.query(sql, uid, (err, result)=>{
		if(err)next(err)
		let output = null
		if(result.affectedRows===0){
			output = {
				code: 411,
				msg: 'user has no cart items'
			}
		}else{
			output = {
				code: 200,
				msg: 'success'
			}
		}
		res.send(output)
	})
})


/**
 * 3.5	删除购物车商品
 *接口URL
 *	{{url}}/cart/delete
 *请求方式
 *	POST
 *请求 Content-Type
 *	application/x-www-form-urlencoded
 *请求Body参数
 *	ctid	4	必填	-购物车中的课程id
 *	uid	2	必需	用户id，从会话中获取
 *成功响应示例
 *	{
 *    "code": 200,
 *    "msg": "success"
 *	}
 *失败响应示例
 *	{
 *    "code": 412,
 *    "msg": "failed"
 *	}
 */
router.post('/delete', (req, res, next)=>{
	let output = null
	let ctid = req.body.ctid
	if(!ctid){
		output = {
			code: 400,
			msg: 'ctid required'
		}
		res.send(output)
		return
	}
	let uid = req.session.user.uid
	
	let sql = 'DELETE FROM cart WHERE ctid=? AND userId=?'
	pool.query(sql, [ctid, uid], (err, result)=>{
		if(err)next(err)
		if(result.affectedRows===0){
			output = {
				code: 412, 
				msg: 'ctid or uid error'
			}
		}else {
			output = {
				code: 200,
				msg: 'success'
			}
		}
		res.send(output)
	})
});
//功能七:删除选中购物车
router.post('/delm', (req, res, next)=>{
	let output = null
	let ctid = req.body.ctid
	if(!ctid){
		output = {
			code: 400,
			msg: 'ctid required'
		}
		res.send(output)
		return
	}
	let sql = `DELETE FROM cart WHERE ctid IN (${ctid})`
	pool.query(sql,(err, result)=>{
		if(err)next(err)
		if(result.affectedRows>0){
			output = {
					code: 200,
				msg: 'success'
			}
		}else {
			output = {
				code: 412, 
				msg: 'ctid or uid error'
			}
		}
		res.send(output)
	})
});