import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file (local development)
load_dotenv()

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY
SECRET_KEY = os.getenv("DJANGO_SECRET", "dev-fallback-secret-change-in-production")

# Debug mode – automatically False in production if env var not set
DEBUG = os.getenv("DJANGO_DEBUG", "False") == "True"

# Allow all hosts in dev, tighten in real production
ALLOWED_HOSTS = ["*"]


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'corsheaders',

    # Local apps
    'app',
    'chat',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',           # ← MUST be first or very near top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'vetri_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'vetri_backend.wsgi.application'
ASGI_APPLICATION = 'vetri_backend.asgi.application'   # fixed typo


# Database (SQLite for now – change to PostgreSQL in production)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Channels (WebSocket) – in-memory for dev, switch to Redis in prod
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}


# DRF settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
    ),
}


# CORS SETTINGS – SECURE & WORKS WITH YOUR VERCEL FRONTEND
FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "https://vetri-finance-frontendfolder.vercel.app"  # change only when you rename the Vercel project
)

CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://vetri-finance-frontendfolder-5pib.vercel.app"
]

CORS_ALLOW_CREDENTIALS = True  # needed for cookies / session auth

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS

# NEVER use this in production
# CORS_ALLOW_ALL_ORIGINS = True  ← removed completely


# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'


# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'