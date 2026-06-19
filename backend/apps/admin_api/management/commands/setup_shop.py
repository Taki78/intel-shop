"""
python manage.py setup_shop
Creates an admin user and seeds fake customers, orders, and reviews.
"""
import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction

from apps.accounts.models import User, Province
from apps.products.models import Product, Review
from apps.orders.models import Order, OrderItem, Invoice
from apps.blog.models import BlogPost

BLOG_POSTS = [
    {
        'slug': 'rahnama-kharid-laptop',
        'title': 'راهنمای کامل خرید لپ‌تاپ در سال ۱۴۰۳',
        'excerpt': 'قبل از خرید لپ‌تاپ باید به چه نکاتی توجه کنیم؟ در این مقاله همه چیز را توضیح می‌دهیم.',
        'cover': 'https://placehold.co/800x400/2563eb/white?text=Laptop+Buying+Guide',
        'author': 'تیم اینتل شاپ',
        'jalali_date': '1403/10/05',
        'read_time': '8 دقیقه',
        'category': 'راهنمای خرید',
        'content': 'هنگام خرید لپ‌تاپ باید به پردازنده، حافظه رم، فضای ذخیره‌سازی، صفحه‌نمایش و باتری توجه کنید. پردازنده قلب لپ‌تاپ است و نسل جدیدتر بهتر است. رم حداقل ۸ گیگابایت برای کارهای روزمره و ۱۶ گیگابایت برای چندوظیفگی توصیه می‌شود. SSD سرعت بوت را به شدت افزایش می‌دهد. صفحه‌نمایش IPS با رزولوشن Full HD برای تجربه بصری بهتر ایده‌آل است.',
    },
    {
        'slug': 'laptop-no-vs-dast-dovom',
        'title': 'لپ‌تاپ نو بخریم یا دست دوم؟ مقایسه کامل',
        'excerpt': 'مزایا و معایب خرید لپ‌تاپ دست دوم در مقایسه با لپ‌تاپ نو را بررسی می‌کنیم.',
        'cover': 'https://placehold.co/800x400/0ea5e9/white?text=New+vs+Used',
        'author': 'تیم اینتل شاپ',
        'jalali_date': '1403/09/20',
        'read_time': '5 دقیقه',
        'category': 'مقایسه',
        'content': 'لپ‌تاپ نو گارانتی و فناوری روز را دارد اما گران‌تر است. لپ‌تاپ دست دوم با همان بودجه سخت‌افزار قدرتمندتری می‌دهد ولی ریسک بیشتری دارد. نکات مهم در خرید دست دوم: بررسی سلامت باتری، تعداد سیکل شارژ، آسیب‌های فیزیکی و تست کامل سیستم پیش از خرید.',
    },
    {
        'slug': 'behrarin-cpu-2024',
        'title': 'بهترین پردازنده‌های ۲۰۲۴ برای هر بودجه',
        'excerpt': 'از بودجه کم تا بودجه بالا، بهترین CPU را برای شما معرفی می‌کنیم.',
        'cover': 'https://placehold.co/800x400/7c3aed/white?text=Best+CPUs+2024',
        'author': 'تیم فنی',
        'jalali_date': '1403/09/10',
        'read_time': '10 دقیقه',
        'category': 'قطعات',
        'content': 'در سال ۲۰۲۴، AMD Ryzen 5 7530U و Intel Core i5 نسل ۱۲ و ۱۳ بهترین گزینه برای بودجه متوسط هستند. برای بودجه بالا، Ryzen 9 و Core i7/i9 عملکرد استثنایی ارائه می‌دهند. در لپ‌تاپ‌های ارزان‌تر، Ryzen 5 5500U همچنان انتخاب فوق‌العاده‌ای است.',
    },
    {
        'slug': 'ssd-vs-hdd',
        'title': 'SSD یا HDD؟ کدام را انتخاب کنیم؟',
        'excerpt': 'تفاوت‌های اساسی بین SSD و HDD و اینکه برای کاربرد شما کدام مناسب‌تر است.',
        'cover': 'https://placehold.co/800x400/10b981/white?text=SSD+vs+HDD',
        'author': 'تیم فنی',
        'jalali_date': '1403/08/28',
        'read_time': '6 دقیقه',
        'category': 'قطعات',
        'content': 'SSD چندین برابر سریع‌تر از HDD است، مقاوم‌تر است، صدا ندارد و انرژی کمتری مصرف می‌کند. HDD فضای بیشتری با قیمت کمتر می‌دهد. توصیه: از SSD برای سیستم عامل و برنامه‌ها و از HDD برای ذخیره فایل‌های حجیم استفاده کنید.',
    },
    {
        'slug': 'laptop-gaming-rahnama',
        'title': 'راهنمای خرید لپ‌تاپ گیمینگ ۱۴۰۳',
        'excerpt': 'برای بازی‌های سنگین به چه لپ‌تاپی نیاز دارید؟ کامل‌ترین راهنما.',
        'cover': 'https://placehold.co/800x400/dc2626/white?text=Gaming+Laptop+Guide',
        'author': 'تیم اینتل شاپ',
        'jalali_date': '1403/08/15',
        'read_time': '12 دقیقه',
        'category': 'راهنمای خرید',
        'content': 'لپ‌تاپ گیمینگ به کارت گرافیک مستقل NVIDIA GTX/RTX یا AMD RX نیاز دارد. رم ۱۶ گیگابایت حداقل و ۳۲ گیگابایت ایده‌آل است. صفحه‌نمایش ۱۴۴ هرتز تجربه روان‌تری می‌دهد. سیستم خنک‌کاری قوی برای جلوگیری از throttling ضروری است.',
    },
    {
        'slug': 'ram-upgrade-rahnama',
        'title': 'چگونه رم لپ‌تاپ خود را ارتقا دهیم؟',
        'excerpt': 'گام به گام نحوه افزایش رم لپ‌تاپ برای بهبود سرعت و عملکرد.',
        'cover': 'https://placehold.co/800x400/f59e0b/white?text=RAM+Upgrade+Guide',
        'author': 'تیم فنی',
        'jalali_date': '1403/08/01',
        'read_time': '7 دقیقه',
        'category': 'آموزش',
        'content': 'ابتدا بررسی کنید لپ‌تاپ شما آیا رم قابل ارتقا دارد (برخی رم سولدر هستند). نوع رم (DDR4/DDR5) و فرکانس آن را مشخص کنید. با باز کردن پنل پشتی، ماژول قدیمی را درآورده و جدید را جایگزین کنید. سیستم را بوت کرده و با CPU-Z یا Task Manager تایید کنید.',
    },
]

PROVINCES = [
    'تهران', 'البرز', 'اصفهان', 'آذربایجان شرقی', 'آذربایجان غربی',
    'اردبیل', 'ایلام', 'بوشهر', 'چهارمحال و بختیاری', 'خراسان جنوبی',
    'خراسان رضوی', 'خراسان شمالی', 'خوزستان', 'زنجان', 'سمنان',
    'سیستان و بلوچستان', 'فارس', 'قزوین', 'قم', 'کردستان',
    'کرمان', 'کرمانشاه', 'کهگیلویه و بویراحمد', 'گلستان', 'گیلان',
    'لرستان', 'مازندران', 'مرکزی', 'هرمزگان', 'همدان', 'یزد',
]


# ── Fake data ──────────────────────────────────────────────────────────────────

CUSTOMERS = [
    {'name': 'علی محمدی',    'email': 'ali.m@gmail.com',         'phone': '09121234567'},
    {'name': 'سارا کریمی',   'email': 'sara.karimi@yahoo.com',    'phone': '09351112233'},
    {'name': 'محمد رضایی',   'email': 'mrezaei@gmail.com',        'phone': '09198765432'},
    {'name': 'زهرا اکبری',   'email': 'z.akbari@gmail.com',       'phone': '09120001122'},
    {'name': 'حسین نوری',    'email': 'hossein.n@gmail.com',      'phone': '09125556677'},
    {'name': 'فاطمه جوادی',  'email': 'f.javadi@gmail.com',       'phone': '09365551234'},
]

ADDRESSES = [
    {'province': 'تهران',            'city': 'تهران',   'detail': 'خیابان ولیعصر، کوچه بهار، پلاک ۱۲'},
    {'province': 'اصفهان',           'city': 'اصفهان',  'detail': 'خیابان چهارباغ، پلاک ۸۸'},
    {'province': 'فارس',             'city': 'شیراز',   'detail': 'بلوار زند، پلاک ۴۵'},
    {'province': 'خراسان رضوی',      'city': 'مشهد',    'detail': 'بلوار وکیل‌آباد، پلاک ۲۳'},
    {'province': 'آذربایجان شرقی',   'city': 'تبریز',   'detail': 'خیابان آزادی، پلاک ۷'},
    {'province': 'تهران',            'city': 'تهران',   'detail': 'خیابان انقلاب، پلاک ۱۵۶'},
]

# (customer_idx, product_slug, qty, status, days_ago)
ORDER_SCENARIOS = [
    (0, 'lenovo-ideapad-5-ryzen5-8gb-512',      1, 'delivered',  15),
    (1, 'hp-pavilion-i5-12th-8gb-256',          1, 'shipped',     5),
    (2, 'asus-vivobook-15-i7-16gb-512',         1, 'delivered',  22),
    (3, 'dell-inspiron-15-i5-8gb-512',          1, 'processing',  3),
    (4, 'msi-modern-14-ryzen5-16gb-512',        1, 'delivered',  10),
    (5, 'lenovo-thinkpad-e14-used-i5-16gb',     1, 'delivered',  18),
    (0, 'acer-aspire5-i5-8gb-512',              1, 'processing',  2),
    (1, 'hp-elitebook-840-used-i7-8gb',         1, 'pending',     1),
    (2, 'lenovo-ideapad-5-ryzen5-8gb-512',      1, 'cancelled',   8),
    (3, 'hp-pavilion-i5-12th-8gb-256',          1, 'shipped',     4),
]

# (customer_idx, product_slug, rating, status, text)
REVIEWS_DATA = [
    (0, 'lenovo-ideapad-5-ryzen5-8gb-512', 5, 'approved',
     'لپ‌تاپ فوق‌العاده‌ایه! سرعت خوبی داره و برای کار روزمره و تحصیل عالیه. باتری هم بسیار خوبه.'),
    (1, 'hp-pavilion-i5-12th-8gb-256', 4, 'approved',
     'کیفیت ساخت خوبیه. صفحه‌نمایش روشن و واضحه. فقط ۲۵۶ گیگ کمه ولی قیمتش منطقیه.'),
    (2, 'asus-vivobook-15-i7-16gb-512', 5, 'approved',
     'بهترین خریدم! i7 با ۱۶ گیگ رم واقعاً قدرتمنده. پرفرمنس عالی برای کار و تحصیل.'),
    (4, 'msi-modern-14-ryzen5-16gb-512', 4, 'approved',
     'لپ‌تاپ خوبیه ولی از MSI انتظار بیشتری داشتم. پرفرمنس Ryzen 5 عالیه.'),
    (5, 'lenovo-thinkpad-e14-used-i5-16gb', 4, 'approved',
     'با توجه به دست دوم بودنش، وضعیتش خیلی خوبه. ارزش قیمت داره.'),
    (0, 'acer-aspire5-i5-8gb-512', 3, 'pending',
     'قیمتش مناسبه ولی کیفیت ساخت متوسطه. برای قیمتش قابل قبوله.'),
    (3, 'dell-inspiron-15-i5-8gb-512', 5, 'pending',
     'دل همیشه عالیه! سرعت بوت سریع، صفحه‌نمایش عالی و کیبورد خوب.'),
    (1, 'msi-modern-14-ryzen5-16gb-512', 4, 'approved',
     'برای ۱۴ اینچ وزنش مناسبه. نمایشگر IPS واقعاً خوبه. پیشنهاد می‌کنم.'),
]


class Command(BaseCommand):
    help = 'ایجاد حساب ادمین و بارگذاری داده‌های نمونه (مشتریان، سفارشات، نظرات)'

    def add_arguments(self, parser):
        parser.add_argument('--email',    default='admin@intelshop.ir', help='ایمیل ادمین')
        parser.add_argument('--password', default='Admin@12345',         help='رمز عبور ادمین')
        parser.add_argument('--name',     default='مدیر سیستم',          help='نام ادمین')
        parser.add_argument('--reset',    action='store_true',           help='حذف داده‌های نمونه قبلی')

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('\n=== Intel Shop Setup ===\n'))

        # ── 0. Blog posts ──────────────────────────────────────────────────────
        blog_created = 0
        for post in BLOG_POSTS:
            _, c = BlogPost.objects.get_or_create(slug=post['slug'], defaults=post)
            if c:
                blog_created += 1
        self.stdout.write(self.style.SUCCESS(f'OK:{blog_created} blog post(s) created ({len(BLOG_POSTS)} total)'))

        # ── 0. Provinces ───────────────────────────────────────────────────────
        prov_created = 0
        for i, name in enumerate(PROVINCES, 1):
            _, c = Province.objects.get_or_create(name=name, defaults={'order': i})
            if c:
                prov_created += 1
        self.stdout.write(self.style.SUCCESS(f'OK:{prov_created} province(s) created ({len(PROVINCES)} total)'))

        # ── 1. Admin user ──────────────────────────────────────────────────────
        email    = options['email']
        password = options['password']
        name     = options['name']

        user, created = User.objects.get_or_create(email=email)
        user.name         = name
        user.is_staff     = True
        user.is_superuser = True
        user.is_active    = True
        user.set_password(password)
        user.save()

        action = 'ایجاد شد' if created else 'به‌روزرسانی شد'
        self.stdout.write(self.style.SUCCESS(f'OK:حساب ادمین {action}'))

        # ── 2. Fake customers ──────────────────────────────────────────────────
        customer_objs = []
        created_count = 0
        for i, cust in enumerate(CUSTOMERS):
            obj, c = User.objects.get_or_create(email=cust['email'], defaults={
                'name': cust['name'],
                'phone': cust['phone'],
                'is_active': True,
            })
            if c:
                obj.set_password('Test@12345')
                obj.save()
                created_count += 1
            customer_objs.append(obj)

        self.stdout.write(self.style.SUCCESS(f'OK:{created_count} مشتری جدید ایجاد شد (+ {len(CUSTOMERS) - created_count} موجود)'))

        # ── 3. Fake orders ──────────────────────────────────────────────────────
        now = timezone.now()
        orders_created = 0

        with transaction.atomic():
            for cust_idx, slug, qty, order_status, days_ago in ORDER_SCENARIOS:
                try:
                    product = Product.objects.get(slug=slug)
                except Product.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f'  WARN:محصول {slug} یافت نشد، رد شد'))
                    continue

                customer = customer_objs[cust_idx]
                addr = ADDRESSES[cust_idx]
                unit_price = product.discount_price or product.price
                subtotal   = unit_price * qty
                delivery   = 0 if subtotal >= 5_000_000 else 350_000
                total      = subtotal + delivery

                # Check if order from this customer for this product already exists
                existing = Order.objects.filter(
                    user=customer,
                    items__product=product,
                ).first()
                if existing:
                    continue

                order = Order.objects.create(
                    user=customer,
                    status=order_status,
                    shipping_name=customer.name,
                    shipping_phone=customer.phone or '09000000000',
                    shipping_province=addr['province'],
                    shipping_city=addr['city'],
                    shipping_postal='1234567890',
                    shipping_detail=addr['detail'],
                    subtotal=subtotal,
                    delivery_fee=delivery,
                    discount_amount=0,
                    total=total,
                    payment_method='online',
                    paid_at=now - timedelta(days=days_ago),
                )
                # Backdate created_at (bypasses auto_now_add)
                Order.objects.filter(pk=order.pk).update(
                    created_at=now - timedelta(days=days_ago)
                )

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    product_price=unit_price,
                    quantity=qty,
                )

                Invoice.objects.get_or_create(order=order)
                orders_created += 1

        self.stdout.write(self.style.SUCCESS(f'OK:{orders_created} سفارش نمونه ایجاد شد'))

        # ── 4. Fake reviews ────────────────────────────────────────────────────
        reviews_created = 0
        with transaction.atomic():
            for cust_idx, slug, rating, rev_status, text in REVIEWS_DATA:
                try:
                    product = Product.objects.get(slug=slug)
                except Product.DoesNotExist:
                    continue

                customer = customer_objs[cust_idx]
                _, created_rev = Review.objects.get_or_create(
                    product=product,
                    user=customer,
                    defaults={
                        'rating':  rating,
                        'text':    text,
                        'status':  rev_status,
                    },
                )
                if created_rev:
                    reviews_created += 1

        self.stdout.write(self.style.SUCCESS(f'OK:{reviews_created} نظر نمونه ایجاد شد'))

        # ── Summary ────────────────────────────────────────────────────────────
        self.stdout.write('\n' + self.style.MIGRATE_HEADING('=== Admin Login Info ==='))
        self.stdout.write(f'  React:  http://localhost:5173/login')
        self.stdout.write(f'  Django: http://localhost:8000/admin/')
        self.stdout.write(f'  Email:    {email}')
        self.stdout.write(f'  Password: {password}')
        self.stdout.write(self.style.SUCCESS('  Login with these credentials at /login\n'))
