from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class ExtendUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    accType = models.CharField(max_length=12)
    phone = models.CharField(max_length=15)
    def __str__(self):
    	return self.user.username

class Food(models.Model):
	foodName = models.CharField(max_length=256)
	foodImgUrl = models.TextField()
	foodDescription = models.TextField()
	foodRestaurantId = models.IntegerField()
	def __str__(self):
		return self.foodName
		
class Order(models.Model):
	foodId = models.IntegerField()
	customerId = models.IntegerField()
	time = models.IntegerField()
	place = models.CharField(max_length=256)
	accept = models.BooleanField()
	def __str__(self):
		return self.foodId