from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from api.models import *
from django.contrib.auth import authenticate, login, logout
import re # regular expression
import time
# Create your views here.

def index(request):
	return JsonResponse({'msg': 'Hello, world'})

def register(request):
	if (request.method != 'POST'):
		return JsonResponse({'errCode': -6, 'msg': 'Invalid method, POST only'})
	if ('username' in request.POST):
		username = request.POST['username']
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'username\''})
	if ('password' in request.POST):
		password = request.POST['password']
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'password\''})
	if ('name' in request.POST):
		name = request.POST['name']
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'name\''})
	if ('accType' in request.POST):
		accType = request.POST['accType']
		if (accType != 'customer' and accType != 'restaurant'):
			return JsonResponse({'errCode': -5, 'msg': 'Invalid accType, only either \'customer\' or \'restaurant\''})
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'accType\''})
	if ('phone' in request.POST):
		phone = request.POST['phone']
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'phone\''})

	if (len(User.objects.filter(username=username)) != 0):
		return JsonResponse({'errCode': -1, 'msg': 'Username \'' + username + '\' already exists'})
	else:
		user = User.objects.create_user(username, None, password)
		user.save()
		extendUser = ExtendUser(user=user, accType=accType, phone=phone, name=name)
		extendUser.save()
		return JsonResponse({'errCode': 0, 'msg': 'Register success', 'userinfo': {'username': username, 'name': name, 'phone': phone}})

def login_api(request):
	if (request.method != 'POST'):
		return JsonResponse({'errCode': -6, 'msg': 'Invalid method, POST only'})
	if ('username' in request.POST):
		username = request.POST['username']
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'username\''})
	if ('password' in request.POST):
		password = request.POST['password']
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'password\''})
	user = authenticate(username=username, password=password)
	if user is not None:
		login(request, user)
		return JsonResponse({'errCode': 0, 'msg': 'Login success'})
	else:
		return JsonResponse({'errCode': -2, 'msg': 'Invalid username or password'})	

def userinfo(request, string):
	if (string == ""):
		if (request.user.is_authenticated()):
			return JsonResponse({'errCode': 0, 'userinfo': {'username': request.user.username, 'accType': request.user.extenduser.accType, 'phone': request.user.extenduser.phone, 'name': request.user.extenduser.name}})
		else:
			return JsonResponse({'errCode': -2, 'msg': 'You are not login'})
	else:
		user = User.objects.filter(username=string)
		if len(user) == 0:
			return JsonResponse({'errCode': -7, 'msg':'Username not found'})
		else:
			return JsonResponse({'errCode': 0, 'userinfo': {'username': string, 'name': user[0].extenduser.name, 'accType': user[0].extenduser.accType, 'phone': user[0].extenduser.phone}})

def logout_api(request):
	if (request.user.is_authenticated()):
		logout(request)
		return JsonResponse({'errCode': 0, 'msg': 'Logout success'})
	else:
		return JsonResponse({'errCode': -2, 'msg': 'You are not login'})

def changePassword(request):
	if (request.method != 'POST'):
		return JsonResponse({'errCode': -6, 'msg': 'Invalid method, POST only'})
	if not request.user.is_authenticated():
		return JsonResponse({'errCode': -2, 'msg': 'You are not login'})
	if ('password' in request.POST):
		password = request.POST['password']
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'password\''})
	if ('newPassword' in request.POST):
		newPassword = request.POST['newPassword']
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'newPassword\''})
	user = authenticate(username=request.user.username, password=password)
	if user is not None:
		user.set_password(newPassword)
		user.save()
		login(request, user)
		return JsonResponse({'errCode': 0, 'msg': 'Password Changed'})
	else:
		return JsonResponse({'errCode': -8, 'msg': 'Authenticate Failed, invalid password'})
	
def postFood(request):
	if request.method != 'POST':
		return JsonResponse({'errCode': -6, 'msg': 'Invalid method, POST only'})
	if not request.user.is_authenticated():
		return JsonResponse({'errCode': -2, 'msg': 'You are not login'})
	if request.user.extenduser.accType != 'restaurant':
		return JsonResponse({'errCode': -3, 'msg': 'This account is not restaurant account'})
	if 'foodName' in request.POST:
		foodName = request.POST['foodName']
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'foodName\''})
	if 'foodImgUrl' in request.POST:
		foodImgUrl = request.POST['foodImgUrl']
	else:
		foodImgUrl = ''
	if 'foodDescription' in request.POST:
		foodDescription = request.POST['foodDescription']
	else:
		foodDescription = ''
	foodRestaurant = request.user.username
	food = Food(foodName=foodName, foodImgUrl=foodImgUrl, foodDescription=foodDescription, foodRestaurant=foodRestaurant)
	food.save()
	return JsonResponse({'errCode': 0, 'foodInfo':{'foodName': foodName, 'foodImgUrl': foodImgUrl, 'foodDescription':foodDescription}})
			
def listFood(request, username):
	if request.method != 'GET':
		return JsonResponse({'errCode': -6, 'msg': 'Invalid method, GET only'})
	if 'limit' in request.GET:
		limit = request.GET['limit']
	else:
		limit = 20
	if 'offset' in request.GET:
		offset = request.GET['offset']
	else:
		offset = 0
	arr = []
	if username == "":
		food = Food.objects.all()[offset: offset + limit]
		for elem in food:
			restaurant = User.objects.filter(username=elem.foodRestaurant)
			arr.append({'foodId': elem.id, 'foodName': elem.foodName, 'Restaurant': {'username': elem.foodRestaurant, 'name': restaurant[0].extenduser.name, 'phone': restaurant[0].extenduser.phone}, 'foodDescription': elem.foodDescription, 'foodImgUrl': elem.foodImgUrl})
		return JsonResponse({'listFood': arr})
	else:
		food = Food.objects.filter(foodRestaurant=username)[offset: offset + limit]
		if len(food) != 0:
			user = User.objects.filter(username=username)[0];
		else:
			name = ''
		for elem in food:
			arr.append({'foodId': elem.id, 'foodName': elem.foodName, 'restaurant': {'username': username, 'name': user.extenduser.name, 'phone': user.extenduser.phone}, 'foodDescription': elem.foodDescription, 'foodImgUrl': elem.foodImgUrl})
		return JsonResponse({'listFood': arr})

def orderFood(request):
	if request.method != 'POST':
		return JsonResponse({'errCode': -6, 'msg': 'Invalid method, POST only'})
	if not request.user.is_authenticated():
		return JsonResponse({'errCode': -2, 'msg': 'You are not login'})
	if ('foodId' in request.POST):
		foodId = request.POST['foodId']
		food = Food.objects.filter(id=foodId)
		if len(food) == 0:
			return JsonResponse({'errCode': -7, 'msg': 'Food not found'})
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'foodId\''})
	if ('time' in request.POST):
		order_time = request.POST['time']
		pattern = re.compile('[0-9]+');
		match = pattern.match(order_time)
		if match is None:
			return Json({'errCode': -9, 'msg': 'Invalid time'})
		else:
			order_time = int(match.group());
			if (order_time < (int(time.time()) - 60)):
				return JsonResponse({'errCode': -9, 'msg': 'Invalid time, time in the past'})
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'time\''})
	if ('place' in request.POST):
		place = request.POST['place']
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'place\''})

	order = Order(foodId=foodId, customer=request.user.username, restaurant=food[0].foodRestaurant, time=order_time, place=place, action='waiting')
	order.save()

	return JsonResponse({'errCode': 0, 'orderId': order.id, 'food': {'foodId': foodId, 'foodName': food[0].foodName, 'restaurant': food[0].foodRestaurant, 'foodImgUrl': food[0].foodImgUrl, 'foodDescription': food[0].foodDescription}, 'time': order_time, 'place': place})

def orderAction(request):
	if request.method != 'POST':
		return JsonResponse({'errCode': -6, 'msg': 'Invalid method, POST only'})
	if not request.user.is_authenticated():
		return JsonResponse({'errCode': -2, 'msg': 'You are not login'})
	if request.user.extenduser.accType != 'restaurant':
		return JsonResponse({'errCode': -3, 'msg': 'Your account type must be \'restaurant\''})	
	if 'orderId' in request.POST:
		orderId = request.POST['orderId']
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'orderId\''})
	if 'action' in request.POST:
		action = request.POST['action']
	else:
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'orderId\''})
	if not (action in ('accepted', 'denied')):
		return JsonResponse({'errCode': -5, 'msg': 'Invalid action, either \'accepted\' or \'denied\''})
	order = Order.objects.filter(id=orderId)
	if len(order) == 0:
		return JsonResponse({'errCode': -7, 'msg': 'Not found order with id = %s' % orderId})
	foodId = order[0].foodId
	food = Food.objects.filter(id=foodId)
	if len(food) == 0:
		return JsonResponse({'errCode': -8, 'msg': 'Food has been deleted'})
	if request.user.username != food[0].foodRestaurant:
		return JsonResponse({'errCode': -4, 'msg': 'You are not own of food'})
	order[0].action = action
	order[0].save()
	return JsonResponse({'errCode': 0, 'msg': 'Action success', 'order': {'foodId': order[0].foodId, 'customerId': order[0].customer, 'time': order[0].time, 'place': order[0].place, 'action': order[0].action}})

def orderList(request):
	if request.method != 'GET':
		return JsonResponse({'errCode': -6, 'msg': 'Invalid method, GET only'})
	if not request.user.is_authenticated():
		return JsonResponse({'errCode': -2, 'msg': 'You are not login'})
	if 'action' in request.GET:
		action = request.GET['action']
		if not (action in ('accepted', 'waiting', 'denied', 'all')):
			return JsonResponse({'errCode': -5, 'msg': 'Invalid \'action\' value, either \'accepted\', \'waiting\', \'denied\' or \'all\''})
	else:
		action = 'all'
	if request.user.extenduser.accType == 'restaurant':
		if action == 'all':
			order = Order.objects.filter(restaurant=request.user.username)
		else:
			order = Order.objects.filter(restaurant=request.user.username, action=action)
	else:
		if action == 'all':
			order = Order.objects.filter(customer=request.user.username)
		else:
			order = Order.objects.filter(customer=request.user.username, action=action)
	arr = []
	for elem in order:
		food = Food.objects.filter(id=elem.foodId)
		if len(food) == 0:
			foodInfo = "Deleted"
		else:
			foodInfo = {'foodName': food[0].foodName, 'foodImgUrl': food[0].foodImgUrl, 'foodDescription': food[0].foodDescription}
		arr.append({'orderId': elem.id,'food': foodInfo, 'customer': elem.customer, 'restaurant': elem.restaurant, 'time': elem.time, 'place': elem.place, 'action': elem.action})
	return JsonResponse({'errCode': 0, 'list': arr})

def deleteFood(request):
	if request.method != 'POST':
		return JsonResponse({'errCode': -6, 'msg': 'Invalid method, POST only'})
	if not request.user.is_authenticated():
		return JsonResponse({'errCode': -2, 'msg': 'You are not login'})
	if request.user.extenduser.accType != 'restaurant':
		return JsonResponse({'errCode': -3, 'msg': 'You are not restaurant'})
	if not ('foodId' in request.POST):
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'foodId\''})
	foodId = request.POST['foodId']
	food = Food.objects.filter(id=foodId);
	if len(food) == 0:
		return JsonResponse({'errCode': -7, 'msg': 'Food not found'})
	if food[0].foodRestaurant != request.user.username:
		return JsonResponse({'errCode': -4, 'msg': 'The food is not belong to your restaurant'})
	food[0].delete();
	return JsonResponse({'errCode': 0, 'msg': 'Deleted', 'food': {'foodName': food[0].foodName, 'foodImgUrl': food[0].foodImgUrl, 'foodDescription': food[0].foodDescription}})

def cancelOrder(request):
	if request.method != 'POST':
		return JsonResponse({'errCode': -6, 'msg': 'Invalid method, POST only'})
	if not request.user.is_authenticated():
		return JsonResponse({'errCode': -2, 'msg': 'You are not login'})
	if request.user.extenduser.accType != 'customer':
		return JsonResponse({'errCode': -3, 'msg': 'You are not customer'})
	if not ('orderId' in request.POST):
		return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'orderId\''})
	orderId = request.POST['orderId']
	order = Order.objects.filter(id=orderId)
	if len(order) == 0:
		return JsonResponse({'errCode': -7, 'msg': 'Not found order'})
	if (order[0].customer != request.user.username):
		return JsonResponse({'errCode': -4, 'msg': 'The order is not belong to you'})
	if (order[0].action == 'accepted'):
		return JsonResponse({'errCode': -4, 'msg': 'You cannot cancel order after restaurant accepted'})
	order[0].delete()
	return JsonResponse({'errCode': 0, 'msg': 'Canceled', 'order': {'foodId': order[0].foodId, 'customer': order[0].customer, 'restaurant': order[0].restaurant, 'time': order[0].time, 'place': order[0].place}})

def test(request, string):
	return JsonResponse({'str': string})
