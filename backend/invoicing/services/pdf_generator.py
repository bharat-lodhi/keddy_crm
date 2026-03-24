import os
from django.template.loader import render_to_string
from django.conf import settings
from weasyprint import HTML

from invoicing.models import CompanyFinanceSettings

def get_company_root(user):
    if user.role == "SUB_ADMIN":
        return user
    if user.parent_user:
        return user.parent_user
    return None

def generate_invoice_pdf(invoice, request):

    company_root = get_company_root(invoice.created_by)

    company = CompanyFinanceSettings.objects.filter(
        created_by=company_root
    ).first()
    print("Company = ",company)
    base_url = request.build_absolute_uri("/")[:-1]
    print(f"{base_url}"+str(company.logo.url))
    logo_url = f"{base_url}"+str(company.logo.url)
    signature_url = f"{base_url}"+str(company.signature.url)
    
    bank = invoice.company_bank_account
    items = invoice.items.all()
    

    processed_items = []

    for item in items:
        rate = 0
        quantity = 0

        if item.billing_type == "BILLABLE_DAYS":
            rate = item.monthly_rate
            quantity = item.working_days

        elif item.billing_type == "HOURLY":
            rate = item.hourly_rate
            quantity = item.total_hours

        else:
            rate = item.amount
            quantity = 1

        processed_items.append({
            "title": item.title,
            "description": str(item.description),
            "sac_code": item.sac_code or company.default_sac_code,  # 🔥 fallback
            "rate": rate,
            "quantity": quantity,
            "amount": item.amount,
        })

    html_string = render_to_string(
        "invoices/invoice_pdf.html",
        {
            "invoice": invoice,
            "company": {
                "company_name": company.company_name if company else "",
                "address": company.address if company else "",
                "gstin": company.gstin if company else "",
                "phone": company.phone if company else "",
                "email": company.email if company else "",
                
                # 🔥 USE DIRECT URL (NO build_absolute_uri)
                "logo": logo_url if company else "",
                "signature": signature_url if company else "",

                "bank_name": bank.bank_name if bank else "",
                "account_number": bank.account_number if bank else "",
                "ifsc_code": bank.ifsc_code if bank else "",
                "account_holder_name": bank.account_holder_name if bank else "",

                # 🔥 fallback
                "terms": company.default_terms or "",
            },
            "items": processed_items,
        },
    )

    pdf_dir = os.path.join(settings.MEDIA_ROOT, "invoices/generated")
    os.makedirs(pdf_dir, exist_ok=True)

    file_path = os.path.join(pdf_dir, f"{invoice.invoice_number}.pdf")

    HTML(
        string=html_string,
        base_url=str(settings.BASE_DIR)
    ).write_pdf(file_path)

    invoice.pdf_file.name = f"invoices/generated/{invoice.invoice_number}.pdf"
    invoice.save(update_fields=["pdf_file"])

    return invoice.pdf_file.url





# def generate_invoice_pdf(invoice, request):

#     company = CompanyFinanceSettings.objects.filter(
#         created_by=invoice.created_by
#     ).first()

#     bank = invoice.company_bank_account

#     items = invoice.items.all()

#     html_string = render_to_string(
#         "invoices/invoice_pdf.html",
#         {
#             "invoice": invoice,
#             "company": {
#                 "company_name": company.company_name if company else "",
#                 "address": company.address if company else "",
#                 "gstin": company.gstin if company else "",
#                 "phone": company.phone if company else "",
#                 "email": company.email if company else "",
#                 "logo": request.build_absolute_uri(company.logo.url) if company and company.logo else "",
#                 "signature": request.build_absolute_uri(company.signature.url) if company and company.signature else "",
#                 "bank_name": bank.bank_name if bank else "",
#                 "account_number": bank.account_number if bank else "",
#                 "ifsc_code": bank.ifsc_code if bank else "",
#                 "account_holder_name": bank.account_holder_name if bank else "",
#                 "terms": company.default_terms if company else "",
#             },
#             "items": items,
#         },
#     )

#     pdf_dir = os.path.join(settings.MEDIA_ROOT, "invoices/generated")
#     os.makedirs(pdf_dir, exist_ok=True)

#     file_path = os.path.join(pdf_dir, f"{invoice.invoice_number}.pdf")

#     HTML(
#         string=html_string,
#         base_url=str(settings.BASE_DIR)
#     ).write_pdf(
#         file_path,
#         presentational_hints=True
#     )

#     invoice.pdf_file.name = f"invoices/generated/{invoice.invoice_number}.pdf"
#     invoice.save(update_fields=["pdf_file"])

#     return invoice.pdf_file.url

