"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Crown, Heart, Eye, MessageCircle, Zap, Star, Check } from "lucide-react"

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
    icon: Heart,
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

export function PremiumScreen() {
  const [selectedPlan, setSelectedPlan] = useState<string>("quarterly")

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6">
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

      <div className="flex-1 overflow-y-auto">
        {/* Features Section */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Premium Features</h2>
            <div className="grid gap-4">
              {premiumFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Plans Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Choose Your Plan</h2>
            <div className="space-y-4">
              {premiumPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    selectedPlan === plan.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                  } ${plan.isPopular ? "relative" : ""}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.isPopular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{plan.duration}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{plan.price}</div>
                        {plan.originalPrice && (
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground line-through">{plan.originalPrice}</div>
                            <Badge variant="secondary" className="text-xs">
                              {plan.discount}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="p-6 border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="space-y-4">
            <Button size="lg" className="w-full">
              <Crown className="w-5 h-5 mr-2" />
              Subscribe to {premiumPlans.find((p) => p.id === selectedPlan)?.name}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">Cancel anytime. Terms and conditions apply.</p>
              <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                <button className="underline">Terms of Service</button>
                <button className="underline">Privacy Policy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
