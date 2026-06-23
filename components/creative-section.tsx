"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Palette, Globe, Camera, Code2, ArrowUpRight, CheckCircle2 } from "lucide-react"

const disciplines = [
  { icon: Palette, label: "Graphic Designers" },
  { icon: Globe, label: "Web Designers" },
  { icon: Code2, label: "Developers" },
  { icon: Camera, label: "Photographers" },
]

const perks = [
  "Your own portfolio at webtray.ng/portfolio/you",
  "Showcase previous work with a gallery",
  "List your services with pricing",
  "Get paid directly through WebTray",
  "Receive client enquiries in one place",
]

// Mini portfolio card preview (decorative)
function MiniPortfolioCard() {
  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      {/* Card shadow layers */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-purple-200/50" />
      <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-2xl bg-indigo-200/50" />

      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        {/* Banner */}
        <div className="h-20 bg-gradient-to-r from-[#365BEB] via-indigo-500 to-purple-600 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
        </div>

        {/* Avatar */}
        <div className="px-5 pb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#365BEB] to-purple-600 border-4 border-white -mt-7 flex items-center justify-center text-white font-bold text-lg shadow-md">
            TK
          </div>
          <div className="mt-2">
            <p className="font-bold text-[#111827] text-sm">Tunde Kolade</p>
            <p className="text-xs text-[#808080]">Brand & Visual Designer · Lagos</p>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {["Branding", "UI/UX", "Print"].map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-full bg-blue-50 text-[#365BEB] text-[10px] font-medium border border-blue-100">
                {s}
              </span>
            ))}
          </div>

          {/* Work grid preview */}
          <div className="grid grid-cols-3 gap-1.5 mt-3">
            {["from-rose-300 to-pink-400", "from-amber-300 to-orange-400", "from-teal-300 to-emerald-400"].map((g, i) => (
              <div key={i} className={`h-14 rounded-xl bg-gradient-to-br ${g} opacity-80`} />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-3 flex gap-2">
            <div className="flex-1 text-center py-1.5 rounded-full bg-[#365BEB] text-white text-[11px] font-semibold">
              Hire Me
            </div>
            <div className="flex-1 text-center py-1.5 rounded-full border border-gray-200 text-[#4D4D4D] text-[11px] font-semibold">
              View Work
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CreativeSection() {
  return (
    <section className="max-w-7xl mx-auto mt-[112px] md:mt-[164px] px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">

        {/* Left — copy */}
        <div>
          <span className="inline-block mb-4 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-widest border border-purple-100">
            For Creatives
          </span>
          <h2 className="text-[28px] md:text-[40px] font-bold text-[#111827] leading-tight mb-4 text-balance">
            Your Portfolio. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#365BEB] to-purple-600">
              Your Brand. Your Clients.
            </span>
          </h2>
          <p className="text-[#4D4D4D] text-[16px] leading-[26px] mb-6">
            WebTray gives digital service providers — designers, developers, photographers and more — a purpose-built portfolio to showcase work, list services, and get paid.
          </p>

          {/* Who it's for */}
          <div className="flex flex-wrap gap-2 mb-8">
            {disciplines.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-[#4D4D4D] text-sm font-medium">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </span>
            ))}
          </div>

          {/* Perks */}
          <ul className="space-y-3 mb-8">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-[#4D4D4D]">
                <CheckCircle2 className="w-4 h-4 text-[#365BEB] shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="rounded-full bg-[#365BEB] hover:bg-[#2d4fd6] text-white font-semibold text-[15px] px-8 py-[14px]"
              asChild
            >
              <Link href="/wait-list">
                Create Your Portfolio <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-gray-200 text-[#4D4D4D] hover:border-[#365BEB] hover:text-[#365BEB] font-semibold text-[15px] px-8 py-[14px]"
              asChild
            >
              <Link href="/portfolio/demo">See an Example</Link>
            </Button>
          </div>
        </div>

        {/* Right — decorative portfolio card */}
        <div className="flex justify-center lg:justify-end">
          <MiniPortfolioCard />
        </div>
      </div>
    </section>
  )
}
