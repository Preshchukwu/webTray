"use client"

import * as React from "react"
import { Mail, MessageSquare, Smartphone } from "lucide-react"
import { SettingsPageHeader } from "../../_components/settings-page-header"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function NotificationsClient() {
  const emailSettings = [
    { label: "Order Confirmations", description: "Get notified when new orders are placed" },
    { label: "Order Status Updates", description: "Notifications when order status changes" },
    { label: "Low Stock Alerts", description: "Alert when inventory is running low" },
    { label: "Customer Messages", description: "New messages from customers" },
    { label: "Payment Notifications", description: "Payment confirmations and failures" },
    { label: "Weekly Reports", description: "Business performance summaries" },
    { label: "Marketing Emails", description: "Tips, promotions, and product updates" },
    { label: "Product Updates", description: "New features and platform updates" },
  ]

  const smsSettings = [
    { label: "Order Alerts", description: "Critical order notifications via SMS" },
    { label: "Low Stock Alerts", description: "Urgent inventory alerts via SMS" },
    { label: "Payment Alerts", description: "Payment failures and issues via SMS" },
  ]

  const pushSettings = [
    { label: "Order Notifications", description: "New orders and updates" },
    { label: "Inventory Alerts", description: "Stock level notifications" },
    { label: "Customer Activity", description: "New customers and messages" },
    { label: "Report Notifications", description: "Weekly and monthly reports" },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-[1000px]">
      <SettingsPageHeader
        segment="Notification Setting"
        title="Notification Settings"
        description="Control email, SMS, and push notification preferences"
      />

      <div className="bg-white rounded-[20px] shadow-sm p-8 flex flex-col gap-10">
        {/* Email Notifications Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[6px] bg-[#F8F8F8] flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-[#1A1A1A]" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[16px] font-bold text-[#1A1A1A]">Email Notifications</h2>
              <p className="text-[14px] text-[#808080]">Manage your email alert preferences</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {emailSettings.map((item) => (
              <div key={item.label} className="flex items-center justify-between group">
                <div className="flex flex-col gap-1">
                  <Label className="text-[14px] font-semibold text-[#1A1A1A]">{item.label}</Label>
                  <p className="text-[12px] text-[#808080]">{item.description}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </section>

        <div className="h-[1px] bg-[#F1F1F1] width-full" />

        {/* SMS Notifications Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[6px] bg-[#F8F8F8] flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-[#1A1A1A]" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[16px] font-bold text-[#1A1A1A]">SMS Notifications</h2>
              <p className="text-[14px] text-[#808080]">Receive important alerts via text message</p>
            </div>
          </div>

          <div className="p-4 rounded-[12px] bg-[#F8FAFF] border border-[#E0E7FF]">
            <p className="text-[13px] text-[#365BEB] leading-relaxed">
              Note: SMS notifications may incur additional charges based on your mobile plan.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {smsSettings.map((item) => (
              <div key={item.label} className="flex items-center justify-between group">
                <div className="flex flex-col gap-1">
                  <Label className="text-[14px] font-semibold text-[#1A1A1A]">{item.label}</Label>
                  <p className="text-[12px] text-[#808080]">{item.description}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </section>

        <div className="h-[1px] bg-[#F1F1F1] width-full" />

        {/* Push Notifications Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[6px] bg-[#F8F8F8] flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-[#1A1A1A]" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[16px] font-bold text-[#1A1A1A]">Push Notifications</h2>
              <p className="text-[14px] text-[#808080]">Real-time notifications in your browser and mobile app</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {pushSettings.map((item) => (
              <div key={item.label} className="flex items-center justify-between group">
                <div className="flex flex-col gap-1">
                  <Label className="text-[14px] font-semibold text-[#1A1A1A]">{item.label}</Label>
                  <p className="text-[12px] text-[#808080]">{item.description}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
