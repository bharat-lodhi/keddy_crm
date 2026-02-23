from django.db import models

# Create your models here.

from rest_framework import serializers
from django.contrib.auth import get_user_model
User = get_user_model()

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "number",
            "role",
            "profile_picture",
            "password",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

#============================================

from rest_framework import serializers
from employee_portal.models import Client
# class ClientListSerializer(serializers.ModelSerializer):
#     created_by_name = serializers.SerializerMethodField()
#     created_by_email = serializers.SerializerMethodField()
    
#     class Meta:
#         model = Client
#         fields = [
#             "id",
#             "client_name",
#             "company_name",
#             "phone_number",
#             "email",
#             "created_at",
#             "created_by_name",
#             "created_by_email",
#         ]

#     def get_created_by_name(self, obj):
#         if obj.created_by:
#             return f"{obj.created_by.first_name} {obj.created_by.last_name}"
#         return None

#     def get_created_by_email(self, obj):
#         if obj.created_by:
#             return obj.created_by.email
#         return None
    

from rest_framework import serializers
from employee_portal.models import Client
from django.db.models import Count, Q
from datetime import datetime


class ClientListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    created_by_email = serializers.SerializerMethodField()
    profile_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            "id",
            "client_name",
            "company_name",
            "phone_number",
            "email",
            "created_at",
            "created_by_name",
            "created_by_email",
            "profile_count",
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}"
        return None

    def get_created_by_email(self, obj):
        if obj.created_by:
            return obj.created_by.email
        return None

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
    
class ClientDetailSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    created_by_email = serializers.SerializerMethodField()
    profile_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            "id",
            "client_name",
            "company_name",
            "phone_number",
            "email",
            "created_at",
            "created_by_name",
            "created_by_email",
            "profile_count",
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}"
        return None

    def get_created_by_email(self, obj):
        if obj.created_by:
            return obj.created_by.email
        return None

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
