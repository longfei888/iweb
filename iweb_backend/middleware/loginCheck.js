module.exports = function(req, res, next){
	let output = null
	if(!req.session){
		output = {
			code: 500,
			msg: 'session middleware required'
		}
	}else if(!req.session.user){
		output = {
			code: 409,
			msg: 'login required'
		}
	}
	
	if(output){
		res.send(output)
	}else {
		next()		//放行，调用后续的业务处理路由
	}
}