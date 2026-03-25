
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response

from employee_portal.models import Vendor, Client, Candidate
from employee_portal.serializers import TodayCandidateSerializer
from django.contrib.auth import get_user_model
User = get_user_model()

from rest_framework import generics
from .serializers import UserCreateSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from django.utils.timezone import now
from datetime import timedelta
from jd_mapping.models import Requirement

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def dashboard_stats(request):
#     user = request.user
#     UserModel = get_user_model()

#     today = now().date()
#     two_days_ago = now() - timedelta(days=2)

#     # ===== Company Isolation =====
#     if user.role == "SUB_ADMIN":
#         company_root = user
#     elif user.role == "EMPLOYEE" and user.parent_user:
#         company_root = user.parent_user
#     else:
#         return Response({"detail": "Invalid role."}, status=403)

#     company_users = UserModel.objects.filter(
#         Q(id=company_root.id) | Q(parent_user=company_root)
#     )

#     # ===== Vendors (exclude soft deleted) =====
#     total_vendors = Vendor.objects.filter(
#         created_by__in=company_users,
#         is_deleted=False
#     ).count()

#     # ===== Clients (exclude soft deleted) =====
#     total_clients = Client.objects.filter(
#         created_by__in=company_users,
#         is_deleted=False
#     ).count()

#     # ===== Candidates (exclude soft deleted) =====
#     total_profiles = Candidate.objects.filter(
#         created_by__in=company_users,
#         is_deleted=False
#     ).count()

#     today_profiles = Candidate.objects.filter(
#         created_by__in=company_users,
#         created_at__date=today,
#         is_deleted=False
#     ).count()
    

#     today_submitted_profiles = Candidate.objects.filter(
#         created_by__in=company_users,
#         created_at__date=today,
#         verification_status=True,
#         is_deleted=False
#     ).count()

#     # ===== Pipeline Count =====
#     total_pipelines = Candidate.objects.filter(
#         created_by__in=company_users,
#         verification_status=True,
#         is_deleted=False
#     ).filter(
#         Q(main_status__iexact="SCREENING") |
#         Q(main_status__iexact="L1") |
#         Q(main_status__iexact="L2") |
#         Q(main_status__iexact="L3") |
#         Q(main_status__iexact="OTHER")
#     ).exclude(
#         sub_status="REJECTED"
#     ).filter(
#         Q(sub_status="ON_HOLD", created_at__gte=two_days_ago) |
#         ~Q(sub_status="ON_HOLD")
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



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    UserModel = get_user_model()

    today = now().date()
    two_days_ago = now() - timedelta(days=2)

    # ===== Company Isolation =====
    if user.role == "SUB_ADMIN":
        company_root = user
    elif user.role == "EMPLOYEE" and user.parent_user:
        company_root = user.parent_user
    else:
        return Response({"detail": "Invalid role."}, status=403)

    company_users = UserModel.objects.filter(
        Q(id=company_root.id) | Q(parent_user=company_root)
    )

    # ===== Employees =====
    total_employees = UserModel.objects.filter(
        parent_user=company_root,
        role__in=["EMPLOYEE", "ACCOUNTANT"],
    ).count()

    # ===== Vendors =====
    total_vendors = Vendor.objects.filter(
        created_by__in=company_users,
        is_deleted=False
    ).count()

    # ===== Clients =====
    total_clients = Client.objects.filter(
        created_by__in=company_users,
        is_deleted=False
    ).count()

    # ===== Profiles =====
    total_profiles = Candidate.objects.filter(
        created_by__in=company_users,
        is_deleted=False
    ).count()

    today_profiles = Candidate.objects.filter(
        created_by__in=company_users,
        created_at__date=today,
        is_deleted=False
    ).count()

    # ===== Submitted Profiles =====
    today_submitted_profiles = Candidate.objects.filter(
        created_by__in=company_users,
        created_at__date=today,
        verification_status=True,
        client__isnull=False,
        is_deleted=False
    ).filter(
        Q(submitted_to__isnull=False) | Q(client__isnull=False)
    ).count()

    total_submitted_profiles = Candidate.objects.filter(
        created_by__in=company_users,
        verification_status=True,
        is_deleted=False
    ).filter(
        Q(submitted_to__isnull=False) | Q(client__isnull=False)
    ).count()

    # ===== Onboard =====
    onboard_profiles = Candidate.objects.filter(
        created_by__in=company_users,
        main_status="ONBORD",
        is_deleted=False
    ).count()

    # ===== Team Pipeline =====
    team_pipeline = Candidate.objects.filter(
        created_by__in=company_users,
        verification_status=True,
        is_deleted=False
    ).filter(
        Q(main_status__in=["SCREENING", "L1", "L2", "L3", "OTHER"])
    ).exclude(
        sub_status="REJECTED"
    ).filter(
        Q(sub_status="ON_HOLD", created_at__gte=two_days_ago) |
        ~Q(sub_status="ON_HOLD")
    ).count()
    
    # ===== Today's Requirements (JDs) =====
    # JDs created by user today
    today_created_jds = Requirement.objects.filter(
        created_by=user,
        created_at__date=today,
        is_deleted=False
    ).count()
    
    # JDs assigned to user today
    today_assigned_jds = Requirement.objects.filter(
        assignments__assigned_to=user,
        created_at__date=today,
        is_deleted=False
    ).distinct().count()
    
    # Total today's requirements (created + assigned)
    today_total_requirements = today_created_jds + today_assigned_jds
    
    # ==============================================================

    data = {
        "user_name": user.get_full_name() or user.email,

        "total_employees": total_employees,
        "total_vendors": total_vendors,
        "total_clients": total_clients,

        "total_profiles": total_profiles,
        "today_profiles": today_profiles,

        "today_submitted_profiles": today_submitted_profiles,
        "total_submitted_profiles": total_submitted_profiles,

        "onboard_profiles": onboard_profiles,
        "team_pipeline": team_pipeline,
        
        "today_requirements": today_total_requirements,
    }

    return Response(data)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def today_verified_candidates(request):
    user = request.user
    UserModel = get_user_model()

    today = now().date()

    # ===== Company Isolation =====
    if user.role == "SUB_ADMIN":
        company_root = user
    elif user.role == "EMPLOYEE" and user.parent_user:
        company_root = user.parent_user
    else:
        return Response({"detail": "Invalid role."}, status=403)

    company_users = UserModel.objects.filter(
        Q(id=company_root.id) | Q(parent_user=company_root)
    )

    queryset = Candidate.objects.filter(
        created_at__date=today,
        verification_status=True,
        created_by__in=company_users,
        client__isnull=False,
        is_deleted=False  # ✅ Exclude soft deleted
    )

    queryset = queryset.select_related("vendor", "client").order_by("-created_at")

    serializer = TodayCandidateSerializer(queryset, many=True)
    return Response(serializer.data)

from django.db.models import Q
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def last_7_days_verified_candidates(request):
    user = request.user
    UserModel = get_user_model()

    today = now().date()
    seven_days_ago = today - timedelta(days=7)

    # ===== Company Isolation =====
    if user.role == "SUB_ADMIN":
        company_root = user
    elif user.role == "EMPLOYEE" and user.parent_user:
        company_root = user.parent_user
    else:
        return Response({"detail": "Invalid role."}, status=403)

    company_users = UserModel.objects.filter(
        Q(id=company_root.id) | Q(parent_user=company_root)
    )

    queryset = Candidate.objects.filter(
        created_at__date__range=(seven_days_ago, today),
        verification_status=True,
        created_by__in=company_users,
        is_deleted=False  # ✅ Exclude soft deleted
    ).select_related("vendor", "client").order_by("-created_at")

    serializer = TodayCandidateSerializer(queryset, many=True)
    return Response(serializer.data)

from django.utils.timezone import now
from datetime import timedelta

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def active_pipeline_candidates(request):
    user = request.user
    UserModel = get_user_model()

    two_days_ago = now() - timedelta(days=2)

    # ===== Company Isolation =====
    if user.role == "SUB_ADMIN":
        company_root = user
    elif user.role == "EMPLOYEE" and user.parent_user:
        company_root = user.parent_user
    else:
        return Response({"detail": "Invalid role."}, status=403)

    company_users = UserModel.objects.filter(
        Q(id=company_root.id) | Q(parent_user=company_root)
    )

    queryset = Candidate.objects.filter(
        verification_status=True,
        created_by__in=company_users,
        is_deleted=False  # ✅ Exclude soft deleted
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
    )

    queryset = queryset.select_related("vendor", "client").order_by("-created_at")

    serializer = TodayCandidateSerializer(queryset, many=True)
    return Response(serializer.data)


#==============User Management=================
from rest_framework.permissions import BasePermission
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication


# class IsSubAdmin(BasePermission):
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role == "SUB_ADMIN"


# @method_decorator(csrf_exempt, name="dispatch")
# class SubAdminUserListCreateAPIView(generics.ListCreateAPIView):
#     # authentication_classes = [JWTAuthentication]
#     permission_classes = [IsSubAdmin]
#     serializer_class = UserCreateSerializer

#     def get_queryset(self):
#         return User.objects.filter(role="EMPLOYEE").order_by("-id")

# class SubAdminUserUpdateAPIView(generics.RetrieveUpdateAPIView):
#     # authentication_classes = [JWTAuthentication]
#     serializer_class = UserCreateSerializer
#     permission_classes = [IsSubAdmin]

#     def get_queryset(self):
#         return User.objects.filter(role="EMPLOYEE")

from rest_framework import generics
from rest_framework.permissions import BasePermission
from rest_framework.authentication import SessionAuthentication
from .serializers import UserCreateSerializer

from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return

class IsSubAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == "SUB_ADMIN"
        )


# class SubAdminUserListCreateAPIView(generics.ListCreateAPIView):
#     authentication_classes = (CsrfExemptSessionAuthentication,)
#     # authentication_classes = [SessionAuthentication]
#     permission_classes = [IsSubAdmin]
#     serializer_class = UserCreateSerializer

#     def get_queryset(self):
#         return User.objects.filter(role="EMPLOYEE").order_by("-id")


from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

# class SubAdminUserListCreateAPIView(generics.ListCreateAPIView):
#     authentication_classes = (JWTAuthentication,)
#     permission_classes = [IsAuthenticated, IsSubAdmin]
#     serializer_class = UserCreateSerializer

#     def get_queryset(self):
#         user = self.request.user
#         return User.objects.filter(
#             role="EMPLOYEE",
#             parent_user=user
#         ).order_by("-id")

#     def get_serializer_context(self):
#         context = super().get_serializer_context()
#         context["request"] = self.request
#         return context


# class SubAdminUserListCreateAPIView(generics.ListCreateAPIView):
#     authentication_classes = (JWTAuthentication,)
#     permission_classes = [IsAuthenticated, IsSubAdmin]
#     serializer_class = UserCreateSerializer

#     def get_queryset(self):
#         user = self.request.user
#         return User.objects.filter(
#             role__in=["EMPLOYEE", "ACCOUNTANT"],
#             parent_user=user
#         ).order_by("-id")

#     def get_serializer_context(self):
#         context = super().get_serializer_context()
#         context["request"] = self.request
#         return context

class SubAdminUserListCreateAPIView(generics.ListCreateAPIView):
    authentication_classes = (JWTAuthentication,)
    permission_classes = [IsAuthenticated, IsSubAdmin]
    serializer_class = UserCreateSerializer

    def get_queryset(self):
        user = self.request.user
        return User.objects.filter(
            role__in=["EMPLOYEE", "ACCOUNTANT"],
            parent_user=user
        ).order_by("-id")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            if user.role == "EMPLOYEE":
                message = "Recruiter created successfully."

            elif user.role == "ACCOUNTANT":
                message = "Accountant created successfully."

            else:
                message = "User created successfully."

            return Response(
                {
                    "success": True,
                    "message": message,
                    "data": UserCreateSerializer(user).data
                },
                status=201
            )

        return Response(
            {
                "success": False,
                "message": "User creation failed.",
                "errors": serializer.errors
            },
            status=400
        )

# class SubAdminUserUpdateAPIView(generics.RetrieveUpdateAPIView):
#     authentication_classes = (JWTAuthentication,)
#     permission_classes = [IsAuthenticated, IsSubAdmin]
#     serializer_class = UserCreateSerializer

#     def get_queryset(self):
#         user = self.request.user
#         return User.objects.filter(
#             role="EMPLOYEE",
#             parent_user=user
#         )

#     def get_serializer_context(self):
#         context = super().get_serializer_context()
#         context["request"] = self.request
#         return context

#     def update(self, request, *args, **kwargs):
#         partial = True  # ✅ allow partial updates
#         instance = self.get_object()

#         serializer = self.get_serializer(
#             instance,
#             data=request.data,
#             partial=partial,
#             context={"request": request}
#         )

#         serializer.is_valid(raise_exception=True)
#         self.perform_update(serializer)

#         return Response(
#             {
#                 "message": "Employee updated successfully",
#                 "data": serializer.data
#             }
#         )

class SubAdminUserUpdateAPIView(generics.RetrieveUpdateAPIView):
    authentication_classes = (JWTAuthentication,)
    permission_classes = [IsAuthenticated, IsSubAdmin]
    serializer_class = UserCreateSerializer

    def get_queryset(self):
        user = self.request.user
        return User.objects.filter(
            role__in=["EMPLOYEE", "ACCOUNTANT"],
            parent_user=user
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()

        role = request.data.get("role")
        if role and role not in ["EMPLOYEE", "ACCOUNTANT"]:
            return Response(
                {"message": "Only EMPLOYEE or ACCOUNTANT role allowed."},
                status=400
            )

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        updated_user = serializer.instance

        if updated_user.role == "EMPLOYEE":
            message = "Recruiter updated successfully."
        elif updated_user.role == "ACCOUNTANT":
            message = "Accountant updated successfully."
        else:
            message = "User updated successfully."

        return Response(
            {
                "success": True,
                "message": message,
                "data": serializer.data
            }
        )

      
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

#Soft Delete
# class SubAdminUserSoftDeleteAPIView(APIView):
#     authentication_classes = (CsrfExemptSessionAuthentication,)
#     permission_classes = [IsSubAdmin]

#     def delete(self, request, user_id):
#         subadmin = request.user

#         user = get_object_or_404(
#             User,
#             id=user_id,
#             role="EMPLOYEE",
#             parent_user=subadmin
#         )

#         user.is_active = False  # ✅ soft delete
#         user.save()

#         return Response(
#             {"message": "Employee soft deleted successfully"},
#             status=status.HTTP_200_OK
#         )


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status

class SubAdminUserSoftDeleteAPIView(APIView):
    authentication_classes = (JWTAuthentication,)
    permission_classes = [IsAuthenticated, IsSubAdmin]

    def delete(self, request, user_id):
        subadmin = request.user

        user = get_object_or_404(
            User,
            id=user_id,
            role="EMPLOYEE",
            parent_user=subadmin
        )

        user.is_active = False  # ✅ soft delete
        user.save()

        return Response(
            {"message": "Employee soft deleted successfully"},
            status=status.HTTP_200_OK
        )


#Hard delete --
# class SubAdminUserHardDeleteAPIView(APIView):
#     authentication_classes = (CsrfExemptSessionAuthentication,)
#     permission_classes = [IsSubAdmin]

#     def delete(self, request, user_id):
#         subadmin = request.user

#         user = get_object_or_404(
#             User,
#             id=user_id,
#             role="EMPLOYEE",
#             parent_user=subadmin
#         )

#         user.delete()  # ❌ permanent delete

#         return Response(
#             {"message": "Employee permanently deleted"},
#             status=status.HTTP_200_OK
#         )  

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status

class SubAdminUserHardDeleteAPIView(APIView):
    authentication_classes = (JWTAuthentication,)
    permission_classes = [IsAuthenticated, IsSubAdmin]

    def delete(self, request, user_id):
        subadmin = request.user

        user = get_object_or_404(
            User,
            id=user_id,
            role="EMPLOYEE",
            parent_user=subadmin
        )

        user.delete()  # ❌ permanent delete

        return Response(
            {"message": "Employee permanently deleted"},
            status=status.HTTP_200_OK
        )
        
#User-restore-api
# class SubAdminUserRestoreAPIView(APIView):
#     authentication_classes = (CsrfExemptSessionAuthentication,)
    
#     permission_classes = [IsSubAdmin]

#     def patch(self, request, user_id):
#         subadmin = request.user

#         user = get_object_or_404(
#             User,
#             id=user_id,
#             role="EMPLOYEE",
#             parent_user=subadmin
#         )

#         user.is_active = True  # ✅ restore
#         user.save()

#         return Response(
#             {"message": "Employee restored successfully"},
#             status=status.HTTP_200_OK
#         )        


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status

class SubAdminUserRestoreAPIView(APIView):
    authentication_classes = (JWTAuthentication,)
    permission_classes = [IsAuthenticated, IsSubAdmin]

    def patch(self, request, user_id):
        subadmin = request.user

        user = get_object_or_404(
            User,
            id=user_id,
            role="EMPLOYEE",
            parent_user=subadmin
        )

        user.is_active = True  # ✅ restore
        user.save()

        return Response(
            {"message": "Employee restored successfully"},
            status=status.HTTP_200_OK
        )
# ==================================================================

from django.db.models import Q
from rest_framework import generics

from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter

from employee_portal.models import Candidate
from employee_portal.serializers import CandidateListSerializer
from employee_portal.candidate_filters import CandidateFilter


# class AdminCandidateListAPIView(generics.ListAPIView):
#     serializer_class = CandidateListSerializer
#     permission_classes = [IsAuthenticated]

#     filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
#     filterset_class = CandidateFilter

#     search_fields = [
#         "candidate_name",
#         "candidate_email",
#         "skills",
#         "technology",
#         "vendor_company_name",
#     ]

#     ordering_fields = "__all__"

#     def get_queryset(self):
#         user = self.request.user

#         # 🔐 Role Check
#         if user.role not in ["SUB_ADMIN","CENTRAL_ADMIN"]:
#             raise PermissionDenied("You do not have permission to access this data.")

#         return Candidate.objects.all().order_by("-created_at")

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
        "vendor__company_name",
    ]

    ordering_fields = "__all__"

    def get_queryset(self):
        user = self.request.user

        if user.role != "SUB_ADMIN":
            raise PermissionDenied("You do not have permission to access this data.")

        # Company users (SubAdmin + employees)
        company_users = User.objects.filter(
            Q(id=user.id) | Q(parent_user=user)
        )

        return Candidate.objects.filter(
            created_by__in=company_users,
            is_deleted=False   # 🔐 Hide soft deleted
        ).select_related(
            "vendor",
            "created_by",
            "submitted_to"
        ).order_by("-created_at")
        
        
from django.db.models import Q
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from employee_portal.models import Vendor
from employee_portal.serializers import VendorDetailSerializer
# from employee_portal.authentication import CsrfExemptSessionAuthentication

class AdminVendorFullListAPIView(ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = VendorDetailSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role != "SUB_ADMIN":
            raise PermissionDenied("Only SubAdmin allowed.")

        # Company users (SubAdmin + employees)
        company_users = User.objects.filter(
            Q(id=user.id) |
            Q(parent_user=user)
        )

        queryset = Vendor.objects.filter(
            created_by__in=company_users,
            is_deleted=False
        ).distinct().order_by("-created_at")

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
    
class VendorAssignAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user

        if user.role != "SUB_ADMIN":
            return Response(
                {"error": "Only SubAdmin can assign vendors."},
                status=status.HTTP_403_FORBIDDEN
            )

        vendor_id = request.data.get("vendor_id")
        employee_ids = request.data.get("employee_ids", [])

        if not vendor_id or not employee_ids:
            return Response(
                {"error": "vendor_id and employee_ids are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Company users
        company_users = User.objects.filter(
            Q(id=user.id) |
            Q(parent_user=user)
        )

        # Get vendor (company restricted)
        vendor = get_object_or_404(
            Vendor,
            id=vendor_id,
            created_by__in=company_users,
            is_deleted=False
        )

        # Get valid employees (only own employees)
        employees = User.objects.filter(
            id__in=employee_ids,
            parent_user=user,
            role="EMPLOYEE"
        )

        if not employees.exists():
            return Response(
                {"error": "No valid employees found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        vendor.assigned_employees.set(employees)

        return Response(
            {"message": "Vendor assigned successfully."},
            status=status.HTTP_200_OK
        )

class AdminVendorSoftDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, vendor_id):
        user = request.user

        if user.role != "SUB_ADMIN":
            return Response({"error": "Only SubAdmin allowed."}, status=403)

        company_users = User.objects.filter(
            Q(id=user.id) | Q(parent_user=user)
        )

        vendor = get_object_or_404(
            Vendor,
            id=vendor_id,
            created_by__in=company_users,
            is_deleted=False
        )

        vendor.is_deleted = True
        vendor.save(update_fields=["is_deleted"])

        return Response({"message": "Vendor soft deleted successfully."})
    
class AdminVendorRestoreAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, vendor_id):
        user = request.user

        if user.role != "SUB_ADMIN":
            return Response({"error": "Only SubAdmin allowed."}, status=403)

        company_users = User.objects.filter(
            Q(id=user.id) | Q(parent_user=user)
        )

        vendor = get_object_or_404(
            Vendor,
            id=vendor_id,
            created_by__in=company_users,
            is_deleted=True
        )

        vendor.is_deleted = False
        vendor.save(update_fields=["is_deleted"])

        return Response({"message": "Vendor restored successfully."})

class AdminVendorHardDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, vendor_id):
        user = request.user

        if user.role != "SUB_ADMIN":
            return Response({"error": "Only SubAdmin allowed."}, status=403)

        company_users = User.objects.filter(
            Q(id=user.id) | Q(parent_user=user)
        )

        vendor = get_object_or_404(
            Vendor,
            id=vendor_id,
            created_by__in=company_users
        )

        vendor.delete()

        return Response({"message": "Vendor permanently deleted."})

# =================================================================================================

from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView

from employee_portal.models import Client


from .serializers import SubAdminClientListSerializer
# class SubAdminClientListAPIView(generics.ListAPIView):
#     permission_classes = [IsAuthenticated]
#     serializer_class = SubAdminClientListSerializer

#     def get_queryset(self):
#         user = self.request.user

#         if user.role != "SUB_ADMIN":
#             return Client.objects.none()

#         # Company users (SubAdmin + employees)
#         company_users = User.objects.filter(
#             Q(id=user.id) | Q(parent_user=user)
#         )

#         return Client.objects.filter(
#             created_by__in=company_users,
#             is_deleted=False
#         ).distinct().order_by("-created_at")
        
        
from rest_framework.filters import SearchFilter
from django.db.models import Q

class SubAdminClientListAPIView(generics.ListAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = SubAdminClientListSerializer

    filter_backends = [SearchFilter]

    search_fields = [
        "client_name",
        "company_name",
        "phone_number",
    ]

    def get_queryset(self):

        user = self.request.user

        if user.role != "SUB_ADMIN":
            return Client.objects.none()

        # Company users (SubAdmin + employees)
        company_users = User.objects.filter(
            Q(id=user.id) | Q(parent_user=user)
        )

        return Client.objects.filter(
            created_by__in=company_users,
            is_deleted=False
        ).distinct().order_by("-created_at")
        
class SubAdminClientAssignAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.role != "SUB_ADMIN":
            return Response(
                {"error": "Only SubAdmin can assign clients."},
                status=403
            )

        client_id = request.data.get("client_id")
        employee_ids = request.data.get("employee_ids", [])

        if not client_id or not employee_ids:
            return Response(
                {"error": "client_id and employee_ids are required."},
                status=400
            )

        # Company users
        company_users = User.objects.filter(
            Q(id=user.id) | Q(parent_user=user)
        )

        # Get client (company restricted)
        client = get_object_or_404(
            Client,
            id=client_id,
            created_by__in=company_users,
            is_deleted=False
        )

        # Get valid employees (only own employees)
        employees = User.objects.filter(
            id__in=employee_ids,
            parent_user=user,
            role="EMPLOYEE"
        )

        if not employees.exists():
            return Response(
                {"error": "No valid employees found."},
                status=400
            )

        client.assigned_employees.set(employees)

        return Response(
            {"message": "Client assigned successfully."},
            status=200
        )

class SubAdminClientRevokeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.role != "SUB_ADMIN":
            return Response(
                {"error": "Only SubAdmin can revoke client assignment."},
                status=403
            )

        client_id = request.data.get("client_id")
        employee_id = request.data.get("employee_id")

        if not client_id or not employee_id:
            return Response(
                {"error": "client_id and employee_id are required."},
                status=400
            )

        # Company users
        company_users = User.objects.filter(
            Q(id=user.id) | Q(parent_user=user)
        )

        # Get client (company restricted)
        client = get_object_or_404(
            Client,
            id=client_id,
            created_by__in=company_users,
            is_deleted=False
        )

        # Validate employee (must belong to this SubAdmin)
        employee = get_object_or_404(
            User,
            id=employee_id,
            parent_user=user,
            role="EMPLOYEE"
        )

        # Remove assignment
        client.assigned_employees.remove(employee)

        return Response(
            {"message": "Client revoked successfully from employee."},
            status=200
        )

class SubAdminClientSoftDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, client_id):
        user = request.user

        if user.role != "SUB_ADMIN":
            return Response({"error": "Only SubAdmin allowed."}, status=403)

        company_users = User.objects.filter(
            Q(id=user.id) | Q(parent_user=user)
        )

        client = get_object_or_404(
            Client,
            id=client_id,
            created_by__in=company_users,
            is_deleted=False
        )

        client.is_deleted = True
        client.save(update_fields=["is_deleted"])

        return Response({"message": "Client soft deleted successfully."})

class SubAdminClientRestoreAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, client_id):
        user = request.user

        if user.role != "SUB_ADMIN":
            return Response({"error": "Only SubAdmin allowed."}, status=403)

        company_users = User.objects.filter(
            Q(id=user.id) | Q(parent_user=user)
        )

        client = get_object_or_404(
            Client,
            id=client_id,
            created_by__in=company_users,
            is_deleted=True
        )

        client.is_deleted = False
        client.save(update_fields=["is_deleted"])

        return Response({"message": "Client restored successfully."})
    
class SubAdminClientHardDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, client_id):
        user = request.user

        if user.role != "SUB_ADMIN":
            return Response({"error": "Only SubAdmin allowed."}, status=403)

        company_users = User.objects.filter(
            Q(id=user.id) | Q(parent_user=user)
        )

        client = get_object_or_404(
            Client,
            id=client_id,
            created_by__in=company_users
        )

        client.delete()

        return Response({"message": "Client permanently deleted."})
    

# ===============candiate-soft-delete,hard delete, restore=====
from django.db.models import Q
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied


# ================== BASE MIXIN (Company Isolation) ==================

class SubAdminCandidateBaseMixin:
    permission_classes = (IsAuthenticated,)

    def get_company_root(self, user):
        if user.role != "SUB_ADMIN":
            raise PermissionDenied("Only SubAdmin allowed.")
        return user

    def get_queryset(self):
        user = self.request.user
        UserModel = get_user_model()

        company_root = self.get_company_root(user)

        company_users = UserModel.objects.filter(
            Q(id=company_root.id) | Q(parent_user=company_root)
        )

        return Candidate.objects.filter(
            created_by__in=company_users
        )


# ================== SOFT DELETE ==================

class SubAdminCandidateSoftDeleteAPIView(SubAdminCandidateBaseMixin, generics.DestroyAPIView):

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.is_deleted:
            return Response(
                {"detail": "Candidate already soft deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance.is_deleted = True
        instance.changed_by = request.user
        instance.save(update_fields=["is_deleted", "changed_by"])

        return Response(
            {"message": "Candidate soft deleted successfully."},
            status=status.HTTP_200_OK
        )


# ================== RESTORE ==================

class SubAdminCandidateRestoreAPIView(SubAdminCandidateBaseMixin, generics.UpdateAPIView):

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        if not instance.is_deleted:
            return Response(
                {"detail": "Candidate is not deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance.is_deleted = False
        instance.changed_by = request.user
        instance.save(update_fields=["is_deleted", "changed_by"])

        return Response(
            {"message": "Candidate restored successfully."},
            status=status.HTTP_200_OK
        )


# ================== HARD DELETE ==================

class SubAdminCandidateHardDeleteAPIView(SubAdminCandidateBaseMixin, generics.DestroyAPIView):

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        instance.delete()

        return Response(
            {"message": "Candidate permanently deleted."},
            status=status.HTTP_200_OK
        )
# =============================================================
from rest_framework.pagination import PageNumberPagination

class SubAdminSubmittedProfilesAPIView(generics.ListAPIView):
    serializer_class = CandidateListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination  # default DRF pagination

    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = CandidateFilter

    search_fields = [
        "candidate_name",
        "candidate_email",
        "skills",
        "technology",
        "vendor__company_name",
    ]

    ordering_fields = "__all__"

    def get_queryset(self):
        user = self.request.user
        UserModel = get_user_model()

        # 🔐 Role restriction
        if user.role != "SUB_ADMIN":
            raise PermissionDenied("You do not have permission to access this data.")

        # 🏢 Company users (SubAdmin + employees)
        company_users = UserModel.objects.filter(
            Q(id=user.id) | Q(parent_user=user)
        )

        # 📦 Submitted profiles (internal OR client)
        return (
            Candidate.objects.select_related(
                "vendor",
                "client",
                "created_by",
                "submitted_to",
            )
            .filter(
                created_by__in=company_users,
                verification_status=True,
                is_deleted=False,
            )
            .filter(
                Q(submitted_to__isnull=False) | Q(client__isnull=False)
            )
            .order_by("-created_at")
        )
        
# ==========================================================================
from django.utils import timezone

class SubAdminTodayProfilesAPIView(generics.ListAPIView):
    serializer_class = CandidateListSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = CandidateFilter

    search_fields = [
        "candidate_name",
        "candidate_email",
        "skills",
        "technology",
        "vendor__company_name",
    ]

    ordering_fields = "__all__"

    def get_queryset(self):
        user = self.request.user
        UserModel = get_user_model()

        # 🔐 Role restriction
        if user.role != "SUB_ADMIN":
            raise PermissionDenied("You do not have permission to access this data.")

        # 🏢 Company users (SubAdmin + employees)
        company_users = UserModel.objects.filter(
            Q(id=user.id) | Q(parent_user=user)
        )

        today = timezone.localdate()

        return (
            Candidate.objects.select_related(
                "vendor",
                "client",
                "created_by",
                "submitted_to",
            )
            .filter(
                created_by__in=company_users,
                created_at__date=today,
                is_deleted=False,
            )
            .order_by("-created_at")
        )
        

# ================================================================

class SubAdminOnboardProfilesAPIView(generics.ListAPIView):
    serializer_class = CandidateListSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = CandidateFilter

    search_fields = [
        "candidate_name",
        "candidate_email",
        "skills",
        "technology",
        "vendor__company_name",
    ]

    ordering_fields = "__all__"

    def get_queryset(self):
        user = self.request.user
        UserModel = get_user_model()

        # 🔐 Role restriction
        if user.role != "SUB_ADMIN":
            raise PermissionDenied("You do not have permission to access this data.")

        # 🏢 Company users (SubAdmin + employees)
        company_users = UserModel.objects.filter(
            Q(id=user.id) | Q(parent_user=user)
        )

        return (
            Candidate.objects.select_related(
                "vendor",
                "client",
                "created_by",
                "submitted_to",
            )
            .filter(
                created_by__in=company_users,
                main_status="ONBORD",
                is_deleted=False,
            )
            .order_by("-created_at")
        )
        
