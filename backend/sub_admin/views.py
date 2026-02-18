
from django.utils.timezone import now
from django.db.models import Q

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from employee_portal.models import Vendor, Client, Candidate
from employee_portal.serializers import TodayCandidateSerializer
from django.contrib.auth import get_user_model
User = get_user_model()

from rest_framework import generics
from .serializers import UserCreateSerializer


# Create your views here.
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    today = now().date()

    if user.role == "SUB_ADMIN":
        candidate_filter = {}
        vendor_filter = {}
        client_filter = {}
    else:
        candidate_filter = {"created_by": user}
        vendor_filter = {"created_by": user}
        client_filter = {"created_by": user}

    total_vendors = Vendor.objects.filter(**vendor_filter).count()
    total_clients = Client.objects.filter(**client_filter).count()

    total_profiles = Candidate.objects.filter(**candidate_filter).count()

    today_profiles = Candidate.objects.filter(
        **candidate_filter,
        created_at__date=today
    ).count()

    today_submitted_profiles = Candidate.objects.filter(
        **candidate_filter,
        created_at__date=today,
        verification_status=True
    ).count()

    total_pipelines = Candidate.objects.filter(
        **candidate_filter,
        verification_status=True
    ).filter(
        Q(main_status__iexact="SCREENING") |
        Q(main_status__iexact="L1") |
        Q(main_status__iexact="L2") |
        Q(main_status__iexact="L3") |
        Q(main_status__iexact="OTHER")
    ).count()

    data = {
        "user_name": user.get_full_name() or user.email,
        "total_vendors": total_vendors,
        "total_clients": total_clients,
        "total_profiles": total_profiles,
        "today_profiles": today_profiles,
        "today_submitted_profiles": today_submitted_profiles,
        "total_pipelines": total_pipelines,
    }

    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def today_verified_candidates(request):
    user = request.user
    today = now().date()

    queryset = Candidate.objects.filter(
        created_at__date=today,
        verification_status=True
    )

    if user.role != "SUB_ADMIN":
        queryset = queryset.filter(created_by=user)

    queryset = queryset.select_related("vendor", "client").order_by("-created_at")

    serializer = TodayCandidateSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def active_pipeline_candidates(request):
    user = request.user

    queryset = Candidate.objects.filter(
        verification_status=True
    ).filter(
        Q(main_status__iexact="SCREENING") |
        Q(main_status__iexact="L1") |
        Q(main_status__iexact="L2") |
        Q(main_status__iexact="L3") |
        Q(main_status__iexact="OTHER")
    )

    if user.role != "SUB_ADMIN":
        queryset = queryset.filter(created_by=user)

    queryset = queryset.select_related("vendor", "client").order_by("-created_at")

    serializer = TodayCandidateSerializer(queryset, many=True)
    return Response(serializer.data)


#==============User Management=================
from rest_framework.permissions import BasePermission
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication


class IsSubAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "SUB_ADMIN"


class SubAdminUserListCreateAPIView(generics.ListCreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsSubAdmin]
    serializer_class = UserCreateSerializer

    def get_queryset(self):
        return User.objects.filter(role="EMPLOYEE").order_by("-id")

class SubAdminUserUpdateAPIView(generics.RetrieveUpdateAPIView):
    authentication_classes = [JWTAuthentication]
    serializer_class = UserCreateSerializer
    permission_classes = [IsSubAdmin]

    def get_queryset(self):
        return User.objects.filter(role="EMPLOYEE")

# ==================================================================