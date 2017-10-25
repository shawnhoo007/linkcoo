var express = require('express');
var router = express.Router();
var crypto = require('crypto')
var fs = require('fs')
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
//var session = require('express-session')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var mongoose=require('mongoose');
var User = require('../model/user')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/login', function(req, res, next) {
  res.render('login.ejs', {
		errorInfo:'请输入信息'
	})
});

router.post('/submit', urlencodedParser, function(req, res) {
	console.log("Data from submit form");
	var user = new User({
		username:req.body.username,
		password:req.body.password,
		id:req.body.id,
		phone:req.body.phone,
		email:req.body.email
	})
	var d = getMD5Password(user.password);
	console.log("加密的结果："+d);
	user.password = d;
	console.log(user);
	var flag = {one:1,two:1,three:1,four:1};
	errorInfo = "";
	checkDataRep(user, flag, req, res);
})

function getMD5Password(content) {
  	var md5 = crypto.createHash('md5');//定义加密方式:md5不可逆,此处的md5可以换成任意hash加密的方法名称；
  	md5.update(content);
  	var d = md5.digest('hex');  //加密后的值d
	return d;
}

function checkDataRep(user, flag, req, res) {
	var testUsername = {username:user.username};
	var testId = {id:user.id};
	var testPhone = {phone:user.phone};
	var testEmail = {email:user.email};
	User.find(testUsername, function (err, detail) {
		if (detail.length) {
			flag.one = 0;
			errorInfo = errorInfo + "用户名重复\n";
		}
		dealWithDataSubmited(user, flag, req, res);
	})
	/*
	User.find(testId, function (err, detail) {
		if (detail.length) {
			flag.two = 0;
			errorInfo = errorInfo + "id重复\n";
		}
	})
	User.find(testPhone, function (err, detail) {
		if (detail.length) {
			flag.three = 0;
			errorInfo = errorInfo + "电话号码重复\n";
		}
	})
	User.find(testEmail, function (err, detail) {
		if (detail.length ) {
			flag.four = 0;
			errorInfo = errorInfo + "邮箱重复\n";
		}
		dealWithDataSubmited(user, flag, req, res)
	})
	*/
}

function dealWithDataSubmited (user, flag, req, res) {
	if (!(flag.one&&flag.two&&flag.three&&flag.four)) {
		repreload(res);
	} else {
		req.session.username = user.username;
		req.session.logged_in = 1;
		user.save(function(err) {
			if (err) {
				console.log('保存失败');
				return;
			}
			console.log('保存成功');
		})
		console.log(user.username + " has been added");
		//res.render('index.ejs', res);
		res.writeHead(301, {'Location': '/'});
		res.end();
		//showInfo(user, res)
	}
}
function showInfo(user, res) {
	res.render('info.ejs', {
		username:user.username,
		userId:user.id,
		phone:user.phone,
		email:user.email,
		errorInfo:'用户详情'
	});
}
function repreload(res) {
	res.render('login.ejs',{
		errorInfo:errorInfo
	})
}
module.exports = router;
