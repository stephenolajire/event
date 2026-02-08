from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .tasks import send_invitation_email, send_reminder_email
from .serializers import (
    SendInviteSerializer,
    SendBulkInvitesSerializer,
    SendEventReminderSerializer,
    EmailResponseSerializer
)
from guests.models import Guest
from events.models import Event


@extend_schema(
    request=SendInviteSerializer,
    responses={
        200: OpenApiResponse(
            response=EmailResponseSerializer,
            description="Invitation queued successfully"
        ),
        400: OpenApiResponse(description="Bad request"),
        404: OpenApiResponse(description="Guest not found"),
    },
    description="Send invitation email to a single guest",
    tags=["Notifications"]
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_invite(request):
    """Send invitation email to a guest."""
    serializer = SendInviteSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    guest_id = serializer.validated_data['guest_id']
    
    guest = get_object_or_404(
        Guest,
        id=guest_id,
        event__organizer=request.user
    )
    
    # Trigger async task
    send_invitation_email(guest_id)
    
    return Response({
        'message': f'Invitation will be sent to {guest.email}'
    }, status=status.HTTP_200_OK)


@extend_schema(
    request=SendBulkInvitesSerializer,
    responses={
        200: OpenApiResponse(
            response=EmailResponseSerializer,
            description="Invitations queued successfully"
        ),
        400: OpenApiResponse(description="Bad request"),
    },
    description="Send invitation emails to multiple guests",
    tags=["Notifications"]
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_bulk_invites(request):
    """Send invitations to multiple guests."""
    serializer = SendBulkInvitesSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    guest_ids = serializer.validated_data['guest_ids']
    
    guests = Guest.objects.filter(
        id__in=guest_ids,
        event__organizer=request.user
    )
    
    # Check if user has permission for all guests
    if guests.count() != len(guest_ids):
        return Response(
            {'error': 'Some guests do not belong to your events'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    for guest in guests:
        send_invitation_email(guest.id)
    
    return Response({
        'message': f'Invitations will be sent to {guests.count()} guests'
    }, status=status.HTTP_200_OK)


@extend_schema(
    request=SendEventReminderSerializer,
    responses={
        200: OpenApiResponse(
            response=EmailResponseSerializer,
            description="Reminders queued successfully"
        ),
        400: OpenApiResponse(description="Bad request"),
        404: OpenApiResponse(description="Event not found"),
    },
    description="Send reminder emails to all confirmed guests of an event",
    tags=["Notifications"]
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_event_reminder(request):
    """Send reminder to all confirmed guests of an event."""
    serializer = SendEventReminderSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    event_id = serializer.validated_data['event_id']
    
    event = get_object_or_404(
        Event,
        id=event_id,
        organizer=request.user
    )
    
    # Trigger async task
    send_reminder_email.delay(event_id)
    
    return Response({
        'message': f'Reminder will be sent to all confirmed guests'
    }, status=status.HTTP_200_OK)