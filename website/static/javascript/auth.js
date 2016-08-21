var currentUser = null;
var currentOrder = null;
$(document).ready(function(){
	var navbarRight = $('#navbarRight');
	var renderUser = function(user) {
		//console.log(user);
		currentUser = user;
		var html = 
		'<li class="dropdown">' +
			'<a href="#" class="dropdown-toggle" data-toggle="dropdown">' +
				'Hi, ' + user.name + 
				'<span class="caret"></span> ' +
			'</a>' +
			'<ul class="dropdown-menu">' + 
				'<li>' + 
					'<a href="#" id="btnLogout">Logout</a>' +
				'</li>' +
			'<ul>' +
		'</li>';
		navbarRight.html(html);
		if (user.accType === 'restaurant') {
			html = 
				'<li>' +
					'<a href="#" id="postFood">Post food</a>' +
				'</li>' +
				'<li>' +
					'<a href="#" id="myFood">My Restaurant\'s food</a>' +
				'</li>' +
				'<li>' +
					'<a href="#" id="orderList">Order List</a>' +
				'</li>';
		}
		else {
			// Customer here
			html = "";
		}
		navbarRight.prepend(html);
	}

	var renderAuth = function() {
		currentUser = null;
		currentOrder = null;
		var html = 
				'<li>' +
					'<a href="#" class="dropdown-toggle" data-toggle="dropdown">' +
						'<span class="glyphicon glyphicon-user"></span> ' +
						'Signup' +
						'<span class="caret"></span> ' +
					'</a>' +
					'<ul class="dropdown-menu">' +
						'<li>'+
							'<div class="form" id="loginForm">' +
								'<input class="form-control username" placeholder="Username">'+
								'<input class="form-control password" placeholder="Password" type="Password">'+
								'<input class="form-control" placeholder="Name" id="txtName">' +
								'<input class="form-control" placeholder="Phone number" id="txtPhone">' +
								'<label class="radio-inline"><input type="radio" name="accType" value="customer" checked>Customer</label>' +
								'<label class="radio-inline"><input type="radio" name="accType" value="restaurant">Restaurant</label>' +
								'<button class="btn btn-primary form-control" id="btnSignup">Signup</button>' +
							'</div>' +
						'</li>' +
					'</ul>' +
				'</li>' +
				'<li class="dropdown">' +
					'<a href="#" class="dropdown-toggle" data-toggle="dropdown">' +
						'<span class="glyphicon glyphicon-log-in"></span> ' +
						'Login' +
						'<span class="caret"></span> ' +
					'</a>' +
					'<ul class="dropdown-menu">' +
						'<li>'+
							'<div class="form" id="loginForm">' +
								'<input class="form-control username" placeholder="Username">'+
								'<input class="form-control password" placeholder="Password" type="password">'+
								'<button class="btn btn-primary form-control" id="btnLogin">Login</button>'
							'</div>' +
						'</li>' +
					'</ul>' +
				'</li>';
		navbarRight.html(html);
	}

	var renderFood = function(arr, add = "") {
		var html = '<div class="row">';
		for (var i = 0; i < arr.length; i++) {
			html += 
				'<div class="jumbotron col-sm-6 col-xs-12">' +
					'<img src="' + arr[i].foodImgUrl + '">'+
					'<h2>' + arr[i].foodName + '</h2>' +
					'<h4>' + arr[i].foodDescription + '</h4>' +
					add +
				'</div>'
			;
		}
		html += '</div>';
		$('.container').html(html);
	}

	var renderOrder = function(list) {
		var html = '';
		currentOrder = list;
		for (var i = 0; i < list.length; i++) {
			html += 
				'<div class="jumbotron">' +
					'<h4>Customer: ' + list[i].customer + '</h4>' + 
					'<h4>Food: ' + list[i].food.foodName + '</h4>' +
					'<h5>Time: ' + new Date(list[i].time).toString() + '</h5>'+
					'<h5>Place: ' + list[i].place + '</h5>';
			if (list[i].action === 'waiting'){
				html +=
					'<button class="btn btn-success btnAccept">Accept</button>'+
					'<button class="btn btn-danger btnDeny">Deny</button>'+
				'</div>';
			}
			else {
				html += 
					'<h4>Status: ' + list[i].action + '</h4>' +				
				'</div>';
			}
		}
		$('.container').html(html);
	}

	$.get('/api/userinfo', function(result){
		if (result.errCode === 0) {
			renderUser(result.userinfo);
			console.log(result);
		}
		else {
			renderAuth();
		}
	});

	// On button Login click
	$('body').on('click', '#btnLogin', function(){
		var username = $(this).parent().find('.username').val();
		var password = $(this).parent().find('.password').val();
		if (username !== "" && password !== "") {
			$.post('/api/login', {
				username: username, 
				password: password
			}, function(result){
				if (result.errCode === 0) {
					console.log('Login success');
					$.get('/api/userinfo', function(result){
						if (result.errCode === 0) {
							renderUser(result.userinfo);
						}
						else {
							alert('Problem when login');
							window.location.reload();
						}
					});
				}
				else {
					console.log(result);
				}
			});
		}
	});

	// On Anchor logout click
	$('body').on('click', '#btnLogout', function(){
		$.get('/api/logout', function(){
			renderAuth();
		});
		return false;
	});

	// On .username, password enterkey
	$('body').on('keypress', 'input', function(e){
		if (e.which === 13) {
			$(this).parent().find('#btnLogin').click();
		}
	});

	// On btnSignup click
	$('body').on('click', '#btnSignup', function(){
		var accType = $(this).parent().find("input[type='radio']:checked").val();
		var username = $(this).parent().find('.username').val();
		var password = $(this).parent().find('.password').val();
		var phone = $(this).parent().find('#txtPhone').val();
		var name = $(this).parent().find('#txtName').val();
		if (username !== "" && password !== "" && phone !== "" && name !== "") {
			$.post('/api/register', {
				username: username,
				password: password,
				accType: accType,
				phone: phone,
				name: name
			}, function(result){
				console.log(result);
				if (result.errCode === 0) {
					$.post('/api/login', {
						username: username, 
						password: password
					}, function(loginResult){
						if (loginResult.errCode === 0) {
							$.get('/api/userinfo', function(userResult){
								if (userResult.errCode === 0) {
									renderUser(userResult.userinfo);
								}
								else {
									alert('Error occur');
									console.log(userResult);
								}
							});
						}
						else {
							alert('Error occur');
							console.log('loginResult');
						}
					});
				}
				else {
					console.log(result);
					alert('Username exists');
				}
			});
		} 
		else {
			alert('You must fill all fields');
		}
	});

	// On anchor postFood click
	$('body').on('click', '#postFood', function(){
		$(this).parent().parent().find('li').removeClass('active');
		$(this).parent().addClass('active');
		var html = 
			'<h3>Post food</h3>'+
			'<input class="form-control" id="foodName" placeholder="Food Name">' +
			'<input class="form-control" id="foodImgUrl" placeholder="Image URL of Food">' +
			'<input class="form-control" id="foodDescription" placeholder="Food Description">' +
			'<button class="btn btn-primary" id="btnPostfood">Post food</button>'
			;
		$('.container').html(html);
		return false;
	});

	// On btnPostfood click
	$('body').on('click', '#btnPostfood', function(){
		var foodName = $(this).parent().find('#foodName').val();
		var foodImgUrl = $(this).parent().find('#foodImgUrl').val();
		var foodDescription = $(this).parent().find('#foodDescription').val();
		var parent = $(this).parent();
		if (foodName !== "" && foodImgUrl !== "" && foodDescription !== "") {
			$(this).prop('disabled', true);
			$.post('/api/postfood', {
				foodName: foodName,
				foodImgUrl: foodImgUrl,
				foodDescription: foodDescription
			}, function(result){
				if (result.errCode === 0) {
					parent.find('input').val('');
				}
				else {
					alert('Error occur');
				}
				parent.find('button').prop('disabled', false);
			});
		}
		else {
			alert('You must fill all fields');
		}
	});

	// On Anchor myFood click
	$('body').on('click', '#myFood', function(){
		$(this).parent().parent().find('li').removeClass('active');
		$(this).parent().addClass('active');
		$.get('/api/listfood/' + currentUser.username, function(result){
			renderFood(result.listFood);
		});
		return false;
	});

	// On orderList anchor click
	$('body').on('click', '#orderList', function(){
		$(this).parent().parent().find('li').removeClass('active');
		$(this).parent().addClass('active');
		$.get('/api/orderlist', function(result){
			renderOrder(result.list);
		});
		return false;
	});

	// On btnAccept click
	$('body').on('click', '.btnAccept', function(){
		var index = $(this).parent().index();
		var parent = $(this).parent();
		$.post('/api/orderaction', {
			orderId: currentOrder[index].orderId,
			action: 'accepted'
		}, function(result){
			if (result.errCode === 0) {
				parent.find('button').remove();
				parent.append('<h4>Status: accepted</h4>');
				currentOrder[index].action = 'accepted';
			}
			else {
				alert('Error occur');
			}
		});
	});

	// On btnDeny click
	$('body').on('click', '.btnDeny', function(){
		var index = $(this).parent().index();
		var parent = $(this).parent();
		$.post('/api/orderaction', {
			orderId: currentOrder[index].orderId,
			action: 'denied'
		}, function(result){
			if (result.errCode === 0) {
				parent.find('button').remove();
				parent.append('<h4>Status: denied</h4>');
				currentOrder[index].action = 'denied';
			}
			else {
				alert('Error occur');
			}
		});
	});

	// Brand click
	$('body').on('click', '.navbar-brand', function(){
		$('li').removeClass('active');
		$.get('/api/listfood', function(result){
			//console.log(result);
			if (currentUser.accType === 'customer') {
				//Customer here
			}
			else {
				renderFood(result.listFood);
			}
		});
		return false;
	})
	$.get('/api/listfood', function(result){
		//console.log(result);
		if (currentUser.accType === 'customer') {
			//Customer here
		}
		else {
			renderFood(result.listFood);
		}
	});
});