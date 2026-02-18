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
            "created_by",
        ]

class VendorUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
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
        ]

from rest_framework import serializers
from .models import Vendor


class VendorDetailSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.first_name", read_only=True)
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
            "created_at",
            "updated_at",
            "created_by_name",
        ]

    def get_uploaded_by(self, obj):
        if obj.uploaded_by:
            return {
                "id": obj.uploaded_by.id,
                "email": obj.uploaded_by.email,
                "role": obj.uploaded_by.role,
            }
        return None

class VendorSingleDetailSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.SerializerMethodField()
    created_by_name = created_by_name = serializers.CharField(source="created_by.first_name", read_only=True)
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
            "created_at",
            "updated_at",
            "created_by_name",
        ]

    def get_uploaded_by(self, obj):
        if obj.uploaded_by:
            return {
                "id": obj.uploaded_by.id,
                "email": obj.uploaded_by.email,
                "role": obj.uploaded_by.role,
            }
        return None

# ===================================================================================

# ===============================Client=============================
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"
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
            "vendor_company_name",
            "vendor_number",
            "vendor_rate",
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
            "submitted_to",
            "submitted_to_name",
            "remark",
            "extra_details",
            "created_by",
            "created_at",
            "created_by_name",
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
    vendor = serializers.CharField(source="vendor.company_name", read_only=True)
    client = serializers.CharField(source="client.company_name", read_only=True)
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
            "vendor",          # vendor name instead of id
            "client",          # client name instead of id
            "vendor_company_name",
            "vendor_number",
            "vendor_rate",
            "client_rate",
            "main_status",
            "sub_status",
            "verification_status",
            "is_blocklisted",
            "blocklisted_reason",
            "remark",
            "extra_details",
            "created_at",
            "submitted_to",
            "changed_by",
            "created_by",
            "submitted_to",
            "submitted_to_name",
            "created_by_name"      
        ]
    def get_submitted_to_name(self, obj):
        if obj.submitted_to:
            return f"{obj.submitted_to.first_name} {obj.submitted_to.last_name}"
        return None
    
    def get_created_by_name(self, obj):
            if obj.created_by:
                return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()
            return ""

