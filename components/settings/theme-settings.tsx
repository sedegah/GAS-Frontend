"use client"
import { useState } from "react"
import { Monitor, Moon, Sun, Palette } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export function ThemeSettings() {
  const [selectedTheme, setSelectedTheme] = useState("light")
  const { toast } = useToast()

  const themes = [
    {
      id: "light",
      name: "Light Mode",
      description: "Clean and bright interface",
      icon: Sun,
    },
    {
      id: "dark",
      name: "Dark Mode",
      description: "Easy on the eyes in low light",
      icon: Moon,
    },
    {
      id: "system",
      name: "System",
      description: "Follow system preference",
      icon: Monitor,
    },
  ]

  const handleThemeChange = (themeId: string) => {
    setSelectedTheme(themeId)
    console.log("[v0] Theme changed to:", themeId)
    toast({
      title: "Theme Updated",
      description: `Switched to ${themes.find((t) => t.id === themeId)?.name} theme.`,
    })
  }

  return (
    <Card className="border-[#1D3557]/10">
      <CardHeader>
        <CardTitle className="text-[#1D3557] flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Appearance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {themes.map((theme) => {
          const Icon = theme.icon
          const isSelected = selectedTheme === theme.id

          return (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? "border-[#005826] bg-[#005826]/5"
                  : "border-[#1D3557]/10 hover:border-[#005826]/50 hover:bg-[#005826]/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-[#005826] text-white" : "bg-[#1D3557]/10 text-[#457B9D]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className={`font-medium ${isSelected ? "text-[#005826]" : "text-[#1D3557]"}`}>{theme.name}</p>
                  <p className="text-sm text-[#457B9D]">{theme.description}</p>
                </div>
                {isSelected && (
                  <div className="ml-auto w-4 h-4 bg-[#005826] rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          )
        })}

        <div className="pt-4 border-t border-[#1D3557]/10">
          <p className="text-xs text-[#457B9D] text-center">
            Theme changes will be applied immediately across the system
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
