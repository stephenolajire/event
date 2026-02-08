from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings


@shared_task
def send_invitation_email(guest_id):
    """Send invitation email with QR code to guest."""
    from guests.models import Guest
    from qr_codes.models import QRCode
    
    try:
        guest = Guest.objects.get(id=guest_id)
        qr_code = QRCode.objects.get(guest=guest)
        
        context = {
            'guest': guest,
            'event': guest.event,
            'qr_code_url': f"{settings.FRONTEND_URL}/qr/{qr_code.token}",
            'frontend_url': settings.FRONTEND_URL
        }
        
        html_message = render_to_string(
            'notifications/invitation_email.html',
            context
        )
        
        send_mail(
            subject=f"You're invited to {guest.event.title}",
            message=f"You're invited to {guest.event.title}",
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[guest.email],
            fail_silently=False,
        )
        
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
    """Send reminder email to all guests of an event."""
    from events.models import Event
    from guests.models import Guest
    
    try:
        event = Event.objects.get(id=event_id)
        guests = Guest.objects.filter(event=event, status='confirmed')
        
        for guest in guests:
            context = {
                'guest': guest,
                'event': event,
                'frontend_url': settings.FRONTEND_URL
            }
            
            html_message = render_to_string(
                'notifications/reminder_email.html',
                context
            )
            
            send_mail(
                subject=f"Reminder: {event.title}",
                message=f"Reminder for {event.title}",
                html_message=html_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[guest.email],
                fail_silently=True,
            )
        
        return f"Reminders sent to {guests.count()} guests"
    
    except Exception as e:
        return f"Error sending reminders: {str(e)}"