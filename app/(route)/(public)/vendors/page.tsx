import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Star, Package, ArrowUpRight, Search } from "lucide-react"
import Header from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Vendors | WebTray",
  description: "Discover and shop from a curated directory of vendors on WebTray.",
}

const CATEGORY_STYLES: Record<string, { gradient: string; pattern: string; badge: string }> = {
  Fashion: {
    gradient: "from-rose-400 via-pink-500 to-fuchsia-500",
    pattern: "bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.15)_0%,transparent_50%)]",
    badge: "bg-rose-100 text-rose-700",
  },
  Electronics: {
    gradient: "from-blue-500 via-indigo-500 to-violet-600",
    pattern: "bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15)_0%,transparent_50%)]",
    badge: "bg-blue-100 text-blue-700",
  },
  "Food & Drinks": {
    gradient: "from-orange-400 via-amber-400 to-yellow-500",
    pattern: "bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2)_0%,transparent_60%)]",
    badge: "bg-amber-100 text-amber-700",
  },
  "Beauty & Wellness": {
    gradient: "from-purple-400 via-violet-500 to-indigo-500",
    pattern: "bg-[radial-gradient(circle_at_0%_100%,rgba(255,255,255,0.18)_0%,transparent_50%)]",
    badge: "bg-purple-100 text-purple-700",
  },
  "Home & Decor": {
    gradient: "from-teal-400 via-emerald-500 to-cyan-500",
    pattern: "bg-[radial-gradient(circle_at_100%_50%,rgba(255,255,255,0.15)_0%,transparent_50%)]",
    badge: "bg-teal-100 text-teal-700",
  },
  Groceries: {
    gradient: "from-lime-400 via-green-500 to-emerald-600",
    pattern: "bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.15)_0%,transparent_50%)]",
    badge: "bg-green-100 text-green-700",
  },
}

const vendors = [
  {
    slug: "zara-ng",
    name: "Zara NG Closet",
    tagline: "Affordable Lagos fashion for every occasion",
    category: "Fashion",
    location: "Lagos Island, Lagos",
    productCount: 124,
    rating: 4.8,
    reviews: 312,
    logo: null,
    initials: "ZN",
  },
  {
    slug: "techvault",
    name: "TechVault",
    tagline: "Genuine gadgets, unbeatable prices",
    category: "Electronics",
    location: "Ikeja, Lagos",
    productCount: 89,
    rating: 4.6,
    reviews: 198,
    logo: null,
    initials: "TV",
  },
  {
    slug: "mama-kitchen",
    name: "Mama's Kitchen",
    tagline: "Home-cooked meals delivered fresh to you",
    category: "Food & Drinks",
    location: "Lekki, Lagos",
    productCount: 47,
    rating: 4.9,
    reviews: 540,
    logo: null,
    initials: "MK",
  },
  {
    slug: "glowhaus",
    name: "GlowHaus",
    tagline: "Premium skincare for every skin tone",
    category: "Beauty & Wellness",
    location: "Abuja, FCT",
    productCount: 76,
    rating: 4.7,
    reviews: 274,
    logo: null,
    initials: "GH",
  },
  {
    slug: "nest-decor",
    name: "Nest & Decor",
    tagline: "Turn your house into a home",
    category: "Home & Decor",
    location: "Port Harcourt, Rivers",
    productCount: 63,
    rating: 4.5,
    reviews: 161,
    logo: null,
    initials: "ND",
  },
  {
    slug: "freshbowl",
    name: "FreshBowl Market",
    tagline: "Farm-fresh produce delivered daily",
    category: "Groceries",
    location: "Ibadan, Oyo",
    productCount: 155,
    rating: 4.9,
    reviews: 429,
    logo: null,
    initials: "FB",
  },
]

function VendorCard({ vendor }: { vendor: typeof vendors[number] }) {
  const style = CATEGORY_STYLES[vendor.category] ?? CATEGORY_STYLES["Fashion"]

  return (
    <Link
      href={`/store/${vendor.slug}`}
      className="group block bg-white rounded-[20px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Gradient banner */}
      <div className={`relative h-[96px] bg-gradient-to-br ${style.gradient}`}>
        <div className={`absolute inset-0 ${style.pattern}`} />
        {/* Decorative dots */}
        <div className="absolute top-3 right-4 flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/30" />
          <span className="w-2 h-2 rounded-full bg-white/20" />
          <span className="w-2 h-2 rounded-full bg-white/10" />
        </div>
        {/* Arrow icon on hover */}
        <div className="absolute top-3 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/30">
            Visit Store <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Avatar — straddles the banner */}
      <div className="relative px-5">
        <div className="absolute -top-7 left-5">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-white font-bold text-xl border-[3px] border-white shadow-md`}>
            {vendor.logo ? (
              <Image src={vendor.logo} alt={vendor.name} fill className="object-cover rounded-xl" />
            ) : (
              vendor.initials
            )}
          </div>
        </div>

        {/* Category badge — top right of body */}
        <div className="flex justify-end pt-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.badge}`}>
            {vendor.category}
          </span>
        </div>

        {/* Content */}
        <div className="mt-2 pb-5">
          <h3 className="text-[#111827] font-bold text-[16px] leading-tight mb-1 group-hover:text-[#365BEB] transition-colors">
            {vendor.name}
          </h3>
          <p className="text-[#808080] text-sm leading-snug mb-4 line-clamp-1">
            {vendor.tagline}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm text-[#4D4D4D]">
            <span className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-gray-400" />
              {vendor.productCount} products
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {vendor.rating}
              <span className="text-gray-400">({vendor.reviews})</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-2 text-xs text-[#808080]">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {vendor.location}
          </div>

          {/* Divider + CTA */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Powered by WebTray</span>
            <span className="flex items-center gap-1 text-[#365BEB] text-sm font-semibold group-hover:gap-2 transition-all">
              Shop now <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function VendorsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block mb-3 px-3 py-1 rounded-full bg-blue-50 text-[#365BEB] text-xs font-semibold uppercase tracking-widest border border-blue-100">
            Vendor Directory
          </span>
          <h1 className="text-[32px] md:text-[48px] font-bold text-[#111827] leading-tight mb-4 text-balance">
            Discover Amazing Vendors
          </h1>
          <p className="text-[#4D4D4D] text-[16px] leading-[26px]">
            Browse and shop from a curated selection of verified vendors all powered by WebTray.
          </p>
        </div>

        {/* Search bar (UI only) */}
        <div className="max-w-lg mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search vendors, categories..."
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm text-[#111827] placeholder:text-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#365BEB]/20 focus:border-[#365BEB]"
            />
          </div>
        </div>
      </section>

      {/* Vendor grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#808080]">
            Showing <span className="font-semibold text-[#111827]">{vendors.length}</span> vendors
          </p>
          <div className="flex gap-2">
            {Object.keys(CATEGORY_STYLES).slice(0, 4).map((cat) => (
              <button
                key={cat}
                className="hidden sm:inline-flex px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-[#4D4D4D] hover:border-[#365BEB] hover:text-[#365BEB] transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.slug} vendor={vendor} />
          ))}
        </div>

        {/* Empty state / load more placeholder */}
        <div className="mt-12 text-center">
          <p className="text-sm text-[#808080]">More vendors coming soon.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
