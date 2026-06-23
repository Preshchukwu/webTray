"use client"

import { useState } from "react"
import {
  Pencil, Plus, Trash2, ExternalLink, Copy, Check,
  Upload, X, ImagePlus, Clock, DollarSign, Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_PROFILE = {
  name: "Tunde Kolade",
  title: "Brand & Visual Designer",
  bio: "I craft bold, strategic identities for startups and growing brands.",
  location: "Lagos, Nigeria",
  skills: ["Branding", "Logo Design", "UI/UX", "Print Design"],
  slug: "tunde-kolade",
}

const MOCK_SERVICES = [
  { id: 1, title: "Brand Identity Package", price: 120000, deliveryDays: 14 },
  { id: 2, title: "Logo Design", price: 35000, deliveryDays: 5 },
  { id: 3, title: "Social Media Kit", price: 28000, deliveryDays: 4 },
]

const MOCK_WORKS = [
  { id: 1, title: "Zuri Foods Rebrand", category: "Branding", gradient: "from-rose-400 to-pink-500" },
  { id: 2, title: "TechNova App UI", category: "UI/UX", gradient: "from-blue-400 to-indigo-500" },
  { id: 3, title: "Bloom Events Identity", category: "Branding", gradient: "from-amber-400 to-orange-500" },
]

// ─── Reusable UI ──────────────────────────────────────────────────────────────

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[16px] font-bold text-[#111827]">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${active ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
      {active ? "Live" : "Draft"}
    </span>
  )
}

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function ProfileSection() {
  const [editing, setEditing] = useState(false)
  const p = MOCK_PROFILE

  return (
    <SectionCard
      title="Profile"
      action={
        <Button size="sm" variant="outline" className="rounded-full text-xs gap-1.5" onClick={() => setEditing(!editing)}>
          <Pencil className="w-3.5 h-3.5" />
          {editing ? "Cancel" : "Edit"}
        </Button>
      }
    >
      {editing ? (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#4D4D4D] block mb-1.5">Display Name</label>
              <input defaultValue={p.name} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#365BEB]/20 focus:border-[#365BEB]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#4D4D4D] block mb-1.5">Professional Title</label>
              <input defaultValue={p.title} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#365BEB]/20 focus:border-[#365BEB]" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#4D4D4D] block mb-1.5">Bio</label>
            <textarea defaultValue={p.bio} rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#365BEB]/20 focus:border-[#365BEB] resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#4D4D4D] block mb-1.5">Location</label>
            <input defaultValue={p.location} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#365BEB]/20 focus:border-[#365BEB]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#4D4D4D] block mb-1.5">Skills (comma separated)</label>
            <input defaultValue={p.skills.join(", ")} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#365BEB]/20 focus:border-[#365BEB]" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button className="rounded-full bg-[#365BEB] hover:bg-[#2d4fd6] text-white text-sm px-5" onClick={() => { setEditing(false); toast.success("Profile updated") }}>
              Save Changes
            </Button>
            <Button variant="outline" className="rounded-full text-sm px-5" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#365BEB] to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
              TK
            </div>
            <div>
              <p className="font-bold text-[#111827]">{p.name}</p>
              <p className="text-sm text-[#808080]">{p.title}</p>
              <p className="text-xs text-[#808080]">{p.location}</p>
            </div>
          </div>
          <p className="text-sm text-[#4D4D4D] leading-relaxed">{p.bio}</p>
          <div className="flex flex-wrap gap-1.5">
            {p.skills.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-full bg-blue-50 text-[#365BEB] text-xs font-medium border border-blue-100">{s}</span>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

function ServicesSection() {
  const [services, setServices] = useState(MOCK_SERVICES)
  const [adding, setAdding] = useState(false)
  const [newService, setNewService] = useState({ title: "", price: "", deliveryDays: "" })

  const addService = () => {
    if (!newService.title || !newService.price) return
    setServices((prev) => [
      ...prev,
      { id: Date.now(), title: newService.title, price: Number(newService.price), deliveryDays: Number(newService.deliveryDays) || 7 },
    ])
    setNewService({ title: "", price: "", deliveryDays: "" })
    setAdding(false)
    toast.success("Service added")
  }

  const removeService = (id: number) => {
    setServices((prev) => prev.filter((s) => s.id !== id))
    toast.success("Service removed")
  }

  return (
    <SectionCard
      title="Services & Pricing"
      action={
        <Button size="sm" className="rounded-full bg-[#365BEB] hover:bg-[#2d4fd6] text-white text-xs gap-1.5" onClick={() => setAdding(true)}>
          <Plus className="w-3.5 h-3.5" /> Add Service
        </Button>
      }
    >
      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-[#365BEB]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#111827] truncate">{s.title}</p>
                <div className="flex items-center gap-3 text-xs text-[#808080]">
                  <span>₦{s.price.toLocaleString()}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {s.deliveryDays} days
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => removeService(s.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-red-400 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {adding && (
          <div className="p-4 rounded-xl border border-[#365BEB]/30 bg-blue-50/30 space-y-3">
            <input
              placeholder="Service title"
              value={newService.title}
              onChange={(e) => setNewService((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#365BEB]/20 focus:border-[#365BEB]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Price (₦)"
                type="number"
                value={newService.price}
                onChange={(e) => setNewService((p) => ({ ...p, price: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#365BEB]/20 focus:border-[#365BEB]"
              />
              <input
                placeholder="Delivery (days)"
                type="number"
                value={newService.deliveryDays}
                onChange={(e) => setNewService((p) => ({ ...p, deliveryDays: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#365BEB]/20 focus:border-[#365BEB]"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="rounded-full bg-[#365BEB] hover:bg-[#2d4fd6] text-white text-xs px-4" onClick={addService}>Save</Button>
              <Button size="sm" variant="outline" className="rounded-full text-xs px-4" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}

function WorksSection() {
  const [works, setWorks] = useState(MOCK_WORKS)
  const [uploading, setUploading] = useState(false)
  const [newWork, setNewWork] = useState({ title: "", category: "" })

  const GRADIENTS = [
    "from-rose-400 to-pink-500",
    "from-blue-400 to-indigo-500",
    "from-amber-400 to-orange-500",
    "from-purple-400 to-violet-600",
    "from-teal-400 to-emerald-500",
    "from-cyan-400 to-blue-500",
  ]

  const addWork = () => {
    if (!newWork.title) return
    setWorks((prev) => [
      { id: Date.now(), title: newWork.title, category: newWork.category || "General", gradient: GRADIENTS[prev.length % GRADIENTS.length] },
      ...prev,
    ])
    setNewWork({ title: "", category: "" })
    setUploading(false)
    toast.success("Work sample added")
  }

  const removeWork = (id: number) => {
    setWorks((prev) => prev.filter((w) => w.id !== id))
    toast.success("Work sample removed")
  }

  return (
    <SectionCard
      title="Work Samples"
      action={
        <Button size="sm" className="rounded-full bg-[#365BEB] hover:bg-[#2d4fd6] text-white text-xs gap-1.5" onClick={() => setUploading(true)}>
          <ImagePlus className="w-3.5 h-3.5" /> Upload Work
        </Button>
      }
    >
      {uploading && (
        <div className="mb-5 p-4 rounded-xl border border-[#365BEB]/30 bg-blue-50/30 space-y-3">
          <div
            className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#365BEB] transition-colors"
            onClick={() => toast.info("File picker — devs will wire this up")}
          >
            <Upload className="w-8 h-8 text-blue-300 mx-auto mb-2" />
            <p className="text-sm text-[#808080]">Click to upload image</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, GIF up to 10MB</p>
          </div>
          <input
            placeholder="Project title"
            value={newWork.title}
            onChange={(e) => setNewWork((p) => ({ ...p, title: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#365BEB]/20 focus:border-[#365BEB]"
          />
          <input
            placeholder="Category (e.g. Branding, UI/UX)"
            value={newWork.category}
            onChange={(e) => setNewWork((p) => ({ ...p, category: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#365BEB]/20 focus:border-[#365BEB]"
          />
          <div className="flex gap-2">
            <Button size="sm" className="rounded-full bg-[#365BEB] hover:bg-[#2d4fd6] text-white text-xs px-4" onClick={addWork}>Save</Button>
            <Button size="sm" variant="outline" className="rounded-full text-xs px-4" onClick={() => setUploading(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {works.map((w) => (
          <div key={w.id} className="group relative rounded-xl overflow-hidden">
            <div className={`h-32 bg-gradient-to-br ${w.gradient}`} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex flex-col items-start justify-between p-3">
              <button
                onClick={() => removeWork(w.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto bg-white/20 backdrop-blur-sm rounded-full p-1 text-white hover:bg-red-500/80"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-medium mb-1 backdrop-blur-sm">{w.category}</span>
                <p className="text-white font-semibold text-xs leading-tight">{w.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Main client ──────────────────────────────────────────────────────────────

export function PortfolioClient() {
  const [copied, setCopied] = useState(false)
  const portfolioUrl = `webtray.ng/portfolio/${MOCK_PROFILE.slug}`

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${portfolioUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Link copied!")
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:py-6 max-w-6xl w-full">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#111827]">My Portfolio</h1>
          <p className="text-sm text-[#808080] mt-0.5">Manage your public-facing creative portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Portfolio link */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-white text-xs text-[#4D4D4D]">
            <span className="hidden sm:block truncate max-w-[160px]">{portfolioUrl}</span>
            <button onClick={copyLink} className="text-[#365BEB] hover:text-[#2d4fd6] transition-colors">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <Button size="sm" variant="outline" className="rounded-full text-xs gap-1.5" asChild>
            <a href={`/portfolio/${MOCK_PROFILE.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="w-3.5 h-3.5" /> Preview
            </a>
          </Button>
          <Button size="sm" className="rounded-full bg-[#365BEB] hover:bg-[#2d4fd6] text-white text-xs gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Publish
          </Button>
        </div>
      </div>

      {/* Status banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-100">
        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
        <p className="text-sm text-amber-800">
          Your portfolio is in <span className="font-semibold">draft</span> mode. Hit <span className="font-semibold">Publish</span> when you're ready to go live.
        </p>
      </div>

      {/* Sections */}
      <ProfileSection />
      <ServicesSection />
      <WorksSection />
    </div>
  )
}
