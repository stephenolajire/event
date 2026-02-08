from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.db.models import Count, Q
import csv

from events.models import Event
from guests.models import Guest
from checkin.models import CheckIn


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_stats(request, event_id):
    """Get detailed statistics for an event."""
    event = get_object_or_404(Event, id=event_id, organizer=request.user)
    
    guests = Guest.objects.filter(event=event)
    
    stats = {
        'event': {
            'id': event.id,
            'title': event.title,
            'date': event.event_date,
            'location': event.location
        },
        'guests': {
            'total': guests.count(),
            'checked_in': guests.filter(has_checked_in=True).count(),
            'pending': guests.filter(has_checked_in=False).count(),
            'confirmed': guests.filter(status='confirmed').count(),
            'declined': guests.filter(status='declined').count(),
        },
        'rsvp': {
            'total_rsvp': guests.filter(rsvp_status=True).count(),
            'pending_rsvp': guests.filter(rsvp_status=False).count(),
        },
        'attendance_rate': event.attendance_rate,
        'capacity': {
            'total': event.capacity,
            'used': event.total_guests,
            'available': event.available_slots
        } if event.capacity else None,
        'checkin_history': CheckIn.objects.filter(
            guest__event=event
        ).values('check_in_method').annotate(
            count=Count('id')
        )
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    """Get dashboard statistics for all user's events."""
    events = Event.objects.filter(organizer=request.user)
    
    total_guests = Guest.objects.filter(event__organizer=request.user).count()
    total_checked_in = Guest.objects.filter(
        event__organizer=request.user,
        has_checked_in=True
    ).count()
    
    stats = {
        'total_events': events.count(),
        'upcoming_events': events.filter(
            status__in=['published', 'ongoing']
        ).count(),
        'total_guests': total_guests,
        'total_checked_in': total_checked_in,
        'attendance_rate': round((total_checked_in / total_guests * 100), 2) if total_guests > 0 else 0,
        'recent_events': events.order_by('-created_at')[:5].values(
            'id', 'title', 'event_date', 'status'
        )
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_guest_list(request, event_id):
    """Export guest list as CSV."""
    event = get_object_or_404(Event, id=event_id, organizer=request.user)
    guests = Guest.objects.filter(event=event)
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="guests_{event.title}.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'First Name', 'Last Name', 'Email', 'Phone', 'Company',
        'Status', 'RSVP', 'Checked In', 'Checked In At'
    ])
    
    for guest in guests:
        writer.writerow([
            guest.first_name,
            guest.last_name,
            guest.email,
            guest.phone_number or '',
            guest.company or '',
            guest.status,
            'Yes' if guest.rsvp_status else 'No',
            'Yes' if guest.has_checked_in else 'No',
            guest.checked_in_at.strftime('%Y-%m-%d %H:%M:%S') if guest.checked_in_at else ''
        ])
    
    return response