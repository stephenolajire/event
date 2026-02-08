from django.contrib import admin
from .models import Event


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """Admin configuration for Event model."""
    
    list_display = [
        'title', 'organizer', 'event_date', 'location',
        'status', 'total_guests', 'checked_in_count', 'created_at'
    ]
    list_filter = ['status', 'is_public', 'event_date', 'created_at']
    search_fields = ['title', 'description', 'location', 'venue_name', 'organizer__email']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'event_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('organizer', 'title', 'description', 'banner_image')
        }),
        ('Event Details', {
            'fields': (
                'event_date', 'event_end_date', 'location',
                'venue_name', 'address'
            )
        }),
        ('Capacity & Settings', {
            'fields': ('capacity', 'allow_plus_one', 'require_rsvp')
        }),
        ('Check-in Settings', {
            'fields': (
                'enable_self_checkin', 'checkin_start_time',
                'checkin_end_time'
            )
        }),
        ('Status', {
            'fields': ('status', 'is_public')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Add computed fields to queryset."""
        qs = super().get_queryset(request)
        return qs