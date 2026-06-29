"use client"

import * as React from "react"
import { Truck, Globe, Plus, Pencil, Trash2 } from "lucide-react"
import { SettingsPageHeader } from "../../_components/settings-page-header"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function ShippingClient() {
  const deliveryMethods = [
    {
      title: "Local Delivery",
      description: "Within 10 miles of store",
      icon: Truck,
      methods: [
        { name: "Express delivery", price: "₦ 5,000", time: "2 - 4 hours" },
        { name: "Normal Delivery", price: "₦ 2,000", time: "1 business day" },
      ],
    },
    {
      title: "National Delivery",
      description: "Nationwide delivery with UPS, FedEx, etc.",
      icon: Truck,
      methods: [
        { name: "Express delivery", price: "₦ 18,000", time: "4 business days" },
        { name: "Normal Delivery", price: "₦ 12,000", time: "7 business days" },
      ],
    },
    {
      title: "International Delivery",
      description: "Worldwide delivery with UPS, FedEx, etc.",
      icon: Globe,
      methods: [
        { name: "Express delivery", price: "₦ 188,000", time: "4 business days" },
        { name: "Normal Delivery", price: "₦ 120,000", time: "7 business days" },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-[1000px]">
      <SettingsPageHeader
        segment="Shipping & Delivery"
        title="Shipping & Delivery Settings"
        description="Define shipping areas and delivery methods"
        action={
          <Button className="h-[48px] px-6 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-[12px] font-semibold gap-2 shrink-0 w-full sm:w-auto">
            <Plus className="w-5 h-5" />
            Add Shipping Zone
          </Button>
        }
      />

      <div className="flex flex-col gap-6">
        {/* Delivery Method Cards */}
        {deliveryMethods.map((method, index) => (
          <Card key={index} className="border-none shadow-sm rounded-[20px] bg-white overflow-hidden">
            <CardContent className="p-8 flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[6px] bg-[#F8F8F8] flex items-center justify-center shrink-0">
                    <method.icon className="w-6 h-6 text-[#1A1A1A]" />
                  </div>
                  <div className="flex flex-col gap-1 pt-1">
                    <h2 className="text-[16px] font-bold text-[#1A1A1A]">{method.title}</h2>
                    <p className="text-[14px] text-[#808080]">{method.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="h-[40px] px-4 rounded-[8px] border-[#E5E5E5] text-[#4D4D4D] font-semibold gap-2">
                    Edit
                  </Button>
                  <Button variant="outline" size="icon" className="h-[40px] w-[40px] rounded-[8px] border-[#E5E5E5] text-[#808080] hover:text-[#EF4444] hover:border-[#EF4444] hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {method.methods.map((delivery, i) => (
                  <div key={i} className="p-6 rounded-[12px] bg-[#F9FAFB] border border-[#F3F4F6] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-semibold text-[#4B5563]">{delivery.name}</span>
                      <span className="text-[16px] font-bold text-[#111827]">{delivery.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#9CA3AF]">{delivery.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Free Delivery Section */}
        <Card className="border-none shadow-sm rounded-[20px] bg-white overflow-hidden mt-2">
          <CardContent className="p-8 flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-[18px] font-bold text-[#1A1A1A]">Free Delivery</h2>
              <p className="text-[14px] text-[#808080]">Set up free shipping promotions and thresholds</p>
            </div>

            <div className="flex flex-col gap-6 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-semibold text-[#1A1A1A]">Enable Free Shipping</span>
                  <p className="text-[12px] text-[#808080]">Offer free shipping to customers</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-[14px] font-semibold text-[#1A1A1A]">Minimum Order Value</Label>
                  <div className="relative">
                    <Input defaultValue="50,000.00" className="h-[52px] rounded-[8px] border-[#E5E5E5] bg-[#F9F9F9] focus-visible:ring-0 focus-visible:border-[#365BEB] pl-4" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-[14px] font-semibold text-[#1A1A1A]">Applicable Zones</Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-[52px] rounded-[8px] border-[#E5E5E5] bg-white">
                      <SelectValue placeholder="Select zones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All zones</SelectItem>
                      <SelectItem value="local">Local only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
