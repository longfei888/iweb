const pool = require('../pool')
const express = require('express')
let router = express.Router()
module.exports = router

/**
 *2.6	获取讲师列表
 *接口URL
 *{{url}}/teacher/list?format=short
 *请求方式
 *GET
 *请求Body参数
 *参数	示例值	必填	参数描述
 *format	short或full	否	short：默认值，返回简短的讲师列表（不包含经验和风格）
 *full：返回完整的讲师列表（包含经验和风格）
 *成功响应示例
 *{
 *	  "code": 200
 *    "msg": "success",
 *    "data": [
 *        {
 *            "tid": 1,
 *            "tname": "成亮",
 *            "maincourse": "Web开发讲师",
 *            "tpic": "img-teacher\/zx.jpg",
 *            "experience": "达内集团web讲师， 主讲 HTML5、Jquery、 Ajax 等课程。先后在一汽启明、日本インタセクト等公司担任系统开发工程师，从事软件开发和设计工作，迄今已积累5年以上的开发及教学经验，兼具技术和教学两方面的培训能力。",
 *            "style": "教学思路严谨，课堂气氛活跃。讲解时善于运用生活当中的例子，使学员能够快速理解。着重培养学员的动手能力，奉行实践是检验真理的唯一标准，教学能力受到学员们的一致好评。"
 *        }
 *}
 */
router.get('/list', (req, res, next)=>{
	let format = req.query.format
	let sql = null
	if(format!=='full'){
		sql = 'SELECT tid,tname,maincourse,tpic FROM teacher'
	}else {
		sql = 'SELECT tid,tname,maincourse,tpic,experience,style FROM teacher'
	}
	pool.query(sql, (err, result)=>{
		let output = {
			code: 200,
			msg: 'success',
			data: result
		}
		res.send(output)
	})
})


