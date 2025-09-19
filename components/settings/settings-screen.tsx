"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Bell,
  Shield,
  Heart,
  Crown,
  HelpCircle,
  LogOut,
  ChevronRight,
  Settings,
  Moon,
  Globe,
  Eye,
  MessageCircle,
} from "lucide-react"

interface SettingsSection {
  title: string
  items: SettingsItem[]
}

interface SettingsItem {
  id: string
  label: string
  description?: string
  icon: React.ElementType
  type: "toggle" | "navigation" | "action"
  value?: boolean
  badge?: string
  destructive?: boolean
}

const settingsSections: SettingsSection[] = [
  {
    title: "Account",
    items: [
      {
        id: "profile",
        label: "Edit Profile",
        description: "Update your photos and information",
        icon: User,
        type: "navigation",
      },
      {
        id: "premium",
        label: "Premium Features",
        description: "Upgrade to unlock all features",
        icon: Crown,
        type: "navigation",
        badge: "Upgrade",
      },
      {
        id: "verification",
        label: "Profile Verification",
        description: "Verify your profile with photo ID",
        icon: Shield,
        type: "navigation",
      },
    ],
  },
  {
    title: "Discovery",
    items: [
      {
        id: "discovery",
        label: "Discovery Settings",
        description: "Age range, distance, and preferences",
        icon: Heart,
        type: "navigation",
      },
      {
        id: "incognito",
        label: "Incognito Mode",
        description: "Browse profiles privately",
        icon: Eye,
        type: "toggle",
        value: false,
        badge: "Premium",
      },
    ],
  },
  {
    title: "Notifications",
    items: [
      {
        id: "push_notifications",
        label: "Push Notifications",
        description: "Get notified about matches and messages",
        icon: Bell,
        type: "toggle",
        value: true,
      },
      {
        id: "message_notifications",
        label: "Message Notifications",
        description: "Notifications for new messages",
        icon: MessageCircle,
        type: "toggle",
        value: true,
      },
    ],
  },
  {
    title: "Preferences",
    items: [
      {
        id: "dark_mode",
        label: "Dark Mode",
        description: "Switch to dark theme",
        icon: Moon,
        type: "toggle",
        value: false,
      },
      {
        id: "language",
        label: "Language",
        description: "English",
        icon: Globe,
        type: "navigation",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        id: "help",
        label: "Help & Support",
        description: "Get help and contact support",
        icon: HelpCircle,
        type: "navigation",
      },
      {
        id: "settings_general",
        label: "App Settings",
        description: "Privacy, safety, and more",
        icon: Settings,
        type: "navigation",
      },
    ],
  },
  {
    title: "Account Actions",
    items: [
      {
        id: "logout",
        label: "Log Out",
        icon: LogOut,
        type: "action",
        destructive: true,
      },
    ],
  },
]

export function SettingsScreen() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    push_notifications: true,
    message_notifications: true,
    incognito: false,
    dark_mode: false,
  })

  const handleToggle = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleNavigation = (id: string) => {
    console.log(`Navigate to: ${id}`)
  }

  const handleAction = (id: string) => {
    if (id === "logout") {
      console.log("Logging out...")
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src="/professional-headshot.png" alt="Profile" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">John Doe</h1>
            <p className="text-sm text-muted-foreground">john.doe@example.com</p>
            <Badge variant="secondary" className="text-xs">
              Free Account
            </Badge>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</h2>

              <Card>
                <CardContent className="p-0">
                  {section.items.map((item, index) => (
                    <div key={item.id}>
                      <div
                        className={`flex items-center justify-between p-4 ${
                          item.type !== "toggle" ? "cursor-pointer hover:bg-muted/50" : ""
                        } transition-colors`}
                        onClick={() => {
                          if (item.type === "navigation") handleNavigation(item.id)
                          if (item.type === "action") handleAction(item.id)
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              item.destructive ? "bg-destructive/10" : "bg-muted"
                            }`}
                          >
                            <item.icon
                              className={`w-5 h-5 ${item.destructive ? "text-destructive" : "text-muted-foreground"}`}
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${item.destructive ? "text-destructive" : ""}`}>
                                {item.label}
                              </span>
                              {item.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                          </div>
                        </div>

                        <div className="flex items-center">
                          {item.type === "toggle" && (
                            <Switch
                              checked={settings[item.id] || false}
                              onCheckedChange={() => handleToggle(item.id)}
                            />
                          )}
                          {item.type === "navigation" && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                        </div>
                      </div>

                      {index < section.items.length - 1 && <Separator className="ml-16" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
