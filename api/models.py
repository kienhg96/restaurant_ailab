from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class extendUser(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    accType = models.CharField(max_length=12)
    phone = models.CharField(max_length=15)