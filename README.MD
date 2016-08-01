# Restaurant project for Webservice of AIlab

**After clone this project, you must run bellow command:**
```bash
python manage.py migrate
```
**Create superuser**
```bash
python manage.py createsuperuser
```
**After that, start the server**
```bash
python manage runserver 0.0.0.0:<port>
```
## Warning
**You must change `SECRET_KEY` in `restaurant/setting.py` for secure reason**  
You can get 50 random character for `SECRET_KEY` at http://www.miniwebtool.com/django-secret-key-generator/