"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Store, TrendingUp, Zap, ShieldCheck } from "lucide-react"

const benefits = [
  {
    icon: Store,
    title: "Your Own Storefront",
    description: "Get a branded, shareable storefront in minutes — no tech skills needed.",
    color: "bg-blue-50 text-[#365BEB]",
  },
  {
    icon: TrendingUp,
    title: "Reach More Customers",
    description: "Get discovered by shoppers already browsing the WebTray vendor directory.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Zap,
    title: "Sell Faster",
    description: "Manage orders, inventory, and payments all from one clean dashboard.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: ShieldCheck,
    title: "Get Paid Securely",
    description: "Accept card and cash payments with instant payout to your bank account.",
    color: "bg-purple-50 text-purple-600",
  },
]

export function VendorSection() {
  return (
    <section className="max-w-7xl mx-auto mt-[112px] md:mt-[164px] px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d1b6e] via-[#1a2f9e] to-[#365BEB] px-6 py-14 md:py-20 md:px-16">
        {/* Background decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative z-10 text-center mb-12">
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium tracking-wide uppercase border border-white/20">
            For Vendors
          </span>
          <h2 className="text-3xl md:text-[40px] font-bold text-white text-balance leading-tight mb-4">
            Why Sell on WebTray?
          </h2>
          <p className="max-w-xl mx-auto text-white/70 text-[16px] leading-[26px]">
            Everything you need to grow your business online — without the headache.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 hover:bg-white/15 transition-colors duration-300"
            >
              <div className={`inline-flex p-2.5 rounded-xl mb-4 ${benefit.color}`}>
                <benefit.icon className="w-5 h-5" />
              </div>
              <h3 className="text-white font-semibold text-[15px] mb-2">{benefit.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            className="rounded-full bg-white text-[#365BEB] hover:bg-gray-100 font-semibold text-[15px] px-8 py-[14px]"
            asChild
          >
            <Link href="/wait-list">Become a Vendor</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-2 border-white/50 text-white hover:bg-white/10 bg-transparent font-semibold text-[15px] px-8 py-[14px]"
            asChild
          >
            <Link href="/vendors">Browse Vendors</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
