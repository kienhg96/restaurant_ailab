var currentUser = null;
var currentOrder = null;
var currentFood = null;
var currentOrderIndex = 0;
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
			html = 
				'<li>' +
					'<a href="#" id="orderList">Order List</a>' +
				'</li>'
			;
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
		currentFood = arr;
		var html = '<div class="row">';
		for (var i = 0; i < arr.length; i++) {
			html += 
				'<div class="jumbotron col-sm-6 col-xs-12 col-md-4 col-lg-3">' +
					'<img src="' + arr[i].foodImgUrl + '">'+
					'<h2>' + arr[i].foodName + '</h2>' +
					'<h4>Restaurant: ' + arr[i].Restaurant.name + '</h4>' +
					'<h4>' + arr[i].foodDescription + '</h4>' +
					add +
				'</div>'
			;
		}
		html += '</div>';
		$('.container').html(html);
	}

	var renderOrder = function(list, custom) {
		var html = '';
		currentOrder = list;
		for (var i = 0; i < list.length; i++) {
			html += 
				'<div class="jumbotron">' +
					'<h4>Customer: ' + list[i].customer + '</h4>' + 
					'<h4>Restaurant: ' + list[i].restaurant + '</h4>' + 
					'<h4>Food: ' + list[i].food.foodName + '</h4>' +
					'<h5>Time: ' + new Date(list[i].time * 1000).toString() + '</h5>'+
					'<h5>Place: ' + list[i].place + '</h5>';
			if (list[i].action === 'waiting' && custom === false){
				html +=
					'<button class="btn btn-success btnAccept">Accept</button>'+
					'<button class="btn btn-danger btnDeny">Deny</button>';
			}
			else {
				html += 
					'<h4>Status: ' + list[i].action + '</h4>';
			}
			if (custom && list[i].action === 'waiting') {
				html += '<button class="btn btn-danger btnCancel">Cancel order</button>';
			}
			html += '</div>';
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
							var addition = 
							'<button class="btn btn-success btnOrder">Order</button>'
							;
							renderFood(currentFood, addition);
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
			renderFood(currentFood);
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
									var addition = 
									'<button class="btn btn-success btnOrder">Order</button>'
									;
									renderFood(currentFood, addition);
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
			renderOrder(result.list, currentUser.accType === 'customer');
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
			if (currentUser) {
				if (currentUser.accType === 'restaurant') {
					renderFood(result.listFood);
				}
				else {
					console.log("Customer");
					var addition = 
						'<button class="btn btn-success btnOrder">Order</button>'
					;
					renderFood(result.listFood, addition);
				}
			}
			else {
				renderFood(result.listFood);
			}
		});
		return false;
	});

	// btnOrder click
	$('body').on('click', '.btnOrder', function(){
		var index = $(this).parent().index();
		console.log(currentFood[index]);
		var date 
		var html = 
			'<label>Restaurant</label>' +
			'<input class="form-control" value="' + currentFood[index].Restaurant.name + '" disabled>' +
			'<label>Food name</label>' +
			'<input class="form-control" value="' + currentFood[index].foodName + '" disabled>' +
			'<label>Place</label>' +
			'<input class="form-control" id="place" placeholder="Your place">' +
			'<label>Time</label>' +
			'<input type="datetime-local" class="form-control" id="time" value="' + new Date(Date.now() - (new Date().getTimezoneOffset()) * 60 * 1000).toJSON().substring(0, 16) + '" placeholder="Time">' +
			'<button class="btn btn-success" id="orderFood">Order</button>'
		;
		currentOrderIndex = index;
		$('.container').html(html);
	});
	// orderFood click
	$('body').on('click', '#orderFood', function(){
		$(this).prop('disabled', true);
		var btn = $(this);
		var place = $(this).parent().find('#place').val();
		var time = $(this).parent().find('#time').val();
		time = new Date(time).getTime();
		var offset = new Date().getTimezoneOffset() * 60 * 1000;		
		time = Math.floor((time + offset) / 1000);
		console.log(time);
		var foodId = currentFood[currentOrderIndex].foodId;
		$.post('/api/orderfood', {
			foodId: foodId,
			time: time, 
			place: place
		}, function(result){
			if (result.errCode === 0) {
				alert('Order Success');
				$()
			}
			else if (result.errCode === -9) {
				alert('Please change time');
				btn.prop('disabled', false);
			}
			else {
				alert('Error occur');
				console.log(result);
			}
		});
	});

	// btnCancel click
	$('body').on('click', '.btnCancel', function(){
		var index = $(this).parent().index();
		console.log(currentOrder[index]);
		var orderId = currentOrder[index].orderId;
		var parent = $(this).parent();
		$.post('/api/cancelorder', {
			orderId: orderId
		}, function(result){
			if (result.errCode === 0) {
				parent.remove();
				currentOrder.splice(index, 1);
				alert('Cancel success');
			}
			else {
				alert('Error Occur');
			}
		});
	})

	$.get('/api/listfood', function(result){
		if (currentUser) {
			if (currentUser.accType === 'restaurant') {
				renderFood(result.listFood);
			}
			else {
				console.log("Customer");
				var addition = 
					'<button class="btn btn-success btnOrder">Order</button>'
				;
				renderFood(result.listFood, addition);
			}
		}
		else {
			renderFood(result.listFood);
		}
	});
});