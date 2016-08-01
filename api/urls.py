from django.conf.urls import url, include
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^register$', views.register, name='register'),
    url(r'^login$', views.login_api, name='login'),
    url(r'^userinfo$', views.userinfo, name='userinfo'),
    url(r'^logout$', views.logout_api, name='logout'),
]
