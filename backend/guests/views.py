from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Guest
from .serializers import (
    GuestSerializer, GuestListSerializer, GuestBulkCreateSerializer
)
from events.models import Event
from events.permissions import IsEventOrganizer


class GuestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        event_id = self.request.query_params.get('event', None)
        
        queryset = Guest.objects.filter(event__organizer=user)
        
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        # Filter by check-in status
        checked_in = self.request.query_params.get('checked_in', None)
        if checked_in is not None:
            queryset = queryset.filter(
                has_checked_in=checked_in.lower() == 'true'
            )
        
        # Filter by RSVP status
        rsvp = self.request.query_params.get('rsvp', None)
        if rsvp is not None:
            queryset = queryset.filter(rsvp_status=rsvp.lower() == 'true')
        
        return queryset.select_related('event')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return GuestListSerializer
        elif self.action == 'bulk_create':
            return GuestBulkCreateSerializer
        return GuestSerializer
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        serializer = GuestBulkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        event = get_object_or_404(
            Event,
            id=serializer.validated_data['event_id'],
            organizer=request.user
        )
        
        guests_data = serializer.validated_data['guests']
        created_guests = []
        errors = []
        
        for guest_data in guests_data:
            guest_data['event'] = event.id
            guest_serializer = GuestSerializer(
                data=guest_data,
                context={'request': request}
            )
            
            if guest_serializer.is_valid():
                guest = guest_serializer.save()
                created_guests.append(guest)
            else:
                errors.append({
                    'guest': guest_data.get('email'),
                    'errors': guest_serializer.errors
                })
        
        return Response({
            'created': GuestSerializer(created_guests, many=True).data,
            'errors': errors,
            'total_created': len(created_guests),
            'total_errors': len(errors)
        }, status=status.HTTP_201_CREATED)