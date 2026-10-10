from rest_framework import serializers
from .models import Bed, Doctor, Staff, Equipment, ResourceRequest

def make(model):
    meta = type("Meta", (), {"model": model, "fields": "__all__"})
    return type(model.__name__ + "Serializer", (serializers.ModelSerializer,), {"Meta": meta})

BedSerializer, DoctorSerializer = make(Bed), make(Doctor)
StaffSerializer, EquipmentSerializer = make(Staff), make(Equipment)

class RequestSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.CharField(source="requested_by.username", read_only=True)
    class Meta:
        model = ResourceRequest
        fields = "__all__"
        read_only_fields = ["requested_by", "created_at"]
