# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='Confirm Password'
    )
    user_type = serializers.ChoiceField(
        choices=User.USER_TYPE_CHOICES,
        default='customer',
        help_text='Select customer to purchase tickets or organizer to create events'
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'password', 'password2',
            'first_name', 'last_name', 'phone_number',
            'organization', 'user_type'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        
        # Validate organization is provided for organizers
        if attrs.get('user_type') == 'organizer' and not attrs.get('organization'):
            raise serializers.ValidationError({
                "organization": "Organization name is required for event organizers."
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create a new user with encrypted password."""
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    
    total_events = serializers.IntegerField(read_only=True)
    total_guests = serializers.IntegerField(read_only=True)
    total_tickets_purchased = serializers.IntegerField(read_only=True)
    total_orders = serializers.IntegerField(read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    is_customer = serializers.BooleanField(read_only=True)
    is_organizer = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'organization', 'profile_picture',
            'user_type', 'is_customer', 'is_organizer',
            'total_events', 'total_guests', 'total_tickets_purchased', 
            'total_orders', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'user_type', 'created_at', 'updated_at']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number',
            'organization', 'profile_picture'
        ]
    
    def validate_organization(self, value):
        """Ensure organizers have organization name."""
        user = self.instance
        if user.is_organizer and not value:
            raise serializers.ValidationError(
                "Organization name is required for event organizers."
            )
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change endpoint."""
    
    old_password = serializers.CharField(
        required=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password2 = serializers.CharField(
        required=True,
        style={'input_type': 'password'},
        label='Confirm New Password'
    )
    
    def validate(self, attrs):
        """Validate that new passwords match."""
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({
                "new_password": "Password fields didn't match."
            })
        return attrs


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user data."""
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add custom claims
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'full_name': self.user.get_full_name(),
            'user_type': self.user.user_type,
            'is_customer': self.user.is_customer,
            'is_organizer': self.user.is_organizer,
            'organization': self.user.organization,
        }
        
        return data