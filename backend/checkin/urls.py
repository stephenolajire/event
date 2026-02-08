from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CheckInViewSet

app_name = 'checkin'

router = DefaultRouter()
router.register(r'', CheckInViewSet, basename='checkin')

urlpatterns = [
    path('', include(router.urls)),
]