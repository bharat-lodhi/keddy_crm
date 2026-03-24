from urllib import request
from rest_framework import serializers
from .models import Invoice, InvoiceItem, CompanyFinanceSettings
from employee_portal.models import Candidate,Client


from rest_framework import serializers
from .models import Invoice, InvoiceItem, CompanyFinanceSettings
from employee_portal.models import Candidate, Client
from decimal import Decimal


# =========================
# Invoice Item Serializer
# =========================
class InvoiceItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = InvoiceItem
        fields = "__all__"
        extra_kwargs = {"invoice": {"required": False}}


class InvoiceCreateSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    create_client = serializers.BooleanField(required=False, default=False)
    
    # Client extra fields for sync/create
    new_client_name = serializers.CharField(required=False, allow_blank=True)
    new_company_name = serializers.CharField(required=False, allow_blank=True)
    new_client_email = serializers.EmailField(required=False, allow_null=True)
    new_client_phone = serializers.CharField(required=False, allow_blank=True)
    new_client_gst = serializers.CharField(required=False, allow_blank=True)
    new_client_address = serializers.CharField(required=False, allow_blank=True)
    
    # Client Bank Details Sync
    client_bank_name = serializers.CharField(required=False, allow_blank=True)
    client_account_number = serializers.CharField(required=False, allow_blank=True)
    client_ifsc_code = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Invoice
        exclude = ("invoice_number", "created_by", "status", "version")
        extra_kwargs = {
            "bill_to_name": {"required": False},
            "bill_to_company": {"required": False},
            "bill_to_address": {"required": False},
            "bill_to_gstin": {"required": False},
            "bill_to_email": {"required": False},
            "bill_to_phone": {"required": False},
            "invoice_date": {"required": False},  # 👈 YE ADD KARNA HAI
        }

    def create(self, validated_data):
        request = self.context.get("request")
        company_root = self.context.get("company_root")
        items_data = validated_data.pop("items", [])
        create_client = validated_data.pop("create_client", False)

        # 1. Handle Client (Create or Update Sync)
        if create_client:
            client = Client.objects.create(
                client_name=validated_data.pop("new_client_name", ""),
                company_name=validated_data.pop("new_company_name", ""),
                email=validated_data.pop("new_client_email", None),
                phone_number=validated_data.pop("new_client_phone", ""),
                gst_number=validated_data.pop("new_client_gst", ""),
                billing_address=validated_data.pop("new_client_address", ""),
                bank_name=validated_data.pop("client_bank_name", ""),
                account_number=validated_data.pop("client_account_number", ""),
                ifsc_code=validated_data.pop("client_ifsc_code", ""),
                created_by=company_root
            )
            validated_data["client"] = client
        else:
            client = validated_data.get("client")

            if client:
                updated = False

                # GST
                new_gst = validated_data.get("new_client_gst")
                if new_gst:
                    client.gst_number = new_gst
                    updated = True

                # Address
                new_address = validated_data.get("new_client_address")
                if new_address:
                    client.billing_address = new_address
                    updated = True

                # Bank Name
                new_bank = validated_data.get("client_bank_name")
                if new_bank:
                    client.bank_name = new_bank
                    updated = True

                # Account Number
                new_acc = validated_data.get("client_account_number")
                if new_acc:
                    client.account_number = new_acc
                    updated = True

                # IFSC
                new_ifsc = validated_data.get("client_ifsc_code")
                if new_ifsc:
                    client.ifsc_code = new_ifsc
                    updated = True

                if updated:
                    client.save()

        # 2. Snapshot for Invoice
        if client:
            validated_data["bill_to_name"] = client.client_name
            validated_data["bill_to_company"] = client.company_name
            validated_data["bill_to_address"] = client.billing_address
            validated_data["bill_to_gstin"] = client.gst_number
            validated_data["bill_to_email"] = client.email
            validated_data["bill_to_phone"] = client.phone_number

        # 3. Create Invoice Object
        from django.utils import timezone

        validated_data["invoice_date"] = timezone.now().date()

        invoice = Invoice.objects.create(
            created_by=request.user,
            **validated_data
        )

        # 4. Create Items (Candidate vs Manual)
        for item in items_data:

            candidate = item.get("candidate")
            billing_type = item.get("billing_type")
            
            if candidate and candidate.client != client:
                raise serializers.ValidationError(
                    f"Candidate {candidate.id} does not belong to selected client"
                )

            # =========================
            # CANDIDATE AUTO FILL
            # =========================
            if candidate:
                item.setdefault(
                    "title",
                    f"{candidate.candidate_name} - {candidate.technology}"
                )

                # Client rate auto
                if not item.get("monthly_rate") and candidate.client_rate:
                    item["monthly_rate"] = candidate.client_rate

                # Vendor rate auto
                if not item.get("vendor_rate") and candidate.vendor_rate:
                    item["vendor_rate"] = candidate.vendor_rate

            # =========================
            # BILLING TYPE VALIDATION
            # =========================
            if billing_type == "BILLABLE_DAYS":
                # required fields check
                if not item.get("monthly_rate"):
                    raise serializers.ValidationError("Monthly rate is required for billable days")

                if not item.get("total_days") or not item.get("working_days"):
                    raise serializers.ValidationError("Total days & working days required")

            elif billing_type == "HOURLY":
                if not item.get("hourly_rate") or not item.get("total_hours"):
                    raise serializers.ValidationError("Hourly rate & total hours required")

            elif billing_type == "MANUAL":
                if not item.get("amount"):
                    raise serializers.ValidationError("Amount required for manual item")

            # =========================
            # CREATE ITEM
            # =========================
            InvoiceItem.objects.create(
                invoice=invoice,
                **item
            )

        return invoice


# =========================
# Invoice Preview
# =========================
class InvoiceItemPreviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = InvoiceItem
        fields = "__all__"


class InvoicePreviewSerializer(serializers.ModelSerializer):

    items = InvoiceItemPreviewSerializer(many=True)

    class Meta:
        model = Invoice
        fields = "__all__"
        
# =========================
# Company Bank Account Serializer
# =========================
from .models import CompanyBankAccount


class CompanyBankAccountSerializer(serializers.ModelSerializer):

    class Meta:
        model = CompanyBankAccount
        fields = "__all__"
        read_only_fields = ["company_owner", "created_at"]
        
# =========================
# Invoice Payment Serializer
# =========================

from .models import InvoicePayment


class InvoicePaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = InvoicePayment
        fields = "__all__"
        read_only_fields = ["created_by", "created_at"]
        
        
# class InvoiceListSerializer(serializers.ModelSerializer):

#     candidate_id = serializers.SerializerMethodField()
#     candidate_name = serializers.SerializerMethodField()

#     # NEW → vendor cost
#     vendor_cost = serializers.SerializerMethodField()

#     # NEW → profit
#     profit = serializers.SerializerMethodField()

#     class Meta:
#         model = Invoice
#         fields = [
#             "id",
#             "candidate_id",
#             "candidate_name",
#             "invoice_number",
#             "invoice_type",
#             "invoice_date",
#             "billing_month",
#             "bill_to_name",
#             "total_amount",
#             "vendor_cost",
#             "profit",
#             "status",
#             "pdf_file",
#         ]

#     def get_candidate_id(self, obj):
#         return obj.candidate.id if obj.candidate else None

#     def get_candidate_name(self, obj):
#         return obj.candidate.candidate_name if obj.candidate else None

#     # =========================
#     # VENDOR COST CALCULATION
#     # =========================
#     def get_vendor_cost(self, obj):

#         total = 0

#         for item in obj.items.all():

#             if item.billing_type == "BILLABLE_DAYS":

#                 if item.vendor_rate and item.total_days and item.working_days:

#                     total += (
#                         item.working_days / item.total_days
#                     ) * float(item.vendor_rate)

#             elif item.billing_type == "HOURLY":

#                 if item.vendor_rate and item.total_hours:

#                     total += float(item.vendor_rate) * float(item.total_hours)

#         return round(total, 2)

#     # =========================
#     # PROFIT CALCULATION
#     # =========================
#     def get_profit(self, obj):

#         vendor_cost = self.get_vendor_cost(obj)

#         if obj.total_amount:
#             return round(float(obj.total_amount) - vendor_cost, 2)

#         return 0
    
class InvoiceListSerializer(serializers.ModelSerializer):

    candidate_names = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            "id",
            "invoice_number",
            "candidate_names",
            "invoice_date",
            "bill_to_name",
            "total_amount",
            "status",
            "pdf_url",
        ]

    def get_candidate_names(self, obj):
        # Priority 1 → Invoice.candidate
        if obj.candidate:
            return obj.candidate.candidate_name

        # Priority 2 → Invoice Items candidates
        candidates = obj.items.filter(candidate__isnull=False).values_list(
            "candidate__candidate_name", flat=True
        ).distinct()

        return ", ".join(candidates) if candidates else None

    def get_pdf_url(self, obj):
        request = self.context.get("request")
        if obj.pdf_file:
            return request.build_absolute_uri(obj.pdf_file.url)
        return None

# =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

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
    