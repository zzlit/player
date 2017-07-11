//openDatabase创建一个访问数据库的对象
var db = openDatabase('Userinfo','','My Database',102400);

//新增数据
function addData(userid, password){
	var t2 = document.getElementById('userid').value;
	var p1 = document.getElementById('password').value;
	var p2 = document.getElementById('password_agin').value;
	var m2 = null;
	if (p1!=p2) {
		alert('请输入相同的密码!');
		exit(0);
	}
	db.transaction(function(tx){
		tx.executeSql('CREATE TABLE IF NOT EXISTS MsgData(userid unique, password)',[]);
/*------------------------------------------------------*/
		tx.executeSql('SELECT * FROM MsgData WHERE userid=?',[t2],function(tx, results) {
            var len = results.rows.length;
            for (var i = 0; i < len; i++) {
            m2 = results.rows.item(i).userid;
            }
            if(m2===t2){
            	alert('用户名已存在，请重新输入！');
            	exit(0);
            }
		},
		function(tx, error){
			alert(error.source + "::" + error.message);
		});
/*------------------------------------------------------*/
		tx.executeSql('INSERT INTO MsgData VALUES(?, ?)',[userid,password],function(tx, rs){
			alert('注册成功！');
		},
		function(tx, error){
			alert(error.source + "::" + error.message);
		});
	});
}

//保存数据
function saveData(){
	var userid = document.getElementById('userid').value;
	var password = document.getElementById('password').value;
	addData(userid, password);
}

//查询语句
function selectData(userid, password){
	var t1 = document.getElementById('userid2').value;
	var t2 = document.getElementById('password2').value;
	var m2 = null;
	db.transaction(function(tx){
		tx.executeSql('SELECT password FROM MsgData WHERE userid=?',[t1],function(tx, results) {
            var len = results.rows.length;
            for (var i = 0; i < len; i++) {
            m2 = results.rows.item(i).password;
            }
            if(m2!=t2){
            	alert('用户名或密码错误！');
            }else {
/*			alert('登陆成功！');*/
			document.getElementById('nickWrapper').style.display = 'none';
			document.getElementById('loginWrapper_2').style.display = 'block';
			document.getElementById('info').textContent = 'Please enter your nickname and can not be empty！';
            }
		},
		function(tx, error){
			alert(error.source + "::" + error.message);
		});
	});
}