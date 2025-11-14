"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { familySchema } from "@/lib/schemas/matrimony"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMatrimonySetupStore } from "@/components/matrimony/store"
import { saveDraft, saveStep4 } from "@/lib/matrimonyService"
import { Check } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

type FormValues = z.infer<typeof familySchema>

export function Step4Family({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { family, setPartial } = useMatrimonySetupStore()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      familyType: family.familyType,
      familyValues: family.familyValues,
      fatherOccupation: family.fatherOccupation,
      fatherCompany: family.fatherCompany,
      motherOccupation: family.motherOccupation,
      motherCompany: family.motherCompany,
      brothers: family.brothers,
      sisters: family.sisters,
      siblingsMarried: family.siblingsMarried,
      showOnProfile: family.showOnProfile ?? false,
    },
    mode: "onChange",
  })

  useEffect(() => {
    const sub = form.watch(async (values) => {
      setPartial("family", values)
      await saveDraft({ profile: { family: values } as any })
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

      setPartial("family", values)

      const result = await saveStep4(user.id, values)

      if (result.success) {
        toast.success("Step 4 saved successfully!")
        onNext()
      } else {
        throw new Error(result.error || "Failed to save")
      }
    } catch (error: any) {
      console.error("Error saving step 4:", error)
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
            <h2 className="text-2xl font-semibold">Family Information</h2>
            <p className="text-muted-foreground">Tell us about your family.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="familyType" render={({ field }) => (
              <FormItem>
                <FormLabel>Family Type</FormLabel>
                <FormControl><Input placeholder="Joint, Nuclear" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="familyValues" render={({ field }) => (
              <FormItem>
                <FormLabel>Family Values</FormLabel>
                <FormControl><Input placeholder="Traditional, Moderate, Modern" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="fatherOccupation" render={({ field }) => (
              <FormItem>
                <FormLabel>Father's Occupation</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="fatherCompany" render={({ field }) => (
              <FormItem>
                <FormLabel>Father's Company</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="motherOccupation" render={({ field }) => (
              <FormItem>
                <FormLabel>Mother's Occupation</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="motherCompany" render={({ field }) => (
              <FormItem>
                <FormLabel>Mother's Company</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="brothers" render={({ field }) => (
              <FormItem>
                <FormLabel>Brothers</FormLabel>
                <FormControl><Input type="number" min={0} {...field} onChange={(e)=>field.onChange(Number(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sisters" render={({ field }) => (
              <FormItem>
                <FormLabel>Sisters</FormLabel>
                <FormControl><Input type="number" min={0} {...field} onChange={(e)=>field.onChange(Number(e.target.value))} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="siblingsMarried" render={({ field }) => (
              <FormItem>
                <FormLabel>Marital Status of Siblings</FormLabel>
                <FormControl><Input placeholder="None, Some, All" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="showOnProfile" render={({ field }) => (
            <FormItem>
              <FormLabel>Show family information on profile</FormLabel>
              <FormControl>
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className={`w-12 h-10 rounded-lg flex items-center justify-center transition-all ${
                    field.value
                      ? "bg-black text-white border border-black"
                      : "bg-white text-gray-700 border border-gray-300"
                  }`}
                >
                  {field.value && <Check className="w-5 h-5" />}
                </button>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex justify-between pt-2">
            <Button type="button" variant="ghost" onClick={onBack} disabled={isLoading}>Back</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Next"}</Button>
          </div>
        </div>
      </form>
    </Form>
  )
}


