from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from tracker.models import Profile, Bed, Doctor, Staff, Patient, Equipment

class Command(BaseCommand):
    help = "Create demo users and sample hospital data"
    def add_arguments(self, parser):
        parser.add_argument("--data-only", action="store_true", help="Do not create demo login accounts")

    def handle(self, *a, **k):
        if not k["data_only"]:
            for u, p, role in [("admin", "admin123", "admin"), ("doctor1", "doctor123", "doctor"), ("staff1", "staff123", "staff")]:
                user, new = User.objects.get_or_create(username=u, defaults={"is_superuser": role == "admin", "is_staff": role == "admin"})
                if new: user.set_password(p); user.save()
                Profile.objects.get_or_create(user=user, defaults={"role": role})
        if not Bed.objects.exists():
            st = ["available", "occupied", "reserved", "maintenance"]
            for i in range(1, 13):
                Bed.objects.create(bed_number=f"B{i:02}", ward="ICU Ward" if i <= 4 else "General Ward",
                                   bed_type="ICU" if i <= 4 else "General", status=st[i % 4])
        if not Doctor.objects.exists():
            Doctor.objects.bulk_create([
                Doctor(name="Dr. Anita Rao", specialization="Cardiology", department="Cardiology", schedule="9am-5pm"),
                Doctor(name="Dr. Vikram Shah", specialization="Neurology", department="Neurology", schedule="2pm-10pm", status="off_duty"),
                Doctor(name="Dr. Meera Iyer", specialization="Emergency Medicine", department="Emergency", schedule="Night")])
        if not Staff.objects.exists():
            Staff.objects.bulk_create([
                Staff(name="Priya N.", role="Nurse", department="ICU", shift="Morning"),
                Staff(name="Ravi K.", role="Technician", department="Radiology", shift="Evening", status="off_duty")])
        if not Equipment.objects.exists():
            Equipment.objects.bulk_create([
                Equipment(name="Ventilator", department="ICU", quantity=6),
                Equipment(name="MRI Scanner", department="Radiology", quantity=1, status="maintenance"),
                Equipment(name="Defibrillator", department="Emergency", quantity=4, status="in_use")])
        if not Patient.objects.exists():
            Patient.objects.bulk_create([
                Patient(patient_id="DEMO-001", ward="ICU Ward", condition="Respiratory observation", status="critical"),
                Patient(patient_id="DEMO-002", ward="Emergency Ward", condition="Cardiac observation", status="critical"),
                Patient(patient_id="DEMO-003", ward="General Ward", condition="Post-operative recovery", status="active"),
                Patient(patient_id="DEMO-004", ward="General Ward", condition="Routine observation", status="active"),
                Patient(patient_id="DEMO-005", ward="Emergency Ward", condition="Observation complete", status="discharged"),
            ])
        message = "Seeded fictional hospital data."
        if not k["data_only"]:
            message += " Logins: admin/admin123, doctor1/doctor123, staff1/staff123"
        self.stdout.write(self.style.SUCCESS(message))
