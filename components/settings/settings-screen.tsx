"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
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
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { StaticBackground } from "@/components/discovery/static-background"
import { supabase } from "@/lib/supabaseClient"
import { getIDVerification } from "@/lib/verificationApi"

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

// Settings sections will be generated dynamically based on user path
const getSettingsSections = (userPath: 'dating' | 'matrimony' | null): SettingsSection[] => {
  const sections: SettingsSection[] = [
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
  ]

  return sections
}

interface UserInfo {
  name: string
  email: string
  photo: string | null
  accountType: string
  userPath: 'dating' | 'matrimony' | null
}

export function SettingsScreen({ onNavigate, onLogout, mode, onBack }: { onNavigate?: SettingsNavigateHandler; onLogout?: () => void; mode?: 'dating' | 'matrimony'; onBack?: () => void }) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "Loading...",
    email: "Loading...",
    photo: null,
    accountType: "Free Account",
    userPath: null
  })
  const [loading, setLoading] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected' | 'in_review' | null>(null)

  useEffect(() => {
    fetchUserInfo()
    checkVerificationStatus()
  }, [])

  const checkVerificationStatus = async () => {
    try {
      const result = await getIDVerification()
      if (result.success && result.data) {
        setVerificationStatus(result.data.verification_status as 'pending' | 'approved' | 'rejected' | 'in_review')
      } else {
        setVerificationStatus(null)
      }
    } catch (error) {
      console.error('Error checking verification status:', error)
      setVerificationStatus(null)
    }
  }

  const fetchUserInfo = async () => {
    try {
      setLoading(true)
      
      // Get auth user for email
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error("Error fetching auth user:", authError)
        setUserInfo({
          name: "User",
          email: "Not available",
          photo: null,
          accountType: "Free Account",
          userPath: null
        })
        setLoading(false)
        return
      }

      const email = user.email || "Not available"

      // Get user's selected path
      const { data: userProfile, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('selected_path')
        .eq('user_id', user.id)
        .single()

      const userPath = (!userProfileError && userProfile?.selected_path) ? 
        (userProfile.selected_path as 'dating' | 'matrimony') : null

      let name = "User"
      let photo: string | null = null

      // Use mode prop to determine which profile table to query
      // Mode is determined by the current context (which page/route we're on)
      const currentMode = mode || 'dating' // Default to dating for backward compatibility

      if (currentMode === 'dating') {
        // ALWAYS fetch from dating_profile_full when in dating mode
        const { data: datingProfile, error: datingError } = await supabase
          .from('dating_profile_full')
          .select('name, photos')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!datingError && datingProfile) {
          name = datingProfile.name || name
          const photos = (datingProfile.photos as string[]) || []
          photo = photos.length > 0 ? photos[0] : null
        }
      } else if (currentMode === 'matrimony') {
        // ALWAYS fetch from matrimony_profile_full when in matrimony mode
        const { data: matrimonyProfile, error: matrimonyError } = await supabase
          .from('matrimony_profile_full')
          .select('name, photos')
          .eq('user_id', user.id)
          .maybeSingle()

        if (!matrimonyError && matrimonyProfile) {
          name = matrimonyProfile.name || name
          const photos = (matrimonyProfile.photos as string[]) || []
          photo = photos.length > 0 ? photos[0] : null
        }
      }

      // Get initials for fallback
      const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || "U"

      setUserInfo({
        name,
        email,
        photo,
        accountType: "Free Account", // TODO: Check subscription status if you have a subscriptions table
        userPath
      })
    } catch (error) {
      console.error("Error fetching user info:", error)
      setUserInfo({
        name: "User",
        email: "Not available",
        photo: null,
        accountType: "Free Account",
        userPath: null
      })
    } finally {
      setLoading(false)
    }
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

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || "U"
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Static Background */}
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
          <Avatar className="w-16 h-16">
            <AvatarImage src={userInfo.photo || "/placeholder-user.jpg"} alt="Profile" />
            <AvatarFallback>{getInitials(userInfo.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-xl font-bold">{userInfo.name}</h1>
            <p className="text-sm text-muted-foreground">{userInfo.email}</p>
            <Badge variant="secondary" className="text-xs">
              {userInfo.accountType}
            </Badge>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {getSettingsSections(userInfo.userPath).map((section) => (
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
                              {/* Verification Status Indicator */}
                              {item.id === "verification" && verificationStatus && (
                                <>
                                  {verificationStatus === 'approved' ? (
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                      <AlertCircle className="w-3.5 h-3.5 text-white" />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                                {item.id === "verification" && verificationStatus === 'approved' && (
                                  <span className="ml-2 text-green-500 text-xs font-medium">Verification completed</span>
                                )}
                                {item.id === "verification" && verificationStatus && verificationStatus !== 'approved' && (
                                  <span className="ml-2 text-red-500 text-xs font-medium">Pending verification</span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center">
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Simulate deletion success
                alert("Your account has been deleted.")
                onLogout?.()
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}