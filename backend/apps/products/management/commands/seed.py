from django.core.management.base import BaseCommand
from apps.products.models import Category, Brand, Product, ProductImage, ProductSpec
from apps.discounts.models import DiscountCode

CATEGORIES = [
    {'name': 'لپ‌تاپ نو',       'slug': 'laptop-new',  'icon': 'laptop',   'order': 1},
    {'name': 'لپ‌تاپ دست دوم', 'slug': 'laptop-used', 'icon': 'laptop',   'order': 2},
    {'name': 'قطعات کامپیوتر', 'slug': 'parts',       'icon': 'cpu',      'order': 3},
    {'name': 'کامپیوتر',        'slug': 'desktop',     'icon': 'monitor',  'order': 4},
    {'name': 'کنسول',           'slug': 'console',     'icon': 'gamepad',  'order': 5},
]

BRANDS = [
    'Lenovo', 'HP', 'Dell', 'Asus', 'Acer', 'MSI', 'Apple',
    'Samsung', 'Corsair', 'Kingston', 'Intel', 'AMD',
    'Sony', 'Microsoft', 'Nintendo',
]

PRODUCTS = [
    {
        'slug': 'lenovo-ideapad-5-ryzen5-8gb-512',
        'name': 'لنوو IdeaPad 5 - Ryzen 5 / 8GB / 512GB',
        'category': 'laptop-new', 'brand': 'Lenovo', 'condition': 'new',
        'warranty': '۱۸ ماه گارانتی', 'price': 28500000, 'discount_price': 25900000,
        'stock': 5, 'rating': '4.3', 'reviews_count': 27, 'tags': ['پیشنهاد ویژه', 'پرفروش'], 'featured': True,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1781001870_1975462.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1780922536_1975671.jpg',
        ],
        'specs': {'cpu': 'AMD Ryzen 5 5500U', 'ram': '8GB DDR4', 'storage': '512GB NVMe SSD',
                  'gpu': 'AMD Radeon Graphics', 'display': '15.6 اینچ Full HD IPS',
                  'os': 'Windows 11 Home', 'weight': '1.7 کیلوگرم', 'battery': '45Wh'},
    },
    {
        'slug': 'hp-pavilion-i5-12th-8gb-256',
        'name': 'اچ‌پی Pavilion - Core i5 نسل 12 / 8GB / 256GB',
        'category': 'laptop-new', 'brand': 'HP', 'condition': 'new',
        'warranty': '۱۲ ماه گارانتی', 'price': 32000000, 'discount_price': None,
        'stock': 8, 'rating': '4.5', 'reviews_count': 41, 'tags': ['جدید'], 'featured': True,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1554996055_1473120.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1530281246_1419124.jpg',
        ],
        'specs': {'cpu': 'Intel Core i5-1235U', 'ram': '8GB DDR4', 'storage': '256GB SSD',
                  'gpu': 'Intel Iris Xe Graphics', 'display': '15.6 اینچ FHD',
                  'os': 'Windows 11 Home', 'weight': '1.75 کیلوگرم', 'battery': '41Wh'},
    },
    {
        'slug': 'asus-vivobook-15-i7-16gb-512',
        'name': 'ایسوس VivoBook 15 - Core i7 / 16GB / 512GB',
        'category': 'laptop-new', 'brand': 'Asus', 'condition': 'new',
        'warranty': '۲۴ ماه گارانتی', 'price': 42000000, 'discount_price': 39500000,
        'stock': 3, 'rating': '4.7', 'reviews_count': 19, 'tags': ['پرفروش'], 'featured': True,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1616593100_1628146.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1741698177_1877112.jpg',
        ],
        'specs': {'cpu': 'Intel Core i7-1255U', 'ram': '16GB DDR4', 'storage': '512GB NVMe SSD',
                  'gpu': 'NVIDIA GeForce MX550 2GB', 'display': '15.6 اینچ FHD OLED',
                  'os': 'Windows 11 Home', 'weight': '1.8 کیلوگرم', 'battery': '50Wh'},
    },
    {
        'slug': 'dell-inspiron-15-i5-8gb-512',
        'name': 'دل Inspiron 15 - Core i5 / 8GB / 512GB',
        'category': 'laptop-new', 'brand': 'Dell', 'condition': 'new',
        'warranty': '۱۲ ماه گارانتی', 'price': 31000000, 'discount_price': None,
        'stock': 12, 'rating': '4.2', 'reviews_count': 33, 'tags': [], 'featured': False,
        'images': ['https://static.bhphoto.com/images/images1000x1000/1374233890_982085.jpg'],
        'specs': {'cpu': 'Intel Core i5-1235U', 'ram': '8GB DDR4', 'storage': '512GB SSD',
                  'gpu': 'Intel Iris Xe', 'display': '15.6 اینچ FHD',
                  'os': 'Windows 11 Home', 'weight': '1.65 کیلوگرم', 'battery': '54Wh'},
    },
    {
        'slug': 'msi-modern-14-ryzen5-16gb-512',
        'name': 'ام‌اس‌آی Modern 14 - Ryzen 5 / 16GB / 512GB',
        'category': 'laptop-new', 'brand': 'MSI', 'condition': 'new',
        'warranty': '۱۲ ماه گارانتی', 'price': 36500000, 'discount_price': 34000000,
        'stock': 6, 'rating': '4.4', 'reviews_count': 15, 'tags': ['تخفیف'], 'featured': False,
        'images': ['https://static.bhphoto.com/images/images1000x1000/1566345076_1499613.jpg'],
        'specs': {'cpu': 'AMD Ryzen 5 6600H', 'ram': '16GB DDR5', 'storage': '512GB NVMe SSD',
                  'gpu': 'AMD Radeon 680M', 'display': '14 اینچ FHD IPS',
                  'os': 'Windows 11 Pro', 'weight': '1.4 کیلوگرم', 'battery': '53Wh'},
    },
    {
        'slug': 'acer-aspire5-i5-8gb-512',
        'name': 'ایسر Aspire 5 - Core i5 / 8GB / 512GB',
        'category': 'laptop-new', 'brand': 'Acer', 'condition': 'new',
        'warranty': '۱۲ ماه گارانتی', 'price': 27000000, 'discount_price': None,
        'stock': 9, 'rating': '4.1', 'reviews_count': 22, 'tags': [], 'featured': False,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1526564121_1408914.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1748514355_1896715.jpg',
        ],
        'specs': {'cpu': 'Intel Core i5-1235U', 'ram': '8GB DDR4', 'storage': '512GB SSD',
                  'gpu': 'Intel Iris Xe', 'display': '15.6 اینچ FHD',
                  'os': 'Windows 11 Home', 'weight': '1.85 کیلوگرم', 'battery': '57Wh'},
    },
    {
        'slug': 'lenovo-thinkpad-e14-used-i5-16gb',
        'name': 'لنوو ThinkPad E14 کارکرده - i5 / 16GB / 512GB',
        'category': 'laptop-used', 'brand': 'Lenovo', 'condition': 'used',
        'warranty': '۳ ماه گارانتی', 'price': 18000000, 'discount_price': 16500000,
        'stock': 2, 'rating': '4.0', 'reviews_count': 8, 'tags': ['قیمت عالی'], 'featured': True,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1718894127_1825336.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1763370827_1926507.jpg',
        ],
        'specs': {'cpu': 'Intel Core i5-10210U', 'ram': '16GB DDR4', 'storage': '512GB SSD',
                  'gpu': 'Intel UHD Graphics', 'display': '14 اینچ FHD IPS',
                  'os': 'Windows 10 Pro', 'weight': '1.6 کیلوگرم', 'battery': '45Wh'},
    },
    {
        'slug': 'hp-elitebook-840-used-i7-8gb',
        'name': 'اچ‌پی EliteBook 840 کارکرده - i7 / 8GB / 256GB',
        'category': 'laptop-used', 'brand': 'HP', 'condition': 'used',
        'warranty': '۶ ماه گارانتی', 'price': 22000000, 'discount_price': None,
        'stock': 1, 'rating': '4.2', 'reviews_count': 5, 'tags': [], 'featured': False,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1727787971_1840247.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1718838908_1835484.jpg',
        ],
        'specs': {'cpu': 'Intel Core i7-8550U', 'ram': '8GB DDR4', 'storage': '256GB SSD',
                  'gpu': 'Intel UHD 620', 'display': '14 اینچ FHD IPS',
                  'os': 'Windows 10 Pro', 'weight': '1.48 کیلوگرم', 'battery': '50Wh'},
    },
    # ===== LAPTOP USED (remaining) =====
    {
        'slug': 'dell-latitude-5490-used-i5',
        'name': 'دل Latitude 5490 کارکرده - i5 / 8GB / 256GB',
        'category': 'laptop-used', 'brand': 'Dell', 'condition': 'used',
        'warranty': '۳ ماه گارانتی', 'price': 15500000, 'discount_price': None,
        'stock': 3, 'rating': '3.9', 'reviews_count': 12,
        'tags': ['مقرون‌به‌صرفه'], 'featured': False,
        'images': ['https://static.bhphoto.com/images/images1000x1000/1376590111_1000376.jpg'],
        'specs': {'cpu': 'Intel Core i5-8350U', 'ram': '8GB DDR4', 'storage': '256GB SSD',
                  'gpu': 'Intel UHD 620', 'display': '14 اینچ FHD',
                  'os': 'Windows 10 Pro', 'weight': '1.6 کیلوگرم', 'battery': '42Wh'},
    },
    {
        'slug': 'asus-zenbook-ux430-used-i7',
        'name': 'ایسوس ZenBook UX430 کارکرده - i7 / 16GB / 512GB',
        'category': 'laptop-used', 'brand': 'Asus', 'condition': 'used',
        'warranty': '۶ ماه گارانتی', 'price': 24000000, 'discount_price': 21000000,
        'stock': 2, 'rating': '4.5', 'reviews_count': 9,
        'tags': ['پیشنهاد ویژه'], 'featured': True,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1581338847_1543085.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1771862196_1954086.jpg',
        ],
        'specs': {'cpu': 'Intel Core i7-8550U', 'ram': '16GB DDR3', 'storage': '512GB SSD',
                  'gpu': 'NVIDIA GeForce 930MX 2GB', 'display': '14 اینچ FHD IPS',
                  'os': 'Windows 10 Home', 'weight': '1.25 کیلوگرم', 'battery': '50Wh'},
    },
    {
        'slug': 'lenovo-yoga-510-used-i5',
        'name': 'لنوو Yoga 510 کارکرده - i5 / 8GB / 256GB',
        'category': 'laptop-used', 'brand': 'Lenovo', 'condition': 'used',
        'warranty': '۳ ماه گارانتی', 'price': 13000000, 'discount_price': None,
        'stock': 4, 'rating': '3.8', 'reviews_count': 7,
        'tags': [], 'featured': False,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1745944595_1888415.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1742579987_1885383.jpg',
        ],
        'specs': {'cpu': 'Intel Core i5-7200U', 'ram': '8GB DDR4', 'storage': '256GB SSD',
                  'gpu': 'Intel HD 620', 'display': '14 اینچ FHD IPS لمسی 360°',
                  'os': 'Windows 10 Home', 'weight': '1.75 کیلوگرم', 'battery': '35Wh'},
    },
    # ===== COMPUTER PARTS =====
    {
        'slug': 'intel-core-i5-13400',
        'name': 'پردازنده Intel Core i5-13400',
        'category': 'parts', 'brand': 'Intel', 'condition': 'new',
        'warranty': '۳۶ ماه گارانتی', 'price': 8900000, 'discount_price': 8200000,
        'stock': 20, 'rating': '4.8', 'reviews_count': 44,
        'tags': ['پرفروش'], 'featured': True,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1697445940_1781465.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1697445940_1781467.jpg',
        ],
        'specs': {'cpu': 'Intel Core i5-13400 | 10 هسته/16 رشته | بوست 4.6GHz | LGA1700 | 65W TDP'},
    },
    {
        'slug': 'amd-ryzen5-7600x',
        'name': 'پردازنده AMD Ryzen 5 7600X',
        'category': 'parts', 'brand': 'AMD', 'condition': 'new',
        'warranty': '۳۶ ماه گارانتی', 'price': 11500000, 'discount_price': None,
        'stock': 15, 'rating': '4.7', 'reviews_count': 31,
        'tags': ['جدید'], 'featured': False,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1670509839_1723471.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1748517940_1807320.jpg',
        ],
        'specs': {'cpu': 'AMD Ryzen 5 7600X | 6 هسته/12 رشته | بوست 5.3GHz | AM5 | 105W TDP'},
    },
    {
        'slug': 'corsair-vengeance-16gb-ddr5',
        'name': 'رم کورسیر Vengeance 16GB DDR5 5600MHz',
        'category': 'parts', 'brand': 'Corsair', 'condition': 'new',
        'warranty': '۳۶ ماه گارانتی', 'price': 4200000, 'discount_price': 3900000,
        'stock': 30, 'rating': '4.6', 'reviews_count': 56,
        'tags': ['پرفروش', 'تخفیف'], 'featured': True,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1770890527_1942119.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1688083205_1723651.jpg',
        ],
        'specs': {'ram': '16GB DDR5 5600MHz CL36 | 1.25V'},
    },
    {
        'slug': 'kingston-fury-8gb-ddr4',
        'name': 'رم کینگستون Fury Beast 8GB DDR4 3200MHz',
        'category': 'parts', 'brand': 'Kingston', 'condition': 'new',
        'warranty': '۳۶ ماه گارانتی', 'price': 1800000, 'discount_price': None,
        'stock': 50, 'rating': '4.5', 'reviews_count': 89,
        'tags': ['پرفروش'], 'featured': False,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1739835965_1875707.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1727343647_1775614.jpg',
        ],
        'specs': {'ram': '8GB DDR4 3200MHz CL16 | 1.35V'},
    },
    {
        'slug': 'samsung-980-pro-1tb-nvme',
        'name': 'SSD سامسونگ 980 Pro 1TB NVMe',
        'category': 'parts', 'brand': 'Samsung', 'condition': 'new',
        'warranty': '۶۰ ماه گارانتی', 'price': 5500000, 'discount_price': 5100000,
        'stock': 25, 'rating': '4.9', 'reviews_count': 102,
        'tags': ['پرفروش', 'تخفیف'], 'featured': True,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1667295948_1726548.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1667295948_1726547.jpg',
        ],
        'specs': {'storage': '1TB NVMe PCIe 4.0 | خواندن: 7000MB/s | نوشتن: 5100MB/s | M.2 2280'},
    },
    {
        'slug': 'asus-rtx4070-tuf-gaming',
        'name': 'کارت گرافیک ASUS TUF Gaming RTX 4070',
        'category': 'parts', 'brand': 'Asus', 'condition': 'new',
        'warranty': '۳۶ ماه گارانتی', 'price': 68000000, 'discount_price': None,
        'stock': 4, 'rating': '4.8', 'reviews_count': 17,
        'tags': ['جدید'], 'featured': False,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1738060668_1872330.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1741164402_1875955.jpg',
        ],
        'specs': {'gpu': 'NVIDIA GeForce RTX 4070 12GB GDDR6X | 5888 CUDA | بوست 2475MHz | HDMI 2.1 / 3x DP 1.4a'},
    },
    {
        'slug': 'kingston-ssd-sa400-480gb',
        'name': 'SSD کینگستون A400 480GB SATA',
        'category': 'parts', 'brand': 'Kingston', 'condition': 'new',
        'warranty': '۳۶ ماه گارانتی', 'price': 1600000, 'discount_price': 1450000,
        'stock': 40, 'rating': '4.3', 'reviews_count': 134,
        'tags': ['پرفروش', 'مقرون‌به‌صرفه'], 'featured': False,
        'images': ['https://static.bhphoto.com/images/images1000x1000/1575564246_1523159.jpg'],
        'specs': {'storage': '480GB SATA III | خواندن: 500MB/s | نوشتن: 450MB/s | 2.5 inch'},
    },
    {
        'slug': 'hp-laptop-15s-i3-8gb-256',
        'name': 'اچ‌پی Laptop 15s - Core i3 / 8GB / 256GB',
        'category': 'laptop-new', 'brand': 'HP', 'condition': 'new',
        'warranty': '۱۲ ماه گارانتی', 'price': 21000000, 'discount_price': None,
        'stock': 14, 'rating': '4.0', 'reviews_count': 28,
        'tags': ['مقرون‌به‌صرفه'], 'featured': False,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1773163330_1955779.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1746002726_1883233.jpg',
        ],
        'specs': {'cpu': 'Intel Core i3-1215U', 'ram': '8GB DDR4', 'storage': '256GB SSD',
                  'gpu': 'Intel UHD Graphics', 'display': '15.6 اینچ FHD',
                  'os': 'Windows 11 Home', 'weight': '1.69 کیلوگرم', 'battery': '41Wh'},
    },
    {
        'slug': 'lenovo-ideapad-gaming3-rtx3050',
        'name': 'لنوو IdeaPad Gaming 3 - i7 / 16GB / RTX3050',
        'category': 'laptop-new', 'brand': 'Lenovo', 'condition': 'new',
        'warranty': '۱۸ ماه گارانتی', 'price': 52000000, 'discount_price': 49500000,
        'stock': 5, 'rating': '4.6', 'reviews_count': 38,
        'tags': ['گیمینگ', 'پرفروش'], 'featured': True,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1644924029_1690032.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1773344214_1954944.jpg',
        ],
        'specs': {'cpu': 'Intel Core i7-12650H', 'ram': '16GB DDR5', 'storage': '512GB NVMe SSD',
                  'gpu': 'NVIDIA GeForce RTX 3050 4GB', 'display': '15.6 اینچ FHD IPS 120Hz',
                  'os': 'Windows 11 Home', 'weight': '2.2 کیلوگرم', 'battery': '45Wh'},
    },
]

    # ===== DESKTOP COMPUTERS =====
    {
        'slug': 'desktop-intel-i5-12400-16gb-512',
        'name': 'کامپیوتر رومیزی Intel Core i5-12400 / 16GB / 512GB SSD',
        'category': 'desktop', 'brand': 'Intel', 'condition': 'new',
        'warranty': '۱۲ ماه گارانتی', 'price': 24500000, 'discount_price': 22900000,
        'stock': 8, 'rating': '4.4', 'reviews_count': 18, 'tags': ['پیشنهاد ویژه'], 'featured': True,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1660838613_1714087.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1660838613_1714088.jpg',
        ],
        'specs': {'cpu': 'Intel Core i5-12400 | 6 هسته/12 رشته | بوست 4.4GHz',
                  'ram': '16GB DDR4 3200MHz', 'storage': '512GB NVMe SSD',
                  'gpu': 'Intel UHD Graphics 730 (داخلی)', 'os': 'Windows 11 Home',
                  'weight': 'کیس مینی‌تاور'},
    },
    {
        'slug': 'desktop-gaming-i7-rtx3060-32gb',
        'name': 'کامپیوتر گیمینگ Core i7-12700 / 32GB / RTX 3060 / 1TB',
        'category': 'desktop', 'brand': 'Asus', 'condition': 'new',
        'warranty': '۱۸ ماه گارانتی', 'price': 78000000, 'discount_price': None,
        'stock': 3, 'rating': '4.8', 'reviews_count': 11, 'tags': ['گیمینگ', 'پرفروش'], 'featured': True,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1736804688_1861900.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1736804688_1861901.jpg',
        ],
        'specs': {'cpu': 'Intel Core i7-12700 | 12 هسته | بوست 4.9GHz',
                  'ram': '32GB DDR4 3200MHz Dual Channel',
                  'storage': '1TB NVMe PCIe 4.0 SSD',
                  'gpu': 'NVIDIA GeForce RTX 3060 12GB GDDR6',
                  'os': 'Windows 11 Home', 'weight': 'کیس میدتاور'},
    },
    {
        'slug': 'desktop-ryzen5-5600g-apu-16gb',
        'name': 'کامپیوتر رومیزی AMD Ryzen 5 5600G APU / 16GB / 480GB',
        'category': 'desktop', 'brand': 'AMD', 'condition': 'new',
        'warranty': '۱۲ ماه گارانتی', 'price': 19800000, 'discount_price': 18500000,
        'stock': 10, 'rating': '4.2', 'reviews_count': 25, 'tags': ['مقرون‌به‌صرفه'], 'featured': False,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1660838613_1714087.jpg',
        ],
        'specs': {'cpu': 'AMD Ryzen 5 5600G | گرافیک Vega 7 داخلی',
                  'ram': '16GB DDR4 3200MHz', 'storage': '480GB SATA SSD',
                  'gpu': 'AMD Radeon Vega 7 (داخلی)', 'os': 'Windows 11 Home',
                  'weight': 'کیس مینی‌تاور'},
    },

    # ===== GAMING CONSOLES =====
    {
        'slug': 'sony-playstation5-disc',
        'name': 'کنسول بازی Sony PlayStation 5 (نسخه دیسک)',
        'category': 'console', 'brand': 'Sony', 'condition': 'new',
        'warranty': '۱۲ ماه گارانتی', 'price': 52000000, 'discount_price': 49000000,
        'stock': 5, 'rating': '4.9', 'reviews_count': 67, 'tags': ['پرفروش', 'جدید'], 'featured': True,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1737647419_1864523.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1702401817_1785527.jpg',
        ],
        'specs': {'cpu': 'AMD Zen 2 | 8 هسته 3.5GHz',
                  'gpu': 'AMD RDNA 2 | 10.28 TFLOPS | 4K/120fps',
                  'storage': '825GB NVMe SSD | حداکثر خواندن 5.5GB/s',
                  'ram': '16GB GDDR6', 'os': 'PlayStation OS',
                  'weight': '4.5 کیلوگرم'},
    },
    {
        'slug': 'microsoft-xbox-series-x',
        'name': 'کنسول بازی Microsoft Xbox Series X',
        'category': 'console', 'brand': 'Microsoft', 'condition': 'new',
        'warranty': '۱۲ ماه گارانتی', 'price': 48000000, 'discount_price': None,
        'stock': 4, 'rating': '4.8', 'reviews_count': 42, 'tags': ['جدید'], 'featured': True,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1730730710_1844786.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1717445993_1815741.jpg',
        ],
        'specs': {'cpu': 'AMD Zen 2 | 8 هسته 3.8GHz',
                  'gpu': 'AMD RDNA 2 | 12 TFLOPS | 4K/120fps',
                  'storage': '1TB NVMe SSD سفارشی',
                  'ram': '16GB GDDR6 + 10GB DDR4', 'os': 'Xbox OS',
                  'weight': '4.45 کیلوگرم'},
    },
    {
        'slug': 'nintendo-switch-oled',
        'name': 'کنسول بازی Nintendo Switch OLED',
        'category': 'console', 'brand': 'Nintendo', 'condition': 'new',
        'warranty': '۶ ماه گارانتی', 'price': 22000000, 'discount_price': 20500000,
        'stock': 9, 'rating': '4.7', 'reviews_count': 89, 'tags': ['پرفروش', 'تخفیف'], 'featured': False,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1633028834_1666234.jpg',
            'https://static.bhphoto.com/images/images1000x1000/1633028834_1666235.jpg',
        ],
        'specs': {'cpu': 'NVIDIA Tegra X1+ | ARM Cortex-A57',
                  'gpu': 'NVIDIA Maxwell 256 CUDA',
                  'storage': '64GB داخلی + پشتیبانی از MicroSD تا 2TB',
                  'display': '7 اینچ OLED | 1280×720 | 60fps',
                  'battery': '4310mAh | 4.5-9 ساعت',
                  'weight': '420 گرم'},
    },
    {
        'slug': 'sony-playstation5-slim-digital',
        'name': 'کنسول بازی Sony PlayStation 5 Slim (نسخه دیجیتال)',
        'category': 'console', 'brand': 'Sony', 'condition': 'new',
        'warranty': '۱۲ ماه گارانتی', 'price': 42000000, 'discount_price': 39500000,
        'stock': 6, 'rating': '4.8', 'reviews_count': 34, 'tags': ['جدید', 'تخفیف'], 'featured': False,
        'images': [
            'https://static.bhphoto.com/images/images1000x1000/1699539282_1794282.jpg',
        ],
        'specs': {'cpu': 'AMD Zen 2 | 8 هسته 3.5GHz',
                  'gpu': 'AMD RDNA 2 | 10.28 TFLOPS | 4K/120fps',
                  'storage': '1TB NVMe SSD',
                  'ram': '16GB GDDR6', 'os': 'PlayStation OS',
                  'weight': '3.2 کیلوگرم (سبک‌تر از نسل قبل)'},
    },
]

DISCOUNT_CODES = [
    {'code': 'INTEL10', 'discount_type': 'percent', 'percent': 10},
    {'code': 'SHOP20', 'discount_type': 'percent', 'percent': 20},
    {'code': 'WELCOME5', 'discount_type': 'percent', 'percent': 5},
]


class Command(BaseCommand):
    help = 'بارگذاری داده اولیه (دسته‌بندی، برند، محصول، کد تخفیف)'

    def handle(self, *args, **options):
        self.stdout.write('در حال بارگذاری داده‌ها...')

        for cat in CATEGORIES:
            Category.objects.update_or_create(slug=cat['slug'], defaults=cat)
        self.stdout.write(f'  ✓ {len(CATEGORIES)} دسته‌بندی')

        for brand_name in BRANDS:
            Brand.objects.get_or_create(name=brand_name)
        self.stdout.write(f'  ✓ {len(BRANDS)} برند')

        for p_orig in PRODUCTS:
            p = {k: v for k, v in p_orig.items()}  # shallow copy so pops don't mutate the original
            cat = Category.objects.get(slug=p.pop('category'))
            brand = Brand.objects.get(name=p.pop('brand'))
            specs_data = p.pop('specs', {})
            images_data = p.pop('images', [])

            product, _ = Product.objects.update_or_create(
                slug=p['slug'],
                defaults={**p, 'category': cat, 'brand': brand},
            )

            product.images.all().delete()
            for i, url in enumerate(images_data):
                ProductImage.objects.create(product=product, url=url, order=i)

            ProductSpec.objects.update_or_create(product=product, defaults=specs_data)

        self.stdout.write(f'  ✓ {len(PRODUCTS)} محصول')

        for dc in DISCOUNT_CODES:
            DiscountCode.objects.update_or_create(code=dc['code'], defaults=dc)
        self.stdout.write(f'  ✓ {len(DISCOUNT_CODES)} کد تخفیف')

        self.stdout.write(self.style.SUCCESS('داده‌ها با موفقیت بارگذاری شدند!'))
