import django_filters
from django_filters import filters
from .models import Candidate


class CandidateFilter(django_filters.FilterSet):
    candidate_name = django_filters.CharFilter(lookup_expr="icontains")
    candidate_email = django_filters.CharFilter(lookup_expr="icontains")
    candidate_number = django_filters.CharFilter(lookup_expr="icontains")

    vendor = django_filters.NumberFilter()
    submitted_to = django_filters.NumberFilter()
    client = django_filters.NumberFilter()

    main_status = django_filters.CharFilter()
    sub_status = django_filters.CharFilter()

    verification_status = django_filters.BooleanFilter()
    is_blocklisted = django_filters.BooleanFilter()

    created_at = django_filters.DateFromToRangeFilter()

    class Meta:
        model = Candidate
        fields = "__all__"
        exclude = ['resume']
