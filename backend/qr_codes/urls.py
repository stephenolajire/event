from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QRCodeViewSet

app_name = 'qr_codes'

router = DefaultRouter()
router.register(r'', QRCodeViewSet, basename='qrcode')

urlpatterns = [
    path('', include(router.urls)),
]