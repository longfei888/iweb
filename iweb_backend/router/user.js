const pool = require('../pool')
const express = require('express')
let router = express.Router()
module.exports = router

/*
1.1	用户注册
接口URL
	{{url}}/user/register
请求方式
	POST
请求 Content-Type
	application/x-www-form-urlencoded
请求Body参数
	uname	zhangsan	必填	-用户名
	upwd	123456	必填	-密码
	upwd2	123456	必填	-确认密码
	phone	13333333333	必填	-手机号
	captcha	vHw90	必填 -验证码
成功响应示例
{
    "code": 200,
    "msg": "register success",
    "data": {
        "uid": 7,
        "uname": "zhangsan"
    }
}
*/
//中间件：验证客户端是否提交了验证码
router.use('/register', (req, res, next)=>{
	let output = {}
	let captcha = req.body.captcha
	if(!captcha){  //客户端未提交验证码
		output.code = 409
		output.msg = 'captcha required'
		res.send(output)
		return
	}
	if(captcha.toLowerCase() !== req.session.registerCaptcha){	//客户端提交的验证码有误
		output.code = 410
		output.msg = 'captcha error'
		res.send(output)
		return
	}
	delete req.session.registerCaptcha	//验证通过，销毁会话中此次使用过的验证码
	next()		//中间件放行，执行后续的路由处理
})
router.post('/register', (req, res, next)=>{
	let output = {}			//要输出给客户端的数据
	//读取请求主体数据,对请求数据进行验证——格式验证
	let uname = req.body.uname
	if(!uname){
		output.code = 401
		output.msg = "uname required"
		res.send(output)
		return 
	}
	let upwd = req.body.upwd
	if(!upwd){
		output.code = 402
		output.msg = "upwd required"
		res.send(output)
		return
	}
	let upwd2 = req.body.upwd2
	if(upwd!==upwd2){
		output.code = 403
		output.msg = "upwd2 not the same with upwd"
		res.send(output)
		return
	}
	let phone = req.body.phone
	if(!phone){
		output.code = 404
		output.msg = "phone required"
		res.send(output)
		return
	}
	//执行数据库验证操作
	let sql = 'SELECT uid FROM user WHERE uname=? OR phone=?'
	pool.query(sql, [uname, phone], (err,result)=>{
		if(err)next(err)
		if(result.length>0){  	//查询到同名或者同电话的用户
			output.code = 405
			output.msg = 'uname or phone already taken'
			res.send(output)
		}else {					//未查询到同名或同电话的用户
			//执行数据库插入操作 —— 等待验证完用户名不存在，再执行插入操作
			let sql = 'INSERT INTO user(uname,upwd,phone) VALUES(?,?,?)'
			pool.query(sql, [uname, upwd, phone], (err, result)=>{
				if(err)next(err)	//企业上线项目中，此处不允许throw err！！只能把错误交给后续的Express错误处理中间件处理
				output.code = 200
				output.msg = 'register success'
				output.data = {
					uid: result.insertId,	//获取数据库产生的自增用户编号
					uname: uname
				}
				res.send(output)
			})
		}
	})
	// //执行数据库插入操作 —— 不能将用户名是否存在验证与新用户的插入操作 异步执行
	// let sql = 'INSERT INTO user(uname,upwd,phone) VALUES(?,?,?)'
	// pool.query(sql, [uname, upwd, phone], (err, result)=>{
	// 	if(err)next(err)	//企业上线项目中，此处不允许throw err！！只能把错误交给后续的Express错误处理中间件处理
	// 	console.log(result)
	// 	output.code = 200
	// 	output.msg = 'register success'
	// 	output.data = {
	// 		uid: result.insertId,	//获取数据库产生的自增用户编号
	// 		uname: uname
	// 	}
	// 	res.send(output)
	// })
})


/*
1.2	用户登录
接口URL	
	{{url}}/user/login
请求方式
	POST
请求 Content-Type
	application/x-www-form-urlencoded
请求Body参数
	uname	lisi	必填	-用户名
	upwd	abc123	必填	-密码
成功响应示例
{
    "code": 200,
    "msg": "login success",
    "data": {
        "uid": 5,
        "uname": "lisi",
        "phone": "13888888888",
        "upwd": "abc123",
        "nickname": "",
        "sex": "",
        "age": "",
        "edu": "",
        "job": ""
    }
}
*/
router.post('/login', (req, res, next)=>{
	let output = {}
	//读取并验证请求数据
	let uname = req.body.uname
	if(!uname){
		output.code = 401
		output.msg = 'uname required'
		res.send(output)
		return 
	}
	let upwd = req.body.upwd
	if(!upwd){
		output.upwd = 402
		output.msg = 'upwd required'
		res.send(output)
		return 
	}
	//执行数据库查询操作
	let sql = 'SELECT * FROM user WHERE uname=? AND upwd=?'
	pool.query(sql, [uname, upwd], (err, result)=>{
		if(err)next(err)
		//如果用户没有查找到
		if(result.length===0){
			output.code = 403
			output.msg = 'uname or upwd error'
			res.send(output)
			return 
		}
		//用户已经被查找到
		output.code = 200
		output.msg = 'login success'
		output.data = result[0] //查询结果集中第0个结果就是该用户的信息
		res.send(output)
		//在当前客户端对应的session中存储会话数据
		req.session.user = result[0]
		req.session.save()  //在服务器端保存会话数据(与安全密切相关的数据)——用户的登录信息
	})
})


/**
 * 1.3	检测用户名是否存在
 *接口URL
 *	{{url}}/user/check_uname
 *请求方式
 *	GET
 *请求 Content-Type
 *	application/x-www-form-urlencoded
 *请求Body参数
 *	uname	zhangsan	必填	-用户名
 * 成功响应示例
 *	{
 *		"code": 200,
 * 	  	"msg": "exist"
 *	}
 *失败响应示例
 *	{
 *   	"code": 401,
 *   	"msg": "not exist"
 * 	}
 */
router.get('/check_uname', (req, res, next)=>{
	//读取请求数据并验证
	let output = {}
	// let uname = req.body.uname
	let uname = req.query.uname	//GET请求把请求数据追加在URL后面的“查询字符串”中
	if(!uname){
		output.code = 401
		output.msg = 'uname required'
		res.send(output)
		return
	}
	//执行数据库查询操作
	let sql = 'SELECT uid FROM user WHERE uname=?'
	pool.query(sql, [uname], (err, result)=>{
		if(err)next(err)
		if(result.length===0){  //根据用户名没有查询到用户信息
			output.code = 401
			output.msg = 'not exists'
		}else {					//根据用户名查询到了用户信息
			output.code = 200
			output.msg = 'exists'
		}
		res.send(output)
	})
})


/**
 * 1.4	检测手机号是否存在
 *接口URL
 *{{url}}/user/check_phone
 *请求方式
 *	GET 
 *请求 Content-Type
 *	application/x-www-form-urlencoded
 *请求Body参数
 *	phone	13333333333	必填	-手机号
 *成功响应示例
 *	{
 *   	"code": 200,
 *    	"msg": "exist"
 *	}
 *失败响应示例
 *	{
 *   	"code": 402,
 *    	"msg": "not exist"
 *	}
 */
router.get('/check_phone', (req, res, next)=>{
	//读取请求数据并验证
	let output = {}
	let phone = req.query.phone	//GET请求把请求数据追加在URL后面的“查询字符串”中
	if(!phone){
		output.code = 401
		output.msg = 'phone required'
		res.send(output)
		return
	}
	//执行数据库查询操作
	let sql = 'SELECT uid FROM user WHERE phone=?'
	pool.query(sql, [phone], (err, result)=>{
		if(err)next(err)
		if(result.length===0){  //根据用户名没有查询到用户信息
			output.code = 402
			output.msg = 'not exists'
		}else {					//根据用户名查询到了用户信息
			output.code = 200
			output.msg = 'exists'
		}
		res.send(output)
	})
})


