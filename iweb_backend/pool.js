/*MySQL数据库连接池*/
const mysql = require('mysql')

//创建连接池
let pool = mysql.createPool({
	host:				'127.0.0.1',	//数据库服务器地址
	port:				'3306',			//数据库服务器监听端口
	user:				'root',			//数据库服务器登录用户名
	password:			'',				//数据库服务器登录密码
	database:			'iweb',			//项目数据库名称
	connectionLimit:	5				//连接池大小
})
//在当前模块中导出连接池
module.exports = pool