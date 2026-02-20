
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


# # Create your views here.
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def dashboard_stats(request):
#     user = request.user
#     today = now().date()

#     if user.role == "SUB_ADMIN":
#         candidate_filter = {}
#         vendor_filter = {}
#         client_filter = {}
#     else:
#         candidate_filter = {"created_by": user}
#         vendor_filter = {"created_by": user}
#         client_filter = {"created_by": user}

#     total_vendors = Vendor.objects.filter(**vendor_filter).count()
#     total_clients = Client.objects.filter(**client_filter).count()

#     total_profiles = Candidate.objects.filter(**candidate_filter).count()

#     today_profiles = Candidate.objects.filter(
#         **candidate_filter,
#         created_at__date=today
#     ).count()

#     today_submitted_profiles = Candidate.objects.filter(
#         **candidate_filter,
#         created_at__date=today,
#         verification_status=True
#     ).count()

#     total_pipelines = Candidate.objects.filter(
#         **candidate_filter,
#         verification_status=True
#     ).filter(
#         Q(main_status__iexact="SCREENING") |
#         Q(main_status__iexact="L1") |
#         Q(main_status__iexact="L2") |
#         Q(main_status__iexact="L3") |
#         Q(main_status__iexact="OTHER")
#     ).count()

#     data = {
#         "user_name": user.get_full_name() or user.email,
#         "total_vendors": total_vendors,
#         "total_clients": total_clients,
#         "total_profiles": total_profiles,
#         "today_profiles": today_profiles,
#         "today_submitted_profiles": today_submitted_profiles,
#         "total_pipelines": total_pipelines,
#     }

#     return Response(data)


from django.utils.timezone import now
from datetime import timedelta

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    today = now().date()
    two_days_ago = now() - timedelta(days=2)

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

    # ✅ Updated Pipeline Count Logic
    total_pipelines = Candidate.objects.filter(
        **candidate_filter,
        verification_status=True
    ).filter(
        Q(main_status__iexact="SCREENING") |
        Q(main_status__iexact="L1") |
        Q(main_status__iexact="L2") |
        Q(main_status__iexact="L3") |
        Q(main_status__iexact="OTHER")
    ).exclude(
        sub_status="REJECTED"
    ).filter(
        Q(sub_status="ON_HOLD", created_at__gte=two_days_ago) |
        ~Q(sub_status="ON_HOLD")
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




# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def active_pipeline_candidates(request):
#     user = request.user

#     queryset = Candidate.objects.filter(
#         verification_status=True
#     ).filter(
#         Q(main_status__iexact="SCREENING") |
#         Q(main_status__iexact="L1") |
#         Q(main_status__iexact="L2") |
#         Q(main_status__iexact="L3") |
#         Q(main_status__iexact="OTHER")
#     )

#     if user.role != "SUB_ADMIN":
#         queryset = queryset.filter(created_by=user)

#     queryset = queryset.select_related("vendor", "client").order_by("-created_at")

#     serializer = TodayCandidateSerializer(queryset, many=True)
#     return Response(serializer.data)


from django.utils.timezone import now
from datetime import timedelta

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def active_pipeline_candidates(request):
    user = request.user
    two_days_ago = now() - timedelta(days=2)

    queryset = Candidate.objects.filter(
        verification_status=True
    ).filter(
        Q(main_status__iexact="SCREENING") |
        Q(main_status__iexact="L1") |
        Q(main_status__iexact="L2") |
        Q(main_status__iexact="L3") |
        Q(main_status__iexact="OTHER")
    ).exclude(
        sub_status="REJECTED"   # ❌ instantly remove
    ).filter(
        Q(sub_status="ON_HOLD", created_at__gte=two_days_ago) |
        ~Q(sub_status="ON_HOLD")   # ⏳ ON_HOLD only 2 days
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

# views.py

from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter

from employee_portal.models import Candidate
from employee_portal.serializers import CandidateListSerializer
from employee_portal.candidate_filters import CandidateFilter


class AdminCandidateListAPIView(generics.ListAPIView):
    serializer_class = CandidateListSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = CandidateFilter

    search_fields = [
        "candidate_name",
        "candidate_email",
        "skills",
        "technology",
        "vendor_company_name",
    ]

    ordering_fields = "__all__"

    def get_queryset(self):
        user = self.request.user

        # 🔐 Role Check
        if user.role not in ["CENTRAL_ADMIN", "SUB_ADMIN"]:
            raise PermissionDenied("You do not have permission to access this data.")

        return Candidate.objects.all().order_by("-created_at")


# views.py

from django.db.models import Q
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from employee_portal.models import Vendor
from employee_portal.serializers import VendorDetailSerializer
# from employee_portal.authentication import CsrfExemptSessionAuthentication

class AdminVendorFullListAPIView(ListAPIView):
    # authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = VendorDetailSerializer

    def get_queryset(self):
        user = self.request.user

        # 🔐 Role Restriction
        if user.role not in ["CENTRAL_ADMIN", "SUB_ADMIN"]:
            raise PermissionDenied("You do not have permission to access this data.")

        queryset = Vendor.objects.all().order_by("-created_at")

        # 🔍 GLOBAL SEARCH
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(company_name__icontains=search) |
                Q(email__icontains=search) |
                Q(number__icontains=search) |
                Q(company_pan_or_reg_no__icontains=search) |
                Q(poc1_name__icontains=search) |
                Q(poc2_name__icontains=search) |
                Q(top_3_clients__icontains=search) |
                Q(specialized_tech_developers__icontains=search) |
                Q(onsite_location__icontains=search)
            )

        return queryset    
# =================================================================================================

from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from employee_portal.models import Client
from .serializers import ClientListSerializer

class AdminClientListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ClientListSerializer

    def get_queryset(self):
        user = self.request.user

        # 🔐 Role Restriction
        if user.role not in ["CENTRAL_ADMIN", "SUB_ADMIN"]:
            raise PermissionDenied("You do not have permission to access this data.")

        return Client.objects.select_related("created_by").order_by("-created_at")
    