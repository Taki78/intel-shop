// ===== Mock data for the admin panel =====
export { ORDER_STATUS } from '../components/admin/ui'

export const orders = [
  {
    id: 'ORD-1452', customer: 'علی محمدی', email: 'ali.m@gmail.com', phone: '۰۹۱۲۳۴۵۶۷۸۹',
    date: '1403/10/15', status: 'delivered', payment: 'online', city: 'تهران',
    address: 'تهران، خیابان ولیعصر، کوچه بهار، پلاک ۱۲',
    items: [
      { name: 'لنوو IdeaPad 5 - Ryzen 5', qty: 1, price: 25900000 },
      { name: 'رم کینگستون 8GB DDR4', qty: 2, price: 1800000 },
    ],
    total: 29500000,
  },
  {
    id: 'ORD-1451', customer: 'سارا کریمی', email: 'sara.karimi@yahoo.com', phone: '۰۹۳۵۱۱۱۲۲۳۳',
    date: '1403/10/15', status: 'shipped', payment: 'online', city: 'اصفهان',
    address: 'اصفهان، خیابان چهارباغ، پلاک ۸۸',
    items: [{ name: 'پردازنده Intel Core i5-13400', qty: 1, price: 8200000 }],
    total: 8200000,
  },
  {
    id: 'ORD-1450', customer: 'محمد رضایی', email: 'mrezaei@gmail.com', phone: '۰۹۱۹۸۷۶۵۴۳۲',
    date: '1403/10/14', status: 'processing', payment: 'online', city: 'شیراز',
    address: 'شیراز، بلوار زند، پلاک ۴۵',
    items: [{ name: 'اچ‌پی Pavilion - Core i5', qty: 1, price: 32000000 }],
    total: 32000000,
  },
  {
    id: 'ORD-1449', customer: 'زهرا اکبری', email: 'z.akbari@gmail.com', phone: '۰۹۱۲۰۰۰۱۱۲۲',
    date: '1403/10/14', status: 'processing', payment: 'cod', city: 'مشهد',
    address: 'مشهد، بلوار وکیل‌آباد، پلاک ۲۳',
    items: [
      { name: 'SSD سامسونگ 980 Pro 1TB', qty: 1, price: 5100000 },
      { name: 'رم کورسیر 16GB DDR5', qty: 1, price: 3900000 },
    ],
    total: 9000000,
  },
  {
    id: 'ORD-1448', customer: 'حسین نوری', email: 'hossein.n@gmail.com', phone: '۰۹۱۲۵۵۵۶۶۷۷',
    date: '1403/10/13', status: 'delivered', payment: 'online', city: 'تبریز',
    address: 'تبریز، خیابان آزادی، پلاک ۷',
    items: [{ name: 'لنوو IdeaPad Gaming 3 - RTX3050', qty: 1, price: 49500000 }],
    total: 49500000,
  },
  {
    id: 'ORD-1447', customer: 'مریم حسینی', email: 'maryam.h@yahoo.com', phone: '۰۹۳۰۱۲۳۴۵۶۷',
    date: '1403/10/13', status: 'canceled', payment: 'online', city: 'کرج',
    address: 'کرج، عظیمیه، پلاک ۱۹',
    items: [{ name: 'ایسوس VivoBook 15 - Core i7', qty: 1, price: 39500000 }],
    total: 39500000,
  },
  {
    id: 'ORD-1446', customer: 'رضا قاسمی', email: 'reza.gh@gmail.com', phone: '۰۹۱۲۳۲۱۰۹۸۷',
    date: '1403/10/12', status: 'shipped', payment: 'cod', city: 'تهران',
    address: 'تهران، نارمک، پلاک ۵۶',
    items: [
      { name: 'کارت گرافیک ASUS TUF RTX 4070', qty: 1, price: 68000000 },
    ],
    total: 68000000,
  },
  {
    id: 'ORD-1445', customer: 'فاطمه عباسی', email: 'f.abbasi@gmail.com', phone: '۰۹۱۲۷۸۹۰۱۲۳',
    date: '1403/10/12', status: 'pending', payment: 'online', city: 'قم',
    address: 'قم، بلوار امین، پلاک ۳۳',
    items: [{ name: 'دل Inspiron 15 - Core i5', qty: 1, price: 31000000 }],
    total: 31000000,
  },
  {
    id: 'ORD-1444', customer: 'امیر صادقی', email: 'amir.s@yahoo.com', phone: '۰۹۳۸۴۴۴۵۵۶۶',
    date: '1403/10/11', status: 'delivered', payment: 'online', city: 'اهواز',
    address: 'اهواز، کیانپارس، پلاک ۹۸',
    items: [
      { name: 'لنوو ThinkPad E14 کارکرده', qty: 1, price: 16500000 },
      { name: 'SSD کینگستون A400 480GB', qty: 1, price: 1450000 },
    ],
    total: 17950000,
  },
  {
    id: 'ORD-1443', customer: 'نگار محمودی', email: 'negar.m@gmail.com', phone: '۰۹۱۲۶۶۶۷۷۸۸',
    date: '1403/10/10', status: 'delivered', payment: 'cod', city: 'رشت',
    address: 'رشت، گلسار، پلاک ۱۴',
    items: [{ name: 'ام‌اس‌آی Modern 14 - Ryzen 5', qty: 1, price: 34000000 }],
    total: 34000000,
  },
]

export const customers = [
  { id: 1, name: 'علی محمدی', email: 'ali.m@gmail.com', phone: '۰۹۱۲۳۴۵۶۷۸۹', city: 'تهران', joined: '1402/03/12', orders: 8, spent: 142000000, status: 'active' },
  { id: 2, name: 'سارا کریمی', email: 'sara.karimi@yahoo.com', phone: '۰۹۳۵۱۱۱۲۲۳۳', city: 'اصفهان', joined: '1402/06/05', orders: 3, spent: 24500000, status: 'active' },
  { id: 3, name: 'محمد رضایی', email: 'mrezaei@gmail.com', phone: '۰۹۱۹۸۷۶۵۴۳۲', city: 'شیراز', joined: '1402/08/21', orders: 5, spent: 88000000, status: 'active' },
  { id: 4, name: 'زهرا اکبری', email: 'z.akbari@gmail.com', phone: '۰۹۱۲۰۰۰۱۱۲۲', city: 'مشهد', joined: '1403/01/15', orders: 2, spent: 14000000, status: 'active' },
  { id: 5, name: 'حسین نوری', email: 'hossein.n@gmail.com', phone: '۰۹۱۲۵۵۵۶۶۷۷', city: 'تبریز', joined: '1402/11/30', orders: 6, spent: 96500000, status: 'active' },
  { id: 6, name: 'مریم حسینی', email: 'maryam.h@yahoo.com', phone: '۰۹۳۰۱۲۳۴۵۶۷', city: 'کرج', joined: '1403/02/18', orders: 1, spent: 0, status: 'inactive' },
  { id: 7, name: 'رضا قاسمی', email: 'reza.gh@gmail.com', phone: '۰۹۱۲۳۲۱۰۹۸۷', city: 'تهران', joined: '1401/12/03', orders: 12, spent: 215000000, status: 'active' },
  { id: 8, name: 'فاطمه عباسی', email: 'f.abbasi@gmail.com', phone: '۰۹۱۲۷۸۹۰۱۲۳', city: 'قم', joined: '1403/04/22', orders: 1, spent: 0, status: 'inactive' },
  { id: 9, name: 'امیر صادقی', email: 'amir.s@yahoo.com', phone: '۰۹۳۸۴۴۴۵۵۶۶', city: 'اهواز', joined: '1402/07/14', orders: 4, spent: 52000000, status: 'active' },
  { id: 10, name: 'نگار محمودی', email: 'negar.m@gmail.com', phone: '۰۹۱۲۶۶۶۷۷۸۸', city: 'رشت', joined: '1402/09/09', orders: 7, spent: 119000000, status: 'active' },
]

// Sales for the last 7 days (in millions of Toman) — for the bar chart
export const salesWeek = [
  { day: 'شنبه', value: 42 },
  { day: 'یکشنبه', value: 58 },
  { day: 'دوشنبه', value: 35 },
  { day: 'سه‌شنبه', value: 71 },
  { day: 'چهارشنبه', value: 64 },
  { day: 'پنجشنبه', value: 89 },
  { day: 'جمعه', value: 96 },
]

// Revenue share by category — for the donut
export const categoryShare = [
  { label: 'لپ‌تاپ نو', value: 52, color: '#2563eb' },
  { label: 'لپ‌تاپ دست دوم', value: 27, color: '#f59e0b' },
  { label: 'قطعات کامپیوتر', value: 21, color: '#7c3aed' },
]

// Recent activity feed
export const activity = [
  { type: 'order', text: 'سفارش جدید ORD-1452 ثبت شد', time: '۵ دقیقه پیش', color: 'bg-blue-500' },
  { type: 'user', text: 'کاربر جدید: فاطمه عباسی', time: '۳۲ دقیقه پیش', color: 'bg-emerald-500' },
  { type: 'stock', text: 'موجودی «ایسوس VivoBook 15» کم است', time: '۱ ساعت پیش', color: 'bg-amber-500' },
  { type: 'review', text: 'نظر جدید برای «SSD سامسونگ 980 Pro»', time: '۲ ساعت پیش', color: 'bg-violet-500' },
  { type: 'order', text: 'سفارش ORD-1447 لغو شد', time: '۳ ساعت پیش', color: 'bg-red-500' },
]

// Reviews
export const reviews = [
  { id: 1, product: 'لنوو IdeaPad 5 - Ryzen 5 / 8GB / 512GB', user: 'علی محمدی', email: 'ali.m@gmail.com', rating: 5, text: 'محصول عالی بود، خیلی راضی هستم. کیفیت ساخت فوق‌العاده است و سرعت بسیار بالایی دارد.', date: '1403/10/12', status: 'approved' },
  { id: 2, product: 'SSD سامسونگ 980 Pro 1TB', user: 'زهرا اکبری', email: 'z.akbari@gmail.com', rating: 4, text: 'سرعت خواندن و نوشتن خیلی خوبه. به این قیمت پیشنهاد می‌کنم.', date: '1403/10/13', status: 'approved' },
  { id: 3, product: 'ایسوس VivoBook 15 - Core i7', user: 'مریم حسینی', email: 'maryam.h@yahoo.com', rating: 2, text: 'باتری ضعیف داره و زیادی گرم می‌کنه. انتظارم بیشتر بود. پشتیبانی هم جواب نداد.', date: '1403/10/14', status: 'pending' },
  { id: 4, product: 'پردازنده Intel Core i5-13400', user: 'سارا کریمی', email: 'sara.karimi@yahoo.com', rating: 5, text: 'سرعت و کارایی بی‌نظیر، به قیمتش کاملاً می‌ارزه.', date: '1403/10/14', status: 'approved' },
  { id: 5, product: 'لنوو ThinkPad E14 کارکرده', user: 'امیر صادقی', email: 'amir.s@yahoo.com', rating: 3, text: 'برای یه لپ‌تاپ دست دوم بد نیست ولی باتری ضعیفه و کیبورد خستگی داره.', date: '1403/10/11', status: 'approved' },
  { id: 6, product: 'رم کینگستون 8GB DDR4', user: 'محمد رضایی', email: 'mrezaei@gmail.com', rating: 4, text: 'کیفیت خوب به قیمتش. نصب ساده و سرعت قابل قبول.', date: '1403/10/09', status: 'pending' },
  { id: 7, product: 'کارت گرافیک ASUS TUF RTX 4070', user: 'رضا قاسمی', email: 'reza.gh@gmail.com', rating: 5, text: '4K با 60 فریم ثابت راحت کار می‌کنه. خرید بی‌نظیری بود!', date: '1403/10/08', status: 'approved' },
  { id: 8, product: 'ام‌اس‌آی Modern 14 - Ryzen 5', user: 'نگار محمودی', email: 'negar.m@gmail.com', rating: 4, text: 'طراحی زیبا و سبک، برای کار روزمره عالیه. ضمانت هم خوبه.', date: '1403/10/07', status: 'approved' },
]

// Notifications (shared initial state for bell dropdown + notifications page)
export const NOTIFICATIONS_INIT = [
  { id: 1,  type: 'order',        text: 'سفارش جدید ORD-1452 ثبت شد',                 time: '۵ دقیقه پیش',  read: false },
  { id: 2,  type: 'user',         text: 'کاربر جدید ثبت‌نام کرد: فاطمه عباسی',         time: '۳۲ دقیقه پیش', read: false },
  { id: 3,  type: 'stock',        text: 'موجودی «ایسوس VivoBook 15» به حد هشدار رسید', time: '۱ ساعت پیش',   read: false },
  { id: 4,  type: 'review',       text: 'نظر جدید برای «SSD سامسونگ 980 Pro»',         time: '۲ ساعت پیش',   read: true  },
  { id: 5,  type: 'order_cancel', text: 'سفارش ORD-1447 توسط مشتری لغو شد',            time: '۳ ساعت پیش',   read: true  },
  { id: 6,  type: 'payment',      text: 'پرداخت موفق ORD-1446 تأیید شد',               time: '۵ ساعت پیش',   read: true  },
  { id: 7,  type: 'order',        text: 'سفارش جدید ORD-1451 ثبت شد',                 time: '۷ ساعت پیش',   read: true  },
  { id: 8,  type: 'stock',        text: 'موجودی «Intel Core i9-13900K» به اتمام رسید', time: 'دیروز',         read: true  },
  { id: 9,  type: 'user',         text: 'کاربر جدید ثبت‌نام کرد: حسین نوری',           time: 'دیروز',         read: true  },
  { id: 10, type: 'order',        text: 'سفارش جدید ORD-1450 ثبت شد',                 time: 'دیروز',         read: true  },
  { id: 11, type: 'review',       text: 'نظر جدید برای «کارت گرافیک RTX 4070»',        time: '۲ روز پیش',    read: true  },
  { id: 12, type: 'payment',      text: 'پرداخت موفق ORD-1448 تأیید شد',               time: '۲ روز پیش',    read: true  },
]

// Discount / coupon codes
export const coupons = [
  { code: 'INTEL10', percent: 10, desc: 'تخفیف عمومی', used: 142, limit: 500, expires: '1403/12/29', active: true },
  { code: 'SHOP20', percent: 20, desc: 'تخفیف ویژه فروشگاه', used: 88, limit: 200, expires: '1403/11/30', active: true },
  { code: 'WELCOME5', percent: 5, desc: 'خوش‌آمدگویی کاربران جدید', used: 305, limit: 1000, expires: '1404/06/31', active: true },
  { code: 'NOWRUZ50', percent: 50, desc: 'جشنواره نوروزی', used: 0, limit: 100, expires: '1403/01/15', active: false },
]
