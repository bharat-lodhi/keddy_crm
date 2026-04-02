from django.urls import path
from . import views 
from .views_bank_accounts import CompanyBankAccountListCreateAPIView
from .views_payments import InvoicePaymentListCreateAPIView
from .views_reports import FinanceDashboardAPIView
from .views_clients import InvoiceClientListCreateAPIView,InvoiceClientRetrieveUpdateAPIView
from .views_candidates import ClientCandidateListAPIView

app_name = 'invoice'

urlpatterns = [
    path("api/create/", views.CreateInvoiceAPIView.as_view(), name="create-invoice"),  #U   #Working in use
    
    path("api/update/<int:id>/", views.UpdateInvoiceAPIView.as_view(), name="update-invoice"),  #NOT USED YET
    path("api/status/<int:id>/", views.UpdateInvoiceStatusAPIView.as_view(), name="invoice-status"),  ##NOT USED YET
    path("api/preview/<int:id>/", views.InvoicePreviewAPIView.as_view(), name="invoice-preview"),  #NOT USED YET
    
    path("api/generate-pdf/<int:id>/", views.GenerateInvoicePDFAPIView.as_view(), name="generate-invoice-pdf"),  #Used
    
    path("api/candidate/<int:candidate_id>/invoices/",views.CandidateInvoiceHistoryAPIView.as_view(),name="candidate-invoice-history",),  #NOT USED YET
    path("api/all/", views.GlobalInvoiceListAPIView.as_view(), name="all-invoices"),  # U
    path("api/settings/", views.CompanyFinanceSettingsAPIView.as_view(), name="invoice-settings"),
    
    # ── New ──
    path("api/invoices/<int:pk>/",          views.InvoiceRetrieveAPIView.as_view(), name="invoice-retrieve"),
    path("api/invoices/<int:pk>/update/",   views.InvoiceUpdateAPIView.as_view(),  name="invoice-update"),
    
    #=======================================
    path("api/bank-accounts/",CompanyBankAccountListCreateAPIView.as_view(),name="company-bank-accounts",),  #UN
    path("api/payments/",InvoicePaymentListCreateAPIView.as_view(),name="invoice-payments",),  #NOT finalised
    path("api/finance/dashboard/",FinanceDashboardAPIView.as_view(),name="finance-dashboard",), #NOT finalised
    
    path("api/clients/", InvoiceClientListCreateAPIView.as_view(), name="invoice-clients"),  # list , create
    path("api/clients/<int:id>/", InvoiceClientRetrieveUpdateAPIView.as_view()),  #update- client detail details
    path("api/clients/<int:client_id>/candidates/", ClientCandidateListAPIView.as_view()),  #UN
    
]
