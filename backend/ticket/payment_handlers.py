# tickets/payment_handlers.py
import requests
from django.conf import settings
from decimal import Decimal


class PaystackPaymentHandler:
    """Handler for Paystack payment integration"""
    BASE_URL = "https://api.paystack.co"
    USD_TO_NGN_RATE = Decimal('1600.00')

    @staticmethod
    def initialize_payment(order):
        """
        Initialize Paystack payment transaction
        Returns payment authorization URL and access code
        """
        url = f"{PaystackPaymentHandler.BASE_URL}/transaction/initialize"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }

        # Convert USD to NGN at fixed rate
        amount_in_ngn = order.total_amount * PaystackPaymentHandler.USD_TO_NGN_RATE

        # Prepare payment data
        data = {
            "email": order.customer_email,
            "amount": int(amount_in_ngn * 100),  # Convert to kobo (smallest unit)
            "currency": "NGN",
            "reference": order.order_number,
            "callback_url": f"{settings.FRONTEND_URL}/payment/callback",
            "metadata": {
                "order_id": order.id,
                "order_number": order.order_number,
                "event_id": order.event.id,
                "event_title": order.event.title,
                "customer_name": order.customer_name,
                "customer_phone": order.customer_phone,
                "cancel_action": f"{settings.FRONTEND_URL}/checkout",
            },
            "channels": ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
        }

        try:
            response = requests.post(url, json=data, headers=headers, timeout=10)
            response.raise_for_status()
            result = response.json()

            if result.get('status'):
                return {
                    'status': True,
                    'message': 'Payment initialized',
                    'data': result.get('data', {}),
                    'authorization_url': result.get('data', {}).get('authorization_url'),
                    'access_code': result.get('data', {}).get('access_code'),
                    'reference': result.get('data', {}).get('reference'),
                }
            else:
                return {
                    'status': False,
                    'message': result.get('message', 'Payment initialization failed'),
                }

        except requests.exceptions.RequestException as e:
            return {
                'status': False,
                'message': f'Payment gateway error: {str(e)}',
            }

    @staticmethod
    def verify_payment(reference):
        """
        Verify Paystack payment transaction
        Returns transaction details if successful
        """
        url = f"{PaystackPaymentHandler.BASE_URL}/transaction/verify/{reference}"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"
        }

        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            result = response.json()

            if result.get('status'):
                data = result.get('data', {})
                return {
                    'status': True,
                    'message': 'Payment verified',
                    'data': data,
                    'amount': data.get('amount', 0) / 100,  # Convert from kobo
                    'reference': data.get('reference'),
                    'paid_at': data.get('paid_at'),
                    'channel': data.get('channel'),
                    'transaction_status': data.get('status'),
                }
            else:
                return {
                    'status': False,
                    'message': result.get('message', 'Payment verification failed'),
                }

        except requests.exceptions.RequestException as e:
            return {
                'status': False,
                'message': f'Payment verification error: {str(e)}',
            }

    @staticmethod
    def get_transaction(reference):
        """
        Get transaction details from Paystack
        """
        url = f"{PaystackPaymentHandler.BASE_URL}/transaction/{reference}"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}"
        }

        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {
                'status': False,
                'message': str(e)
            }


# class StripePaymentHandler:
#     """Handler for Stripe payment integration (Alternative)"""
    
#     @staticmethod
#     def initialize_payment(order):
#         """Initialize Stripe payment session"""
#         import stripe
#         stripe.api_key = settings.STRIPE_SECRET_KEY
        
#         try:
#             # Create Stripe Checkout Session
#             session = stripe.checkout.Session.create(
#                 payment_method_types=['card'],
#                 line_items=[{
#                     'price_data': {
#                         'currency': 'usd',
#                         'product_data': {
#                             'name': f'{order.event.title} Tickets',
#                             'description': f'Order {order.order_number}',
#                         },
#                         'unit_amount': int(order.total_amount * 100),
#                     },
#                     'quantity': 1,
#                 }],
#                 mode='payment',
#                 success_url=f"{settings.FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
#                 cancel_url=f"{settings.FRONTEND_URL}/checkout",
#                 client_reference_id=order.order_number,
#                 customer_email=order.customer_email,
#                 metadata={
#                     'order_id': order.id,
#                     'order_number': order.order_number,
#                     'event_id': order.event.id,
#                 }
#             )
            
#             return {
#                 'status': True,
#                 'session_id': session.id,
#                 'session_url': session.url,
#             }
            
#         except Exception as e:
#             return {
#                 'status': False,
#                 'message': str(e)
#             }
    
#     @staticmethod
#     def verify_payment(session_id):
#         """Verify Stripe payment"""
#         import stripe
#         stripe.api_key = settings.STRIPE_SECRET_KEY
        
#         try:
#             session = stripe.checkout.Session.retrieve(session_id)
            
#             return {
#                 'status': True,
#                 'payment_status': session.payment_status,
#                 'amount': session.amount_total / 100,
#                 'reference': session.client_reference_id,
#             }
            
#         except Exception as e:
#             return {
#                 'status': False,
#                 'message': str(e)
#             }