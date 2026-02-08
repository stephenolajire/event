from django.db import models
from django.conf import settings
from guests.models import Guest
import jwt
from datetime import datetime, timedelta


class QRCode(models.Model):
    """Model for storing QR code information."""
    
    guest = models.OneToOneField(
        Guest,
        on_delete=models.CASCADE,
        related_name='qr_code'
    )
    token = models.CharField(max_length=500, unique=True)
    qr_image = models.ImageField(upload_to='qr_codes/', blank=True, null=True)
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'QR Code'
        verbose_name_plural = 'QR Codes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"QR Code for {self.guest.full_name}"
    
    @staticmethod
    def generate_token(guest):
        """Generate a secure JWT token for the guest."""
        from django.utils import timezone
        
        payload = {
            'guest_id': guest.id,
            'event_id': guest.event.id,
            'email': guest.email,
            'exp': timezone.now() + timedelta(hours=settings.QR_CODE_EXPIRY_HOURS),
            'iat': timezone.now()
        }
        
        token = jwt.encode(
            payload,
            settings.QR_CODE_SECRET_KEY,
            algorithm='HS256'
        )
        
        return token
    
    @staticmethod
    def verify_token(token):
        """Verify and decode a QR code token."""
        try:
            payload = jwt.decode(
                token,
                settings.QR_CODE_SECRET_KEY,
                algorithms=['HS256']
            )
            return payload
        except jwt.ExpiredSignatureError:
            return {'error': 'Token has expired'}
        except jwt.InvalidTokenError:
            return {'error': 'Invalid token'}
    
    def mark_as_used(self):
        """Mark QR code as used."""
        from django.utils import timezone
        
        self.is_used = True
        self.used_at = timezone.now()
        self.save()