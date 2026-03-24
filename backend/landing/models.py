from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        CENTRAL_ADMIN = "CENTRAL_ADMIN", "Central Admin"
        SUB_ADMIN = "SUB_ADMIN", "Sub Admin"
        EMPLOYEE = "EMPLOYEE", "Employee"
        ACCOUNTANT = "ACCOUNTANT", "Accountant"

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
    parent_user = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees"
    )
    #===============================================================
    def get_company(self):
        """Return the company (Sub-Admin) this user belongs to"""
        if self.role == 'SUB_ADMIN':
            return self
        elif self.role == 'EMPLOYEE' and self.parent_user:
            return self.parent_user
        elif self.role == 'ACCOUNTANT' and self.parent_user:
            return self.parent_user
        return None
    
    def is_company_admin(self):
        """Check if user is Sub-Admin of their company"""
        return self.role == 'SUB_ADMIN'
    
    def can_edit_requirement(self, requirement):
        """Check if user can edit a requirement"""
        if self.role == 'CENTRAL_ADMIN':
            return True
        if self.role == 'SUB_ADMIN' and requirement.company == self:
            return True
        if self.role == 'EMPLOYEE' and requirement.created_by == self:
            return True
        return False

    #==============================================================
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

