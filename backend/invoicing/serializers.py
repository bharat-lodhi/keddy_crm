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
            "invoice_date": {"required": False}, 
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
        
        first_item = items_data[0] if items_data else None
        candidate_obj = first_item.get("candidate") if first_item else None

        invoice = Invoice.objects.create(
            created_by=request.user,
            candidate=candidate_obj,
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
            "bill_to_company",
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
    
    
# =======================update-preview =========================
# invoice/serializers.py — Add these serializers to your existing serializers.py

from rest_framework import serializers
from .models import Invoice, InvoiceItem
from employee_portal.models import Candidate, Client
from decimal import Decimal


# =================================================
# InvoiceItem — Full detail serializer (for GET)
# =================================================
class InvoiceItemDetailSerializer(serializers.ModelSerializer):
    candidate_name = serializers.SerializerMethodField()

    class Meta:
        model = InvoiceItem
        fields = [
            "id",
            "candidate",
            "candidate_name",
            "title",
            "description",
            "sac_code",
            "billing_type",
            # BILLABLE_DAYS
            "monthly_rate",
            "total_days",
            "working_days",
            # HOURLY
            "hourly_rate",
            "total_hours",
            # MANUAL
            "amount",
            # VENDOR / CLIENT rates (internal)
            "vendor_rate",
            "client_rate",
        ]

    def get_candidate_name(self, obj):
        if obj.candidate:
            return obj.candidate.candidate_name
        return None


# =================================================
# Client — minimal nested read (for GET prefill)
# =================================================
class ClientMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            "id",
            "client_name",
            "company_name",
            "email",
            "phone_number",
            "gst_number",
            "billing_address",
        ]


# =================================================
# Invoice RETRIEVE Serializer  (GET /invoices/<id>/)
# =================================================
class InvoiceRetrieveSerializer(serializers.ModelSerializer):
    """
    Full invoice detail — used to prefill the Edit form.
    Returns nested client object + all items with their billing-type fields.
    """
    items = InvoiceItemDetailSerializer(many=True, read_only=True)
    client_detail = ClientMinimalSerializer(source="client", read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "invoice_number",
            "invoice_type",
            "billing_type",
            "status",
            # Relations
            "client",
            "client_detail",       # nested client for prefill
            "company_bank_account",
            # Snapshot fields (bill_to_*)
            "bill_to_name",
            "bill_to_company",
            "bill_to_address",
            "bill_to_gstin",
            "bill_to_email",
            "bill_to_phone",
            # Dates
            "invoice_date",
            "billing_month",
            "due_date",
            # Totals
            "rate",
            "quantity",
            "amount",
            "gst_rate",
            "gst_amount",
            "subtotal",
            "total_amount",
            # Extra
            "notes",
            "version",
            "created_at",
            "updated_at",
            # Items
            "items",
        ]


# =================================================
# InvoiceItem — Write serializer (for PATCH)
# =================================================
class InvoiceItemUpdateSerializer(serializers.ModelSerializer):
    # id is needed to identify existing items during update
    id = serializers.IntegerField(required=False)

    class Meta:
        model = InvoiceItem
        fields = [
            "id",
            "candidate",
            "title",
            "description",
            "sac_code",
            "billing_type",
            "monthly_rate",
            "total_days",
            "working_days",
            "hourly_rate",
            "total_hours",
            "amount",
            "vendor_rate",
            "client_rate",
        ]
        extra_kwargs = {
            "title": {"required": False},
            "billing_type": {"required": False},
        }


# =================================================
# Invoice UPDATE Serializer  (PATCH /invoices/<id>/update/)
# =================================================
class InvoiceUpdateSerializer(serializers.ModelSerializer):
    """
    Partial update serializer.
    - Accepts items list: existing items (with id) are updated,
      items without id are created, items missing from list are deleted.
    """
    items = InvoiceItemUpdateSerializer(many=True, required=False)

    class Meta:
        model = Invoice
        fields = [
            "invoice_type",
            "client",
            "company_bank_account",
            # Snapshot override (optional — auto-synced from client if not sent)
            "bill_to_name",
            "bill_to_company",
            "bill_to_address",
            "bill_to_gstin",
            "bill_to_email",
            "bill_to_phone",
            # Dates
            "invoice_date",
            "billing_month",
            "due_date",
            # Tax
            "gst_rate",
            # Extra
            "notes",
            # Items
            "items",
        ]
        extra_kwargs = {f: {"required": False} for f in [
            "invoice_type", "client", "company_bank_account",
            "bill_to_name", "bill_to_company", "bill_to_address",
            "bill_to_gstin", "bill_to_email", "bill_to_phone",
            "invoice_date", "billing_month", "due_date", "gst_rate", "notes",
        ]}

    def validate_items(self, items_data):
        """Validate each item based on its billing_type."""
        for item in items_data:
            billing_type = item.get("billing_type", "MANUAL")

            if billing_type == "BILLABLE_DAYS":
                if not item.get("monthly_rate"):
                    raise serializers.ValidationError(
                        "monthly_rate is required for BILLABLE_DAYS billing."
                    )
                if not item.get("total_days") or not item.get("working_days"):
                    raise serializers.ValidationError(
                        "total_days and working_days are required for BILLABLE_DAYS."
                    )

            elif billing_type == "HOURLY":
                if not item.get("hourly_rate") or not item.get("total_hours"):
                    raise serializers.ValidationError(
                        "hourly_rate and total_hours are required for HOURLY billing."
                    )

            elif billing_type == "MANUAL":
                if not item.get("amount") and item.get("amount") != 0:
                    raise serializers.ValidationError(
                        "amount is required for MANUAL billing."
                    )

        return items_data

    def update(self, instance, validated_data):
        items_data = validated_data.pop("items", None)

        # ── Auto-sync bill_to_* from client if client changed ──
        new_client = validated_data.get("client", instance.client)
        if new_client and "client" in validated_data:
            validated_data.setdefault("bill_to_name", new_client.client_name)
            validated_data.setdefault("bill_to_company", new_client.company_name)
            validated_data.setdefault("bill_to_address", new_client.billing_address)
            validated_data.setdefault("bill_to_gstin", new_client.gst_number)
            validated_data.setdefault("bill_to_email", new_client.email)
            validated_data.setdefault("bill_to_phone", new_client.phone_number)

        # ── Update invoice scalar fields ──
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # ── Handle items (upsert + delete) ──
        if items_data is not None:
            existing_ids = {item.id for item in instance.items.all()}
            sent_ids = {item["id"] for item in items_data if "id" in item}

            # Delete items not present in the new list
            ids_to_delete = existing_ids - sent_ids
            if ids_to_delete:
                instance.items.filter(id__in=ids_to_delete).delete()

            for item_data in items_data:
                item_id = item_data.pop("id", None)

                if item_id and item_id in existing_ids:
                    # Update existing item
                    InvoiceItem.objects.filter(id=item_id).update(**item_data)
                else:
                    # Create new item
                    InvoiceItem.objects.create(invoice=instance, **item_data)

        instance.save()
        return instance