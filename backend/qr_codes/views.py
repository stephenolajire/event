from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.conf import settings
import qrcode
from io import BytesIO
from django.core.files import File

from .models import QRCode
from .serializers import QRCodeSerializer
from guests.models import Guest


class QRCodeViewSet(viewsets.ModelViewSet):
    """ViewSet for QR Code operations."""
    
    serializer_class = QRCodeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return QRCode.objects.filter(
            guest__event__organizer=user
        ).select_related('guest', 'guest__event')
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate QR code for a guest."""
        guest_id = request.data.get('guest_id')
        
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
        
        # Check if QR code already exists
        qr_code, created = QRCode.objects.get_or_create(guest=guest)
        
        if not created and qr_code.is_used:
            return Response(
                {'error': 'QR code has already been used'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate new token if needed
        if created or not qr_code.token:
            qr_code.token = QRCode.generate_token(guest)
        
        # Generate QR code image
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_code.token)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save image to model
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        file_name = f'qr_{guest.id}_{guest.event.id}.png'
        qr_code.qr_image.save(file_name, File(buffer), save=False)
        qr_code.save()
        
        serializer = self.get_serializer(qr_code)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def validate(self, request):
        """Validate a QR code token."""
        token = request.data.get('token')
        
        if not token:
            return Response(
                {'error': 'token is required'},
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
            qr_code = QRCode.objects.get(token=token)
        except QRCode.DoesNotExist:
            return Response(
                {'error': 'Invalid QR code'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'valid': True,
            'guest': {
                'id': qr_code.guest.id,
                'name': qr_code.guest.full_name,
                'email': qr_code.guest.email,
                'event': qr_code.guest.event.title,
                'has_checked_in': qr_code.guest.has_checked_in,
                'is_used': qr_code.is_used
            }
        })