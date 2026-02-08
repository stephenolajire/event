from django.contrib import admin
from .models import QRCode


@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = [
        'guest', 'is_used', 'used_at', 'created_at'
    ]
    list_filter = ['is_used', 'created_at', 'used_at']
    search_fields = [
        'guest__first_name', 'guest__last_name',
        'guest__email', 'token'
    ]
    readonly_fields = ['token', 'created_at', 'updated_at', 'used_at']