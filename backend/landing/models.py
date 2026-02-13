from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        CENTRAL_ADMIN = "CENTRAL_ADMIN", "Central Admin"
        SUB_ADMIN = "SUB_ADMIN", "Sub Admin"
        EMPLOYEE = "EMPLOYEE", "Employee"

    username = None  # disable username field

    email = models.EmailField(unique=True)
    number = models.CharField(max_length=15)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.EMPLOYEE
    )
    profile_picture = models.ImageField(
        upload_to="profile_pics/",
        null=True,
        blank=True
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]


