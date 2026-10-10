from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
r = DefaultRouter()
r.register("beds", views.BedViewSet)
r.register("doctors", views.DoctorViewSet)
r.register("staff", views.StaffViewSet)
r.register("equipment", views.EquipmentViewSet)
r.register("requests", views.RequestViewSet, basename="requests")
urlpatterns = [path("login/", views.login), path("dashboard/", views.dashboard), path("", include(r.urls))]
