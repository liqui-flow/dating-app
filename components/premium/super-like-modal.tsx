"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Star, Crown, X } from "lucide-react"

interface SuperLikeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuperLike: () => void
  onUpgrade: () => void
  remainingSuperLikes: number
  isPremium: boolean
}

export function SuperLikeModal({
  open,
  onOpenChange,
  onSuperLike,
  onUpgrade,
  remainingSuperLikes,
  isPremium,
}: SuperLikeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 gap-0">
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-[#97011A] to-[#7A0115] text-white p-6 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Star className="w-16 h-16 fill-current" />
                    <div className="absolute inset-0 animate-pulse">
                      <Star className="w-16 h-16 fill-current opacity-50" />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-1">Super Like</h2>
                  <p className="text-white/90 text-sm">Stand out and get 3x more matches</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="text-center space-y-3">
                <div className="space-y-2">
                  <h3 className="font-semibold">How Super Likes Work</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    When you Super Like someone, they'll see that you're really interested before they decide whether to
                    swipe right on you.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <Star className="w-4 h-4 text-primary fill-current" />
                    <span className="font-medium">
                      {isPremium ? "Unlimited" : `${remainingSuperLikes} remaining today`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {remainingSuperLikes > 0 || isPremium ? (
                  <Button size="lg" className="w-full" onClick={onSuperLike}>
                    <Star className="w-5 h-5 mr-2 fill-current" />
                    Send Super Like
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-3">You've used all your Super Likes for today</p>
                    </div>
                    <Button size="lg" className="w-full" onClick={onUpgrade}>
                      <Crown className="w-5 h-5 mr-2" />
                      Get Unlimited Super Likes
                    </Button>
                  </div>
                )}

                {!isPremium && (
                  <Button variant="outline" size="lg" className="w-full bg-transparent" onClick={onUpgrade}>
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Premium
                  </Button>
                )}
              </div>

              {/* Benefits */}
              {!isPremium && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Premium Benefits:</h4>
                  <div className="space-y-2">
                    {["Unlimited Super Likes", "See who likes you", "5 Boosts per month", "Advanced filters"].map(
                      (benefit) => (
                        <div key={benefit} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
