"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Users, Home } from "lucide-react"

export function MatrimonyPreferences() {
  const [preferences, setPreferences] = useState({
    religion: "",
    caste: "",
    community: "",
    motherTongue: "",
    familyType: "",
    familyValues: "",
    partnerPreferences: "",
    showCommunityInfo: true,
    showFamilyInfo: true,
  })

  return (
    <div className="space-y-6">
      {/* Cultural Background */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Cultural Background</span>
          </CardTitle>
          <CardDescription>Share your cultural and religious background (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-community">Show community information</Label>
            <Switch
              id="show-community"
              checked={preferences.showCommunityInfo}
              onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, showCommunityInfo: checked }))}
            />
          </div>

          {preferences.showCommunityInfo && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Religion</Label>
                  <Select onValueChange={(value) => setPreferences((prev) => ({ ...prev, religion: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hindu">Hindu</SelectItem>
                      <SelectItem value="muslim">Muslim</SelectItem>
                      <SelectItem value="christian">Christian</SelectItem>
                      <SelectItem value="sikh">Sikh</SelectItem>
                      <SelectItem value="buddhist">Buddhist</SelectItem>
                      <SelectItem value="jain">Jain</SelectItem>
                      <SelectItem value="jewish">Jewish</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="spiritual">Spiritual but not religious</SelectItem>
                      <SelectItem value="atheist">Atheist/Agnostic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mother Tongue</Label>
                  <Select onValueChange={(value) => setPreferences((prev) => ({ ...prev, motherTongue: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="tamil">Tamil</SelectItem>
                      <SelectItem value="telugu">Telugu</SelectItem>
                      <SelectItem value="bengali">Bengali</SelectItem>
                      <SelectItem value="marathi">Marathi</SelectItem>
                      <SelectItem value="gujarati">Gujarati</SelectItem>
                      <SelectItem value="kannada">Kannada</SelectItem>
                      <SelectItem value="malayalam">Malayalam</SelectItem>
                      <SelectItem value="punjabi">Punjabi</SelectItem>
                      <SelectItem value="urdu">Urdu</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Community/Caste (Optional)</Label>
                <Select onValueChange={(value) => setPreferences((prev) => ({ ...prev, caste: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select community" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    <SelectItem value="brahmin">Brahmin</SelectItem>
                    <SelectItem value="kshatriya">Kshatriya</SelectItem>
                    <SelectItem value="vaishya">Vaishya</SelectItem>
                    <SelectItem value="shudra">Shudra</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="w-5 h-5" />
            <span>Family Information</span>
          </CardTitle>
          <CardDescription>Tell us about your family background</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-family">Show family information</Label>
            <Switch
              id="show-family"
              checked={preferences.showFamilyInfo}
              onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, showFamilyInfo: checked }))}
            />
          </div>

          {preferences.showFamilyInfo && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label>Family Type</Label>
                <Select onValueChange={(value) => setPreferences((prev) => ({ ...prev, familyType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select family type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nuclear">Nuclear Family</SelectItem>
                    <SelectItem value="joint">Joint Family</SelectItem>
                    <SelectItem value="extended">Extended Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Family Values</Label>
                <Select onValueChange={(value) => setPreferences((prev) => ({ ...prev, familyValues: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select family values" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="traditional">Traditional</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="liberal">Liberal</SelectItem>
                    <SelectItem value="orthodox">Orthodox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Partner Preferences</span>
          </CardTitle>
          <CardDescription>What are you looking for in a life partner?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partner-preferences">Describe your ideal partner</Label>
            <Textarea
              id="partner-preferences"
              value={preferences.partnerPreferences}
              onChange={(e) => setPreferences((prev) => ({ ...prev, partnerPreferences: e.target.value }))}
              placeholder="I'm looking for someone who is kind, family-oriented, and shares similar values. Someone who is ambitious yet grounded, and believes in building a strong partnership based on mutual respect and understanding..."
              className="min-h-32 resize-none"
              maxLength={300}
            />
            <div className="text-xs text-muted-foreground text-right">{preferences.partnerPreferences.length}/300</div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Matrimony Focus</p>
                <p className="text-xs text-muted-foreground">
                  Your preferences help us find matches who are serious about marriage and share similar life goals.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
