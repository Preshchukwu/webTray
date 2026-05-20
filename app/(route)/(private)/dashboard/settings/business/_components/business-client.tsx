"use client"

import * as React from "react"
import { Upload, Trash2, Phone, Mail, Globe, Clock, MapPin, AtSign } from "lucide-react"
import { SettingsPageHeader } from "../../_components/settings-page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function BusinessClient() {
  const days = [
    { name: "Monday", open: true, range: "09:00 AM - 05:00 PM" },
    { name: "Tuesday", open: true, range: "09:00 AM - 05:00 PM" },
    { name: "Wednesday", open: true, range: "09:00 AM - 05:00 PM" },
    { name: "Thursday", open: true, range: "09:00 AM - 05:00 PM" },
    { name: "Friday", open: true, range: "09:00 AM - 05:00 PM" },
    { name: "Saturday", open: true, range: "09:00 AM - 05:00 PM" },
    { name: "Sunday", open: false, range: "Closed" },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-[1000px]">
      <SettingsPageHeader
        segment="Business Setting"
        title="Business Settings"
        description="Configure your business information and store details"
      />

      <div className="bg-white rounded-[20px] shadow-sm p-8 flex flex-col gap-10">
        {/* Business Information Section */}
        <section className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-[#1A1A1A]">Business Information</h2>
            <p className="text-[14px] text-[#808080]">Basic information about your business</p>
          </div>

          {/* Logo Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6">
              <div className="w-[80px] h-[80px] rounded-full border-2 border-dashed border-[#E5E5E5] bg-[#F9F9F9] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="h-[44px] px-6 rounded-[8px] border-[#E5E5E5] text-[#4D4D4D] font-semibold gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </Button>
                <Button variant="ghost" className="h-[44px] px-4 text-[#808080] font-semibold gap-2 hover:text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                  Remove Logo
                </Button>
              </div>
            </div>
            <p className="text-[12px] text-[#A3A3A3]">JPG, PNG or GIF. Max size 2MB.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="business-name" className="text-[14px] font-semibold text-[#1A1A1A]">Business Name</Label>
              <Input id="business-name" placeholder="Enter your business name" className="h-[52px] rounded-[8px] border-[#E5E5E5]" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="business-type" className="text-[14px] font-semibold text-[#1A1A1A]">Business Type</Label>
              <Select>
                <SelectTrigger id="business-type" className="h-[52px] rounded-[8px] border-[#E5E5E5]">
                  <SelectValue placeholder="Choose business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="business-description" className="text-[14px] font-semibold text-[#1A1A1A]">Business Description</Label>
              <Textarea id="business-description" placeholder="Coffee enthusiast and small business owner" className="min-h-[120px] rounded-[8px] border-[#E5E5E5] resize-none" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="website" className="text-[14px] font-semibold text-[#1A1A1A]">Website</Label>
              <Input id="website" placeholder="Enter your business website" className="h-[52px] rounded-[8px] border-[#E5E5E5]" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tax-id" className="text-[14px] font-semibold text-[#1A1A1A]">
                Tax ID <span className="text-[#FFB547] text-[12px] font-regular">(optional)</span>
              </Label>
              <Select>
                <SelectTrigger id="tax-id" className="h-[52px] rounded-[8px] border-[#E5E5E5]">
                  <SelectValue placeholder="Choose business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <div className="h-[1px] bg-[#F1F1F1] width-full" />

        {/* Contact Information Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-[#1A1A1A]">Contact Information</h2>
            <p className="text-[14px] text-[#808080]">How customers can reach your business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-2">
              <Label className="text-[14px] font-semibold text-[#1A1A1A]">Phone Number</Label>
              <div className="relative">
                <Input placeholder="Enter phone number" className="h-[52px] rounded-[8px] border-[#E5E5E5] pr-10" />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[14px] font-semibold text-[#1A1A1A]">Business Email</Label>
              <div className="relative">
                <Input placeholder="Enter business email" className="h-[52px] rounded-[8px] border-[#E5E5E5] pr-10" />
                <AtSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
              </div>
            </div>
          </div>
        </section>

        <div className="h-[1px] bg-[#F1F1F1] width-full" />

        {/* Business Address Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-[#1A1A1A]">Business Address</h2>
            <p className="text-[14px] text-[#808080]">Basic information about your business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label className="text-[14px] font-semibold text-[#1A1A1A]">Street Address</Label>
              <Input placeholder="Enter your business name" className="h-[52px] rounded-[8px] border-[#E5E5E5]" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[14px] font-semibold text-[#1A1A1A]">City</Label>
              <Input placeholder="Enter city" className="h-[52px] rounded-[8px] border-[#E5E5E5]" />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[14px] font-semibold text-[#1A1A1A]">State</Label>
              <Input placeholder="Enter state" className="h-[52px] rounded-[8px] border-[#E5E5E5]" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label className="text-[14px] font-semibold text-[#1A1A1A]">Country</Label>
              <Select defaultValue="ng">
                <SelectTrigger className="h-[52px] rounded-[8px] border-[#E5E5E5]">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ng">Nigeria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <div className="h-[1px] bg-[#F1F1F1] width-full" />

        {/* Opening Hours Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-[#1A1A1A]">Opening Hours</h2>
            <p className="text-[14px] text-[#808080]">Set your business hours for each day of the week</p>
          </div>
          <div className="flex flex-col gap-4">
            {days.map((day) => (
              <div key={day.name} className="flex items-center justify-between py-1">
                <span className="text-[14px] text-[#6B7280] font-regular">{day.name}</span>
                <div className="flex items-center gap-8">
                  <Switch defaultChecked={day.open} />
                  <span className={cn("text-[14px] w-[180px] text-right font-regular", day.open ? "text-[#6B7280]" : "text-[#A3A3A3]")}>
                    {day.range}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="h-[1px] bg-[#F1F1F1] width-full" />

        {/* Regional Settings Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-[#1A1A1A]">Regional Settings</h2>
            <p className="text-[14px] text-[#808080]">Currency and timezone preferences</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-2">
              <Label className="text-[14px] font-semibold text-[#1A1A1A]">Currency</Label>
              <Select defaultValue="naira">
                <SelectTrigger className="h-[52px] bg-[#F9F9F9] border-[#E5E5E5] rounded-[8px]">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="naira">Naira</SelectItem>
                  <SelectItem value="usd">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[14px] font-semibold text-[#1A1A1A]">Timezone</Label>
              <Select defaultValue="wat">
                <SelectTrigger className="h-[52px] bg-[#F9F9F9] border-[#E5E5E5] rounded-[8px]">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wat">West African Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <div className="h-[1px] bg-[#F1F1F1] width-full" />

        {/* Business Features Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[16px] font-bold text-[#1A1A1A]">Business Features</h2>
            <p className="text-[14px] text-[#808080]">Enable or disable specific business features</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Label className="text-[14px] font-semibold text-[#1A1A1A]">Currently Open</Label>
                <p className="text-[12px] text-[#808080]">Toggle your business open/closed status</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Label className="text-[14px] font-semibold text-[#1A1A1A]">Accept Online Orders</Label>
                <p className="text-[12px] text-[#808080]">Allow customers to place orders online</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </section>
      </div>

       {/* Action Buttons */}
       <div className="flex justify-end gap-3 mt-4">
        <Button variant="ghost" className="h-[52px] px-8 text-[#808080] font-semibold rounded-[12px]">
          Cancel
        </Button>
        <Button className="h-[52px] px-10 bg-[#365BEB] hover:bg-[#2A48C9] text-white rounded-[12px] font-semibold shadow-md shadow-blue-100">
          Save Changes
        </Button>
      </div>
    </div>
  )
}
