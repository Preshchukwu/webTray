"use client"

import * as React from "react"
import { Upload, Trash2, Eye, EyeOff } from "lucide-react"
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

export function AccountClient() {
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const passwordRequirements = [
    "At least 8 characters long",
    "Contains uppercase and lowercase letters",
    "Contains at least one number",
    "Contains at least one special character",
  ]

  return (
    <div className="flex flex-col gap-8 max-w-[1000px]">
      <SettingsPageHeader
        segment="Account Setting"
        title="Account Settings"
        description="Manage your personal account information and preferences"
      />

      <div className="flex flex-col gap-10 bg-white p-8 rounded-[20px] shadow-sm">
        {/* Profile Information Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-[#1A1A1A]">Profile Information</h2>
            <p className="text-[14px] text-[#808080]">Update your personal details and profile picture</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6">
              <div className="w-[80px] h-[80px] rounded-full border-2 border-dashed border-[#E5E5E5] bg-[#F9F9F9] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px]" />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="h-[44px] px-6 rounded-[8px] border-[#E5E5E5] text-[#4D4D4D] font-semibold gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </Button>
                <Button variant="ghost" className="h-[44px] px-4 text-[#808080] font-semibold gap-2 hover:text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                  Remove Photo
                </Button>
              </div>
            </div>
            <p className="text-[12px] text-[#A3A3A3]">JPG, PNG or GIF. Max size 2MB.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="first-name" className="text-[14px] font-semibold text-[#1A1A1A]">First Name</Label>
              <Input id="first-name" placeholder="Enter your first name" className="h-[52px] rounded-[8px] border-[#E5E5E5]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name" className="text-[14px] font-semibold text-[#1A1A1A]">Last Name</Label>
              <Input id="last-name" placeholder="Enter your last name" className="h-[52px] rounded-[8px] border-[#E5E5E5]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[14px] font-semibold text-[#1A1A1A]">Phone Number</Label>
              <Input id="phone" placeholder="Enter your phone number" className="h-[52px] rounded-[8px] border-[#E5E5E5]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[14px] font-semibold text-[#1A1A1A]">Email Address</Label>
              <Input id="email" placeholder="Enter your email address" className="h-[52px] rounded-[8px] border-[#E5E5E5]" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio" className="text-[14px] font-semibold text-[#1A1A1A]">Bio</Label>
              <Textarea id="bio" placeholder="Coffee enthusiast and small business owner" className="min-h-[120px] rounded-[8px] border-[#E5E5E5] resize-none" />
            </div>
          </div>
        </section>

        <div className="h-[1px] bg-[#F1F1F1]" />

        {/* Password & Security Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-[#1A1A1A]">Password & Security</h2>
            <p className="text-[14px] text-[#808080]">Update your password and security settings</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-[14px] font-semibold text-[#1A1A1A]">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  className="h-[52px] rounded-[8px] border-[#E5E5E5] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#808080] hover:text-[#4D4D4D]"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-[14px] font-semibold text-[#1A1A1A]">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="h-[52px] rounded-[8px] border-[#E5E5E5] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#808080] hover:text-[#4D4D4D]"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-[14px] font-semibold text-[#1A1A1A]">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="h-[52px] rounded-[8px] border-[#E5E5E5] pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#808080] hover:text-[#4D4D4D]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[12px] bg-[#F8FAFF] border border-[#E0E7FF] flex flex-col gap-3">
              <h4 className="text-[14px] font-semibold text-[#365BEB]">Password Requirements</h4>
              <ul className="space-y-2">
                {passwordRequirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-3 text-[13px] text-[#365BEB]">
                    <div className="w-[6px] h-[6px] rounded-full bg-[#365BEB]" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <Button className="h-[52px] px-8 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-[8px] font-semibold">
              Update Password
            </Button>
          </div>
        </section>

        <div className="h-[1px] bg-[#F1F1F1]" />

        {/* Preferences Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-bold text-[#1A1A1A]">Preferences</h2>
            <p className="text-[14px] text-[#808080]">Customize your account preferences and regional settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-[#1A1A1A]">Timezone</Label>
              <Select defaultValue="wat">
                <SelectTrigger className="h-[52px] rounded-[8px] border-[#E5E5E5]">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wat">West African Time</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-[#1A1A1A]">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger className="h-[52px] rounded-[8px] border-[#E5E5E5]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[14px] font-semibold text-[#1A1A1A]">Date format</Label>
              <Select defaultValue="dmy">
                <SelectTrigger className="h-[52px] rounded-[8px] border-[#E5E5E5]">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <div className="h-[1px] bg-[#F1F1F1]" />

        {/* Communication Preferences Section */}
        <section className="flex flex-col gap-6">
          <h2 className="text-[16px] font-bold text-[#1A1A1A]">Communication Preferences</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Label className="text-[14px] font-semibold text-[#1A1A1A]">Email Notifications</Label>
                <p className="text-[12px] text-[#808080]">Receive important updates via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Label className="text-[14px] font-semibold text-[#1A1A1A]">Marketing Emails</Label>
                <p className="text-[12px] text-[#808080]">Receive promotional content and tips</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </section>
      </div>

      {/* Danger Zone */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-bold text-[#EF4444]">Danger Zone</h2>
          <p className="text-[14px] text-[#808080]">Irreversible actions</p>
        </div>

        <Card className="border border-[#FEE2E2] shadow-sm rounded-[20px] bg-white overflow-hidden">
          <CardContent className="p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-[16px] font-bold text-[#1A1A1A]">Delete Account</h3>
              <p className="text-[14px] text-[#808080]">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <Button className="w-fit h-[48px] px-8 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-[12px] font-semibold">
              Delete Account
            </Button>
          </CardContent>
        </Card>
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
