"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { culturalAstroSchema } from "@/lib/schemas/matrimony"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMatrimonySetupStore } from "@/components/matrimony/store"
import { saveDraft, saveStep5 } from "@/lib/matrimonyService"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

type FormValues = z.infer<typeof culturalAstroSchema>

export function Step5CulturalAstro({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { cultural, setPartial } = useMatrimonySetupStore()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(culturalAstroSchema),
    defaultValues: {
      religion: cultural.religion || "",
      motherTongue: cultural.motherTongue || "",
      community: cultural.community || "",
      subCaste: cultural.subCaste || "",
      dob: cultural.dob || "",
      tob: cultural.tob || "00:00",
      pob: cultural.pob || "",
      star: cultural.star || "",
      gotra: cultural.gotra || "",
    },
    mode: "onChange",
  })

  useEffect(() => {
    const sub = form.watch(async (values) => {
      setPartial("cultural", values)
      await saveDraft({ profile: { cultural: values } as any })
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

      setPartial("cultural", values)

      const result = await saveStep5(user.id, {
        religion: values.religion,
        motherTongue: values.motherTongue,
        community: values.community,
        subCaste: values.subCaste,
        dob: values.dob,
        tob: values.tob,
        pob: values.pob,
        star: values.star,
        gotra: values.gotra,
      })

      if (result.success) {
        toast.success("Step 5 saved successfully!")
        onNext()
      } else {
        throw new Error(result.error || "Failed to save")
      }
    } catch (error: any) {
      console.error("Error saving step 5:", error)
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
            <h2 className="text-2xl font-semibold">Your Cultural Details</h2>
            <p className="text-muted-foreground">Tell us about your cultural and religious background.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="religion" render={({ field }) => (
              <FormItem>
                <FormLabel>Religion</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="motherTongue" render={({ field }) => (
              <FormItem>
                <FormLabel>Mother Tongue</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="community" render={({ field }) => (
              <FormItem>
                <FormLabel>Community / Caste</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="subCaste" render={({ field }) => (
              <FormItem>
                <FormLabel>Sub-caste (optional)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="dob" render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="tob" render={({ field }) => (
              <FormItem>
                <FormLabel>Time of Birth</FormLabel>
                <FormControl><Input type="time" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="pob" render={({ field }) => (
              <FormItem>
                <FormLabel>Place of Birth</FormLabel>
                <FormControl><Input placeholder="City, Country" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="star" render={({ field }) => (
              <FormItem>
                <FormLabel>Star / Raashi (optional)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="gotra" render={({ field }) => (
              <FormItem>
                <FormLabel>Gotra (optional)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="flex justify-between pt-2">
            <Button type="button" variant="ghost" onClick={onBack} disabled={isLoading}>Back</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Next"}</Button>
          </div>
        </div>
      </form>
    </Form>
  )
}


