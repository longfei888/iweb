const pool = require('../pool')
const express = require('express')
const captcha = require('svg-captcha')
let router = express.Router()
module.exports = router

//console.log(captcha.options) 	验证码图片的默认选项
/**
 * 生成“注册新用户”专用的验证码
 * URL:  GET   /captcha/register 
 */
router.get('/register', (req, res, next)=>{
	//随机验证码生成选项 —— 都是可选的
	let options = {		
		size: 5, 				// 验证码长度，默认值为4
		ignoreChars: '0oO1lI', 	// 验证码字符中排除指定字符，默认值为空
		noise: 4, 				// 干扰线条的数量，默认值为1
		color: true, 			// 验证码的字符是否彩色显示，默认值为false
		background: '#fff', 	// 验证码图片背景颜色，默认值为透明色
		width: 150,				// 验证码图片宽度，默认值为150 
		height: 40,				// 验证码图片高度，默认值为50
		fontSize: 50,			// 随机文字大小
		//charPreset: ''		// 预设的随机文字池，默认值为 52个大小写英文字符+10个数字
	}
	let c = captcha.create(options)			//创建随机验证码
	
	//c形如：{text: '随机验证码', data: '<svg>...</svg>'}
	req.session.registerCaptcha = c.text.toLowerCase()		//在会话中保存生成的随机验证码文本
	req.session.save()
	res.type('svg')								//向客户端输出随机验证码图片
	res.send(c.data)	
})