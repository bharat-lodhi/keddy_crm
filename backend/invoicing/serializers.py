from urllib import request
from rest_framework import serializers
from .models import Invoice, InvoiceItem, CompanyFinanceSettings
from employee_portal.models import Candidate

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = "__all__"
        extra_kwargs = {"invoice": {"required": False}}


class InvoiceCreateSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        exclude = ("invoice_number", "created_by", "status", "version")

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        invoice = Invoice.objects.create(**validated_data)

        for item in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item)

        return invoice
    

class InvoiceUpdateSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        exclude = ("invoice_number", "created_by", "created_at")

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", [])

        # Update invoice fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.version += 1
        instance.save()

        # Replace items (simple & clean approach)
        instance.items.all().delete()
        for item in items_data:
            InvoiceItem.objects.create(invoice=instance, **item)

        return instance
    
class InvoiceStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ["status"]
        


class InvoiceItemPreviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ["title", "description", "sac_code", "rate", "quantity", "amount"]


class InvoicePreviewSerializer(serializers.ModelSerializer):
    items = InvoiceItemPreviewSerializer(many=True)
    candidate_name = serializers.CharField(source="candidate.candidate_name",read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "candidate_name",
            "invoice_number",
            "invoice_date",
            "billing_month",
            "status",
            "bill_to_name",
            "bill_to_company",
            "bill_to_address",
            "bill_to_gstin",
            "bill_to_email",
            "bill_to_phone",
            "description",
            "sac_code",
            "rate",
            "quantity",
            "amount",
            "subtotal",
            "gst_rate",
            "gst_amount",
            "total_amount",
            "notes",
            "items",
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        company = CompanyFinanceSettings.objects.first()

        data["company"] = {
            "company_name": company.company_name if company else None,
            "address": company.address if company else None,
            "phone": company.phone if company else None,
            "email": company.email if company else None,
            "gstin": company.gstin if company else None,
            "logo": company.logo.url if company and company.logo else None,
            "signature": company.signature.url if company and company.signature else None,
            # "logo": request.build_absolute_uri(company.logo.url) if company and company.logo else None,
            # "signature": request.build_absolute_uri(company.signature.url) if company and company.signature else None,
            "bank_name": company.bank_name if company else None,
            "account_number": company.account_number if company else None,
            "ifsc_code": company.ifsc_code if company else None,
            "account_holder_name": company.account_holder_name if company else None,
            "terms": company.default_terms if company else None,
        }

        return data
    
    
class CandidateInvoiceHistorySerializer(serializers.ModelSerializer):
    candidate_name = serializers.SerializerMethodField()
    class Meta:
        model = Invoice
        fields = [
            "id",
           
            "candidate_name",
            "invoice_number",
            "invoice_date",
            "billing_month",
            "total_amount",
            "gst_amount",
            "status",
            "pdf_file",
        ]
    def get_candidate_name(self, obj):
        return obj.candidate.candidate_name if obj.candidate else None
        
class InvoiceListSerializer(serializers.ModelSerializer):
    candidate_id = serializers.SerializerMethodField()
    candidate_name = serializers.SerializerMethodField()
    class Meta:
        model = Invoice
        fields = [
            "id",
            "candidate_id",
            "candidate_name",
            "invoice_number",
            "invoice_type",
            "invoice_date",
            "billing_month",
            "bill_to_name",
            "total_amount",
            "status",
            "pdf_file",
        ]
        
    def get_candidate_id(self, obj):
        return obj.candidate.id if obj.candidate else None
    def get_candidate_name(self, obj):
        return obj.candidate.candidate_name if obj.candidate else None
    
    
# class CompanyFinanceSettingsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = CompanyFinanceSettings
#         fields = "__all__"
#         read_only_fields = ("created_by", "updated_at")


class CompanyFinanceSettingsSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    signature_url = serializers.SerializerMethodField()

    class Meta:
        model = CompanyFinanceSettings
        fields = "__all__"
        read_only_fields = ("created_by", "updated_at")

    def get_logo_url(self, obj):
        request = self.context.get("request")
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        return None

    def get_signature_url(self, obj):
        request = self.context.get("request")
        if obj.signature and request:
            return request.build_absolute_uri(obj.signature.url)
        return None
    