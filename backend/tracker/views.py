from django.contrib.auth import authenticate
from django.db.models import Count
from rest_framework import viewsets, filters
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, BasePermission, SAFE_METHODS
from rest_framework.response import Response
from .models import Bed, Doctor, Staff, Equipment, ResourceRequest
from .serializers import *

def role_of(user):
    if user.is_superuser: return "admin"
    return getattr(getattr(user, "profile", None), "role", "staff")

class AdminWriteOnly(BasePermission):
    """Everyone logged in can read; only Admin can add/update/delete."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS: return request.user.is_authenticated
        return request.user.is_authenticated and role_of(request.user) == "admin"

def resource_viewset(model, serializer, search):
    class VS(viewsets.ModelViewSet):
        queryset = model.objects.all().order_by("id")
        serializer_class = serializer
        permission_classes = [AdminWriteOnly]
        filter_backends = [filters.SearchFilter]
        search_fields = search
        def get_queryset(self):
            qs = super().get_queryset()
            s = self.request.query_params.get("status")
            return qs.filter(status=s) if s else qs
    return VS

BedViewSet = resource_viewset(Bed, BedSerializer, ["bed_number", "ward", "bed_type"])
DoctorViewSet = resource_viewset(Doctor, DoctorSerializer, ["name", "specialization", "department"])
StaffViewSet = resource_viewset(Staff, StaffSerializer, ["name", "role", "department"])
EquipmentViewSet = resource_viewset(Equipment, EquipmentSerializer, ["name", "department"])

class RequestViewSet(viewsets.ModelViewSet):
    serializer_class = RequestSerializer
    def get_queryset(self):
        qs = ResourceRequest.objects.select_related("requested_by")
        return qs if role_of(self.request.user) == "admin" else qs.filter(requested_by=self.request.user)
    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)
    def get_permissions(self):
        if self.action in ("update", "partial_update", "destroy"):
            return [AdminWriteOnly()]
        return super().get_permissions()

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    user = authenticate(username=request.data.get("username"), password=request.data.get("password"))
    if not user: return Response({"detail": "Invalid username or password."}, status=400)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username, "role": role_of(user)})

@api_view(["GET"])
def dashboard(request):
    def counts(model): return {r["status"]: r["n"] for r in model.objects.values("status").annotate(n=Count("id"))}
    beds = counts(Bed)
    total, free = sum(beds.values()), beds.get("available", 0)
    alerts = []
    if total and free / total < 0.2: alerts.append(f"Low bed availability: only {free} of {total} beds free.")
    icu = Bed.objects.filter(bed_type="ICU")
    if icu.exists() and not icu.filter(status="available").exists(): alerts.append("No ICU beds available.")
    m = Equipment.objects.filter(status="maintenance").count()
    if m: alerts.append(f"{m} equipment item(s) under maintenance.")
    return Response({"beds": beds, "doctors": counts(Doctor), "staff": counts(Staff), "equipment": counts(Equipment),
                     "pending_requests": ResourceRequest.objects.filter(status="pending").count(), "alerts": alerts})
