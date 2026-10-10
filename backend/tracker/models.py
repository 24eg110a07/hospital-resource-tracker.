from django.conf import settings
from django.db import models

class Profile(models.Model):
    ROLES = [("admin", "Admin"), ("doctor", "Doctor"), ("staff", "Staff")]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=10, choices=ROLES, default="staff")
    def __str__(self): return f"{self.user.username} ({self.role})"

class Bed(models.Model):
    TYPES = [("ICU", "ICU"), ("General", "General"), ("Emergency", "Emergency")]
    STATUS = [("available", "Available"), ("occupied", "Occupied"), ("reserved", "Reserved"), ("maintenance", "Maintenance")]
    bed_number = models.CharField(max_length=20, unique=True)
    ward = models.CharField(max_length=60)
    bed_type = models.CharField(max_length=20, choices=TYPES, default="General")
    status = models.CharField(max_length=20, choices=STATUS, default="available")

class Doctor(models.Model):
    STATUS = [("on_duty", "On duty"), ("off_duty", "Off duty")]
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    schedule = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default="on_duty")

class Staff(models.Model):
    STATUS = [("on_duty", "On duty"), ("off_duty", "Off duty")]
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=60)
    department = models.CharField(max_length=100)
    shift = models.CharField(max_length=40, blank=True)
    status = models.CharField(max_length=20, choices=STATUS, default="on_duty")

class Equipment(models.Model):
    STATUS = [("available", "Available"), ("in_use", "In use"), ("maintenance", "Maintenance")]
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS, default="available")

class ResourceRequest(models.Model):
    STATUS = [("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected")]
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    resource_type = models.CharField(max_length=20)
    details = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created_at"]
