from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import filters, serializers
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied, NotFound

from employee_portal.models import Candidate, Client # Client import kiya verification ke liye

UserModel = get_user_model()

# =========================
# CANDIDATE SERIALIZER
# =========================
class InvoiceCandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = [
            "id",
            "candidate_name",
            "technology",
            "client_rate",
            "vendor_rate",
            "client",
            "vendor",
        ]

# =========================
# CANDIDATES BY CLIENT
# =========================
from django.db.models import Q

class ClientCandidateListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceCandidateSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ["candidate_name", "technology"]

    def get_company_root(self, user):
        if user.role == "SUB_ADMIN":
            return user
        
        if user.parent_user:
            return user.parent_user
        
        raise PermissionDenied("Invalid company structure.")

    def get_queryset(self):
        user = self.request.user
        company_root = self.get_company_root(user)
        client_id = self.kwargs.get("client_id")

        # ✅ FIXED CLIENT VERIFY
        try:
            client = Client.objects.get(
                Q(created_by=company_root) | Q(created_by__parent_user=company_root),
                id=client_id,
                is_deleted=False
            )
        except Client.DoesNotExist:
            raise NotFound("Client not found or doesn't belong to your company.")

        # ✅ CANDIDATES (ONLY BY CLIENT)
        # return Candidate.objects.filter(
        #     client=client,
        #     is_deleted=False,
        #     main_status=Candidate.MainStatus.ONBORD or Candidate.MainStatus.OFFBORDED
        # ).order_by("-created_at")
        
        return Candidate.objects.filter(
            client=client,
            is_deleted=False,
            main_status__in=[Candidate.MainStatus.ONBORD, Candidate.MainStatus.OFFBOARDED]
        ).order_by("-created_at")
