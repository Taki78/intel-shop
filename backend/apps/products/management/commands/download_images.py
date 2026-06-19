import os
import uuid
from urllib.parse import urlparse
from urllib.request import urlopen, Request

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand

from apps.products.models import ProductImage

EXT_BY_TYPE = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
}
KNOWN_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}


class Command(BaseCommand):
    help = 'Download externally-hosted product images into local MEDIA storage and ' \
           'repoint their URLs to /media/, so the project serves its own images.'

    def add_arguments(self, parser):
        parser.add_argument('--timeout', type=int, default=25, help='per-image download timeout (s)')

    def _ext_for(self, url, content_type):
        ext = os.path.splitext(urlparse(url).path)[1].lower()
        if ext in KNOWN_EXTS:
            return ext
        return EXT_BY_TYPE.get((content_type or '').split(';')[0].strip(), '.jpg')

    def handle(self, *args, **options):
        timeout = options['timeout']
        images = ProductImage.objects.all()
        total = images.count()
        localized, skipped, failed = 0, 0, 0

        self.stdout.write(f'Scanning {total} product image(s)...')

        for img in images:
            url = (img.url or '').strip()
            parsed = urlparse(url)

            # Already local (relative path or our own /media/ URL) → skip
            if not url or parsed.path.startswith(settings.MEDIA_URL):
                skipped += 1
                continue
            # Not an absolute external URL → nothing to download
            if not parsed.netloc:
                skipped += 1
                continue

            try:
                req = Request(url, headers={'User-Agent': 'Mozilla/5.0 (IntelShop image importer)'})
                with urlopen(req, timeout=timeout) as resp:
                    data = resp.read()
                    content_type = resp.headers.get('Content-Type', '')

                ext = self._ext_for(url, content_type)
                name = f'products/{uuid.uuid4().hex}{ext}'
                saved_path = default_storage.save(name, ContentFile(data))
                img.url = settings.MEDIA_URL + saved_path
                img.save(update_fields=['url'])
                localized += 1
                self.stdout.write(self.style.SUCCESS(f'  ✓ {url}  →  {img.url}'))
            except Exception as exc:  # noqa: BLE001
                failed += 1
                self.stdout.write(self.style.WARNING(f'  ✗ {url}  ({exc})'))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Done. localized={localized}  skipped={skipped}  failed={failed}'
        ))
