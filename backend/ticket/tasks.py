# tickets/tasks.py
# from celery import shared_task
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
from .models import Order, Ticket
from .pdf_generator import generate_order_tickets_pdf


# @shared_task
def send_ticket_confirmation_email(order_id):
    """
    Send ticket confirmation email with PDF tickets attached
    """
    try:
        order = Order.objects.get(id=order_id)
        tickets = Ticket.objects.filter(order_item__order=order)
        
        # Generate PDF tickets
        pdf_buffer = generate_order_tickets_pdf(order)
        
        # Email context
        context = {
            'order': order,
            'tickets': tickets,
            'event': order.event,
            'customer_name': order.customer_name,
            'order_number': order.order_number,
            'total_amount': order.total_amount,
            'payment_reference': order.payment_reference,
            'frontend_url': settings.FRONTEND_URL,
        }
        
        # Render HTML email
        html_message = render_to_string(
            'tickets/ticket_confirmation_email.html',
            context
        )
        
        # Plain text fallback
        plain_message = f"""
        Thank you for your purchase!
        
        Order Number: {order.order_number}
        Event: {order.event.title}
        Date: {order.event.date.strftime('%B %d, %Y at %I:%M %p')}
        Location: {order.event.location}
        Total: ${order.total_amount}
        
        Your tickets are attached to this email as a PDF.
        Please bring your tickets (digital or printed) to the event.
        
        IMPORTANT: Present the QR code on your ticket at the entrance.
        
        View your tickets online: {settings.FRONTEND_URL}/event
        
        See you at the event!
        """
        
        # Create email with attachment
        email = EmailMessage(
            subject=f"Your Tickets for {order.event.title} 🎫",
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[order.customer_email],
        )
        
        # Attach HTML version
        email.attach_alternative(html_message, "text/html")
        
        # Attach PDF tickets
        pdf_filename = f"Tickets_{order.order_number}.pdf"
        email.attach(pdf_filename, pdf_buffer.getvalue(), 'application/pdf')
        
        # Send email
        email.send(fail_silently=False)
        
        return f"Confirmation email with PDF tickets sent to {order.customer_email}"
        
    except Order.DoesNotExist:
        return f"Order {order_id} not found"
    except Exception as e:
        return f"Error sending confirmation email: {str(e)}"


# @shared_task
def send_ticket_reminder_email(event_id):
    """
    Send reminder emails to all ticket holders for an upcoming event
    """
    from events.models import Event
    
    try:
        event = Event.objects.get(id=event_id)
        
        # Get all orders for this event with valid tickets
        orders = Order.objects.filter(
            event=event,
            status='completed',
            payment_status='successful'
        ).distinct()
        
        sent_count = 0
        
        for order in orders:
            tickets = Ticket.objects.filter(
                order_item__order=order,
                status='valid',
                checked_in=False
            )
            
            if not tickets.exists():
                continue
            
            # Generate fresh PDF tickets
            pdf_buffer = generate_order_tickets_pdf(order)
            
            context = {
                'event': event,
                'order': order,
                'tickets': tickets,
                'customer_name': order.customer_name,
                'frontend_url': settings.FRONTEND_URL,
            }
            
            html_message = render_to_string(
                'tickets/ticket_reminder_email.html',
                context
            )
            
            plain_message = f"""
            Reminder: {event.title} is coming up soon!
            
            Date: {event.date.strftime('%B %d, %Y at %I:%M %p')}
            Location: {event.location}
            
            Your tickets are attached to this email.
            
            IMPORTANT REMINDERS:
            - Arrive early to avoid queues
            - Present your QR code at the entrance
            - Check the weather and dress accordingly
            
            We can't wait to see you there!
            """
            
            email = EmailMessage(
                subject=f"Reminder: {event.title} is Tomorrow! 🎉",
                body=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[order.customer_email],
            )
            
            email.attach_alternative(html_message, "text/html")
            
            # Attach PDF tickets
            pdf_filename = f"Tickets_{order.order_number}.pdf"
            email.attach(pdf_filename, pdf_buffer.getvalue(), 'application/pdf')
            
            email.send(fail_silently=True)
            sent_count += 1
        
        return f"Sent {sent_count} reminder emails for event {event.title}"
        
    except Event.DoesNotExist:
        return f"Event {event_id} not found"
    except Exception as e:
        return f"Error sending reminder emails: {str(e)}"


# @shared_task
def generate_and_save_tickets_pdf(order_id):
    """
    Generate PDF tickets and save to media folder
    Can be called separately if needed
    """
    try:
        order = Order.objects.get(id=order_id)
        from .pdf_generator import save_ticket_pdf
        
        file_path = save_ticket_pdf(order)
        
        return f"Tickets PDF saved to {file_path}"
        
    except Order.DoesNotExist:
        return f"Order {order_id} not found"
    except Exception as e:
        return f"Error generating PDF: {str(e)}"