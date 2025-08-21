"use client"
import { useState } from "react"
import { Bell, Mail, MessageSquare, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    correspondenceUpdates: true,
    statusChanges: false,
    weeklyReports: true,
    systemAlerts: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    console.log("[v0] Saving notification settings:", settings)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      })
    }, 1000)
  }

  return (
    <Card className="border-[#1D3557]/10">
      <CardHeader>
        <CardTitle className="text-[#1D3557] flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg border border-[#1D3557]/10">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#457B9D]" />
            <div>
              <p className="font-medium text-[#1D3557]">Email Notifications</p>
              <p className="text-sm text-[#457B9D]">Receive notifications via email</p>
            </div>
          </div>
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
          />
        </div>

        {/* Correspondence Updates */}
        <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg border border-[#1D3557]/10">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-[#457B9D]" />
            <div>
              <p className="font-medium text-[#1D3557]">Correspondence Updates</p>
              <p className="text-sm text-[#457B9D]">Get notified when correspondence is updated</p>
            </div>
          </div>
          <Switch
            checked={settings.correspondenceUpdates}
            onCheckedChange={(checked) => handleSettingChange("correspondenceUpdates", checked)}
          />
        </div>

        {/* Status Changes */}
        <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg border border-[#1D3557]/10">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#457B9D]" />
            <div>
              <p className="font-medium text-[#1D3557]">Status Changes</p>
              <p className="text-sm text-[#457B9D]">Alerts when correspondence status changes</p>
            </div>
          </div>
          <Switch
            checked={settings.statusChanges}
            onCheckedChange={(checked) => handleSettingChange("statusChanges", checked)}
          />
        </div>

        {/* Weekly Reports */}
        <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg border border-[#1D3557]/10">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#457B9D]" />
            <div>
              <p className="font-medium text-[#1D3557]">Weekly Reports</p>
              <p className="text-sm text-[#457B9D]">Receive weekly activity summaries</p>
            </div>
          </div>
          <Switch
            checked={settings.weeklyReports}
            onCheckedChange={(checked) => handleSettingChange("weeklyReports", checked)}
          />
        </div>

        {/* System Alerts */}
        <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg border border-[#1D3557]/10">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-[#457B9D]" />
            <div>
              <p className="font-medium text-[#1D3557]">System Alerts</p>
              <p className="text-sm text-[#457B9D]">Important system notifications</p>
            </div>
          </div>
          <Switch
            checked={settings.systemAlerts}
            onCheckedChange={(checked) => handleSettingChange("systemAlerts", checked)}
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-[#005826] hover:bg-[#005826]/90 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  )
}
