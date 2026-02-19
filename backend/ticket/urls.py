# tickets/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TicketTypeViewSet, OrderViewSet, TicketViewSet, DiscountCodeViewSet,
    paystack_webhook, verify_payment
)

router = DefaultRouter()
router.register(r'ticket-types', TicketTypeViewSet, basename='ticket-type')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'discount-codes', DiscountCodeViewSet, basename='discount-code')

urlpatterns = [
    path('', include(router.urls)),
    path('webhooks/paystack/', paystack_webhook, name='paystack-webhook'),
    path('verify-payment/', verify_payment, name='verify-payment'),
]