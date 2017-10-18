window.onload = function(){
	//实例并初始化我们的hichat程序
	var hichat = new HiChat();
	hichat.init();
};

//定义我们的hichat类
var HiChat = function(){
	this.socket = null;
};

//向原型添加业务方法
HiChat.prototype = {
	init:function(){
	//此方法初始化程序
		var that = this;
		//建立到服务器的socket连接
		this.socket = io.connect();
		//监听socket的connect事件，此事件表示连接已经建立
		this.socket.on('connect',function(){
			//连接到服务器后，显示昵称输入框
			document.getElementById('info').textContent = '欢迎来到聊天小站';
			document.getElementById('loginWrapper_2').style.display = "block";
			document.getElementById('nicknameInput').focus();
		});

		this.socket.on('nickExisted',function(){
			document.getElementById('info').textContent = '昵称被占用，请重新输入！';  
		});

		this.socket.on('loginSuccess',function(){
			document.title = 'Chatting |' + document.getElementById('nicknameInput').value;
			document.getElementById('loginWrapper_2').style.display = 'none'; //隐藏遮罩层显示聊天界面
			document.getElementById('loginWrapper').style.display = 'none';
			document.getElementById('messageInput').focus();//让消息输入框获得焦点
		});

		this.socket.on('system', function(nickName, userCount, type){
			//将在线人数显示到页面顶部
			document.getElementById('status').textContent = userCount + (userCount>1?' users':' user')+' online';
		});

		this.socket.on('newMsg',function(user,msg,color){
			that._displayNewMsg(user,msg,color);
		});

		this.socket.on('newImg',function(user,img,color){
			that._displayImage(user,img,color);
		});

		//昵称设置的确定按钮
		document.getElementById('loginBtn').addEventListener('click',function(){
			var nickName = document.getElementById('nicknameInput').value;
			//检查昵称输入框是否为空
			if (nickName.trim().length !=0) {
				//不为空，则发起一个login事件并将输入的昵称发送到服务器
				that.socket.emit('login',nickName);
			} else{
				document.getElementById('info').textContent = '昵称不能为空！';
				//否则输入框获得焦点
				document.getElementById('nicknameInput').focus();
			};
		},false);

		document.getElementById('nicknameInput').addEventListener('keyup',function(e){
			if (e.keyCode ==13) {
				var nickName = document.getElementById('nicknameInput').value;
				if (nickName.trim().length!=0) {
					that.socket.emit('login',nickName);
				};
			};
		},false);
		//监听发送按钮点击事件
		document.getElementById('sendBtn').addEventListener('click',function(){
			var messageInput = document.getElementById('messageInput'),
				msg = messageInput.value;
				//获取颜色值
				color = document.getElementById('colorStyle').value;
			messageInput.value = '';
			messageInput.focus();
			if (msg.trim().length!=0) {
				//显示和发送时带上颜色值参数
				that.socket.emit('postMsg',msg,color);//把消息发送到服务器
				that._displayNewMsg('me',msg,color);//把自己的消息显示到自己的窗口中
			};

			//存储历史消息
			var lStorage = window.localStorage;
            if (lStorage.myBoard) {
                var date = new Date();
                lStorage.myBoard +="\n" + date.toLocaleString() + "\n" + document.getElementById('nicknameInput').value + ":  " + msg + "\n";
            }
            else {
                var date = new Date();
                lStorage.myBoard ="\n" + date.toLocaleString() + "\n" + document.getElementById('nicknameInput').value + ":  " + msg + "\n";
            }

		},false);
		//监听图片按钮
		document.getElementById('messageInput').addEventListener('keyup',function(e){
			var messageInput = document.getElementById('messageInput'),
				msg = messageInput.value,
				color = document.getElementById('colorStyle'.value);
				if (e.keyCode == 13&& msg.trim().length !=0) {
					messageInput.value = '';
					that.socket.emit('postMsg',msg,color);
					that._displayNewMsg('me',msg,color);
				};
		},false);
		//监听clear按钮
		document.getElementById('clearBtn').addEventListener('click', function() {
            document.getElementById('historyMsg').innerHTML = '';
        }, false);
		//监听文本发送图片
		document.getElementById('sendImage').addEventListener('change',function(){
			//检查是否有文件被选中
			if (this.files.length !=0) {
				//获取文件并用filereader进行读取
				var file = this.files[0],
					reader = new FileReader(),
					color = document.getElementById('colorStyle').value;  
				if (!reader) {
					that._displayNewMsg('system','!your bowser doesn\'t support FileReader','red');
					this.value = '';
					return;
				};
				reader.onload = function(e){
					//读取成功，显示到页面并发送到服务器
					this.value = '';
					that.socket.emit('img',e.target.result,color);
					that._displayImage('me',e.target.result,color);  
				};
				reader.readAsDataURL(file);
			};
		},false);
		//监听表情按钮，创建表情窗口
		this._initialEmoji();
		document.getElementById('emoji').addEventListener('click',function(e){
			var emojiwrapper = document.getElementById('emojiWrapper');
			emojiwrapper.style.display = 'block';
			e.stopPropagation();
		},false);
		document.body.addEventListener('click',function(e){
			var emojiwrapper = document.getElementById('emojiWrapper');
			if (e.target!= emojiwrapper) {
				emojiwrapper.style.display = 'none';
			};
		});
		document.getElementById('emojiWrapper').addEventListener('click',function(e){
			//获取被点击的表情
			var target = e.target;
			if (target.nodeName.toLowerCase() == 'img') {
				var messageInput = document.getElementById('messageInput');
				messageInput.focus();
				messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
			};
		},false);
	},
	
	_initialEmoji:function(){
		var emojiContainer = document.getElementById('emojiWrapper'),
			docFragment = document.createDocumentFragment();
		for(var i = 69; i>0; i--){
			var emojiItem = document.createElement('img');
			emojiItem.src = '../content/emoji/' + i + '.gif';
			emojiItem.title = i;
			docFragment.appendChild(emojiItem);
		};
		emojiContainer.appendChild(docFragment);
	},
	
	_displayNewMsg:function(user,msg,color){
		var container = document.getElementById('historyMsg'),
			msgToDisplay = document.createElement('p'),
			date = new Date().toTimeString().substr(0,8),
			//将消息中的表情换为图片
			msg = this._showEmoji(msg);
		msgToDisplay.style.color = color ||'#000';
		msgToDisplay.innerHTML = user +':<span class="txtspan" >' + msg +'</span>';
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	},

	_displayImage:function(user,imgData,color){
		var container = document.getElementById('historyMsg'),
			msgToDisplay = document.createElement('p'),
			date = new Date().toTimeString().substr(0,8);
		msgToDisplay.style.color = color||'#000';
		msgToDisplay.innerHTML = user + '<a href="' + imgData + '" target="_blank" class="url"><img src="' + imgData + '"/></a>';
		container.appendChild(msgToDisplay);
		container.scrollTop = container.scrollHeight;
	},

	_showEmoji:function(msg){
		var match,result = msg,
			reg = /\[emoji:\d+\]/g,
			emojiIndex,
			totalEmojiNum = document.getElementById('emojiWrapper').children.length;
		while (match = reg.exec(msg)){
			emojiIndex = match[0].slice(7,-1);
			if(emojiIndex>totalEmojiNum){
				result = result.replace(match[0],'[x]');
			} else {
				result = result.replace(match[0],'<img class="emoji"src="../content/emoji/'+ emojiIndex +'.gif"/>');
			};
		};
		return result;
	}
};