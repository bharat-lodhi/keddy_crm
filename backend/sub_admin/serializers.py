from django.db import models

# Create your models here.

from rest_framework import serializers
from django.contrib.auth import get_user_model
User = get_user_model()

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

# class UserCreateSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, required=True)
#     class Meta:
#         model = User
#         fields = [
#             "id",
#             "first_name",
#             "last_name",
#             "email",
#             "number",
#             "role",
#             "profile_picture",
#             "password",
#         ]

#     def create(self, validated_data):
#         request = self.context.get("request")
#         password = validated_data.pop("password")

#         user = User(**validated_data)

#         # 🔐 Attach employee to SubAdmin automatically
#         if request and request.user.role == "SUB_ADMIN":
#             user.parent_user = request.user

#         user.set_password(password)
#         user.save()
#         return user

#     def update(self, instance, validated_data):
#         request = self.context.get("request")
#         password = validated_data.pop("password", None)

#         # 🔐 Prevent SubAdmin from changing parent_user manually
#         validated_data.pop("parent_user", None)

#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)

#         if password:
#             instance.set_password(password)

#         instance.save()
#         return instance


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    role = serializers.CharField(required=False)

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

    def validate_role(self, value):
        allowed_roles = ["EMPLOYEE", "ACCOUNTANT"]
        if value not in allowed_roles:
            raise serializers.ValidationError(
                "Sub admin can only assign EMPLOYEE or ACCOUNTANT role."
            )
        return value

    def create(self, validated_data):
        request = self.context.get("request")
        password = validated_data.pop("password")

        role = validated_data.get("role", "EMPLOYEE")

        user = User(**validated_data)
        user.role = role

        if request and request.user.role == "SUB_ADMIN":
            user.parent_user = request.user

        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        validated_data.pop("parent_user", None)

        role = validated_data.get("role")
        if role and role not in ["EMPLOYEE", "ACCOUNTANT"]:
            raise serializers.ValidationError(
                {"role": "Only EMPLOYEE or ACCOUNTANT allowed."}
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

#============================================

from rest_framework import serializers
from employee_portal.models import Client

from rest_framework import serializers
from employee_portal.models import Client
from django.db.models import Count, Q
from datetime import datetime

class SubAdminClientListSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source="created_by.first_name",
        read_only=True
    )
    profile_count = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            "id",
            "client_name",
            "company_name",
            "phone_number",
            "email",

            "nda_status",
            "msa_status",

            "is_active",
            "is_verified",

            "created_by",
            "created_by_name",
            "created_at",

            "profile_count",
        ]

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
    
