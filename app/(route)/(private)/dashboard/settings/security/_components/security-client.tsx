"use client"

import * as React from "react"
import { Smartphone, AlertTriangle, CheckCircle2, Shield, Lock, Activity } from "lucide-react"
import { SettingsPageHeader } from "../../_components/settings-page-header"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function SecurityClient() {
  const recentActivity = [
    { title: "Successful Login", details: "Maryland Lagos • 2 hours ago", icon: CheckCircle2 },
    { title: "Password Changed", details: "1 month ago", icon: CheckCircle2 },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-[1000px]">
      <SettingsPageHeader
        segment="Security & Privacy"
        title="Security & Privacy"
        description="Two-factor authentication, API keys, and privacy settings"
      />

      <div className="flex flex-col gap-8">
        {/* Two-Factor Authentication Section */}
        <div className="bg-white rounded-[20px] shadow-sm p-8 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[6px] bg-[#F8F8F8] flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-[#1A1A1A]" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-[16px] font-bold text-[#1A1A1A]">Two-Factor Authentication</h2>
              <p className="text-[14px] text-[#808080]">Add an extra layer of security to your account</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-[#F1F1F1] pt-6">
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-semibold text-[#1A1A1A]">Enable Two-Factor Authentication</span>
              <p className="text-[12px] text-[#808080]">Require a code from your phone to sign in</p>
            </div>
            <Switch />
          </div>

          <div className="p-4 rounded-[12px] bg-[#FFFBEB] border border-[#FEF3C7] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#D97706] leading-relaxed">
              Two-factor authentication is disabled. Enable it to secure your account with an additional verification step.
            </p>
          </div>
        </div>

        {/* Security Settings Section */}
        <div className="bg-white rounded-[20px] shadow-sm p-8 flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-[#1A1A1A]">Security Settings</h2>
            <p className="text-[14px] text-[#808080]">Configure additional security options</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-2">
            {/* Account Security Column */}
            <div className="flex flex-col gap-6">
              <h3 className="text-[14px] font-semibold text-[#808080] uppercase tracking-wider">Account Security</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-semibold text-[#1A1A1A]">Login Notifications</span>
                  <p className="text-[12px] text-[#808080]">Get notified of new sign-ins</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[14px] font-semibold text-[#1A1A1A]">Service Timeout (minutes)</span>
                <Input type="number" defaultValue={30} className="h-[48px] rounded-[8px] border-[#E5E5E5] bg-[#F9F9F9] focus-visible:ring-0 focus-visible:border-[#365BEB]" />
              </div>
            </div>

            {/* Data Protection Column */}
            <div className="flex flex-col gap-6">
              <h3 className="text-[14px] font-semibold text-[#808080] uppercase tracking-wider">Data Protection</h3>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-semibold text-[#1A1A1A]">Audit Logging</span>
                  <p className="text-[12px] text-[#808080]">Offer free shipping to customers</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-semibold text-[#1A1A1A]">Enable Free Shipping</span>
                  <p className="text-[12px] text-[#808080]">Offer free shipping to customers</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-[#1A1A1A]">Recent Activity</h2>
            <p className="text-[14px] text-[#808080]">Monitor recent security events and login attempts</p>
          </div>

          <div className="flex flex-col gap-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-5 rounded-[12px] bg-[#ECFDF5] border border-[#D1FAE5]">
                <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0">
                  <activity.icon className="w-5 h-5 text-[#10B981]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-bold text-[#1A1A1A]">{activity.title}</span>
                  <p className="text-[13px] text-[#6B7280]">{activity.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
