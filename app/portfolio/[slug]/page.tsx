import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  MapPin, Star, Clock, CheckCircle2, ArrowUpRight,
  Twitter, Instagram, Linkedin, Globe, Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"

// ─── Mock data (devs will replace with real API call) ────────────────────────

const MOCK_PROVIDER = {
  name: "Tunde Kolade",
  title: "Brand & Visual Designer",
  bio: "I craft bold, strategic identities for startups and growing brands. With 6 years of experience across Lagos and London, I turn business goals into visual stories that stick.",
  location: "Lagos, Nigeria",
  avatar: null,
  initials: "TK",
  accentColor: "#365BEB",
  skills: ["Branding", "Logo Design", "UI/UX", "Print Design", "Motion Graphics"],
  stats: [
    { label: "Projects done", value: "120+" },
    { label: "Happy clients", value: "94" },
    { label: "Years active", value: "6" },
  ],
  socials: {
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    website: "https://example.com",
  },
  services: [
    {
      id: 1,
      title: "Brand Identity Package",
      description: "Full brand identity — logo, colour palette, typography, brand guidelines document.",
      price: 120000,
      deliveryDays: 14,
      popular: true,
    },
    {
      id: 2,
      title: "Logo Design",
      description: "Clean, versatile logo with 3 concepts, unlimited revisions until you love it.",
      price: 35000,
      deliveryDays: 5,
      popular: false,
    },
    {
      id: 3,
      title: "Social Media Kit",
      description: "Profile art, cover images, and 10 post templates tailored to your brand.",
      price: 28000,
      deliveryDays: 4,
      popular: false,
    },
    {
      id: 4,
      title: "Flyer / Print Design",
      description: "Eye-catching print or digital flyers, posters, and event banners.",
      price: 15000,
      deliveryDays: 2,
      popular: false,
    },
  ],
  works: [
    { id: 1, title: "Zuri Foods Rebrand", category: "Branding", gradient: "from-rose-400 to-pink-500" },
    { id: 2, title: "TechNova App UI", category: "UI/UX", gradient: "from-blue-400 to-indigo-500" },
    { id: 3, title: "Bloom Events Identity", category: "Branding", gradient: "from-amber-400 to-orange-500" },
    { id: 4, title: "Lagos Fashion Week Poster", category: "Print", gradient: "from-purple-400 to-violet-600" },
    { id: 5, title: "FreshMart Campaign", category: "Social Media", gradient: "from-teal-400 to-emerald-500" },
    { id: 6, title: "Kudi Finance Dashboard", category: "UI/UX", gradient: "from-cyan-400 to-blue-500" },
  ],
}

const WORK_CATEGORIES = ["All", ...Array.from(new Set(MOCK_PROVIDER.works.map((w) => w.category)))]

// ─── Sub-components ───────────────────────────────────────────────────────────

function ServiceCard({ service }: { service: typeof MOCK_PROVIDER.services[number] }) {
  return (
    <div className={`relative bg-white rounded-[20px] border p-6 hover:shadow-md transition-shadow duration-300 ${service.popular ? "border-[#365BEB] shadow-sm shadow-blue-100" : "border-gray-100 shadow-sm"}`}>
      {service.popular && (
        <span className="absolute -top-3 left-5 px-3 py-0.5 rounded-full bg-[#365BEB] text-white text-xs font-semibold">
          Most Popular
        </span>
      )}
      <h3 className="font-bold text-[#111827] text-[16px] mb-2">{service.title}</h3>
      <p className="text-[#808080] text-sm leading-relaxed mb-4">{service.description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-[#808080] mb-0.5">Starting from</p>
          <p className="font-bold text-[#111827] text-[18px]">
            ₦{service.price.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-[#808080] mb-1 justify-end">
            <Clock className="w-3.5 h-3.5" />
            {service.deliveryDays} day{service.deliveryDays > 1 ? "s" : ""}
          </div>
          <Button size="sm" className="rounded-full bg-[#365BEB] hover:bg-[#2d4fd6] text-white text-xs px-4">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}

function WorkCard({ work }: { work: typeof MOCK_PROVIDER.works[number] }) {
  return (
    <div className="group relative rounded-2xl overflow-hidden cursor-pointer">
      <div className={`h-48 bg-gradient-to-br ${work.gradient} transition-transform duration-500 group-hover:scale-105`} />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex flex-col items-start justify-end p-4">
        <div className="translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-medium mb-1 backdrop-blur-sm">
            {work.category}
          </span>
          <p className="text-white font-semibold text-sm">{work.title}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${MOCK_PROVIDER.name} — Portfolio | WebTray`,
    description: MOCK_PROVIDER.bio,
  }
}

export default function PortfolioPage() {
  const p = MOCK_PROVIDER

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* ── Hero ── */}
      <div className="relative">
        {/* Banner */}
        <div className="h-52 md:h-64 bg-gradient-to-br from-[#0d1b6e] via-[#365BEB] to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,rgba(255,255,255,0.12)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
        </div>

        {/* Avatar + name — anchored to banner bottom */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 pb-6">
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#365BEB] to-purple-600 border-4 border-white flex items-center justify-center text-white font-bold text-3xl shadow-xl shrink-0">
                {p.avatar ? (
                  <Image src={p.avatar} alt={p.name} fill className="object-cover rounded-full" />
                ) : (
                  p.initials
                )}
              </div>

              <div className="pb-1">
                <h1 className="text-[22px] md:text-[28px] font-bold text-[#111827] leading-tight">{p.name}</h1>
                <p className="text-[#4D4D4D] text-sm md:text-base">{p.title}</p>
                <div className="flex items-center gap-1 text-xs text-[#808080] mt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {p.location}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-2 shrink-0">
              <Button className="rounded-full bg-[#365BEB] hover:bg-[#2d4fd6] text-white font-semibold px-6">
                Hire Me
              </Button>
              <Button variant="outline" className="rounded-full border-gray-200 text-[#4D4D4D] hover:border-[#365BEB] hover:text-[#365BEB] font-semibold px-6">
                <Mail className="w-4 h-4 mr-1.5" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16">

        {/* About + stats */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-5">
            <h2 className="text-[20px] font-bold text-[#111827]">About</h2>
            <p className="text-[#4D4D4D] leading-relaxed">{p.bio}</p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2">
              {p.skills.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full bg-blue-50 text-[#365BEB] text-sm font-medium border border-blue-100">
                  {s}
                </span>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3 pt-1">
              {p.socials.twitter && (
                <Link href={p.socials.twitter} target="_blank" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[#808080] hover:border-[#365BEB] hover:text-[#365BEB] transition-colors">
                  <Twitter className="w-4 h-4" />
                </Link>
              )}
              {p.socials.instagram && (
                <Link href={p.socials.instagram} target="_blank" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[#808080] hover:border-[#365BEB] hover:text-[#365BEB] transition-colors">
                  <Instagram className="w-4 h-4" />
                </Link>
              )}
              {p.socials.linkedin && (
                <Link href={p.socials.linkedin} target="_blank" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[#808080] hover:border-[#365BEB] hover:text-[#365BEB] transition-colors">
                  <Linkedin className="w-4 h-4" />
                </Link>
              )}
              {p.socials.website && (
                <Link href={p.socials.website} target="_blank" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[#808080] hover:border-[#365BEB] hover:text-[#365BEB] transition-colors">
                  <Globe className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Stats card */}
          <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-6 flex flex-col justify-center gap-6 h-fit">
            {p.stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-[28px] font-bold text-[#111827]">{s.value}</p>
                <p className="text-xs text-[#808080] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-bold text-[#111827]">Services & Pricing</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {p.services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </div>

        {/* Work samples */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-bold text-[#111827]">Work Samples</h2>
            <div className="hidden sm:flex gap-2">
              {WORK_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white text-[#4D4D4D] hover:border-[#365BEB] hover:text-[#365BEB] transition-colors first:bg-[#365BEB] first:text-white first:border-[#365BEB]"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {p.works.map((w) => (
              <WorkCard key={w.id} work={w} />
            ))}
          </div>
        </div>

        {/* Hire CTA */}
        <div className="bg-gradient-to-br from-[#0d1b6e] via-[#365BEB] to-purple-600 rounded-[24px] p-10 text-center">
          <h2 className="text-[22px] md:text-[28px] font-bold text-white mb-3">
            Ready to work together?
          </h2>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            Let's create something great. Reach out and I'll get back to you within 24 hours.
          </p>
          <Button size="lg" className="rounded-full bg-white text-[#365BEB] hover:bg-gray-100 font-semibold px-8">
            Get in Touch <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Powered by WebTray */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2 text-xs text-[#808080] hover:text-[#365BEB] transition-colors">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Portfolio powered by <span className="font-semibold">WebTray</span>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
