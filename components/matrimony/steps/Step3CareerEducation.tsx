"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { careerEducationSchema } from "@/lib/schemas/matrimony"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMatrimonySetupStore } from "@/components/matrimony/store"
import { saveDraft, saveStep3 } from "@/lib/matrimonyService"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

type FormValues = z.infer<typeof careerEducationSchema>

export function Step3CareerEducation({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { career, setPartial } = useMatrimonySetupStore()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(careerEducationSchema),
    defaultValues: {
      highestEducation: career.highestEducation || "",
      college: career.college || "",
      jobTitle: career.jobTitle || "",
      company: career.company || "",
      annualIncome: career.annualIncome || "",
      workLocation: career.workLocation || { city: "", state: "", country: "" },
    },
    mode: "onChange",
  })

  useEffect(() => {
    const sub = form.watch(async (values) => {
      setPartial("career", values)
      await saveDraft({ profile: { career: values } as any })
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

      setPartial("career", values)

      const result = await saveStep3(user.id, values)

      if (result.success) {
        toast.success("Step 3 saved successfully!")
        onNext()
      } else {
        throw new Error(result.error || "Failed to save")
      }
    } catch (error: any) {
      console.error("Error saving step 3:", error)
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
            <h2 className="text-2xl font-semibold">Your Career & Education</h2>
            <p className="text-muted-foreground">Share details about your professional and educational background.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="highestEducation" render={({ field }) => (
              <FormItem>
                <FormLabel>Highest Education</FormLabel>
                <FormControl>
                  <Input placeholder="Bachelor's, Master's, PhD, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="college" render={({ field }) => (
              <FormItem>
                <FormLabel>College / University</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Stanford University" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="jobTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Profession / Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="company" render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Google" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="annualIncome" render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Income</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 10–15 LPA / Prefer not to say" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="workLocation.city" render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="workLocation.state" render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="workLocation.country" render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Country" {...field} />
                </FormControl>
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


