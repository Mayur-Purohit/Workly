import sys
from types import ModuleType

# Polyfill/patch pkg_resources to prevent AttributeError or DistributionNotFound in Python 3.12+ environments (e.g. for razorpay)
class MockDistribution:
    def __init__(self, version="1.4.1"):
        self.version = version

try:
    import pkg_resources
except ImportError:
    class DistributionNotFound(Exception):
        pass

    class MockPkgResources(ModuleType):
        def __init__(self, name):
            super().__init__(name)
            self.DistributionNotFound = DistributionNotFound

        def get_distribution(self, name):
            return MockDistribution()

        def require(self, *args, **kwargs):
            return [MockDistribution()]

    mock_pkg = MockPkgResources("pkg_resources")
    sys.modules["pkg_resources"] = mock_pkg
    pkg_resources = mock_pkg

if not hasattr(pkg_resources, "require"):
    pkg_resources.require = lambda *args, **kwargs: [MockDistribution()]

if not hasattr(pkg_resources, "get_distribution"):
    pkg_resources.get_distribution = lambda *args, **kwargs: MockDistribution()

_orig_require = getattr(pkg_resources, "require", None)
if _orig_require:
    def _safe_require(*args, **kwargs):
        try:
            return _orig_require(*args, **kwargs)
        except Exception:
            return [MockDistribution()]
    pkg_resources.require = _safe_require

import os
import re
from urllib.parse import urlparse
from pathlib import Path
import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv(BASE_DIR / ".env", override=True)

SECRET_KEY = os.getenv("JWT_SECRET")

# Validate critical environment variables at startup
CRITICAL_VARS = ["DATABASE_URL", "JWT_SECRET"]
# Ensure LLM API Keys are present
if not os.getenv("GEMINI_API_KEY") and not os.getenv("GEMINI_API_KEYS") and not os.getenv("OPENAI_API_KEY"):
    raise ValueError(
        "Critical Error: Missing required LLM API keys. "
        "Please configure GEMINI_API_KEY, GEMINI_API_KEYS, or OPENAI_API_KEY in your .env file."
    )

for var in CRITICAL_VARS:
    if not os.getenv(var):
        raise ValueError(
            f"Critical Error: Required environment variable '{var}' is not configured. "
            f"The application cannot start without this variable. Please set it in your .env file."
        )

DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1")

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'api.middleware.SecurityHeadersMiddleware',
    'api.middleware.ExceptionSanitizationMiddleware',
    'api.middleware.UsageLoggerMiddleware',
]

ROOT_URLCONF = 'vishleshan_backend.urls'

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

WSGI_APPLICATION = 'vishleshan_backend.wsgi.application'
ASGI_APPLICATION = 'vishleshan_backend.asgi.application'

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
# Convert asyncpg to standard postgresql engine for Django ORM
SYNC_DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

db_config = dj_database_url.parse(
    SYNC_DATABASE_URL,
    conn_max_age=600,
    conn_health_checks=True,
)
if not DEBUG:
    # Force TLS/SSL database connection in production
    if db_config.get('ENGINE') == 'django.db.backends.postgresql' or 'postgresql' in SYNC_DATABASE_URL:
        db_config.setdefault('OPTIONS', {})
        db_config['OPTIONS']['sslmode'] = 'require'

DATABASES = {
    'default': db_config
}

# Use PostgreSQL engine if URL is postgresql
if 'postgresql' in SYNC_DATABASE_URL:
    DATABASES['default']['ENGINE'] = 'django.db.backends.postgresql'

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS Config
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True

allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "")
CORS_ALLOWED_ORIGINS = []
CORS_ALLOWED_ORIGIN_REGEXES = []

if allowed_origins_str:
    raw_origins = [o.strip() for o in allowed_origins_str.split(",") if o.strip()]
else:
    raw_origins = ["http://localhost:5173", "http://localhost:3000", "https://between.indevs.in"]

for origin in raw_origins:
    if "*" in origin:
        regex_pattern = r"^" + re.escape(origin).replace(r"\*", r".*") + r"$"
        regex_pattern = regex_pattern.replace(r"\/$", "")
        CORS_ALLOWED_ORIGIN_REGEXES.append(regex_pattern)
    else:
        parsed = urlparse(origin)
        if parsed.scheme and parsed.netloc:
            CORS_ALLOWED_ORIGINS.append(f"{parsed.scheme}://{parsed.netloc}")
        else:
            cleaned = origin.rstrip("/")
            if cleaned:
                CORS_ALLOWED_ORIGINS.append(cleaned)
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-api-key',
    'X-API-Key',
    'x-embed-token',
    'X-Embed-Token',
]

# Custom directory configs for uploading/photos
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
PHOTO_DIR = os.getenv("PHOTO_DIR", "photos")

# Celery configurations
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", os.getenv("REDIS_URL", "redis://localhost:6379"))
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", os.getenv("REDIS_URL", "redis://localhost:6379"))

# File upload limit configs (10MB)
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760

# Email settings
INSTALLED_APPS += [
    'anymail',
]

ANYMAIL = {
    "BREVO_API_KEY": os.getenv("BREVO_API_KEY"),
}

if os.getenv("EMAIL_HOST_USER") and os.getenv("EMAIL_HOST_PASSWORD"):
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
    EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
    EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
    EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
    DEFAULT_FROM_EMAIL = os.getenv("MAIL_FROM", f"Workly <{EMAIL_HOST_USER}>")
elif ANYMAIL.get("BREVO_API_KEY"):
    EMAIL_BACKEND = "anymail.backends.brevo.EmailBackend"
    DEFAULT_FROM_EMAIL = os.getenv("MAIL_FROM", "Workly <support@between.indevs.in>")
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
    DEFAULT_FROM_EMAIL = os.getenv("MAIL_FROM", "Workly <support@between.indevs.in>")

