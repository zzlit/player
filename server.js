//服务器及页面相应部分
//express是管理路由响应请求的模块，根据请求的URL返回相应的HTML页面。这里我们使用一个事先写好的静态页面返回给客户端，只需使用express指定要返回的页面的路径即可。
var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
//socket是一个包,使用它可以很方便地建立服务器到客户端的sockets连接，发送事件与接收特定事件。
//通过socket.emit()来激发一个事件，通过socket.on()来侦听和处理对应事件。
	io = require('socket.io').listen(server),//引入socket.io模块并绑定到服务器
	users =[];//保存在线用户的昵称
	app.use('/',express.static(__dirname + '/www'));
	server.listen(8080, function() {
	console.log('lisen on 8080...')
});

//socket部分
io.sockets.on('connection',function(socket){

	//昵称设置
	socket.on('login',function(nickname){
		if (users.indexOf(nickname)>-1){
			socket.emit('nickExisted');
		} else{
			socket.userIndex = users.length;
			socket.nickname = nickname;
			users.push(nickname);
			socket.emit('loginSuccess');
			io.sockets.emit('system', nickname, users.length, 'login');//向所有连接到服务器的客户端发送当前登录的用户昵称
		};
	});

	//断开连接事件
	socket.on('disconnect',function(){
		//将断开的用户从user中删除
		users.splice(socket.userIndex, 1);
		//通知除自己以外的所有人
		socket.broadcast.emit('system',socket.nickname,users.length,'logout');
	});

	//接受新消息
	socket.on('postMsg',function(msg,color){
		//将消息发送到除自己的之外的所有用户啊
		socket.broadcast.emit('newMsg',socket.nickname,msg,color);
	});

	//接受用户发来的图片
	socket.on('img',function(imgData,color){
		//通过一个newImg事件分发到除自己之外的每个用户
		socket.broadcast.emit('newImg',socket.nickname,imgData,color);
	});	
});