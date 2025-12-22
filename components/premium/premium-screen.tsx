"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Crown, Eye, MessageCircle, Zap, Star, Check, ArrowLeft } from "lucide-react"
import { StaticBackground } from "@/components/discovery/static-background"

interface PremiumPlan {
  id: string
  name: string
  duration: string
  price: string
  originalPrice?: string
  discount?: string
  features: string[]
  isPopular?: boolean
}

const premiumPlans: PremiumPlan[] = [
  {
    id: "monthly",
    name: "Premium",
    duration: "1 Month",
    price: "₹999",
    features: [
      "Unlimited likes",
      "See who liked you",
      "5 Super Likes per day",
      "1 Boost per month",
      "Advanced filters",
      "Read receipts",
      "Priority support",
    ],
  },
  {
    id: "quarterly",
    name: "Premium Plus",
    duration: "3 Months",
    price: "₹2,499",
    originalPrice: "₹2,997",
    discount: "Save 17%",
    features: [
      "Everything in Premium",
      "10 Super Likes per day",
      "3 Boosts per month",
      "Incognito mode",
      "Passport feature",
      "Profile insights",
      "VIP customer support",
    ],
    isPopular: true,
  },
  {
    id: "yearly",
    name: "Premium Gold",
    duration: "12 Months",
    price: "₹7,999",
    originalPrice: "₹11,988",
    discount: "Save 33%",
    features: [
      "Everything in Premium Plus",
      "Unlimited Super Likes",
      "5 Boosts per month",
      "Top Picks feature",
      "Advanced matching algorithm",
      "Profile verification priority",
      "Exclusive events access",
    ],
  },
]

const premiumFeatures = [
  {
    icon: Star,
    title: "Unlimited Likes",
    description: "Like as many profiles as you want without daily limits",
  },
  {
    icon: Eye,
    title: "See Who Likes You",
    description: "View all the people who have already liked your profile",
  },
  {
    icon: Zap,
    title: "Super Likes",
    description: "Stand out with Super Likes to get 3x more matches",
  },
  {
    icon: Star,
    title: "Profile Boosts",
    description: "Be the top profile in your area for 30 minutes",
  },
  {
    icon: MessageCircle,
    title: "Advanced Filters",
    description: "Filter by education, lifestyle, interests and more",
  },
]

export function PremiumScreen({ onPlanSelect, onSubscribe, onBack }: { onPlanSelect?: (planId: string) => void; onSubscribe?: (planId: string) => void; onBack?: () => void }) {
  const [selectedPlan, setSelectedPlan] = useState<string>("quarterly")

  return (
    <div className="min-h-screen relative bg-[#0E0F12]">
      <StaticBackground />
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-xl border-b border-white/20 bg-[#14161B]/50 shadow-lg z-10">
        <div className="flex items-center justify-between p-4">
          {onBack && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 hover:bg-white/10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" style={{ color: '#FFFFFF' }} />
              <span style={{ color: '#FFFFFF' }}>Back</span>
            </Button>
          )}
          {!onBack && <div className="w-16"></div>}
          <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>Go Premium</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="overflow-y-auto">
        {/* Hero Section */}
        <div className="glass-apple bg-gradient-to-br from-[#97011A] via-[#7A0115] to-[#97011A] text-white p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Crown className="w-16 h-16 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Go Premium</h1>
              <p className="text-white/90">Unlock all features and find your perfect match faster</p>
            </div>
          </div>
        </div>
        {/* Features Section */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center" style={{ color: '#FFFFFF' }}>Premium Features</h2>
            <div className="grid gap-4">
              {premiumFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#97011A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5" style={{ color: '#97011A' }} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold" style={{ color: '#FFFFFF' }}>{feature.title}</h3>
                    <p className="text-sm" style={{ color: '#A1A1AA' }}>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-white/20" />

          {/* Plans Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center" style={{ color: '#FFFFFF' }}>Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {premiumPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all h-full flex flex-col bg-[#14161B]/50 border ${
                    selectedPlan === plan.id ? "ring-2 ring-[#97011A] border-[#97011A]" : "border-white/20 hover:border-[#97011A]/50"
                  } ${plan.isPopular ? "relative" : ""}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.isPopular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#97011A] text-white">
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg" style={{ color: '#FFFFFF' }}>{plan.name}</CardTitle>
                        <p className="text-sm" style={{ color: '#A1A1AA' }}>{plan.duration}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>{plan.price}</div>
                        {plan.originalPrice && (
                          <div className="space-y-1">
                            <div className="text-sm line-through" style={{ color: '#A1A1AA' }}>{plan.originalPrice}</div>
                            <Badge variant="secondary" className="text-xs bg-[#97011A]/10 text-[#97011A] border-[#97011A]/20">
                              {plan.discount}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0 flex-1 flex flex-col">
                    <div className="space-y-2 flex-1">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#97011A' }} />
                          <span className="text-sm" style={{ color: '#FFFFFF' }}>{feature}</span>
                        </div>
                      ))}
                      <div className="pt-2 mt-auto">
                        <Button
                          variant={selectedPlan === plan.id ? "default" : "outline"}
                          size="sm"
                          className={`w-full ${
                            selectedPlan === plan.id 
                              ? "bg-[#97011A] hover:bg-[#7A0115] text-white border-[#97011A]" 
                              : "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPlan(plan.id)
                            onPlanSelect?.(plan.id)
                          }}
                        >
                          {selectedPlan === plan.id ? "Selected" : "Select"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="p-6 border-t border-white/20 bg-[#14161B]/50 backdrop-blur-xl">
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full bg-[#97011A] hover:bg-[#7A0115] text-white border-[#97011A]" 
              onClick={() => onSubscribe?.(selectedPlan)}
            >
              <Crown className="w-5 h-5 mr-2" style={{ color: '#FFFFFF' }} />
              Subscribe to {premiumPlans.find((p) => p.id === selectedPlan)?.name}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-xs" style={{ color: '#A1A1AA' }}>Cancel anytime. Terms and conditions apply.</p>
              <div className="flex items-center justify-center space-x-4 text-xs" style={{ color: '#A1A1AA' }}>
                <button className="underline hover:text-white transition-colors">Terms of Service</button>
                <button className="underline hover:text-white transition-colors">Privacy Policy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}