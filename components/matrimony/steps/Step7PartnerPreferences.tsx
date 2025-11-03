"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { partnerPreferencesSchema } from "@/lib/schemas/matrimony"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMatrimonySetupStore } from "@/components/matrimony/store"
import { saveDraft, saveStep7 } from "@/lib/matrimonyService"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

type FormValues = z.infer<typeof partnerPreferencesSchema>

export function Step7PartnerPreferences({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { preferences, setPartial } = useMatrimonySetupStore()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(partnerPreferencesSchema),
    defaultValues: {
      ageRange: preferences.ageRange || [21, 35],
      heightRangeCm: preferences.heightRangeCm || [150, 190],
      dietPrefs: preferences.dietPrefs || [],
      lifestylePrefs: preferences.lifestylePrefs || [],
      educationPrefs: preferences.educationPrefs || [],
      professionPrefs: preferences.professionPrefs || [],
      locations: preferences.locations || [],
      communities: preferences.communities || [],
      familyTypePrefs: preferences.familyTypePrefs || [],
    },
    mode: "onChange",
  })

  useEffect(() => {
    const sub = form.watch(async (values) => {
      setPartial("preferences", values)
      await saveDraft({ preferences: values as any })
    })
    return () => sub.unsubscribe()
  }, [form, setPartial])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error("Please sign in to continue")
        setIsLoading(false)
        return
      }

      setPartial("preferences", values)

      const result = await saveStep7(user.id, {
        ageRange: values.ageRange as [number, number],
        heightRangeCm: values.heightRangeCm as [number, number],
        dietPrefs: values.dietPrefs,
        lifestylePrefs: values.lifestylePrefs,
        educationPrefs: values.educationPrefs,
        professionPrefs: values.professionPrefs,
        locations: values.locations,
        communities: values.communities,
        familyTypePrefs: values.familyTypePrefs,
      })

      if (result.success) {
        toast.success("Profile completed successfully!")
        onNext()
      } else {
        throw new Error(result.error || "Failed to save")
      }
    } catch (error: any) {
      console.error("Error saving step 7:", error)
      toast.error(error.message || "Failed to save. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Your Partner Preferences</h2>
            <p className="text-muted-foreground">What are you looking for in a life partner?</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="ageRange.0" render={({ field }) => (
              <FormItem>
                <FormLabel>Min Age</FormLabel>
                <FormControl><Input type="number" min={18} max={80} {...field} onChange={(e)=>field.onChange(Number(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ageRange.1" render={({ field }) => (
              <FormItem>
                <FormLabel>Max Age</FormLabel>
                <FormControl><Input type="number" min={18} max={80} {...field} onChange={(e)=>field.onChange(Number(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="heightRangeCm.0" render={({ field }) => (
              <FormItem>
                <FormLabel>Min Height (cm)</FormLabel>
                <FormControl><Input type="number" min={90} max={250} {...field} onChange={(e)=>field.onChange(Number(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="heightRangeCm.1" render={({ field }) => (
              <FormItem>
                <FormLabel>Max Height (cm)</FormLabel>
                <FormControl><Input type="number" min={90} max={250} {...field} onChange={(e)=>field.onChange(Number(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="locations" render={({ field }) => (
            <FormItem>
              <FormLabel>Location Preferences (comma separated)</FormLabel>
              <FormControl><Input placeholder="Mumbai, Bangalore, USA" value={field.value?.join(", ") || ""} onChange={(e)=>field.onChange(e.target.value.split(/\s*,\s*/).filter(Boolean))} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="educationPrefs" render={({ field }) => (
              <FormItem>
                <FormLabel>Education Preferences (comma separated)</FormLabel>
                <FormControl><Input placeholder="Any professional degree, MBA, etc." value={field.value?.join(", ") || ""} onChange={(e)=>field.onChange(e.target.value.split(/\s*,\s*/).filter(Boolean))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="professionPrefs" render={({ field }) => (
              <FormItem>
                <FormLabel>Profession Preferences (comma separated)</FormLabel>
                <FormControl><Input placeholder="IT background, Same profession, etc." value={field.value?.join(", ") || ""} onChange={(e)=>field.onChange(e.target.value.split(/\s*,\s*/).filter(Boolean))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="communities" render={({ field }) => (
              <FormItem>
                <FormLabel>Community/Caste Preferences (comma separated or Any)</FormLabel>
                <FormControl><Input placeholder="Any or specific castes" value={field.value?.join(", ") || ""} onChange={(e)=>field.onChange(e.target.value.split(/\s*,\s*/).filter(Boolean))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="familyTypePrefs" render={({ field }) => (
              <FormItem>
                <FormLabel>Family Type Preferences (comma separated)</FormLabel>
                <FormControl><Input placeholder="Nuclear, Joint" value={field.value?.join(", ") || ""} onChange={(e)=>field.onChange(e.target.value.split(/\s*,\s*/).filter(Boolean))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="dietPrefs" render={({ field }) => (
              <FormItem>
                <FormLabel>Dietary Preferences (comma separated)</FormLabel>
                <FormControl><Input placeholder="Open to both, Strictly vegetarian" value={field.value?.join(", ") || ""} onChange={(e)=>field.onChange(e.target.value.split(/\s*,\s*/).filter(Boolean))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lifestylePrefs" render={({ field }) => (
              <FormItem>
                <FormLabel>Lifestyle Preferences (comma separated)</FormLabel>
                <FormControl><Input placeholder="Non-smoker, Non-drinker" value={field.value?.join(", ") || ""} onChange={(e)=>field.onChange(e.target.value.split(/\s*,\s*/).filter(Boolean))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="flex justify-between pt-2">
            <Button type="button" variant="ghost" onClick={onBack} disabled={isLoading}>Back</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Complete"}</Button>
          </div>
        </div>
      </form>
    </Form>
  )
}


