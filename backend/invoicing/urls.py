from django.urls import path
from . import views 
app_name = 'invoice'

urlpatterns = [
    path("api/create/", views.CreateInvoiceAPIView.as_view(), name="create-invoice"),
    path("api/update/<int:id>/", views.UpdateInvoiceAPIView.as_view(), name="update-invoice"),
    path("api/status/<int:id>/", views.UpdateInvoiceStatusAPIView.as_view(), name="invoice-status"),
    path("api/preview/<int:id>/", views.InvoicePreviewAPIView.as_view(), name="invoice-preview"),
    path("api/generate-pdf/<int:id>/", views.GenerateInvoicePDFAPIView.as_view(), name="generate-invoice-pdf"),
    
    path("api/candidate/<int:candidate_id>/invoices/",views.CandidateInvoiceHistoryAPIView.as_view(),name="candidate-invoice-history",),
    path("api/all/", views.GlobalInvoiceListAPIView.as_view(), name="all-invoices"),
    path("api/settings/", views.CompanyFinanceSettingsAPIView.as_view(), name="invoice-settings"),
]
