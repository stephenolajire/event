from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.core.files.base import ContentFile
import base64


@shared_task
def send_invitation_email(guest_id):
    """Send invitation email with embedded QR code image to guest."""
    from guests.models import Guest
    from qr_codes.models import QRCode
    
    try:
        guest = Guest.objects.get(id=guest_id)
        
        # Get or create QR code
        qr_code, created = QRCode.objects.get_or_create(guest=guest)
        
        # Generate QR code if it doesn't exist
        if created or not qr_code.qr_image:
            import qrcode
            from io import BytesIO
            from django.core.files import File
            
            # Generate token
            if not qr_code.token:
                qr_code.token = QRCode.generate_token(guest)
            
            # Create validation URL that will be embedded in QR code
            validation_url = f"{settings.FRONTEND_URL}/validate-qr/{qr_code.token}"
            
            # Generate QR code image
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(validation_url)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Save image to model
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            file_name = f'qr_{guest.id}_{guest.event.id}.png'
            qr_code.qr_image.save(file_name, File(buffer), save=False)
            qr_code.save()
        
        # Read QR code image and convert to base64 for embedding
        qr_code.qr_image.seek(0)
        qr_image_data = base64.b64encode(qr_code.qr_image.read()).decode()
        
        context = {
            'guest': guest,
            'event': guest.event,
            'qr_image_base64': qr_image_data,
            'validation_url': f"{settings.FRONTEND_URL}/validate-qr/{qr_code.token}",
            'frontend_url': settings.FRONTEND_URL
        }
        
        html_message = render_to_string(
            'notifications/invitation_email.html',
            context
        )
        
        # Create email with HTML
        email = EmailMultiAlternatives(
            subject=f"You're invited to {guest.event.title}",
            body=f"You're invited to {guest.event.title}. Please view this email in HTML format.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[guest.email]
        )
        email.attach_alternative(html_message, "text/html")
        
        # Attach QR code as file as well (for backup)
        qr_code.qr_image.seek(0)
        email.attach(
            f'qr_code_{guest.first_name}_{guest.last_name}.png',
            qr_code.qr_image.read(),
            'image/png'
        )
        
        email.send()
        
        # Update guest invitation status
        from django.utils import timezone
        guest.invitation_sent = True
        guest.invitation_sent_at = timezone.now()
        guest.save()
        
        return f"Invitation sent to {guest.email}"
    
    except Exception as e:
        return f"Error sending invitation: {str(e)}"


@shared_task
def send_reminder_email(event_id):
    """Send reminder email to all confirmed guests of an event."""
    from events.models import Event
    from guests.models import Guest
    
    try:
        event = Event.objects.get(id=event_id)
        guests = Guest.objects.filter(event=event, status='confirmed')
        
        for guest in guests:
            send_invitation_email.delay(guest.id)  # Reuse invitation email with QR code
        
        return f"Reminders sent to {guests.count()} guests"
    
    except Exception as e:
        return f"Error sending reminders: {str(e)}"