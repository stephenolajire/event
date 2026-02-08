from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import CheckIn
from .serializers import CheckInSerializer, QRScanSerializer
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
    
    @action(detail=False, methods=['post'])
    def scan(self, request):
        """Process QR code scan and check in guest."""
        serializer = QRScanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        notes = serializer.validated_data.get('notes', '')
        
        # Verify token
        payload = QRCode.verify_token(token)
        
        if 'error' in payload:
            return Response(
                {'error': payload['error']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get QR code
        try:
            qr_code = QRCode.objects.get(token=token)
        except QRCode.DoesNotExist:
            return Response(
                {'error': 'Invalid QR code'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already used
        if qr_code.is_used:
            return Response(
                {
                    'error': 'This QR code has already been used',
                    'checked_in_at': qr_code.used_at,
                    'guest': qr_code.guest.full_name
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check in guest
        guest = qr_code.guest
        guest.mark_as_checked_in(checked_in_by=request.user.get_full_name())
        
        # Mark QR code as used
        qr_code.mark_as_used()
        
        # Create check-in record
        checkin = CheckIn.objects.create(
            guest=guest,
            checked_in_by=request.user,
            check_in_method='qr_scan',
            notes=notes,
            ip_address=get_client_ip(request)
        )
        
        return Response({
            'success': True,
            'message': f'{guest.full_name} checked in successfully',
            'checkin': CheckInSerializer(checkin).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def manual(self, request):
        """Manually check in a guest."""
        guest_id = request.data.get('guest_id')
        notes = request.data.get('notes', '')
        
        if not guest_id:
            return Response(
                {'error': 'guest_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        guest = get_object_or_404(
            Guest,
            id=guest_id,
            event__organizer=request.user
        )
        
        # Check if already checked in
        if guest.has_checked_in:
            return Response(
                {
                    'error': 'Guest has already checked in',
                    'checked_in_at': guest.checked_in_at
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check in guest
        guest.mark_as_checked_in(checked_in_by=request.user.get_full_name())
        
        # Create check-in record
        checkin = CheckIn.objects.create(
            guest=guest,
            checked_in_by=request.user,
            check_in_method='manual',
            notes=notes,
            ip_address=get_client_ip(request)
        )
        
        return Response({
            'success': True,
            'message': f'{guest.full_name} checked in successfully',
            'checkin': CheckInSerializer(checkin).data
        }, status=status.HTTP_200_OK)