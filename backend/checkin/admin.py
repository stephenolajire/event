from django.contrib import admin
from .models import CheckIn


@admin.register(CheckIn)
class CheckInAdmin(admin.ModelAdmin):
    list_display = [
        'guest', 'checked_in_by', 'check_in_method',
        'created_at'
    ]
    list_filter = ['check_in_method', 'created_at']
    search_fields = [
        'guest__first_name', 'guest__last_name',
        'guest__email', 'checked_in_by__email'
    ]
    readonly_fields = ['created_at']