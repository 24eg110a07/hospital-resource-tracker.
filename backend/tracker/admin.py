from django.contrib import admin
from .models import Profile, Bed, Doctor, Staff, Patient, Equipment, ResourceRequest
for m in (Profile, Bed, Doctor, Staff, Patient, Equipment, ResourceRequest):
    admin.site.register(m)
