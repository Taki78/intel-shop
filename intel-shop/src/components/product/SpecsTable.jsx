const specLabels = {
  cpu: 'پردازنده',
  ram: 'حافظه رم',
  storage: 'حافظه ذخیره‌ساز',
  gpu: 'کارت گرافیک',
  display: 'صفحه‌نمایش',
  os: 'سیستم‌عامل',
  weight: 'وزن',
  battery: 'باتری',
  cores: 'هسته‌ها',
  base_clock: 'فرکانس پایه',
  boost_clock: 'فرکانس بوست',
  cache: 'کش',
  tdp: 'مصرف برق',
  socket: 'سوکت',
  capacity: 'ظرفیت',
  type: 'نوع',
  speed: 'سرعت',
  latency: 'تاخیر',
  voltage: 'ولتاژ',
  interface: 'رابط',
  read_speed: 'سرعت خواندن',
  write_speed: 'سرعت نوشتن',
  form_factor: 'فرم‌فاکتور',
  vram: 'حافظه گرافیک',
  cuda_cores: 'هسته‌های CUDA',
  ports: 'پورت‌ها',
  power: 'توان',
}

export default function SpecsTable({ specs = {} }) {
  const entries = Object.entries(specs).filter(([, v]) => v)
  if (entries.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="bg-primary-50 px-5 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-800">مشخصات فنی</h3>
      </div>
      <table className="w-full">
        <tbody>
          {entries.map(([key, value], i) => (
            <tr key={key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-5 py-3 text-sm font-medium text-gray-500 w-2/5">
                {specLabels[key] || key}
              </td>
              <td className="px-5 py-3 text-sm text-gray-800 font-medium">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
