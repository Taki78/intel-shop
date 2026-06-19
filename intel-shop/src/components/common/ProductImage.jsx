const T = {
  Lenovo:   { c1:'#0f172a', c2:'#1e3a5f', accent:'#2563eb', sub:'#93c5fd' },
  HP:       { c1:'#0c1a4f', c2:'#075985', accent:'#0ea5e9', sub:'#7dd3fc' },
  Asus:     { c1:'#2e1065', c2:'#4c1d95', accent:'#7c3aed', sub:'#c4b5fd' },
  Dell:     { c1:'#172554', c2:'#1e3a8a', accent:'#3b82f6', sub:'#93c5fd' },
  MSI:      { c1:'#0c0a09', c2:'#1c1917', accent:'#ef4444', sub:'#fca5a5' },
  Acer:     { c1:'#052e16', c2:'#14532d', accent:'#22c55e', sub:'#86efac' },
  Apple:    { c1:'#18181b', c2:'#27272a', accent:'#a1a1aa', sub:'#d4d4d8' },
  Intel:    { c1:'#1e3a8a', c2:'#1e40af', accent:'#60a5fa', sub:'#bfdbfe' },
  AMD:      { c1:'#450a0a', c2:'#7f1d1d', accent:'#f87171', sub:'#fecaca' },
  Samsung:  { c1:'#0c1a4f', c2:'#1e3a8a', accent:'#60a5fa', sub:'#bfdbfe' },
  Kingston: { c1:'#431407', c2:'#7c2d12', accent:'#fb923c', sub:'#fed7aa' },
  Corsair:  { c1:'#0c0a09', c2:'#1c1917', accent:'#fbbf24', sub:'#fde68a' },
}
const D = { c1:'#1e293b', c2:'#334155', accent:'#64748b', sub:'#94a3b8' }
const t = (brand) => T[brand] || D

function LaptopSvg({ brand, model, uid }) {
  const b = t(brand)
  const g = `lp${uid}`
  return (
    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <defs>
        <linearGradient id={`bg${g}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9"/>
          <stop offset="100%" stopColor="#cbd5e1"/>
        </linearGradient>
        <linearGradient id={`lid${g}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={b.c2}/>
          <stop offset="100%" stopColor={b.c1}/>
        </linearGradient>
        <filter id={`sh${g}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.22"/>
        </filter>
      </defs>

      {/* Background */}
      <rect width="600" height="400" fill={`url(#bg${g})`}/>
      <circle cx="300" cy="155" r="130" fill={b.accent} opacity="0.07"/>

      <g filter={`url(#sh${g})`}>
        {/* Lid */}
        <rect x="120" y="20" width="360" height="258" rx="14" fill={`url(#lid${g})`}/>
        {/* Bezel */}
        <rect x="135" y="34" width="330" height="228" rx="9" fill="#060b14"/>
        {/* Screen */}
        <rect x="143" y="42" width="314" height="212" rx="6" fill={b.c2}/>
        {/* Top glow */}
        <rect x="143" y="42" width="314" height="62" rx="6" fill={b.accent} opacity="0.2"/>

        {/* Brand name */}
        <text x="300" y="165" textAnchor="middle" fill="#ffffff"
          fontSize="52" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900">
          {brand}
        </text>
        {/* Model */}
        <text x="300" y="197" textAnchor="middle" fill={b.sub}
          fontSize="15" fontFamily="Arial, sans-serif">
          {model}
        </text>

        {/* Webcam */}
        <circle cx="300" cy="50" r="5" fill="#111827"/>
        <circle cx="300" cy="50" r="2" fill="#374151"/>

        {/* Hinge */}
        <rect x="105" y="276" width="390" height="18" rx="5" fill={b.c1}/>

        {/* Keyboard deck */}
        <rect x="90" y="292" width="420" height="46" rx="6" fill="#334155"/>
        <rect x="110" y="298" width="380" height="9" rx="2" fill="rgba(255,255,255,0.09)"/>
        <rect x="110" y="310" width="380" height="9" rx="2" fill="rgba(255,255,255,0.09)"/>
        <rect x="110" y="322" width="270" height="9" rx="2" fill="rgba(255,255,255,0.09)"/>
        {/* Touchpad */}
        <rect x="225" y="310" width="150" height="26" rx="5" fill="#1e293b" opacity="0.55"/>
      </g>

      {/* Shadow */}
      <ellipse cx="300" cy="342" rx="235" ry="12" fill="#000" opacity="0.09"/>
    </svg>
  )
}

function CpuSvg({ brand, model, uid }) {
  const b = t(brand)
  const g = `cp${uid}`
  const pins = Array.from({ length: 10 }, (_, r) =>
    Array.from({ length: 10 }, (_, c) => ({ r, c }))
  ).flat()
  return (
    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <defs>
        <linearGradient id={`bg${g}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9"/>
          <stop offset="100%" stopColor="#cbd5e1"/>
        </linearGradient>
        <linearGradient id={`ihs${g}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={b.c2}/>
          <stop offset="100%" stopColor={b.c1}/>
        </linearGradient>
        <filter id={`sh${g}`}>
          <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#000" floodOpacity="0.28"/>
        </filter>
      </defs>

      <rect width="600" height="400" fill={`url(#bg${g})`}/>
      <circle cx="300" cy="188" r="145" fill={b.accent} opacity="0.08"/>

      <g filter={`url(#sh${g})`}>
        {/* PCB socket */}
        <rect x="150" y="52" width="300" height="296" rx="10" fill="#0a0e1a"/>
        {/* Pins */}
        {pins.map(({ r, c }) => (
          <rect key={`${r}-${c}`}
            x={163 + c * 27} y={65 + r * 27}
            width="10" height="10" rx="2"
            fill={b.accent} opacity="0.45"/>
        ))}
        {/* IHS (Integrated Heat Spreader) */}
        <rect x="175" y="77" width="250" height="246" rx="10" fill={`url(#ihs${g})`}/>
        {/* Inner surface */}
        <rect x="188" y="90" width="224" height="220" rx="7" fill={b.c1}/>
        {/* Engrave lines */}
        <rect x="200" y="102" width="200" height="1" fill={b.accent} opacity="0.3"/>
        <rect x="200" y="296" width="200" height="1" fill={b.accent} opacity="0.3"/>
        {/* Logo area */}
        <rect x="210" y="130" width="180" height="100" rx="6" fill={b.accent} opacity="0.12"/>
        <text x="300" y="188" textAnchor="middle" fill="#ffffff"
          fontSize="42" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900">
          {brand}
        </text>
        <text x="300" y="212" textAnchor="middle" fill={b.sub}
          fontSize="14" fontFamily="Arial, sans-serif">
          {model}
        </text>
        {/* Bottom label */}
        <text x="300" y="278" textAnchor="middle" fill={b.sub}
          fontSize="10" fontFamily="Arial, sans-serif" opacity="0.6">
          SOCKET LGA1700 / AM5
        </text>
      </g>

      <ellipse cx="300" cy="354" rx="175" ry="9" fill="#000" opacity="0.09"/>
    </svg>
  )
}

function RamSvg({ brand, model, uid }) {
  const b = t(brand)
  const g = `rm${uid}`
  const fins = Array.from({ length: 16 }, (_, i) => i)
  const chips = Array.from({ length: 8 }, (_, i) => i)
  const contacts = Array.from({ length: 28 }, (_, i) => i)
  return (
    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <defs>
        <linearGradient id={`bg${g}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9"/>
          <stop offset="100%" stopColor="#cbd5e1"/>
        </linearGradient>
        <filter id={`sh${g}`}>
          <feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#000" floodOpacity="0.2"/>
        </filter>
      </defs>

      <rect width="600" height="400" fill={`url(#bg${g})`}/>
      <circle cx="300" cy="205" r="180" fill={b.accent} opacity="0.06"/>

      <g filter={`url(#sh${g})`}>
        {/* Heatspreader fins */}
        {fins.map((i) => (
          <rect key={i} x={50 + i * 31} y="105" width="22" height="55" rx="3" fill={b.c1}/>
        ))}
        {/* Top bridge */}
        <rect x="45" y="155" width="510" height="18" rx="3" fill={b.c2}/>
        {/* Main PCB */}
        <rect x="45" y="171" width="510" height="88" rx="5" fill={b.c1}/>
        {/* Memory chips row */}
        {chips.map((i) => (
          <rect key={i} x={58 + i * 62} y="183" width="46" height="38" rx="4" fill={b.c2}/>
        ))}
        {/* Label */}
        <rect x="85" y="222" width="430" height="30" rx="4" fill={b.accent} opacity="0.22"/>
        <text x="300" y="241" textAnchor="middle" fill="#ffffff"
          fontSize="15" fontFamily="Arial, sans-serif" fontWeight="700">
          {brand} · {model}
        </text>
        {/* Gold contacts */}
        <rect x="45" y="257" width="510" height="20" rx="3" fill="#78350f" opacity="0.35"/>
        {contacts.map((i) => (
          <rect key={i} x={52 + i * 17} y="258" width="10" height="18" rx="1.5" fill="#d97706"/>
        ))}
        {/* Notch (slot key) */}
        <rect x="245" y="260" width="22" height="18" rx="1" fill="#f1f5f9"/>
      </g>

      <ellipse cx="300" cy="282" rx="280" ry="11" fill="#000" opacity="0.08"/>

      <text x="300" y="316" textAnchor="middle" fill="#1e293b"
        fontSize="17" fontFamily="Arial, sans-serif" fontWeight="700">
        {brand} {model}
      </text>
    </svg>
  )
}

function NvmeSvg({ brand, model, uid }) {
  const b = t(brand)
  const g = `nv${uid}`
  const contacts = Array.from({ length: 55 }, (_, i) => i)
  return (
    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <defs>
        <linearGradient id={`bg${g}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9"/>
          <stop offset="100%" stopColor="#cbd5e1"/>
        </linearGradient>
        <filter id={`sh${g}`}>
          <feDropShadow dx="0" dy="5" stdDeviation="9" floodColor="#000" floodOpacity="0.2"/>
        </filter>
      </defs>

      <rect width="600" height="400" fill={`url(#bg${g})`}/>
      <circle cx="300" cy="200" r="160" fill={b.accent} opacity="0.07"/>

      <g filter={`url(#sh${g})`}>
        {/* Card body */}
        <rect x="50" y="140" width="500" height="120" rx="10" fill={b.c1}/>
        <rect x="60" y="150" width="480" height="100" rx="7" fill={b.c2}/>
        {/* Controller chip */}
        <rect x="75" y="162" width="72" height="76" rx="5" fill={b.c1}/>
        <text x="111" y="204" textAnchor="middle" fill={b.sub} fontSize="9" fontFamily="Arial, sans-serif" fontWeight="700">CTRL</text>
        {/* Flash chips */}
        {[162, 252, 342, 432].map((x, i) => (
          <rect key={i} x={x} y="162" width="72" height="76" rx="5" fill={b.c1}/>
        ))}
        {/* Sticker */}
        <rect x="162" y="168" width="350" height="32" rx="3" fill={b.accent} opacity="0.22"/>
        <text x="337" y="188" textAnchor="middle" fill="#ffffff"
          fontSize="15" fontFamily="Arial, sans-serif" fontWeight="700">
          {brand} {model}
        </text>
        {/* PCIe gold contacts */}
        <rect x="50" y="248" width="500" height="16" rx="3" fill="#78350f" opacity="0.3"/>
        {contacts.map((i) => (
          <rect key={i} x={53 + i * 9} y="249" width="5" height="13" rx="1" fill="#d97706"/>
        ))}
        {/* M.2 notch */}
        <rect x="95" y="252" width="16" height="13" rx="1" fill="#f1f5f9"/>
      </g>

      <ellipse cx="300" cy="270" rx="275" ry="10" fill="#000" opacity="0.08"/>

      <text x="300" y="305" textAnchor="middle" fill="#1e293b"
        fontSize="17" fontFamily="Arial, sans-serif" fontWeight="700">
        {brand} {model}
      </text>
    </svg>
  )
}

function SataSvg({ brand, model, uid }) {
  const b = t(brand)
  const g = `st${uid}`
  return (
    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <defs>
        <linearGradient id={`bg${g}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9"/>
          <stop offset="100%" stopColor="#cbd5e1"/>
        </linearGradient>
        <linearGradient id={`case${g}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={b.c2}/>
          <stop offset="100%" stopColor={b.c1}/>
        </linearGradient>
        <filter id={`sh${g}`}>
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000" floodOpacity="0.22"/>
        </filter>
      </defs>

      <rect width="600" height="400" fill={`url(#bg${g})`}/>
      <circle cx="300" cy="195" r="155" fill={b.accent} opacity="0.07"/>

      <g filter={`url(#sh${g})`}>
        {/* 2.5" outer case */}
        <rect x="110" y="90" width="380" height="220" rx="14" fill={`url(#case${g})`}/>
        {/* Inner face */}
        <rect x="122" y="102" width="356" height="196" rx="10" fill={b.c1}/>
        {/* Label */}
        <rect x="145" y="125" width="310" height="110" rx="7" fill={b.accent} opacity="0.18"/>
        <text x="300" y="184" textAnchor="middle" fill="#ffffff"
          fontSize="40" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900">
          {brand}
        </text>
        <text x="300" y="212" textAnchor="middle" fill={b.sub}
          fontSize="14" fontFamily="Arial, sans-serif">
          {model}
        </text>
        {/* Screw holes */}
        {[[130, 112], [470, 112], [130, 288], [470, 288]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="8" fill="#060b14"/>
            <line x1={x - 4} y1={y} x2={x + 4} y2={y} stroke="#334155" strokeWidth="1.5"/>
            <line x1={x} y1={y - 4} x2={x} y2={y + 4} stroke="#334155" strokeWidth="1.5"/>
          </g>
        ))}
        {/* SATA connector notch */}
        <rect x="445" y="180" width="45" height="40" rx="4" fill="#0f172a"/>
        <rect x="449" y="184" width="10" height="32" rx="2" fill="#1e293b"/>
        <rect x="462" y="184" width="10" height="32" rx="2" fill="#1e293b"/>
        <rect x="475" y="184" width="10" height="32" rx="2" fill="#1e293b"/>
      </g>

      <ellipse cx="300" cy="316" rx="220" ry="11" fill="#000" opacity="0.09"/>

      <text x="300" y="350" textAnchor="middle" fill="#1e293b"
        fontSize="17" fontFamily="Arial, sans-serif" fontWeight="700">
        {brand} {model}
      </text>
    </svg>
  )
}

function GpuSvg({ brand, model, uid }) {
  const b = t(brand)
  const g = `gp${uid}`
  const fanBlades = (cx, cy, r) =>
    Array.from({ length: 7 }, (_, i) => {
      const a = (i * 51.4 * Math.PI) / 180
      const x1 = cx + (r * 0.36) * Math.cos(a)
      const y1 = cy + (r * 0.36) * Math.sin(a)
      const x2 = cx + r * Math.cos(a - 0.42)
      const y2 = cy + r * Math.sin(a - 0.42)
      const x3 = cx + r * Math.cos(a + 0.16)
      const y3 = cy + r * Math.sin(a + 0.16)
      return `${x1},${y1} ${x2},${y2} ${x3},${y3}`
    })

  return (
    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <defs>
        <linearGradient id={`bg${g}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9"/>
          <stop offset="100%" stopColor="#cbd5e1"/>
        </linearGradient>
        <filter id={`sh${g}`}>
          <feDropShadow dx="0" dy="8" stdDeviation="14" floodColor="#000" floodOpacity="0.26"/>
        </filter>
      </defs>

      <rect width="600" height="400" fill={`url(#bg${g})`}/>
      <circle cx="300" cy="185" r="155" fill={b.accent} opacity="0.07"/>

      <g filter={`url(#sh${g})`}>
        {/* Card outer */}
        <rect x="45" y="65" width="510" height="240" rx="14" fill={b.c1}/>
        {/* Card face */}
        <rect x="56" y="76" width="488" height="218" rx="10" fill={b.c2}/>
        {/* Heatsink section */}
        <rect x="68" y="88" width="320" height="100" rx="6" fill={b.c1}/>
        {[78, 105, 132, 159, 186, 213, 240, 267, 294, 321].map((x, i) => (
          <rect key={i} x={x} y="94" width="18" height="86" rx="2" fill={b.accent} opacity="0.12"/>
        ))}

        {/* Fan 1 */}
        <circle cx="150" cy="138" r="58" fill={b.c1}/>
        <circle cx="150" cy="138" r="52" fill="#060b14"/>
        <circle cx="150" cy="138" r="18" fill={b.c2}/>
        {fanBlades(150, 138, 46).map((pts, i) => (
          <polygon key={i} points={pts} fill={b.c2} opacity="0.85"/>
        ))}
        <circle cx="150" cy="138" r="8" fill={b.c1}/>

        {/* Fan 2 */}
        <circle cx="300" cy="138" r="58" fill={b.c1}/>
        <circle cx="300" cy="138" r="52" fill="#060b14"/>
        <circle cx="300" cy="138" r="18" fill={b.c2}/>
        {fanBlades(300, 138, 46).map((pts, i) => (
          <polygon key={i} points={pts} fill={b.c2} opacity="0.85"/>
        ))}
        <circle cx="300" cy="138" r="8" fill={b.c1}/>

        {/* Brand panel */}
        <rect x="400" y="95" width="130" height="90" rx="7" fill={b.accent} opacity="0.18"/>
        <text x="465" y="143" textAnchor="middle" fill="#ffffff"
          fontSize="20" fontFamily="Arial, sans-serif" fontWeight="900">
          {brand}
        </text>
        <text x="465" y="164" textAnchor="middle" fill={b.sub}
          fontSize="11" fontFamily="Arial, sans-serif">
          {model}
        </text>

        {/* Bottom outputs */}
        <rect x="68" y="256" width="200" height="24" rx="4" fill="#0f172a"/>
        <rect x="276" y="256" width="200" height="24" rx="4" fill="#0f172a"/>

        {/* PCIe power */}
        <rect x="410" y="66" width="48" height="22" rx="4" fill="#374151"/>
        {[418, 430, 442, 450].map((x, i) => (
          <circle key={i} cx={x} cy="72" r="4" fill="#0f172a"/>
        ))}

        {/* PCIe bracket edge */}
        <rect x="45" y="200" width="14" height="90" rx="4" fill="#1e293b"/>
        {[210, 225, 240, 255, 265, 275].map((y, i) => (
          <rect key={i} x={49} y={y} width="6" height="8" rx="1" fill="#0f172a"/>
        ))}
      </g>

      <ellipse cx="300" cy="312" rx="285" ry="12" fill="#000" opacity="0.09"/>

      <text x="300" y="346" textAnchor="middle" fill="#1e293b"
        fontSize="17" fontFamily="Arial, sans-serif" fontWeight="700">
        {brand} {model}
      </text>
    </svg>
  )
}

export default function ProductImage({ product, className = '' }) {
  // Use real image if available (non-placeholder)
  const first = product.images?.[0]
  if (first && !first.includes('placehold') && !first.startsWith('http')) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <img src={first} alt={product.name} className="w-full h-full object-contain"/>
      </div>
    )
  }

  const brand = product.brand || 'Unknown'
  // Short model name: take text after first '-' or the brand name part
  const raw = product.name.replace(new RegExp(`^.*?${brand}\\s*`, 'i'), '').trim()
  const model = raw.split(/[/،,]/)[0].trim().split(' ').slice(0, 3).join(' ')
  const uid = product.id

  let Inner
  if (product.category === 'parts') {
    const sub = product.subcategory || ''
    if (sub === 'gpu') {
      Inner = <GpuSvg brand={brand} model={model} uid={uid}/>
    } else if (sub === 'ram') {
      Inner = <RamSvg brand={brand} model={model} uid={uid}/>
    } else if (sub === 'cpu') {
      Inner = <CpuSvg brand={brand} model={model} uid={uid}/>
    } else if (sub === 'ssd') {
      const isNvme = product.specs?.interface?.toLowerCase().includes('nvme') ||
                     product.specs?.interface?.toLowerCase().includes('pcie')
      Inner = isNvme
        ? <NvmeSvg brand={brand} model={model} uid={uid}/>
        : <SataSvg brand={brand} model={model} uid={uid}/>
    } else {
      Inner = <LaptopSvg brand={brand} model={model} uid={uid}/>
    }
  } else {
    Inner = <LaptopSvg brand={brand} model={model} uid={uid}/>
  }

  return <div className={`overflow-hidden ${className}`}>{Inner}</div>
}
