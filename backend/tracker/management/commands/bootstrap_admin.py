import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from tracker.models import Profile


class Command(BaseCommand):
    help = "Create the initial admin account from one-time environment variables"

    def handle(self, *args, **options):
        username = os.getenv("BOOTSTRAP_ADMIN_USERNAME", "").strip()
        email = os.getenv("BOOTSTRAP_ADMIN_EMAIL", "").strip()
        password = os.getenv("BOOTSTRAP_ADMIN_PASSWORD", "")

        if not username or not email or not password:
            raise CommandError(
                "Set BOOTSTRAP_ADMIN_USERNAME, BOOTSTRAP_ADMIN_EMAIL, and "
                "BOOTSTRAP_ADMIN_PASSWORD together."
            )
        if len(password) < 12:
            raise CommandError("BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.")

        with transaction.atomic():
            user = User.objects.filter(username=username).first()
            if user:
                if not (user.is_staff and user.is_superuser):
                    raise CommandError(
                        f"Username {username!r} already exists but is not an admin."
                    )
                Profile.objects.update_or_create(user=user, defaults={"role": "admin"})
                self.stdout.write("Bootstrap admin already exists; no changes made.")
                return

            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
            )
            Profile.objects.update_or_create(user=user, defaults={"role": "admin"})
        self.stdout.write("Bootstrap admin created.")
