# tickets/pdf_generator.py
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import qrcode
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import os
from django.conf import settings


class ConcertTicketGenerator:
    """Generate concert-style PDF tickets with QR codes"""
    
    # Ticket dimensions (in inches)
    TICKET_WIDTH = 8.5
    TICKET_HEIGHT = 3.5
    
    def __init__(self):
        self.buffer = BytesIO()
        
    def generate_qr_code(self, data):
        """Generate QR code image"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to BytesIO
        img_buffer = BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        return ImageReader(img_buffer)
    
    def draw_ticket(self, c, ticket, y_position):
        """Draw a single concert ticket"""
        # Get QR code
        qr_data = f"{ticket.ticket_number}|{ticket.ticket_code}"
        qr_image = self.generate_qr_code(qr_data)
        
        # Ticket background - gradient effect with rectangles
        ticket_x = 0.5 * inch
        ticket_y = y_position
        ticket_w = 7.5 * inch
        ticket_h = 3 * inch
        
        # Main ticket background
        c.setFillColorRGB(0.1, 0.1, 0.15)  # Dark background
        c.rect(ticket_x, ticket_y, ticket_w, ticket_h, fill=1, stroke=0)
        
        # Gradient bars
        c.setFillColorRGB(0.4, 0.25, 0.6)  # Purple
        c.rect(ticket_x, ticket_y + ticket_h - 0.5*inch, ticket_w, 0.5*inch, fill=1, stroke=0)
        
        c.setFillColorRGB(0.5, 0.3, 0.7)  # Lighter purple
        c.rect(ticket_x, ticket_y + ticket_h - 0.6*inch, ticket_w, 0.1*inch, fill=1, stroke=0)
        
        # Bottom accent
        c.setFillColorRGB(0.4, 0.25, 0.6)
        c.rect(ticket_x, ticket_y, ticket_w, 0.3*inch, fill=1, stroke=0)
        
        # Left section (Event details)
        left_section_x = ticket_x + 0.3*inch
        left_section_y = ticket_y + ticket_h - 0.8*inch
        
        # Event title
        c.setFillColorRGB(1, 1, 1)  # White
        c.setFont("Helvetica-Bold", 20)
        c.drawString(left_section_x, left_section_y, ticket.event.title[:35])
        
        # Ticket type badge
        c.setFillColorRGB(0.95, 0.8, 0.2)  # Gold
        badge_x = left_section_x
        badge_y = left_section_y - 0.5*inch
        c.rect(badge_x, badge_y, 1.5*inch, 0.3*inch, fill=1, stroke=0)
        
        c.setFillColorRGB(0.1, 0.1, 0.15)  # Dark text
        c.setFont("Helvetica-Bold", 12)
        c.drawString(badge_x + 0.1*inch, badge_y + 0.08*inch, ticket.ticket_type.name.upper())
        
        # Date and time
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica", 11)
        event_date = ticket.event.date.strftime("%B %d, %Y")
        event_time = ticket.event.date.strftime("%I:%M %p")
        c.drawString(left_section_x, badge_y - 0.35*inch, f"📅 {event_date}")
        c.drawString(left_section_x, badge_y - 0.6*inch, f"🕐 {event_time}")
        
        # Location
        c.setFont("Helvetica", 10)
        location_lines = self._wrap_text(ticket.event.location, 40)
        location_y = badge_y - 0.85*inch
        for line in location_lines[:2]:  # Max 2 lines
            c.drawString(left_section_x, location_y, f"📍 {line}")
            location_y -= 0.2*inch
        
        # Holder name
        c.setFont("Helvetica-Bold", 11)
        c.drawString(left_section_x, ticket_y + 0.5*inch, "TICKET HOLDER:")
        c.setFont("Helvetica", 11)
        c.drawString(left_section_x + 1.2*inch, ticket_y + 0.5*inch, ticket.holder_name)
        
        # Right section (QR Code and ticket number)
        qr_section_x = ticket_x + ticket_w - 2.5*inch
        qr_section_y = ticket_y + 0.4*inch
        
        # QR code background
        c.setFillColorRGB(1, 1, 1)
        c.rect(qr_section_x, qr_section_y, 2*inch, 2*inch, fill=1, stroke=0)
        
        # QR code
        c.drawImage(qr_image, qr_section_x + 0.1*inch, qr_section_y + 0.1*inch, 
                   width=1.8*inch, height=1.8*inch, mask='auto')
        
        # Ticket number
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica", 8)
        c.drawCentredString(qr_section_x + 1*inch, qr_section_y - 0.25*inch, ticket.ticket_number)
        
        # Barcode separator line
        c.setStrokeColorRGB(0.4, 0.25, 0.6)
        c.setLineWidth(2)
        separator_x = qr_section_x - 0.3*inch
        c.line(separator_x, ticket_y + 0.3*inch, separator_x, ticket_y + ticket_h - 0.3*inch)
        
        # Perforation marks on separator
        c.setStrokeColorRGB(0.6, 0.6, 0.6)
        c.setDash(3, 3)
        c.line(separator_x, ticket_y + 0.3*inch, separator_x, ticket_y + ticket_h - 0.3*inch)
        c.setDash()  # Reset dash
        
        # Instructions
        c.setFillColorRGB(0.7, 0.7, 0.7)
        c.setFont("Helvetica", 7)
        c.drawCentredString(qr_section_x + 1*inch, ticket_y + 0.15*inch, 
                          "Present this QR code at entrance")
        
        # Decorative elements
        self._draw_decorative_elements(c, ticket_x, ticket_y, ticket_w, ticket_h)
        
    def _draw_decorative_elements(self, c, x, y, w, h):
        """Add decorative elements to ticket"""
        # Corner stars
        c.setFillColorRGB(0.95, 0.8, 0.2)
        star_size = 8
        
        # Top left star
        self._draw_star(c, x + 0.2*inch, y + h - 0.2*inch, star_size)
        
        # Bottom right star
        self._draw_star(c, x + w - 2.8*inch, y + 0.2*inch, star_size)
        
    def _draw_star(self, c, x, y, size):
        """Draw a simple star"""
        c.saveState()
        c.translate(x, y)
        path = c.beginPath()
        for i in range(5):
            angle = i * 144 - 90
            import math
            px = size * math.cos(math.radians(angle))
            py = size * math.sin(math.radians(angle))
            if i == 0:
                path.moveTo(px, py)
            else:
                path.lineTo(px, py)
        path.close()
        c.drawPath(path, fill=1, stroke=0)
        c.restoreState()
        
    def _wrap_text(self, text, max_length):
        """Wrap text to multiple lines"""
        words = text.split()
        lines = []
        current_line = []
        current_length = 0
        
        for word in words:
            if current_length + len(word) + 1 <= max_length:
                current_line.append(word)
                current_length += len(word) + 1
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
                current_length = len(word)
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return lines
    
    def generate_tickets_pdf(self, tickets):
        """Generate PDF with multiple tickets"""
        c = canvas.Canvas(self.buffer, pagesize=letter)
        page_width, page_height = letter
        
        tickets_per_page = 2
        current_ticket = 0
        
        for i, ticket in enumerate(tickets):
            if i > 0 and i % tickets_per_page == 0:
                c.showPage()  # New page
                current_ticket = 0
            
            # Calculate Y position (top to bottom)
            y_position = page_height - (current_ticket + 1) * 3.8 * inch
            
            self.draw_ticket(c, ticket, y_position)
            current_ticket += 1
        
        c.save()
        self.buffer.seek(0)
        return self.buffer


def generate_order_tickets_pdf(order):
    """
    Generate a PDF with all tickets for an order
    Returns BytesIO buffer with PDF
    """
    from .models import Ticket
    
    tickets = Ticket.objects.filter(
        order_item__order=order
    ).select_related('ticket_type', 'event')
    
    generator = ConcertTicketGenerator()
    pdf_buffer = generator.generate_tickets_pdf(tickets)
    
    return pdf_buffer


def save_ticket_pdf(order, filename=None):
    """
    Generate and save ticket PDF to file
    Returns file path
    """
    if not filename:
        filename = f"tickets_{order.order_number}.pdf"
    
    pdf_buffer = generate_order_tickets_pdf(order)
    
    # Create tickets directory if it doesn't exist
    tickets_dir = os.path.join(settings.MEDIA_ROOT, 'tickets')
    os.makedirs(tickets_dir, exist_ok=True)
    
    file_path = os.path.join(tickets_dir, filename)
    
    with open(file_path, 'wb') as f:
        f.write(pdf_buffer.getvalue())
    
    return file_path