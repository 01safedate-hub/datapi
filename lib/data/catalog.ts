import type { Availability, Category, Product, ProductOption, ProductSource, Variant, WholesaleTier } from "../types";

export const categories: Category[] = [
  { slug: "phones", name: "Phones & Accessories", icon: "smartphone", description: "Smartphones, chargers, power banks, cases and earbuds." },
  { slug: "computers", name: "Computers", icon: "laptop", description: "Laptops, keyboards, mice, monitors and storage." },
  { slug: "electronics", name: "Electronics & Gadgets", icon: "headphones", description: "Audio, smart home, cameras and everyday gadgets." },
  { slug: "fashion", name: "Fashion", icon: "shirt", description: "Clothing, shoes, bags and accessories." },
  { slug: "home", name: "Home & Kitchen", icon: "cooking-pot", description: "Appliances, cookware, lighting and storage." },
  { slug: "beauty", name: "Beauty & Care", icon: "sparkles", description: "Grooming tools, skincare devices and fragrance." },
];

type Raw = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  source: ProductSource;
  icon: string;
  /** Imported: supplier price in RMB. Local: selling price in naira. */
  price: number;
  compareAt?: number;
  kg: number;
  dims: [number, number, number];
  moq?: number;
  stock?: number;
  availability?: Availability;
  days?: [number, number];
  options?: ProductOption[];
  rating: number;
  reviews: number;
  sold: number;
  created: string;
  tags: string[];
  origin?: "manual" | "alibaba";
  description: string;
  highlights: string[];
  specs: Record<string, string>;
  /** Store slug; imported products always belong to Alaba Verified. */
  store?: string;
  /** Price change for an option value, in the product's source currency: { "Capacity:2 TB": 250 }. */
  variantPrice?: Record<string, number>;
  wholesale?: WholesaleTier[];
  freeDelivery?: boolean;
  video?: string;
  warranty?: string;
};

const raw: Raw[] = [
  {
    slug: "volt-x12-5g-smartphone", name: "Volt X12 5G Smartphone, 8GB + 256GB", brand: "Volt", category: "phones", source: "imported", icon: "smartphone",
    price: 1099, kg: 0.45, dims: [18, 10, 6], rating: 4.6, reviews: 214, sold: 1320, created: "2026-11-12", tags: ["android", "5g", "phone", "mobile"],
    options: [{ name: "Colour", values: ["Graphite", "Ocean Blue", "Silver"] }],
    description: "A 6.7-inch AMOLED phone with a 120 Hz display, a 50 MP main camera and a 5,000 mAh battery that lasts a full day of heavy use.",
    highlights: ["6.7\" 120 Hz AMOLED display", "50 MP main camera with OIS", "5,000 mAh battery, 67 W fast charging", "Dual SIM, works on all Nigerian networks"],
    specs: { Display: "6.7\" AMOLED, 120 Hz", Memory: "8 GB RAM, 256 GB storage", Battery: "5,000 mAh", Charging: "67 W wired", Network: "5G / 4G LTE, dual SIM", OS: "Android 16" },
  },
  {
    slug: "nexa-65w-gan-charger", name: "Nexa 65W GaN Fast Charger, 3 Ports", brand: "Nexa", category: "phones", source: "imported", icon: "plug",
    price: 69, compareAt: 28_000, kg: 0.15, dims: [8, 6, 4], rating: 4.8, reviews: 532, sold: 4100, created: "2026-10-02", tags: ["charger", "usb-c", "gan", "laptop charger"],
    description: "Charges a laptop, phone and earbuds at the same time from one compact plug. UK 3-pin plug fitted for Nigerian sockets.",
    highlights: ["65 W total output", "2× USB-C + 1× USB-A", "UK 3-pin plug", "Over-heat and surge protection"],
    specs: { Output: "65 W max", Ports: "2× USB-C, 1× USB-A", Plug: "UK Type G", Weight: "120 g" },
  },
  {
    slug: "kora-20000mah-power-bank", name: "Kora 20,000mAh Power Bank with Display", brand: "Kora", category: "phones", source: "local", icon: "battery-charging",
    price: 24_500, compareAt: 29_000, kg: 0.42, dims: [15, 8, 3], stock: 64, days: [1, 3], rating: 4.5, reviews: 389, sold: 2870, created: "2026-09-18", tags: ["power bank", "battery", "nepa"],
    options: [{ name: "Colour", values: ["Black", "White"] }],
    description: "Keeps two phones going through a full day of power cuts. A digital display shows exactly how much charge is left.",
    highlights: ["20,000 mAh capacity", "22.5 W fast charging", "Digital battery display", "In stock in Lagos"],
    specs: { Capacity: "20,000 mAh", Output: "22.5 W", Ports: "USB-C in/out, 2× USB-A", Weight: "410 g" },
  },
  {
    slug: "pulse-buds-anc", name: "Pulse Buds ANC Wireless Earbuds", brand: "Pulse", category: "phones", source: "imported", icon: "headphones",
    price: 129, kg: 0.12, dims: [10, 8, 4], rating: 4.4, reviews: 176, sold: 980, created: "2026-11-01", tags: ["earbuds", "bluetooth", "anc", "earphones"],
    options: [{ name: "Colour", values: ["Black", "White", "Navy"] }],
    description: "Active noise cancelling earbuds with 32 hours of total playback and a pocket-size charging case.",
    highlights: ["Hybrid active noise cancelling", "32 h with case", "Bluetooth 5.4", "IPX5 sweat resistant"],
    specs: { Battery: "8 h buds + 24 h case", Bluetooth: "5.4", "Water resistance": "IPX5", Charging: "USB-C" },
  },
  {
    slug: "shield-magsafe-clear-case", name: "Shield Clear Magnetic Phone Case", brand: "Shield", category: "phones", source: "imported", icon: "smartphone",
    price: 12, kg: 0.06, dims: [18, 10, 2], moq: 2, rating: 4.3, reviews: 88, sold: 1540, created: "2026-08-21", tags: ["case", "cover", "magnetic"],
    options: [{ name: "Model", values: ["iPhone 16", "iPhone 16 Pro", "iPhone 17", "iPhone 17 Pro"] }],
    description: "Slim, anti-yellowing clear case with built-in magnets for wireless chargers and car mounts.",
    highlights: ["Anti-yellowing coating", "Built-in magnet ring", "Raised camera lip", "Minimum order: 2"],
    specs: { Material: "TPU + polycarbonate", Thickness: "1.2 mm", Compatibility: "See model options" },
  },
  {
    slug: "aero-14-ultrabook", name: "Aero 14 Ultrabook, Core Ultra 7, 16GB, 512GB", brand: "Aero", category: "computers", source: "imported", icon: "laptop",
    price: 3899, kg: 1.4, dims: [36, 26, 7], rating: 4.7, reviews: 96, sold: 310, created: "2026-11-15", tags: ["laptop", "notebook", "computer", "work"],
    description: "A 1.3 kg aluminium laptop with a 2.8K display, all-day battery and a backlit keyboard for work and study.",
    highlights: ["14\" 2.8K 90 Hz display", "Intel Core Ultra 7", "16 GB RAM, 512 GB SSD", "Up to 14 h battery"],
    specs: { Processor: "Intel Core Ultra 7 255H", Memory: "16 GB LPDDR5X", Storage: "512 GB NVMe SSD", Display: "14\" 2880×1800, 90 Hz", Weight: "1.3 kg", OS: "Windows 11 Home" },
  },
  {
    slug: "keyflow-mechanical-keyboard", name: "Keyflow K3 Wireless Mechanical Keyboard", brand: "Keyflow", category: "computers", source: "imported", icon: "keyboard",
    price: 239, kg: 0.85, dims: [38, 15, 6], rating: 4.6, reviews: 142, sold: 640, created: "2026-10-20", tags: ["keyboard", "mechanical", "wireless"],
    options: [{ name: "Switch", values: ["Red (linear)", "Brown (tactile)"] }],
    description: "Compact 75% mechanical keyboard that switches between three devices over Bluetooth, 2.4 GHz or cable.",
    highlights: ["75% layout", "Hot-swappable switches", "Bluetooth, 2.4 GHz and USB-C", "4,000 mAh battery"],
    specs: { Layout: "75%, 84 keys", Connection: "BT 5.1 / 2.4 GHz / USB-C", Battery: "4,000 mAh" },
  },
  {
    slug: "glide-silent-mouse", name: "Glide Silent Wireless Mouse", brand: "Glide", category: "computers", source: "local", icon: "mouse",
    price: 9_500, kg: 0.1, dims: [12, 8, 5], stock: 120, days: [1, 3], rating: 4.4, reviews: 410, sold: 3900, created: "2026-07-14", tags: ["mouse", "wireless", "silent"],
    options: [{ name: "Colour", values: ["Black", "Grey", "Pink"] }],
    description: "Quiet clicks, 18-month battery life and a USB receiver that stores inside the mouse.",
    highlights: ["Silent clicks", "2.4 GHz wireless", "18-month battery", "In stock in Lagos"],
    specs: { DPI: "800–1600", Battery: "1× AA (included)", Connection: "2.4 GHz USB receiver" },
  },
  {
    slug: "vista-27-4k-monitor", name: "Vista 27\" 4K IPS Monitor", brand: "Vista", category: "computers", source: "imported", icon: "monitor",
    price: 1499, kg: 5.8, dims: [70, 45, 15], rating: 4.5, reviews: 61, sold: 190, created: "2026-09-30", tags: ["monitor", "screen", "4k", "display"],
    description: "Sharp 4K IPS panel with USB-C power delivery so one cable connects and charges your laptop.",
    highlights: ["27\" 4K IPS", "USB-C with 65 W charging", "Height-adjustable stand", "Volumetric weight applies"],
    specs: { Panel: "27\" IPS, 3840×2160", "Refresh rate": "60 Hz", Ports: "USB-C 65 W, HDMI 2.0, DP 1.4", Stand: "Height, tilt, pivot" },
  },
  {
    slug: "stash-1tb-portable-ssd", name: "Stash 1TB Portable SSD", brand: "Stash", category: "computers", source: "imported", icon: "hard-drive",
    price: 399, kg: 0.08, dims: [10, 6, 2], rating: 4.7, reviews: 203, sold: 1100, created: "2026-10-11", tags: ["ssd", "storage", "drive", "backup"],
    options: [{ name: "Capacity", values: ["1 TB", "2 TB"] }],
    description: "Pocket-size SSD with 1,050 MB/s transfers, a drop-resistant shell and USB-C and USB-A cables included.",
    highlights: ["Up to 1,050 MB/s", "Drop resistant to 2 m", "USB-C and USB-A cables"],
    specs: { Capacity: "1 TB", Speed: "1,050 MB/s read", Interface: "USB 3.2 Gen 2" },
  },
  {
    slug: "beam-smart-projector", name: "Beam Mini Smart Projector, 1080p", brand: "Beam", category: "electronics", source: "imported", icon: "tv",
    price: 899, kg: 1.6, dims: [25, 20, 18], rating: 4.3, reviews: 74, sold: 420, created: "2026-11-08", tags: ["projector", "movie", "netflix", "tv"],
    description: "Plug-and-play projector with built-in streaming apps for movie nights up to 120 inches.",
    highlights: ["Native 1080p", "Built-in streaming apps", "Auto focus and keystone", "Up to 120\" picture"],
    specs: { Resolution: "1920×1080", Brightness: "450 ANSI lumens", Connectivity: "Wi-Fi 6, Bluetooth, HDMI" },
  },
  {
    slug: "echo-bass-bluetooth-speaker", name: "Echo Bass Portable Bluetooth Speaker", brand: "Echo", category: "electronics", source: "local", icon: "speaker",
    price: 38_000, compareAt: 45_000, kg: 0.9, dims: [22, 10, 10], stock: 35, days: [1, 3], rating: 4.6, reviews: 267, sold: 1450, created: "2026-08-05", tags: ["speaker", "bluetooth", "party", "music"],
    options: [{ name: "Colour", values: ["Black", "Blue"] }],
    description: "Loud, waterproof speaker with deep bass and 20 hours of playback for parties and outdoor use.",
    highlights: ["30 W stereo sound", "IPX7 waterproof", "20 h battery", "In stock in Lagos"],
    specs: { Output: "30 W", Battery: "20 h", "Water resistance": "IPX7", Bluetooth: "5.3" },
  },
  {
    slug: "snap-action-camera-4k", name: "Snap 4K Action Camera with Waterproof Case", brand: "Snap", category: "electronics", source: "imported", icon: "camera",
    price: 459, kg: 0.35, dims: [16, 12, 8], rating: 4.2, reviews: 58, sold: 260, created: "2026-10-25", tags: ["camera", "gopro", "action", "vlog"],
    description: "Stabilised 4K60 video for travel, sport and vlogging, with a 40 m waterproof case and mounts.",
    highlights: ["4K 60 fps video", "Electronic stabilisation", "40 m waterproof case", "Mount kit included"],
    specs: { Video: "4K 60 fps", Photo: "20 MP", Screen: "2\" touch + front screen" },
  },
  {
    slug: "pixel-watch-fit-pro", name: "Fit Pro Smartwatch with Calling", brand: "Fitly", category: "electronics", source: "imported", icon: "watch",
    price: 239, kg: 0.15, dims: [12, 9, 7], rating: 4.4, reviews: 321, sold: 2200, created: "2026-11-18", tags: ["smartwatch", "watch", "fitness", "health"],
    options: [{ name: "Strap", values: ["Black silicone", "Navy silicone", "Steel mesh"] }],
    description: "AMOLED smartwatch that takes calls, tracks heart rate, sleep and 100+ workouts, and lasts 7 days.",
    highlights: ["1.96\" AMOLED", "Bluetooth calling", "7-day battery", "Heart rate, SpO2, sleep"],
    specs: { Display: "1.96\" AMOLED", Battery: "7 days typical", "Water resistance": "IP68" },
  },
  {
    slug: "mesh-wifi-router-ax3000", name: "Mesh AX3000 Wi-Fi 6 Router", brand: "Linkr", category: "electronics", source: "imported", icon: "router",
    price: 329, kg: 0.7, dims: [24, 18, 8], rating: 4.5, reviews: 47, sold: 300, created: "2026-09-12", tags: ["router", "wifi", "internet", "mesh"],
    description: "Wi-Fi 6 router that covers a 3-bedroom flat and works with Starlink, fibre and 4G/5G modems.",
    highlights: ["AX3000 dual-band Wi-Fi 6", "Covers up to 150 m²", "Mesh-ready", "App setup in 5 minutes"],
    specs: { Standard: "Wi-Fi 6 (802.11ax)", Speed: "AX3000", Ports: "4× Gigabit" },
  },
  {
    slug: "breeze-rechargeable-fan", name: "Breeze 16\" Rechargeable Standing Fan", brand: "Breeze", category: "home", source: "local", icon: "fan",
    price: 67_000, compareAt: 75_000, kg: 6.5, dims: [50, 40, 20], stock: 18, days: [1, 4], rating: 4.5, reviews: 512, sold: 2600, created: "2026-06-22", tags: ["fan", "rechargeable", "solar", "nepa"],
    description: "Runs up to 12 hours on battery, with solar charging support and a USB port to charge your phone.",
    highlights: ["Up to 12 h on battery", "Solar charging input", "USB phone charging", "Remote control"],
    specs: { Size: "16\"", Battery: "12 V lithium", Runtime: "Up to 12 h" },
  },
  {
    slug: "nova-air-fryer-6l", name: "Nova 6L Digital Air Fryer", brand: "Nova", category: "home", source: "imported", icon: "cooking-pot",
    price: 359, kg: 5.2, dims: [38, 34, 36], rating: 4.6, reviews: 188, sold: 870, created: "2026-10-28", tags: ["air fryer", "kitchen", "cooking"],
    description: "Fries, roasts and bakes with up to 85% less oil. Big enough for a family of five.",
    highlights: ["6 L basket", "8 presets", "Dishwasher-safe basket", "Bulky item: priced by volume"],
    specs: { Capacity: "6 L", Power: "1,700 W", Voltage: "220–240 V" },
  },
  {
    slug: "pure-blender-1200w", name: "Pure 1200W Blender with Grinder", brand: "Pure", category: "home", source: "local", icon: "blender",
    price: 46_500, kg: 3.8, dims: [25, 25, 45], stock: 22, days: [1, 3], rating: 4.4, reviews: 233, sold: 1150, created: "2026-07-30", tags: ["blender", "grinder", "pepper", "kitchen"],
    description: "Powerful enough for pepper, beans and smoothies, with a separate dry grinder jar for spices.",
    highlights: ["1,200 W motor", "1.5 L glass jar + grinder", "6 stainless blades", "In stock in Lagos"],
    specs: { Power: "1,200 W", Jar: "1.5 L glass", Speeds: "3 + pulse" },
  },
  {
    slug: "lumi-led-desk-lamp", name: "Lumi LED Desk Lamp with Wireless Charger", brand: "Lumi", category: "home", source: "imported", icon: "lamp",
    price: 119, kg: 0.9, dims: [30, 18, 8], rating: 4.5, reviews: 92, sold: 510, created: "2026-09-05", tags: ["lamp", "light", "desk", "study"],
    description: "Eye-friendly desk lamp with five colour temperatures and a 15 W wireless charging base.",
    highlights: ["5 colour modes, 10 brightness levels", "15 W wireless charging", "Flicker-free LEDs"],
    specs: { Power: "12 W", "Wireless charging": "15 W Qi", "Colour temperature": "2700–6500 K" },
  },
  {
    slug: "aqua-insulated-bottle", name: "Aqua 1L Insulated Steel Bottle", brand: "Aqua", category: "home", source: "imported", icon: "glass-water",
    price: 39, kg: 0.42, dims: [28, 9, 9], moq: 2, rating: 4.7, reviews: 145, sold: 1900, created: "2026-08-12", tags: ["bottle", "flask", "water"],
    options: [{ name: "Colour", values: ["Navy", "Orange", "White", "Black"] }],
    description: "Keeps drinks cold for 24 hours or hot for 12. Leak-proof lid with a carry loop.",
    highlights: ["Cold 24 h / hot 12 h", "Leak-proof lid", "BPA-free", "Minimum order: 2"],
    specs: { Capacity: "1 L", Material: "18/8 stainless steel" },
  },
  {
    slug: "cloud-memory-foam-sofa-cushion", name: "Cloud Memory Foam Seat Cushion", brand: "Cloud", category: "home", source: "imported", icon: "sofa",
    price: 49, kg: 0.6, dims: [45, 40, 8], rating: 4.2, reviews: 39, sold: 220, created: "2026-11-03", tags: ["cushion", "office", "chair"],
    description: "Ergonomic memory foam cushion for long hours at a desk or in traffic.",
    highlights: ["Ergonomic U-shape", "Non-slip base", "Washable cover"],
    specs: { Material: "Memory foam", Size: "45 × 40 × 8 cm" },
  },
  {
    slug: "urban-oxford-shirt", name: "Urban Slim-Fit Oxford Shirt", brand: "Urban Thread", category: "fashion", source: "imported", icon: "shirt",
    price: 59, kg: 0.3, dims: [30, 25, 4], moq: 1, rating: 4.3, reviews: 127, sold: 1300, created: "2026-10-15", tags: ["shirt", "men", "corporate", "office"],
    options: [{ name: "Size", values: ["S", "M", "L", "XL", "XXL"] }, { name: "Colour", values: ["White", "Light Blue", "Navy"] }],
    description: "Breathable cotton Oxford shirt with a modern slim fit. Works for the office and weekends.",
    highlights: ["100% cotton", "Slim fit", "Machine washable", "See size guide"],
    specs: { Material: "100% cotton Oxford", Fit: "Slim", Care: "Machine wash 30°C" },
  },
  {
    slug: "stride-running-sneakers", name: "Stride Lightweight Running Sneakers", brand: "Stride", category: "fashion", source: "imported", icon: "footprints",
    price: 189, kg: 0.9, dims: [33, 22, 12], rating: 4.5, reviews: 204, sold: 1600, created: "2026-11-10", tags: ["sneakers", "shoes", "running", "trainers"],
    options: [{ name: "Size (EU)", values: ["39", "40", "41", "42", "43", "44", "45"] }, { name: "Colour", values: ["White/Navy", "Black", "Grey/Orange"] }],
    description: "Cushioned, breathable running shoes weighing just 240 g each.",
    highlights: ["240 g per shoe", "Breathable knit upper", "Cushioned foam sole"],
    specs: { Upper: "Engineered knit", Sole: "EVA foam", Weight: "240 g (EU 42)" },
  },
  {
    slug: "metro-laptop-backpack", name: "Metro Anti-Theft Laptop Backpack", brand: "Metro", category: "fashion", source: "local", icon: "backpack",
    price: 21_000, kg: 0.8, dims: [45, 30, 12], stock: 40, days: [1, 3], rating: 4.6, reviews: 318, sold: 2400, created: "2026-08-28", tags: ["backpack", "bag", "laptop bag", "school"],
    options: [{ name: "Colour", values: ["Black", "Grey"] }],
    description: "Water-resistant backpack with a hidden zip, USB charging port and a padded 15.6\" laptop sleeve.",
    highlights: ["Hidden anti-theft zip", "Fits 15.6\" laptops", "Water-resistant", "In stock in Lagos"],
    specs: { Capacity: "25 L", Laptop: "Up to 15.6\"", Material: "Water-resistant polyester" },
  },
  {
    slug: "luxe-tote-bag", name: "Luxe Structured Leather Tote", brand: "Luxe", category: "fashion", source: "imported", icon: "shopping-bag",
    price: 149, kg: 0.7, dims: [38, 30, 14], rating: 4.4, reviews: 66, sold: 340, created: "2026-11-14", tags: ["bag", "handbag", "tote", "women"],
    options: [{ name: "Colour", values: ["Black", "Tan", "Navy"] }],
    description: "Roomy structured tote in vegan leather with a zip pocket and detachable pouch.",
    highlights: ["Fits a 14\" laptop", "Vegan leather", "Detachable pouch"],
    specs: { Material: "PU leather", Size: "38 × 30 × 14 cm" },
  },
  {
    slug: "polar-sunglasses", name: "Polar Polarised Sunglasses", brand: "Polar", category: "fashion", source: "imported", icon: "glasses",
    price: 35, kg: 0.08, dims: [16, 7, 5], moq: 2, rating: 4.1, reviews: 52, sold: 880, created: "2026-09-22", tags: ["sunglasses", "shades", "eyewear"],
    options: [{ name: "Frame", values: ["Black", "Tortoise", "Clear"] }],
    description: "UV400 polarised lenses in a lightweight frame, with a hard case and cloth.",
    highlights: ["UV400 polarised", "Hard case included", "Minimum order: 2"],
    specs: { Lens: "Polarised, UV400", Frame: "TR90" },
  },
  {
    slug: "gleam-hair-dryer", name: "Gleam Ionic Hair Dryer, 1800W", brand: "Gleam", category: "beauty", source: "imported", icon: "sparkles",
    price: 199, kg: 0.85, dims: [28, 22, 10], rating: 4.5, reviews: 119, sold: 690, created: "2026-10-08", tags: ["hair dryer", "blow dryer", "hair"],
    description: "Fast-drying ionic dryer with three heat settings, a cool shot and diffuser for natural hair.",
    highlights: ["1,800 W", "Ionic, less frizz", "Diffuser + concentrator", "UK plug"],
    specs: { Power: "1,800 W", Settings: "3 heat, 2 speed, cool shot" },
  },
  {
    slug: "edge-beard-trimmer", name: "Edge Cordless Beard & Hair Trimmer", brand: "Edge", category: "beauty", source: "local", icon: "scissors",
    price: 17_500, compareAt: 21_000, kg: 0.3, dims: [20, 10, 6], stock: 55, days: [1, 3], rating: 4.4, reviews: 287, sold: 2100, created: "2026-07-19", tags: ["trimmer", "clipper", "barber", "shaver"],
    description: "Precision trimmer with 20 length settings and a 120-minute battery.",
    highlights: ["20 length settings", "120 min battery", "USB-C charging", "In stock in Lagos"],
    specs: { Battery: "120 min", Lengths: "0.5–10 mm", Charging: "USB-C" },
  },
  {
    slug: "aura-perfume-oil-set", name: "Aura Perfume Oil Discovery Set (6 × 10ml)", brand: "Aura", category: "beauty", source: "local", icon: "flask-conical",
    price: 15_000, kg: 0.35, dims: [18, 12, 5], stock: 0, availability: "out_of_stock", days: [1, 3], rating: 4.7, reviews: 98, sold: 760, created: "2026-06-30", tags: ["perfume", "oil", "fragrance", "gift"],
    description: "Six long-lasting perfume oils in travel bottles. A good gift set.",
    highlights: ["6 × 10 ml oils", "Alcohol-free", "Gift box"],
    specs: { Volume: "6 × 10 ml", Type: "Perfume oil" },
  },
  {
    slug: "glow-led-face-mask", name: "Glow LED Skincare Mask", brand: "Glow", category: "beauty", source: "imported", icon: "gem",
    price: 289, kg: 0.6, dims: [26, 22, 10], availability: "preorder", days: [14, 21], rating: 4.0, reviews: 21, sold: 90, created: "2026-11-19", tags: ["skincare", "led", "face", "mask"],
    origin: "alibaba",
    description: "Red and blue light therapy mask with 7 modes. Shipped on the next consolidated flight.",
    highlights: ["7 light modes", "Rechargeable", "Pre-order: ships on next flight"],
    specs: { Modes: "7", Battery: "Rechargeable, USB-C" },
  },
  {
    slug: "joy-kids-ride-on-car", name: "Joy Kids Electric Ride-On Car", brand: "Joy", category: "home", source: "imported", icon: "baby",
    price: 899, kg: 14, dims: [100, 55, 40], rating: 4.6, reviews: 33, sold: 75, created: "2026-11-05", tags: ["kids", "toy", "car", "gift", "christmas"],
    origin: "alibaba",
    options: [{ name: "Colour", values: ["Red", "White", "Blue"] }],
    description: "12 V ride-on car with parent remote, music and LED lights, for ages 2–6.",
    highlights: ["12 V battery", "Parent remote control", "Ages 2–6", "Bulky item: priced by volume"],
    specs: { Battery: "12 V 7 Ah", "Max load": "30 kg", Age: "2–6 years" },
  },
  {
    slug: "core-adjustable-dumbbells", name: "Core Adjustable Dumbbell Set, 20kg", brand: "Core", category: "home", source: "local", icon: "dumbbell",
    price: 52_000, kg: 21, dims: [40, 25, 25], stock: 9, days: [2, 4], rating: 4.5, reviews: 71, sold: 260, created: "2026-09-02", tags: ["gym", "dumbbell", "fitness", "weights"],
    description: "Two adjustable dumbbells with a connector bar to turn them into a barbell.",
    highlights: ["20 kg total", "Converts to barbell", "Non-slip grips", "Only 9 left"],
    specs: { "Total weight": "20 kg", Plates: "Cement-filled, coated" },
  },
  {
    slug: "gamepad-pro-wireless", name: "Gamepad Pro Wireless Controller", brand: "Playr", category: "electronics", source: "imported", icon: "gamepad-2",
    price: 159, kg: 0.35, dims: [18, 14, 7], rating: 4.4, reviews: 84, sold: 470, created: "2026-11-11", tags: ["gaming", "controller", "ps5", "pc"],
    description: "Hall-effect sticks, no drift, works with PC, Android, iPhone and Switch.",
    highlights: ["Hall-effect sticks", "Works with PC, phone, Switch", "30 h battery"],
    specs: { Connection: "Bluetooth / 2.4 GHz / USB-C", Battery: "30 h" },
  },
  {
    slug: "aba-handmade-leather-loafers", name: "Handmade Leather Loafers", brand: "Aba Leatherworks", category: "fashion", source: "local", icon: "footprints",
    price: 28_000, kg: 1.1, dims: [32, 20, 12], stock: 140, days: [2, 5], rating: 4.6, reviews: 143, sold: 870, created: "2026-11-16", tags: ["shoes", "loafers", "leather", "men", "aba made"],
    options: [{ name: "Size (EU)", values: ["40", "41", "42", "43", "44", "45"] }, { name: "Colour", values: ["Black", "Brown", "Tan"] }],
    wholesale: [{ minQty: 12, discount: 0.12 }, { minQty: 48, discount: 0.2 }],
    description: "Full-grain cowhide loafers hand-stitched in Aba. Leather sole with rubber heel grip. Custom sizes and logos available on request.",
    highlights: ["Full-grain cowhide", "Hand-stitched in Aba", "Wholesale from 12 pairs", "Custom orders via chat"],
    specs: { Upper: "Full-grain cowhide", Sole: "Leather with rubber heel", Lining: "Goatskin", Made_in: "Aba, Abia State" },
  },
];

/** Marketplace details layered onto the base catalogue (store, variant prices, wholesale, video). */
const extras: Record<string, Partial<Raw>> = {
  "volt-x12-5g-smartphone": { warranty: "12 months", video: "https://www.tiktok.com/@alaba.ng/video/7441234567890123456", variantPrice: { "Colour:Silver": 30 } },
  "kora-20000mah-power-bank": { store: "kora-power-industries", wholesale: [{ minQty: 10, discount: 0.08 }, { minQty: 50, discount: 0.15 }], video: "https://www.instagram.com/reel/C9x1AlabaDemo/", warranty: "6 months" },
  "glide-silent-mouse": { store: "lekki-gadget-hub", freeDelivery: true },
  "echo-bass-bluetooth-speaker": { store: "lekki-gadget-hub", variantPrice: { "Colour:Blue": 1500 }, warranty: "12 months" },
  "edge-beard-trimmer": { store: "lekki-gadget-hub" },
  "breeze-rechargeable-fan": { store: "arewa-home-appliances" },
  "metro-laptop-backpack": { store: "aba-leatherworks", wholesale: [{ minQty: 12, discount: 0.1 }, { minQty: 60, discount: 0.18 }] },
  "aura-perfume-oil-set": { store: "lekki-gadget-hub" },
  "stash-1tb-portable-ssd": { variantPrice: { "Capacity:2 TB": 260 } },
  "aero-14-ultrabook": { warranty: "12 months" },
  "keyflow-mechanical-keyboard": { variantPrice: { "Switch:Brown (tactile)": 15 } },
  "pixel-watch-fit-pro": { variantPrice: { "Strap:Steel mesh": 40 } },
  "aba-handmade-leather-loafers": { store: "aba-leatherworks" },
};

const fen = (rmb: number) => Math.round(rmb * 100);
const kobo = (naira: number) => Math.round(naira * 100);

const STORE_IDS: Record<string, string> = {
  "alaba-verified": "str_alaba",
  "kora-power-industries": "str_kora",
  "aba-leatherworks": "str_aba",
  "lekki-gadget-hub": "str_lekki",
  "arewa-home-appliances": "str_kano",
};

/** Deterministic pseudo-random stock so demo data is stable between builds. */
const seeded = (seed: string, max: number) => {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % max;
};

function cartesian(options: ProductOption[]): Record<string, string>[] {
  return options.reduce<Record<string, string>[]>(
    (acc, o) => acc.flatMap((combo) => o.values.map((v) => ({ ...combo, [o.name]: v }))),
    [{}],
  );
}

function buildVariants(r: Raw, base: { fen?: number; kobo?: number; compareKobo?: number }, totalStock: number): Variant[] {
  const combos = cartesian(r.options ?? []);
  return combos.map((options, i) => {
    const delta = Object.entries(options).reduce((sum, [k, v]) => sum + (r.variantPrice?.[`${k}:${v}`] ?? 0), 0);
    const code = Object.values(options).map((v) => v.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase()).join("-");
    const stock = r.availability === "out_of_stock" ? 0 : r.source === "imported" ? 999 : Math.max(0, Math.round(totalStock / combos.length) + seeded(r.slug + i, 5) - 2);
    return {
      id: `${r.slug}#${i}`,
      sku: `ALB-${r.slug.split("-").slice(0, 2).join("").slice(0, 8).toUpperCase()}${code ? `-${code}` : ""}`,
      options,
      supplierPriceFen: base.fen != null ? base.fen + fen(delta) : undefined,
      priceKobo: base.kobo != null ? base.kobo + kobo(delta) : undefined,
      compareAtKobo: base.compareKobo,
      stock,
    };
  });
}

export const products: Product[] = raw.map((r0, i) => {
  const r = { ...r0, ...extras[r0.slug] };
  const storeSlug = r.source === "imported" ? "alaba-verified" : (r.store ?? "alaba-verified");
  const stock = r.stock ?? 999;
  return {
    id: `prd_${String(i + 1).padStart(3, "0")}`,
    slug: r.slug,
    name: r.name,
    brand: r.brand.toLowerCase().replace(/\s+/g, "-"),
    storeId: STORE_IDS[storeSlug] ?? "str_alaba",
    category: r.category,
    source: r.source,
    origin: r.origin ?? "manual",
    status: "active",
    description: r.description,
    highlights: r.highlights,
    specs: Object.fromEntries(Object.entries(r.specs).map(([k, v]) => [k.replace(/_/g, " "), v])),
    images: [1, 2, 3].map((n) => `/products/${r.slug}-${n}.svg`),
    supplierPriceFen: r.source === "imported" ? fen(r.price) : undefined,
    priceKobo: r.source === "local" ? kobo(r.price) : undefined,
    compareAtKobo: r.compareAt ? kobo(r.compareAt) : undefined,
    estWeightKg: r.kg,
    dimsCm: r.dims,
    moq: r.moq ?? 1,
    stock,
    availability: r.availability ?? "in_stock",
    deliveryDays: r.days ?? [10, 18],
    options: r.options ?? [],
    variants: buildVariants(
      r,
      r.source === "imported" ? { fen: fen(r.price) } : { kobo: kobo(r.price), compareKobo: r.compareAt ? kobo(r.compareAt) : undefined },
      stock,
    ),
    wholesale: r.wholesale ?? [],
    freeDelivery: r.freeDelivery ?? false,
    videoUrl: r.video,
    condition: "new",
    warranty: r.warranty,
    rating: r.rating,
    reviewCount: r.reviews,
    sold: r.sold,
    createdAt: `${r.created}T10:00:00.000Z`,
    tags: r.tags,
  };
});

/** Used by scripts/generate-product-images.ts */
export const productIcons = raw.map((r) => ({ slug: r.slug, icon: r.icon, category: r.category }));
