"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PaymentScreen({ planId, onSuccess, onCancel }: { planId: string; onSuccess?: () => void; onCancel?: () => void }) {
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    onSuccess?.()
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment for {planId}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cardholder Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name on card" />
            </div>
            <div className="space-y-2">
              <Label>Card Number</Label>
              <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry</Label>
                <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label>CVC</Label>
                <Input value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 border-t border-border bg-background/95 backdrop-blur-sm space-y-3">
        <Button size="lg" className="w-full" onClick={handlePay} disabled={loading}>
          {loading ? "Processing..." : "Pay Now"}
        </Button>
        <Button variant="outline" className="w-full" onClick={() => onCancel?.()}>Cancel</Button>
      </div>
    </div>
  )
}