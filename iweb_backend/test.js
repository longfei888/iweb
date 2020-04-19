/*测试数据库连接池*/
/*
const pool = require('./pool')
//console.log(pool)
pool.query('select * from user', (err, result)=>{
	if(err)throw err
	console.log(result)
})
*/


/*测试svg-captcha模块的使用*/
const captcha = require('svg-captcha')

//创建随机验证码
let c = captcha.create()
console.log(c.text)		//生成的验证码内容 —— 应该保存在服务器端会话中
console.log(c.data)		//包含验证码的SVG字符串 —— 应该作为响应消息发送给客户端，在浏览器中显示的SVG图片