# serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Vendor,Client,Candidate,CandidateStatusHistory, CandidateRemarkHistory

User = get_user_model()

#========================Venders=============================
class VendorCreateSerializer(serializers.ModelSerializer):

    class Meta:
            model = Vendor
            fields = [
                "id",
                "name",
                "number",
                "company_name",

                "email",
                "company_website",
                "company_pan_or_reg_no",

                "poc1_name",
                "poc1_number",
                "poc2_name",
                "poc2_number",

                "top_3_clients",
                "no_of_bench_developers",
                "provide_onsite",
                "onsite_location",
                "specialized_tech_developers",

                "bench_list",

                # ✅ ADD THESE
                "nda_document",
                "msa_document",
                "nda_status",
                "msa_status",

                "vendor_official_email",
                "sending_email_id",

                "provide_bench",
                "provide_market",

                "company_employee_count",
                "remark",
            ]

    def validate(self, attrs):
        if not attrs.get("name"):
            raise serializers.ValidationError({"name": "Vendor name is required."})
        if not attrs.get("company_name"):
            raise serializers.ValidationError({"company_name": "Company name is required."})
        if not attrs.get("number"):
            raise serializers.ValidationError({"number": "Number is required."})
        return attrs
    
class VendorUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Vendor
        fields = [
            "name",
            "number",
            "company_name",

            "email",
            "company_website",
            "company_pan_or_reg_no",

            "poc1_name",
            "poc1_number",
            "poc2_name",
            "poc2_number",

            "top_3_clients",
            "no_of_bench_developers",
            "provide_onsite",
            "onsite_location",
            "specialized_tech_developers",

            "bench_list",

            "vendor_official_email",
            "sending_email_id",

            "provide_bench",
            "provide_market",

            "company_employee_count",
            "remark",

            "nda_document",
            "msa_document",
            "nda_status",
            "msa_status",
        ]
        
from rest_framework import serializers
from .models import Vendor


class VendorDetailSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.first_name", read_only=True)
    profile_count = serializers.SerializerMethodField()
    class Meta:
        model = Vendor
        fields = [
            "id",
            "name",
            "email",
            "number",
            "company_name",
            "company_website",
            "company_pan_or_reg_no",

            "poc1_name",
            "poc1_number",
            "poc2_name",
            "poc2_number",

            "top_3_clients",
            "no_of_bench_developers",
            "provide_onsite",
            "onsite_location",
            "specialized_tech_developers",

            "bench_list",
            "uploaded_by",
            "created_by",
            "created_at",
            "updated_at",
            "created_by_name",
            "profile_count",
        ]

    def get_uploaded_by(self, obj):
        if obj.uploaded_by:
            return {
                "id": obj.uploaded_by.id,
                "email": obj.uploaded_by.email,
                "role": obj.uploaded_by.role,
            }
        return None
    
    def get_created_by(self, obj):
        if obj.created_by:
            return {
                "id": obj.created_by.id,
                "email": obj.created_by.email,
                "role": obj.created_by.role,
            }
        return None
    
    def get_profile_count(self, obj):
        return obj.candidates.count()

class VendorSingleDetailSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.first_name", read_only=True)
    assigned_employees = serializers.SerializerMethodField()
    profile_count = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = [
            "id",

            # BASIC
            "name",
            "number",
            "company_name",
            "email",
            "company_website",
            "company_pan_or_reg_no",

            # POC
            "poc1_name",
            "poc1_number",
            "poc2_name",
            "poc2_number",

            # BUSINESS
            "top_3_clients",
            "no_of_bench_developers",
            "provide_onsite",
            "onsite_location",
            "specialized_tech_developers",
            "provide_bench",
            "provide_market",
            "company_employee_count",
            "remark",

            # DOCUMENTS
            "bench_list",

            # AGREEMENT
            "nda_document",
            "nda_uploaded_date",
            "nda_status",
            "msa_document",
            "msa_uploaded_date",
            "msa_status",

            "vendor_official_email",
            "sending_email_id",

            # STATUS
            "is_active",
            "is_verified",
            "is_deleted",

            # SYSTEM
            "uploaded_by",
            "created_by",
            "created_by_name",
            "assigned_employees",
            "created_at",
            "updated_at",

            # EXTRA
            "profile_count",
        ]

    def get_uploaded_by(self, obj):
        if obj.uploaded_by:
            return {
                "id": obj.uploaded_by.id,
                "email": obj.uploaded_by.email,
                "role": obj.uploaded_by.role,
            }
        return None

    def get_created_by(self, obj):
        if obj.created_by:
            return {
                "id": obj.created_by.id,
                "email": obj.created_by.email,
                "role": obj.created_by.role,
            }
        return None

    def get_assigned_employees(self, obj):
        return [
            {
                "id": user.id,
                "email": user.email,
                "role": user.role
            }
            for user in obj.assigned_employees.all()
        ]

    def get_profile_count(self, obj):
        request = self.context.get("request")

        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        candidates = obj.candidates.all()

        if start_date and end_date:
            candidates = candidates.filter(
                created_at__date__range=[start_date, end_date]
            )

        return candidates.count()
    
# ===================================================================================

# ===============================Client=============================
class ClientSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source="created_by.first_name",
        read_only=True
    )
    created_by_email = serializers.CharField(
        source="created_by.email",
        read_only=True
    )
    class Meta:
        model = Client
        fields = [
            "id",

            "client_name",
            "company_name",
            "phone_number",
            "email",

            "nda_document",
            "nda_status",
            "msa_document",
            "msa_status",

            "official_email",
            "sending_email_id",

            "company_employee_count",
            "remark",

            "is_active",
            "is_verified",
            
            "created_by",
            "created_by_name",
            "created_by_email",
            "created_at",
        ]

    def validate(self, attrs):
        if not attrs.get("client_name"):
            raise serializers.ValidationError({"client_name": "Client name is required."})
        if not attrs.get("company_name"):
            raise serializers.ValidationError({"company_name": "Company name is required."})
        if not attrs.get("phone_number"):
            raise serializers.ValidationError({"phone_number": "Phone number is required."})
        return attrs
    
class ClientUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Client
        fields = [
            "client_name",
            "company_name",
            "phone_number",
            "email",

            "nda_document",
            "nda_status",
            "msa_document",
            "msa_status",

            "official_email",
            "sending_email_id",

            "company_employee_count",
            "remark",

            "is_active",
            "is_verified",
        ]

class ClientDetailSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source="created_by.first_name",
        read_only=True
    )
    assigned_employees = serializers.SerializerMethodField()
    profile_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            "id",
            "client_name",
            "company_name",
            "phone_number",
            "email",

            "official_email",
            "sending_email_id",

            "nda_document",
            "nda_uploaded_date",
            "nda_status",

            "msa_document",
            "msa_uploaded_date",
            "msa_status",

            "company_employee_count",
            "remark",

            "is_active",
            "is_verified",

            "created_by",
            "created_by_name",
            "assigned_employees",

            "created_at",
            "profile_count",
        ]

    def get_assigned_employees(self, obj):
        return [
            {
                "id": user.id,
                "email": user.email
            }
            for user in obj.assigned_employees.all()
        ]

    def get_profile_count(self, obj):
        request = self.context.get("request")

        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        candidates = obj.candidates.all()

        if start_date and end_date:
            candidates = candidates.filter(
                created_at__date__range=[start_date, end_date]
            )

        return candidates.count()
#====================Resume parse=====================================
class ResumeUploadSerializer(serializers.Serializer):
    resume = serializers.FileField()
    
#====================Candidate=========================================

class CandidateCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Candidate
        fields = [
            "resume",
            "candidate_name",
            "candidate_email",
            "candidate_number",
            "years_of_experience_manual",
            "years_of_experience_calculated",
            "skills",
            "technology",
            "vendor",
            "vendor_rate",
            "vendor_rate_type",
            "submitted_to",
            "remark",
            "extra_details",
        ]

    def create(self, validated_data):
        request = self.context["request"]

        # Auto set submitted_to if empty
        if not validated_data.get("submitted_to"):
            validated_data["submitted_to"] = request.user

        validated_data["changed_by"] = request.user
        validated_data["created_by"] = request.user
        
        return super().create(validated_data)


class CandidateListSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    vendor_company_name = serializers.CharField(source="vendor.company_name", read_only=True)
    vendor_number = serializers.CharField(source="vendor.number", read_only=True)
    
    client_name = serializers.CharField(source="client.client_name", read_only=True)
    client_company_name = serializers.CharField(source="client.company_name", read_only=True)
    client_number = serializers.CharField(source="client.phone_number", read_only=True)

    submitted_to_name = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.first_name", read_only=True)

    class Meta:
        model = Candidate
        fields = [
            "id",
            "resume",
            "candidate_name",
            "candidate_email",
            "candidate_number",
            "years_of_experience_manual",
            "years_of_experience_calculated",
            "skills",
            "technology",

            "vendor",
            "vendor_name",
            "vendor_company_name",
            "vendor_number",
            "vendor_rate",
            "vendor_rate_type",
            
            "client",
            "client_name",
            "client_company_name",
            "client_number",
            "client_rate",
            "client_rate_type",

            "submitted_to",
            "submitted_to_name",
            
            "main_status",
            "sub_status",

            "remark",
            "extra_details",

            "created_by",
            "created_by_name",
            "created_at",
        ]

    def get_submitted_to_name(self, obj):
        if obj.submitted_to:
            return f"{obj.submitted_to.first_name} {obj.submitted_to.last_name}"
        return None


class CandidateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = "__all__"
        read_only_fields = ("changed_by", "created_at")

    def update(self, instance, validated_data):
        request = self.context.get("request")

        old_status = instance.main_status
        old_remark = instance.remark

        instance = super().update(instance, validated_data)

        # ===== changed_by auto update =====
        instance.changed_by = request.user
        instance.save()

        # ===== Status history create =====
        from .models import CandidateStatusHistory, CandidateRemarkHistory

        if old_status != instance.main_status:
            CandidateStatusHistory.objects.create(
                candidate=instance,
                old_status=old_status,
                new_status=instance.main_status,
                sub_status=instance.sub_status,
                changed_by=request.user
            )

        # ===== Remark history create =====
        if old_remark != instance.remark and instance.remark:
            CandidateRemarkHistory.objects.create(
                candidate=instance,
                remark=instance.remark,
                added_by=request.user
            )

        return instance


from .models import Candidate, CandidateStatusHistory, CandidateRemarkHistory


class CandidateStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CandidateStatusHistory
        fields = [
            "old_status",
            "new_status",
            "sub_status",
            "changed_by",
            "changed_by_name",
            "changed_at",
        ]

    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return f"{obj.changed_by.first_name} {obj.changed_by.last_name}"
        return None


class CandidateRemarkHistorySerializer(serializers.ModelSerializer):
    added_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CandidateRemarkHistory
        fields = [
            "remark",
            "added_by",
            "added_by_name",
            "created_at",
        ]

    def get_added_by_name(self, obj):
        if obj.added_by:
            return f"{obj.added_by.first_name} {obj.added_by.last_name}"
        return None


class CandidateDetailSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    submitted_to_name = serializers.SerializerMethodField()
    # created_by_name = serializers.CharField(source="created_by.first_name", read_only=True)
    created_by_name = serializers.SerializerMethodField()
    client_name = serializers.CharField(source="client.client_name", read_only=True)
    client_company_name = serializers.CharField(source="client.company_name", read_only=True)

    status_history = CandidateStatusHistorySerializer(many=True, read_only=True)
    remark_history = CandidateRemarkHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Candidate
        fields = "__all__"

    def get_submitted_to_name(self, obj):
        if obj.submitted_to:
            return f"{obj.submitted_to.first_name} {obj.submitted_to.last_name}"
        return None
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
        return ""

# ========================Emmployee-Dashboard===============================================

class DashboardStatsSerializer(serializers.Serializer):
    user_name = serializers.CharField()
    total_vendors = serializers.IntegerField()
    total_clients = serializers.IntegerField()
    total_profiles = serializers.IntegerField()
    today_profiles = serializers.IntegerField()
    today_submitted_profiles = serializers.IntegerField()
    total_pipelines = serializers.IntegerField()



class TodayCandidateSerializer(serializers.ModelSerializer):
    # ===== Vendor Details =====
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    vendor_company_name = serializers.CharField(source="vendor.company_name", read_only=True)
    vendor_number = serializers.CharField(source="vendor.number", read_only=True)

    # ===== Client Details =====
    client_name = serializers.CharField(source="client.client_name", read_only=True)
    client_company_name = serializers.CharField(source="client.company_name", read_only=True)

    submitted_to_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Candidate
        fields = [
            "id",
            "resume",
            "candidate_name",
            "candidate_email",
            "candidate_number",
            "years_of_experience_manual",
            "years_of_experience_calculated",
            "skills",
            "technology",

            # ===== Vendor =====
            "vendor_name",
            "vendor_company_name",
            "vendor_number",
            "vendor_rate",
            "vendor_rate_type",

            # ===== Client =====
            "client_name",
            "client_company_name",
            "client_rate",
            "client_rate_type",

            # ===== Status =====
            "main_status",
            "sub_status",
            "verification_status",
            "is_blocklisted",
            "blocklisted_reason",

            # ===== Other =====
            "remark",
            "extra_details",
            "created_at",

            # ===== Relations =====
            "submitted_to",
            "changed_by",
            "submitted_to_name",
            "created_by_name",
        ]

    def get_submitted_to_name(self, obj):
        if obj.submitted_to:
            return f"{obj.submitted_to.first_name} {obj.submitted_to.last_name}".strip()
        return None

    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
        return ""