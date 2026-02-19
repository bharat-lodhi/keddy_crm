from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from landing.views import CsrfExemptSessionAuthentication
from .serializers import ClientSerializer,VendorDetailSerializer,VendorSingleDetailSerializer,VendorUpdateSerializer,VendorCreateSerializer,CandidateCreateSerializer,CandidateCreateSerializer,CandidateUpdateSerializer,CandidateDetailSerializer
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
import os
from django.core.files.storage import default_storage


from .resume_parser.extractor import extract_text_from_resume
from .resume_parser.parser import extract_skills_from_text
from .models import Candidate,Vendor,Client
from rest_framework import status
from rest_framework.generics import ListAPIView
from django.db.models import Q

User = get_user_model()

#====================verders============================================
class VendorCreateAPIView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = VendorCreateSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        vendor = serializer.save(
            uploaded_by=request.user
        )
        vendor = serializer.save(
            created_by=request.user
        )
        return Response(
            {
                "message": "Vendor created successfully",
                "vendor_id": vendor.id
            },
            status=status.HTTP_201_CREATED
        )


class VendorUpdateAPIView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def put(self, request, vendor_id):
        vendor = get_object_or_404(
            Vendor,
            id=vendor_id,
            uploaded_by=request.user
        )

        serializer = VendorUpdateSerializer(
            vendor,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Vendor updated successfully"},
            status=status.HTTP_200_OK
        )



class VendorFullListAPIView(ListAPIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = VendorDetailSerializer

    def get_queryset(self):
        queryset = Vendor.objects.all().order_by("-created_at")

        # 🔍 GLOBAL SEARCH (optional)
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
                Q(specialized_tech_developers__icontains=search)|
                Q(onsite_location__icontains=search)
            )

        return queryset
    
    
class UserVendorFullListAPIView(ListAPIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    serializer_class = VendorDetailSerializer

    def get_queryset(self):
        queryset = Vendor.objects.filter(
            created_by=self.request.user
        ).order_by("-created_at")

        # 🔍 GLOBAL SEARCH (optional)
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
                Q(specialized_tech_developers__icontains=search)|
                Q(onsite_location__icontains=search)
            )

        return queryset
    

class VendorDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, vendor_id):
        vendor = get_object_or_404(Vendor, id=vendor_id)

        serializer = VendorSingleDetailSerializer(vendor)
        return Response(serializer.data)


class VendorDeleteAPIView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def delete(self, request, vendor_id):
        user = request.user

        if user.role not in ["CENTRAL_ADMIN", "SUB_ADMIN","EMPLOYEE"]:
            return Response(
                {"detail": "You do not have permission to delete vendor"},
                status=status.HTTP_403_FORBIDDEN
            )

        vendor = get_object_or_404(Vendor, id=vendor_id)
        vendor.delete()

        return Response(
            {"message": "Vendor deleted successfully"},
            status=status.HTTP_200_OK
        )
# ===========================Clients============================================
from rest_framework import generics

class ClientCreateAPIView(generics.CreateAPIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Client.objects.all()
    serializer_class = ClientSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        serializer.save(created_by=request.user)

        return Response(
            {
                "message": "Client created successfully",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated


class ClientListAPIView(generics.ListAPIView):
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Client.objects.filter(
            created_by=self.request.user
        ).order_by('-created_at')

    
# =========================Candidate==========================================


class EmployeeDropdownAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        employees = User.objects.filter(
            role="EMPLOYEE"
        ).values("id", "first_name", "last_name")
        return Response(employees)


import io
from pdfminer.high_level import extract_text
from docx import Document

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .serializers import ResumeUploadSerializer
from .utils import parse_resume_text


def read_resume_file(uploaded_file):
    filename = uploaded_file.name.lower()

    if filename.endswith(".pdf"):
        file_stream = io.BytesIO(uploaded_file.read())
        return extract_text(file_stream)

    elif filename.endswith(".docx"):
        document = Document(uploaded_file)
        return "\n".join([p.text for p in document.paragraphs])

    elif filename.endswith(".txt"):
        return uploaded_file.read().decode("utf-8")

    else:
        raise ValueError("Unsupported file format")


class ResumeParseAPIView(APIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = ResumeUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        resume_file = serializer.validated_data['resume']

        text = read_resume_file(resume_file)

        parsed_data = parse_resume_text(text)

        return Response(
            {
                "message": "Resume parsed successfully",
                "data": parsed_data
            },
            status=status.HTTP_200_OK
        )

#=========================Candidate=========================


class CandidateCreateAPIView(generics.CreateAPIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Candidate.objects.all()
    serializer_class = CandidateCreateSerializer
    permission_classes = (IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(
            {
                "message": "Candidate created successfully",
                "data": serializer.data
            },
            status=status.HTTP_201_CREATED
        )


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter

from .candidate_filters import CandidateFilter


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter

from .models import Candidate
from .serializers import CandidateListSerializer
from .candidate_filters import CandidateFilter


class CandidateListAPIView(generics.ListAPIView):
    queryset = Candidate.objects.all().order_by("-id")
    serializer_class = CandidateListSerializer
    permission_classes = (IsAuthenticated,)

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

class UserCandidateListAPIView(generics.ListAPIView):
    serializer_class = CandidateListSerializer
    permission_classes = (IsAuthenticated,)

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
        return Candidate.objects.filter(
            created_by=self.request.user
        ).order_by("-id")


class CandidateUpdateAPIView(generics.RetrieveUpdateAPIView):
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = (IsAuthenticated,)
    queryset = Candidate.objects.all()
    serializer_class = CandidateUpdateSerializer
    permission_classes = (IsAuthenticated,)

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(
            {
                "message": "Candidate updated successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated


class CandidateDetailAPIView(generics.RetrieveAPIView):
    queryset = Candidate.objects.all()
    serializer_class = CandidateDetailSerializer
    permission_classes = (IsAuthenticated,)


#=============================Employee Dashboard====================================================
from django.utils.timezone import now
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from employee_portal.models import Vendor, Client, Candidate
from .serializers import DashboardStatsSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    today = now().date()

    total_vendors = Vendor.objects.filter(created_by=user).count()
    # total_clients = Client.objects.filter(created_at__isnull=False).count()
    total_clients = Client.objects.filter(created_by=user).count()

    total_profiles = Candidate.objects.filter(created_by=user).count()

    today_profiles = Candidate.objects.filter(
        created_by=user,
        created_at__date=today
    ).count()

    today_submitted_profiles = Candidate.objects.filter(
        created_by=user,
        created_at__date=today,
        verification_status=True
    ).count()
    
    total_pipelines = Candidate.objects.filter(
        Q(created_by=user) | Q(submitted_to=user),
        verification_status=True
    ).filter(
        Q(main_status__iexact="SCREENING") |
        Q(main_status__iexact="L1") |
        Q(main_status__iexact="L2") |
        Q(main_status__iexact="L3") |
        Q(main_status__iexact="OTHER")
    ).select_related("vendor", "client").count()
    
    data = {
        "user_name": user.get_full_name() or user.email,
        "total_vendors": total_vendors,
        "total_clients": total_clients,
        "total_profiles": total_profiles,
        "today_profiles": today_profiles,
        "today_submitted_profiles": today_submitted_profiles,
        "total_pipelines":total_pipelines,
    }

    serializer = DashboardStatsSerializer(data)
    return Response(serializer.data)

from .serializers import TodayCandidateSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def today_user_candidates(request):
    user = request.user
    today = now().date()

    candidates = Candidate.objects.filter(
        created_by=user,
        created_at__date=today
    ).select_related("vendor", "client").order_by("-created_at")

    serializer = TodayCandidateSerializer(candidates, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def today_verified_candidates(request):
    user = request.user
    today = now().date()

    candidates = Candidate.objects.filter(
        created_by=user,
        created_at__date=today,
        verification_status=True
    ).select_related("vendor", "client").order_by("-created_at")

    serializer = TodayCandidateSerializer(candidates, many=True)
    return Response(serializer.data)


from django.db.models import Q


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def active_pipeline_candidates(request):
#     user = request.user

#     candidates = Candidate.objects.filter(
#         created_by=user,verification_status=True
#     ).filter(
#         Q(main_status__iexact="SCREENING") |
#         Q(main_status__iexact="L1") |
#         Q(main_status__iexact="L2") |
#         Q(main_status__iexact="L3") |
#         Q(main_status__iexact="OTHER")
#     ).select_related("vendor", "client").order_by("-created_at")

#     serializer = TodayCandidateSerializer(candidates, many=True)
#     return Response(serializer.data)

from django.db.models import Q

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def active_pipeline_candidates(request):
    user = request.user

    candidates = Candidate.objects.filter(
        Q(created_by=user) | Q(submitted_to=user),
        verification_status=True
    ).filter(
        Q(main_status__iexact="SCREENING") |
        Q(main_status__iexact="L1") |
        Q(main_status__iexact="L2") |
        Q(main_status__iexact="L3") |
        Q(main_status__iexact="OTHER")
    ).select_related("vendor", "client").order_by("-created_at")

    serializer = TodayCandidateSerializer(candidates, many=True)
    return Response(serializer.data)


from django.utils.timezone import now
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def today_team_submissions(request):
#     user = request.user
#     today = now().date()

#     candidates = Candidate.objects.filter(
#         submitted_to=user,
#         created_at__date=today,
#         verification_status=True
#     ).exclude(
#         created_by=user
#     ).select_related("vendor", "client").order_by("-created_at")

#     serializer = TodayCandidateSerializer(candidates, many=True)
#     return Response(serializer.data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def today_team_submissions(request):
    user = request.user
    today = now().date()

    candidates = Candidate.objects.filter(
        submitted_to=user,
        created_at__date=today
    ).exclude(
        created_by=user
    ).select_related("vendor", "client").order_by("-created_at")

    serializer = TodayCandidateSerializer(candidates, many=True)
    return Response(serializer.data)


# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def all_team_submissions(request):
#     user = request.user

#     candidates = Candidate.objects.filter(
#         submitted_to=user,
#         verification_status=True
#     ).exclude(
#         created_by=user
#     ).select_related("vendor", "client").order_by("-created_at")

#     serializer = TodayCandidateSerializer(candidates, many=True)
#     return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def all_team_submissions(request):
    user = request.user

    candidates = Candidate.objects.filter(
        submitted_to=user
    ).exclude(
        created_by=user
    ).select_related("vendor", "client").order_by("-created_at")

    serializer = TodayCandidateSerializer(candidates, many=True)
    return Response(serializer.data)
