from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
# Create your views here.

def index(request):
    return JsonResponse({'msg': 'Hello, world'})
    
def register(request):
    #user = User.objects.filter(username='hk')
    #print len(user)
    if (request.method == 'POST'):
        username = request.POST['username']
        password = request.POST['password']
        accType = request.POST['acctype']
        phone = request.POST['phone']
    return JsonResponse({'username': 'xyz'})
    