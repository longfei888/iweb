const pool = require('../pool')
const express = require('express')
let router = express.Router()
module.exports = router

/**
 * 2.2	获取课程列表
	接口URL
		{{url}}/course/list?pageNum=1&typeId=3&pageSize=5
	请求方式
		GET
	请求Query参数
		pageNum		1		可选	-当前页码，默认值为1
		typeId		3		可选	-课程分类id，如果客户端未提交，则查询所有类别
		pageSize  	3		可选 -分页查询的页面大小——一页中数据的最大数量
	成功响应示例
	{
		"code": 200,
		"msg": "success",
		"data": [
			{
				"cid": 12,
				"title": "12HTML零基础入门",
				"teacherId": 4,
				"cLength": "1天",
				"startTime": "每周一开课",
				"address": "i前端各校区 ",
				"pic": "img-course\/01.png",
				"price": 399,
				"tid": 4,
				"tname": "纪盈鑫"
			}
		],
		"pageNum": "1",
		"pageSize": 3,
		"pageCount": 2,
		"totalCount": 4
	}
 */
router.get('/list', (req, res, next)=>{
	let output = {
		pageNum: 1,		//要查询的页号
		pageSize: 3,	//页面大小
		pageCount: 1,	//符合条件的记录总页数
		totalCount: 1,	//符合条件的记录总行数
		data: []		//当前页号中的记录
	}
	//读取客户端提交请求参数，未提交的则设置默认值
	let pageNum = req.query.pageNum		//要查询的页号
	if(!pageNum){
		pageNum = 1
	}else {
		pageNum = parseInt(pageNum)  	//把查询字符串中的“字符串数据”解析为整数
	}
	output.pageNum = pageNum
	
	let pageSize = req.query.pageSize	//要查询的页面大小——一页最多显示的记录条数
	if(!pageSize){
		pageSize = 3
	}else {
		pageSize = parseInt(pageSize)
	}
	output.pageSize = pageSize
	
	let typeId = req.query.typeId
	//select * from course where 其它条件 and typeId=?
	let where = ''		//SQL语句中的WHERE子句中的条件
	let params = []		//查询参数 —— ?占位符对应的值
	if(typeId){
		where = ' AND typeId=?'
		params.push(typeId)
	}
	//查询数据库中符合条件的记录总条数，并计算出总页数
	//'SELECT COUNT(*) FROM course WHERE  1'
	//'SELECT COUNT(*) FROM course WHERE  1  AND typeId=?'
	let sql = 'SELECT COUNT(*) AS c FROM course WHERE  1' + where
	pool.query(sql, params, (err, result)=>{
		if(err)next(err)
		output.totalCount = result[0].c		//查询到符号条件的总记录数
		output.pageCount = Math.ceil(output.totalCount/output.pageSize)  //总页数
		//查询数据库中符合条件的记录内容——分页查询 & 跨表查询 —— 整个项目的最难点：多条件(可能是单选或多选)筛选查询
		let start = (output.pageNum-1)*output.pageSize  //从结果集中的哪一条记录开始查询
		let count = output.pageSize	//分页查询一次最多查询的记录数
		params.push(start)
		params.push(count)
		let sql = 'SELECT cid,title,teacherId,cLength,startTime,address,pic,price,tid,tname FROM course AS c, teacher AS t  WHERE t.tid=c.teacherId '+ where + ' ORDER BY c.cid DESC LIMIT ?,?'
		pool.query(sql, params, (err, result)=>{
			if(err)next(err)
			output.data = result
			res.send(output)
		})
	})	
})


/**
 * 2.3	获取课程详情
 *接口URL
 *{{url}}/course/detail?cid=1
 *请求方式
 *GET
 *请求Query参数
 *参数	示例值	必填	参数描述
 *cid	1	必填	-课程id
 *成功响应示例
 *{
 *    "code": 200,
 *    "msg": "success",
 *    "data": {
 *        "cid": 1,
 *        "typeId": 1,
 *        "title": "01HTML零基础入门",
 *        "teacherId": 1,
 *        "cLength": "1天",
 *        "startTime": "每周一开课",
 *        "address": "i前端各校区 ",
 *        "pic": "img-course\/01.png",
 *        "price": 399,
 *        "details": "<p>本课程详细讲解了HTML5的各个方面，课程从环境搭建开始，依次讲述了HTML5新元素、Canvas、SVG、Audio、GPS定位、拖拽效果、WEB存储、App Cache、HTML5 多线程和HTML5消息推送等内容。本课程详细讲解了HTML5的各个方面，课程从环境搭建开始，依次讲述了HTML5新元素、Canvas、SVG、Audio、GPS定位、拖拽效果、WEB存储、App Cache、HTML5 多线程和HTML5消息推送等内容。<\/p><p>本课程详细讲解了HTML5的各个方面，课程从环境搭建开始，依次讲述了HTML5新元素、Canvas、SVG、Audio、GPS定位、拖拽效果、WEB存储、App Cache、HTML5 多线程和HTML5消息推送等内容。本课程详细讲解了HTML5的各个方面，课程从环境搭建开始，依次讲述了HTML5新元素、Canvas、SVG、Audio、GPS定位、拖拽效果、WEB存储、App Cache、HTML5 多线程和HTML5消息推送等内容。<\/p><p>本课程详细讲解了HTML5的各个方面，课程从环境搭建开始，依次讲述了HTML5新元素、Canvas、SVG、Audio、GPS定位、拖拽效果、WEB存储、App Cache、HTML5 多线程和HTML5消息推送等内容。<\/p>",
 *        "tid": 1,
 *        "tname": "成亮",
 *        "maincourse": "Web开发讲师",
 *        "tpic": "img-teacher\/zx.jpg",
 *        "experience": "达内集团web讲师， 主讲 HTML5、Jquery、 Ajax 等课程。先后在一汽启明、日本インタセクト等公司担任系统开发工程师，从事软件开发和设计工作，迄今已积累5年以上的开发及教学经验，兼具技术和教学两方面的培训能力。",
 *        "style": "教学思路严谨，课堂气氛活跃。讲解时善于运用生活当中的例子，使学员能够快速理解。着重培养学员的动手能力，奉行实践是检验真理的唯一标准，教学能力受到学员们的一致好评。"
 *    }
 *}
 */
router.get('/detail', (req, res, next)=>{
	let output = {}
	let cid = req.query.cid
	if(!cid){
		output.code = 401
		output.msg = 'cid required'
		res.send(output)
		return 
	}
	//查询课程及对应讲师的详细信息——跨表查询
	let sql = 'SELECT cid,typeId,title,teacherId,cLength,startTime,address,pic,price,details,tid,tname,maincourse,tpic,experience,style FROM course AS c,teacher AS t WHERE t.tid=c.teacherId AND cid=?'
	pool.query(sql, cid, (err, result)=>{
		if(err)next(err)
		output.code = 200
		output.msg = 'success'
		output.data = result[0]
		res.send(output)
	})
})


/**
 * 2.4	获取最新课程
 *接口URL
 *{{url}}/course/newest?count=4
 *请求方式
 *GET
 *请求Query参数
 *参数	示例值	必填	参数描述
 *count	4	必填	-返回结果数量
 *成功响应示例
 *{
 *	"code": 200,
 *	"msg": "success",
 *	"data": [
 *		{
 *			"cid": 12,
 *			"title": "12HTML零基础入门",
 *			"pic": "img-course/01.png",
 *			"price": 399,
 * 			"tid": 5,
 *			"tname": "纪盈鑫"
 *		}
 *		...
 *	]
 *}
 */
router.get('/newest', (req, res, next)=>{
	let count = req.query.count
	if(count){
		count = parseInt(count)
	}else {
		count = 4
	}
	let sql = 'SELECT cid,pic,title,price,tid,tname FROM course AS c, teacher AS t WHERE t.tid=c.teacherId ORDER BY cid DESC LIMIT ?'
	pool.query(sql, count, (err, result)=>{
		if(err)next(err)
		let output = {}
		output.code = 200
		output.msg = 'success'
		output.data = result
		res.send(output)
	})
})


/**
 * 
 * 2.5	获取热门课程
 *接口URL
 *{{url}}/course/hottest?count=4
 *GET
 *请求Query参数
 *参数	示例值	必填	参数描述
 *count	4	必填	-返回结果数量
 *成功响应示例
 *{
 *	"code": 200,
 *	"msg": "success",
 *	"data": [
 *		{
 *			"cid": 12,
 *			"title": "12HTML零基础入门",
 *			"pic": "img-course/01.png",
 *			"price": 399,
 *			"tname": "纪盈鑫",
 * 			"tid": 5,
 *		}
 *	]
 *}
 */

router.get('/hottest', (req, res, next)=>{
	let count = req.query.count
	if(count){
		count = parseInt(count)
	}else {
		count = 4
	}
	let sql = 'SELECT cid,pic,title,price,tid,tname FROM course AS c, teacher AS t WHERE t.tid=c.teacherId ORDER BY buyCount DESC LIMIT ?'
	pool.query(sql, count, (err, result)=>{
		if(err)next(err)
		let output = {}
		output.code = 200
		output.msg = 'success'
		output.data = result
		res.send(output)
	})
})
