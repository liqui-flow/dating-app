"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Shield,
  Crown,
  HelpCircle,
  LogOut,
  ChevronRight,
  Settings,
  Power,
  MessageCircle,
  Info,
  Mail,
  Bug,
  ArrowLeft,
} from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { supabase } from "@/lib/supabaseClient"
import { useToast } from "@/hooks/use-toast"
import { StaticBackground } from "@/components/discovery/static-background"

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

type SettingsNavigateHandler = (id: string) => void

const settingsSections: SettingsSection[] = [
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
    title: "App Settings",
    items: [
      {
        id: "profile_visibility",
        label: "Profile Visibility",
        description: "Show or hide your profile",
        icon: Power,
        type: "toggle",
        value: true,
      },
      {
        id: "hide_age",
        label: "Hide My Age",
        description: "Don't show your age on profile",
        icon: Info,
        type: "toggle",
        value: false,
      },
      {
        id: "hide_distance",
        label: "Hide My Distance",
        description: "Don't show distance on profile",
        icon: Info,
        type: "toggle",
        value: false,
      },
    ],
  },
  {
    title: "Help & Support",
    items: [
      {
        id: "help_faq",
        label: "FAQ",
        description: "Common questions about the app",
        icon: HelpCircle,
        type: "navigation",
      },
      {
        id: "help_contact",
        label: "Contact Us",
        description: "Reach out to our team",
        icon: Mail,
        type: "navigation",
      },
      {
        id: "help_report_bug",
        label: "Report a Bug",
        description: "Found an issue? Tell us",
        icon: Bug,
        type: "navigation",
      },
      {
        id: "app_settings",
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
        id: "delete_account",
        label: "Delete Account",
        description: "Permanently delete your account",
        icon: Settings,
        type: "action",
        destructive: true,
      },
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

interface AppSettingsProps {
  onNavigate?: SettingsNavigateHandler
  onLogout?: () => void
  onBack?: () => void
}

export function AppSettings({ onNavigate, onLogout, onBack }: AppSettingsProps) {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    push_notifications: true,
    message_notifications: true,
    profile_visibility: true,
    hide_age: false,
    hide_distance: false,
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleToggle = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleNavigation = (id: string) => {
    if (onNavigate) onNavigate(id)
  }

  const handleAction = (id: string) => {
    if (id === "logout") {
      onLogout?.()
    }
    if (id === "delete_account") {
      const trigger = document.getElementById("delete-account-trigger") as HTMLButtonElement | null
      trigger?.click()
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        toast({
          title: "Error",
          description: "Unable to verify user session",
          variant: "destructive",
        })
        return
      }

      // Call delete account API
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()

      if (!data.success) {
        toast({
          title: "Deletion Failed",
          description: data.error || "Failed to delete account. Please try again.",
          variant: "destructive",
        })
        return
      }

      // Sign out the user
      await supabase.auth.signOut()

      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      })

      // Call logout handler to redirect user
      setTimeout(() => {
        onLogout?.()
      }, 1500)

    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex flex-col h-full relative">
      <StaticBackground />
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border glass-apple">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-muted/50 rounded-full" 
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{section.title}</h2>

              <Card className="overflow-hidden">
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

                      {index < section.items.length - 1 && <Separator className="ml-16 mr-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Account Confirmation */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="hidden" id="delete-account-trigger" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and all data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDeleteAccount()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
