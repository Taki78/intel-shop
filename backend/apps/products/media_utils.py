from urllib.parse import urlparse
from django.conf import settings


def absolute_media_url(url, request):
    """Return an absolute URL for locally-stored (relative) media paths, and pass
    external/absolute URLs through unchanged. Keeps stored paths host-independent
    while serving fully-qualified URLs the frontend (on another origin) can load."""
    url = (url or '').strip()
    if not url:
        return url
    if url.startswith('/') and request is not None:
        return request.build_absolute_uri(url)
    return url


def normalize_media_url(url, request):
    """Inverse of absolute_media_url for storage: collapse a URL that points at our
    own /media/ to a relative path so the database never hard-codes the host.
    External URLs (different host, or non-media paths) are stored as-is."""
    url = (url or '').strip()
    if not url:
        return url
    parsed = urlparse(url)
    if not parsed.netloc:
        return url  # already relative
    same_host = request is not None and parsed.netloc == request.get_host()
    if same_host and parsed.path.startswith(settings.MEDIA_URL):
        return parsed.path
    return url
