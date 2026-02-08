from django.contrib import admin
from .models import Guest


@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'email', 'event', 'status',
        'rsvp_status', 'has_checked_in', 'checked_in_at'
    ]
    list_filter = [
        'status', 'rsvp_status', 'has_checked_in',
        'invitation_sent', 'event', 'created_at'
    ]
    search_fields = [
        'first_name', 'last_name', 'email',
        'company', 'event__title'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'rsvp_date',
        'checked_in_at', 'invitation_sent_at'
    ]
    
    fieldsets = (
        ('Guest Information', {
            'fields': (
                'event', 'first_name', 'last_name',
                'email', 'phone_number', 'company', 'title'
            )
        }),
        ('Plus One', {
            'fields': ('plus_one_allowed', 'plus_one_name')
        }),
        ('Status', {
            'fields': (
                'status', 'rsvp_status', 'rsvp_date',
                'has_checked_in', 'checked_in_at', 'checked_in_by'
            )
        }),
        ('Invitation', {
            'fields': ('invitation_sent', 'invitation_sent_at')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )