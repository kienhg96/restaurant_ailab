from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class ExtendUser(models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE)
	accType = models.CharField(max_length=12)
	phone = models.CharField(max_length=15)
	name = models.CharField(max_length=256)
	def __str__(self):
		return self.user.username

class Food(models.Model):
	foodName = models.CharField(max_length=256)
	foodImgUrl = models.TextField()
	foodDescription = models.TextField()
	foodRestaurant = models.CharField(max_length=256)
	def __str__(self):
		return self.foodName
		
class Order(models.Model):
	foodId = models.IntegerField()
	customer = models.CharField(max_length=256)
	restaurant = models.CharField(max_length=256)
	time = models.IntegerField()
	place = models.CharField(max_length=256)
	action = models.CharField(max_length=20)
	def __str__(self):
		return self.foodId