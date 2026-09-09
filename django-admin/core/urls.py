from django.contrib import admin
from django.urls import path
from django.shortcuts import redirect

admin.site.site_header = "WorkPulse AI Administration"
admin.site.site_title = "WorkPulse AI Admin Portal"
admin.site.index_title = "Shared PostgreSQL Database Management"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', lambda request: redirect('admin/', permanent=False)),
]
