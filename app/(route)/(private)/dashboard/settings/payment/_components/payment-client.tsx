"use client"

import * as React from "react"
import { CreditCard, Plus, Trash2 } from "lucide-react"
import { SettingsPageHeader } from "../../_components/settings-page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function PaymentClient() {
  return (
    <div className="flex flex-col gap-8 max-w-[1000px]">
      <SettingsPageHeader
        segment="Payment Setting"
        title="Payment Settings"
        description="Manage payment methods, gateways, and processing"
      />

      <Card className="border-none shadow-sm rounded-[20px] bg-white overflow-hidden">
        <CardContent className="p-8 flex flex-col gap-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[6px] bg-[#F8F8F8] flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#1A1A1A]" />
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-[16px] font-bold text-[#1A1A1A]">Payment Methods</h2>
                <p className="text-[14px] text-[#808080]">Configure payment gateways and processors</p>
              </div>
            </div>
            <Button className="h-[48px] px-6 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-[12px] font-semibold gap-2">
              <Plus className="w-5 h-5" />
              Add Payment Method
            </Button>
          </div>

          {/* Gateway List */}
          <div className="flex flex-col gap-4">
            <div className="p-6 rounded-[16px] border border-[#F1F1F1] flex items-center justify-between group hover:border-[#365BEB] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[12px] border border-[#F1F1F1] flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-[#1A1A1A]" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[16px] font-bold text-[#1A1A1A]">Paystack</h3>
                  <p className="text-[14px] text-[#808080]">Fees 2.9%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="h-[40px] px-6 rounded-[8px] border-[#E5E5E5] text-[#4D4D4D] font-semibold">
                  Configure
                </Button>
                <Button variant="outline" size="icon" className="h-[40px] w-[40px] rounded-[8px] border-[#E5E5E5] text-[#808080] hover:text-[#EF4444] hover:border-[#EF4444] hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
