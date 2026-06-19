import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Truck, CreditCard, BadgeCheck, Zap, Tag } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const slides = [
  {
    id: 1,
    badge: 'جدیدترین مدل‌ها',
    title: 'بهترین لپ‌تاپ‌های نو',
    subtitle: 'با گارانتی اصل و قیمت رقابتی',
    chips: [
      { icon: ShieldCheck, label: 'گارانتی اصالت' },
      { icon: CreditCard, label: 'خرید اقساطی' },
      { icon: Truck, label: 'ارسال رایگان' },
    ],
    cta: 'مشاهده لپ‌تاپ نو',
    to: '/shop?category=laptop-new',
    offer: 'تا ۱۸ ماه گارانتی',
    bg: 'from-primary-900 via-primary-800 to-primary-600',
    glow: 'bg-sky-400/30',
    image: 'https://static.bhphoto.com/images/images1000x1000/1616593100_1628146.jpg',
  },
  {
    id: 2,
    badge: 'صرفه‌جویانه',
    title: 'لپ‌تاپ دست دوم با کیفیت',
    subtitle: 'قیمت مناسب، کیفیت تضمین‌شده',
    chips: [
      { icon: BadgeCheck, label: 'تست کامل سخت‌افزار' },
      { icon: ShieldCheck, label: '۶ ماه گارانتی' },
      { icon: Tag, label: 'قیمت ویژه' },
    ],
    cta: 'مشاهده لپ‌تاپ دست دوم',
    to: '/shop?category=laptop-used',
    offer: 'تا ۴۰٪ ارزان‌تر',
    bg: 'from-amber-900 via-amber-700 to-amber-500',
    glow: 'bg-orange-400/30',
    image: 'https://static.bhphoto.com/images/images1000x1000/1718894127_1825336.jpg',
  },
  {
    id: 3,
    badge: 'تخفیف ویژه',
    title: 'قطعات کامپیوتر اصل',
    subtitle: 'CPU، RAM، SSD و کارت گرافیک',
    chips: [
      { icon: BadgeCheck, label: 'کالای اورجینال' },
      { icon: Zap, label: 'ارتقای سریع سیستم' },
      { icon: Truck, label: 'ارسال سریع' },
    ],
    cta: 'مشاهده قطعات',
    to: '/shop?category=parts',
    offer: 'گارانتی تعویض',
    bg: 'from-violet-950 via-violet-800 to-violet-600',
    glow: 'bg-fuchsia-400/30',
    image: 'https://static.bhphoto.com/images/images1000x1000/1738060668_1872330.jpg',
  },
]

export default function HeroSlider() {
  return (
    <div className="overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className={`relative overflow-hidden bg-gradient-to-l ${slide.bg} min-h-[420px] sm:min-h-[500px] flex items-center`}>
              {/* Decorative layers */}
              <div className={`absolute -top-24 -left-16 w-[28rem] h-[28rem] ${slide.glow} rounded-full blur-3xl`} />
              <div className="absolute -bottom-32 right-0 w-96 h-96 bg-black/20 rounded-full blur-3xl" />
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                }}
              />

              <div className="container-custom relative w-full py-12">
                <div className="flex flex-col-reverse sm:flex-row items-center gap-8 sm:gap-12">
                  {/* Text */}
                  <div className="flex-1 text-white text-center sm:text-right">
                    <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md ring-1 ring-white/25 text-white text-xs font-bold px-3.5 py-1.5 rounded-full mb-5">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {slide.badge}
                    </span>

                    <h1 className="text-3xl sm:text-5xl font-black mb-3 leading-[1.15] tracking-tight">
                      {slide.title}
                    </h1>
                    <p className="text-white/80 text-base sm:text-lg mb-6 font-medium">{slide.subtitle}</p>

                    {/* Feature chips */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-7">
                      {slide.chips.map((chip) => (
                        <span
                          key={chip.label}
                          className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm ring-1 ring-white/15 text-white/90 text-xs sm:text-sm px-3 py-1.5 rounded-xl"
                        >
                          <chip.icon size={15} className="shrink-0" />
                          {chip.label}
                        </span>
                      ))}
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
                      <Link
                        to={slide.to}
                        className="group inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-7 py-3.5 rounded-2xl shadow-xl shadow-black/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
                      >
                        {slide.cta}
                        <ArrowLeft size={17} className="group-hover:-translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3.5 rounded-2xl ring-1 ring-white/40 hover:bg-white/10 transition-colors"
                      >
                        همه محصولات
                      </Link>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="flex-1 flex justify-center w-full">
                    <div className="relative group/img">
                      {/* Glow ring */}
                      <div className="absolute -inset-6 bg-white/20 blur-2xl rounded-full" />

                      {/* Offer badge */}
                      <span className="absolute -top-3 -right-3 sm:-right-4 z-20 bg-white text-primary-700 text-xs sm:text-sm font-black px-4 py-2 rounded-2xl shadow-xl rotate-3">
                        {slide.offer}
                      </span>

                      <div className="relative bg-white rounded-[2rem] shadow-2xl p-5 sm:p-7 ring-1 ring-white/40">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full max-w-[260px] sm:max-w-[340px] aspect-square object-contain transition-transform duration-500 group-hover/img:scale-105 group-hover/img:-rotate-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
