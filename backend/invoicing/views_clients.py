from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers, filters  # filters add kiya
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied

from employee_portal.models import Client

UserModel = get_user_model()


class InvoiceClientCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            "client_name",
            "company_name",
            "phone_number",
            "email",
            "gst_number",
            "billing_address",
            "account_holder_name",
            "bank_name",
            "account_number",
            "ifsc_code",
        ]


class InvoiceClientListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            "id",
            "client_name",
            "company_name",
            "phone_number",
            "gst_number",
            "billing_address",
            "account_holder_name",
            "bank_name",
            "account_number",
            "ifsc_code",
        ]
        
class InvoiceClientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            "client_name",
            "company_name",
            "phone_number",
            "gst_number",
            "billing_address",
            "account_holder_name",
            "bank_name",
            "account_number",
            "ifsc_code",
        ]
        

#============ API code ===================
from django.db.models import Q

class InvoiceClientListCreateAPIView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    filter_backends = [filters.SearchFilter]
    search_fields = ["client_name", "company_name"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return InvoiceClientCreateSerializer
        return InvoiceClientListSerializer

    def get_company_root(self, user):
        if user.role == "SUB_ADMIN":
            return user
        
        if user.parent_user:
            return user.parent_user
        
        raise PermissionDenied("Invalid company structure.")

    def get_queryset(self):
        user = self.request.user
        company_root = self.get_company_root(user)

        # 🔥 UPDATED LOGIC
        return Client.objects.filter(
            Q(created_by=company_root) | 
            Q(created_by__parent_user=company_root),
            is_deleted=False
        ).order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        company_root = self.get_company_root(user)

        # 🔥 BEST PRACTICE (IMPORTANT)
        serializer.save(created_by=company_root)
        
from rest_framework.generics import RetrieveUpdateAPIView

class InvoiceClientRetrieveUpdateAPIView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = InvoiceClientUpdateSerializer
    lookup_field = "id"

    def get_company_root(self, user):
        if user.role == "SUB_ADMIN":
            return user
        
        if user.parent_user:
            return user.parent_user
        
        raise PermissionDenied("Invalid company structure.")

    def get_queryset(self):
        user = self.request.user
        company_root = self.get_company_root(user)

        # 🔥 SAME FIX HERE
        return Client.objects.filter(
            Q(created_by=company_root) | 
            Q(created_by__parent_user=company_root),
            is_deleted=False
        )



# from rest_framework.generics import ListCreateAPIView
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import serializers, filters  # filters add kiya
# from django.contrib.auth import get_user_model
# from django.db.models import Q
# from rest_framework.exceptions import PermissionDenied

# from employee_portal.models import Client

# UserModel = get_user_model()

# # =========================
# # CLIENT SERIALIZER
# # =========================
# class InvoiceClientSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Client
#         fields = "__all__"
#         read_only_fields = ["created_by", "created_at"]


# # =========================
# # CLIENT LIST + CREATE API
# # =========================
# class InvoiceClientListCreateAPIView(ListCreateAPIView):
#     permission_classes = [IsAuthenticated]
#     serializer_class = InvoiceClientSerializer
    
#     # Search Filter Backend add kiya
#     filter_backends = [filters.SearchFilter]
#     # In fields par search kaam karega
#     search_fields = ['client_name', 'company_name']

#     def get_company_root(self, user):
#         if user.role == "SUB_ADMIN":
#             return user
#         if user.parent_user:
#             return user.parent_user
#         raise PermissionDenied("Invalid company structure.")

#     def get_queryset(self):
#         user = self.request.user
#         company_root = self.get_company_root(user)

#         # Optimization: Sirf company root ke clients fetch karna kafi hai 
#         # kyunki perform_create mein hum created_by=company_root set kar rahe hain
#         return Client.objects.filter(
#             created_by=company_root,
#             is_deleted=False
#         ).order_by("-created_at")

#     def perform_create(self, serializer):
#         user = self.request.user
#         company_root = self.get_company_root(user)
#         # Hamesha company root (Sub-Admin) ke naam par client save hoga
#         serializer.save(created_by=company_root)


