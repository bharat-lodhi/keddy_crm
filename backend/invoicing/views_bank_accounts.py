from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

from .models import CompanyBankAccount
from .serializers import CompanyBankAccountSerializer

UserModel = get_user_model()

class CompanyBankAccountListCreateAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CompanyBankAccountSerializer

    def get_company_root(self, user):
        # 1. SubAdmin hamesha owner hota hai
        if user.role == "SUB_ADMIN":
            return user
        
        # 2. Sirf ACCOUNTANT ko hi bank access hona chahiye
        if user.role == "ACCOUNTANT" and user.parent_user:
            return user.parent_user

        # 3. Baaki roles (EMPLOYEE) ke liye access block
        raise PermissionDenied("Only Accountants or SubAdmins can manage bank accounts.")

    def get_queryset(self):
        user = self.request.user
        # Root fetch karo (ya toh SubAdmin khud, ya Accountant ka boss)
        company_root = self.get_company_root(user)

        return CompanyBankAccount.objects.filter(
            company_owner=company_root
        ).order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        company_root = self.get_company_root(user)

        # Hamesha company_owner field mein SubAdmin ki ID hi jayegi
        serializer.save(company_owner=company_root)