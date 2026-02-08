from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import CheckIn
from .serializers import CheckInSerializer
from guests.models import Guest
from qr_codes.models import QRCode


def get_client_ip(request):
    """Get client IP address from request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class CheckInViewSet(viewsets.ModelViewSet):
    """ViewSet for check-in operations."""
    
    serializer_class = CheckInSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = CheckIn.objects.filter(
            guest__event__organizer=user
        ).select_related('guest', 'checked_in_by', 'guest__event')
        
        # Filter by event
        event_id = self.request.query_params.get('event', None)
        if event_id:
            queryset = queryset.filter(guest__event_id=event_id)
        
        return queryset
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def validate_qr(self, request):
        """Validate QR code and return guest details without checking in."""
        token = request.data.get('token')
        
        if not token:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify token
        payload = QRCode.verify_token(token)
        
        if 'error' in payload:
            return Response(
                {'valid': False, 'error': payload['error']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get QR code
        try:
            qr_code = QRCode.objects.select_related('guest', 'guest__event').get(token=token)
        except QRCode.DoesNotExist:
            return Response(
                {'valid': False, 'error': 'Invalid QR code'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        guest = qr_code.guest
        
        return Response({
            'valid': True,
            'guest': {
                'id': guest.id,
                'full_name': guest.full_name,
                'first_name': guest.first_name,
                'last_name': guest.last_name,
                'email': guest.email,
                'phone_number': guest.phone_number,
                'company': guest.company,
                'has_checked_in': guest.has_checked_in,
                'checked_in_at': guest.checked_in_at,
            },
            'event': {
                'id': guest.event.id,
                'title': guest.event.title,
                'event_date': guest.event.event_date,
                'location': guest.event.location,
                'venue_name': guest.event.venue_name,
            },
            'qr_code': {
                'is_used': qr_code.is_used,
                'used_at': qr_code.used_at,
            }
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def checkin(self, request):
        """Simple check-in endpoint - just check in the guest."""
        token = request.data.get('token')
        
        if not token:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify token
        payload = QRCode.verify_token(token)
        
        if 'error' in payload:
            return Response(
                {'error': payload['error']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get QR code
        try:
            qr_code = QRCode.objects.select_related('guest', 'guest__event').get(token=token)
        except QRCode.DoesNotExist:
            return Response(
                {'error': 'Invalid QR code'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        guest = qr_code.guest
        
        # Check if already checked in
        if guest.has_checked_in:
            return Response(
                {
                    'error': 'Guest has already checked in',
                    'checked_in_at': guest.checked_in_at,
                    'guest': guest.full_name
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark guest as checked in
        guest.has_checked_in = True
        guest.checked_in_at = timezone.now()
        guest.checked_in_by = 'Security'  # Default to Security
        guest.save()
        
        # Mark QR code as used
        qr_code.is_used = True
        qr_code.used_at = timezone.now()
        qr_code.save()
        
        # Create check-in record
        checkin = CheckIn.objects.create(
            guest=guest,
            checked_in_by=request.user if request.user.is_authenticated else None,
            check_in_method='qr_scan',
            ip_address=get_client_ip(request)
        )
        
        return Response({
            'success': True,
            'message': f'{guest.full_name} checked in successfully!',
            'guest': {
                'id': guest.id,
                'full_name': guest.full_name,
                'email': guest.email,
                'checked_in_at': guest.checked_in_at,
            },
            'checkin': CheckInSerializer(checkin).data
        }, status=status.HTTP_200_OK)