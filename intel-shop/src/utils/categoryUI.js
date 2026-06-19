// ─── Category visual mapping ─────────────────────────────────────────────────
// The Category.icon field stores a lucide icon *name* (e.g. "laptop", "cpu").
// This module maps those names to components and provides the gradient palette
// used by the homepage category cards. Add new icons here to expose them in the
// admin icon picker automatically.
import {
  Laptop, Cpu, Monitor, HardDrive, MemoryStick, Mouse, Keyboard, Headphones,
  Server, Smartphone, Tablet, Gamepad2, Camera, Printer, Wifi, Fan, Plug,
  Package,
} from 'lucide-react'

export const CATEGORY_ICONS = {
  laptop: Laptop,
  'laptop-2': Laptop,
  cpu: Cpu,
  monitor: Monitor,
  'hard-drive': HardDrive,
  'memory-stick': MemoryStick,
  mouse: Mouse,
  keyboard: Keyboard,
  headphones: Headphones,
  server: Server,
  smartphone: Smartphone,
  tablet: Tablet,
  gamepad: Gamepad2,
  camera: Camera,
  printer: Printer,
  wifi: Wifi,
  fan: Fan,
  plug: Plug,
  package: Package,
}

// Names available in the admin icon picker
export const CATEGORY_ICON_OPTIONS = Object.keys(CATEGORY_ICONS)

/** Resolve a stored icon name to a lucide component, falling back to Package. */
export function getCategoryIcon(name) {
  return CATEGORY_ICONS[name] || Package
}

// Gradient palette cycled by index for the homepage category cards, so any
// number of categories gets a distinct-looking card without per-slug config.
export const CATEGORY_GRADIENTS = [
  'bg-gradient-to-br from-primary-600 to-primary-800',
  'bg-gradient-to-br from-amber-500 to-amber-700',
  'bg-gradient-to-br from-violet-600 to-violet-800',
  'bg-gradient-to-br from-emerald-600 to-emerald-800',
  'bg-gradient-to-br from-rose-500 to-rose-700',
  'bg-gradient-to-br from-cyan-600 to-cyan-800',
]

export const gradientFor = (i) => CATEGORY_GRADIENTS[i % CATEGORY_GRADIENTS.length]
