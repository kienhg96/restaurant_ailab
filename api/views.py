from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from api.models import *
from django.contrib.auth import authenticate, login, logout
# Create your views here.

def index(request):
    return JsonResponse({'msg': 'Hello, world'})
    
def register(request):
    if (request.method == 'POST'):
    	#checking argument
    	if ('username' in request.POST):
        	username = request.POST['username']
        else:
        	return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'username\''})
        if ('password' in request.POST):
        	password = request.POST['password']
        else:
        	return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'password\''})
        if ('acctype' in request.POST):
        	acctype = request.POST['acctype']
        	if (acctype != 'customer' and acctype !='restaurant'):
        		return JsonResponse({'errCode': -5, 'msg': 'Invalid acctype, only either \'customer\' or \'restaurant\''})
        else:
        	return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'acctype\''})
        if ('phone' in request.POST):
        	phone = request.POST['phone']
        else:
        	return JsonResponse({'errCode': -5, 'msg': 'Missing argument \'phone\''})
        
        if (len(User.objects.filter(username=username)) != 0):
        	return JsonResponse({'errCode': -1, 'msg': 'Username \'' + username + '\' already exists'})
    	else:
    		user = User.objects.create_user(username, None, password)
    		user.save()
    		extendUser = ExtendUser(user=user, acctype=acctype, phone=phone)
    		extendUser.save()
    		return JsonResponse({'errCode': 0, 'msg': 'Register success', 'userinfo': {'username': username, 'phone': phone}})
    else:
    	return JsonResponse({'errCode': -6, 'msg': 'Invalid method, POST only'})
def login_api(request):
	if (request.method == 'POST'):
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
def userinfo(request):
	if (request.user.is_authenticated()):
		return JsonResponse({'errCode': 0, 'userinfo': {'username': request.user.username, 'acctype': request.user.extenduser.acctype}})
	else:
		return JsonResponse({'errCode': -2, 'msg': 'Not login yet'})
def logout_api(request):
	if (request.user.is_authenticated()):
		logout(request)
		return JsonResponse({'errCode': 0, 'msg': 'Logout success'})
	else:
		return JsonResponse({'errCode': -2, 'msg': 'Not login yet'})