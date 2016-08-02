from django.contrib import admin
from . import models
# Register your models here.

admin.site.register(models.ExtendUser)
admin.site.register(models.Food)
admin.site.register(models.Order)