const pool = require('../pool')
const express = require('express')
let router = express.Router()
module.exports = router

/**
 *2.1	获取课程分类
 *接口URL
 *	{{url}}/type
 *请求方式
 *	GET
 *请求Body参数
 *成功响应示例
 *{
 *    "code": 200,
 *    "msg": "success",
 *    "data": [
 *        {
 *            "tpid": 1,
 *            "tpname": "基础课程"
 *        },
 *        {
 *            "tpid": 2,
 *            "tpname": "核心课程"
 *        },
 *        {
 *            "tpid": 3,
 *            "tpname": "进阶课程"
 *        }
 *    ]
 *}
 */
router.get('/', (req, res, next)=>{
	let sql = 'SELECT * FROM type'
	pool.query(sql, (err, result)=>{
		let output = {
			code: 200,
			msg: 'success',
			data: result
		}
		res.send(output)
	})
})


