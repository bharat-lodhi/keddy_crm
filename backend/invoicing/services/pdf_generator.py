import os
from django.template.loader import render_to_string
from django.conf import settings
from weasyprint import HTML

from invoicing.models import CompanyFinanceSettings


def generate_invoice_pdf(invoice,request):
    company = CompanyFinanceSettings.objects.first()
    items = invoice.items.all()

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
                # "logo": company.logo.url if company and company.logo else None,
                # "signature": company.signature.url if company and company.signature else None,
                "logo": request.build_absolute_uri(company.logo.url) if company and company.logo else None,
                "signature": request.build_absolute_uri(company.signature.url) if company and company.signature else None,
                "bank_name": company.bank_name if company else "",
                "account_number": company.account_number if company else "",
                "ifsc_code": company.ifsc_code if company else "",
                "account_holder_name": company.account_holder_name if company else "",
                "terms": company.default_terms if company else "",
            },
            "items": items,
        },
    )

    pdf_dir = os.path.join(settings.MEDIA_ROOT, "invoices/generated")
    os.makedirs(pdf_dir, exist_ok=True)

    file_path = os.path.join(pdf_dir, f"{invoice.invoice_number}.pdf")

    # ✅ Safer PDF generation (Windows-stable)
    HTML(
        string=html_string,
        base_url=str(settings.BASE_DIR)
    ).write_pdf(
        file_path,
        presentational_hints=True
    )

    invoice.pdf_file.name = f"invoices/generated/{invoice.invoice_number}.pdf"
    invoice.save(update_fields=["pdf_file"])

    return invoice.pdf_file.url



# import os
# from django.template.loader import render_to_string
# from django.conf import settings
# from weasyprint import HTML

# from invoicing.models import CompanyFinanceSettings


# def generate_invoice_pdf(invoice):
#     company = CompanyFinanceSettings.objects.first()
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
#                 "logo": company.logo.url if company and company.logo else None,
#                 "signature": company.signature.url if company and company.signature else None,
#                 "bank_name": company.bank_name if company else "",
#                 "account_number": company.account_number if company else "",
#                 "ifsc_code": company.ifsc_code if company else "",
#                 "account_holder_name": company.account_holder_name if company else "",
#                 "terms": company.default_terms if company else "",
#             },
#             "items": items,
#         },
#     )

#     pdf_dir = os.path.join(settings.MEDIA_ROOT, "invoices/generated/")
#     os.makedirs(pdf_dir, exist_ok=True)

#     file_path = os.path.join(pdf_dir, f"{invoice.invoice_number}.pdf")

#     HTML(string=html_string, base_url=settings.BASE_DIR).write_pdf(file_path)

#     invoice.pdf_file.name = f"invoices/generated/{invoice.invoice_number}.pdf"
#     invoice.save(update_fields=["pdf_file"])

#     return invoice.pdf_file.url