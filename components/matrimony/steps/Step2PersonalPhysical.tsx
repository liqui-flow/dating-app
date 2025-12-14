"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { personalPhysicalSchema } from "@/lib/schemas/matrimony"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMatrimonySetupStore } from "@/components/matrimony/store"
import { Check } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { saveStep2 } from "@/lib/matrimonyService"
import { toast } from "sonner"

type FormValues = z.infer<typeof personalPhysicalSchema>

function toCm(value: { cm?: number; ft?: number; inch?: number }) {
  if (value.cm) return value.cm
  const totalInches = (value.ft || 0) * 12 + (value.inch || 0)
  return Math.round(totalInches * 2.54)
}

export function Step2PersonalPhysical({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { personal, setPartial } = useMatrimonySetupStore()
  const [unit, setUnit] = useState<"cm" | "ftin">(personal.heightUnit || "cm")
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(personalPhysicalSchema),
    defaultValues: {
      heightCm: personal.heightCm ?? 170,
      complexion: (personal.complexion as any) ?? undefined,
      bodyType: (personal.bodyType as any) ?? undefined,
      diet: (personal.diet as any) ?? undefined,
      smoker: personal.smoker ?? false,
      drinker: personal.drinker ?? false,
      maritalStatus: (personal.maritalStatus as any) ?? "Never Married",
    },
    mode: "onChange",
  })

  useEffect(() => {
    const sub = form.watch((values) => {
      setPartial("personal", { ...values, heightUnit: unit })
    })
    return () => sub.unsubscribe()
  }, [form, setPartial, unit])

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error("Please sign in to continue")
        setIsLoading(false)
        return
      }

      // Save to store
      setPartial("personal", { ...values, heightUnit: unit })

      // Save to database
      const result = await saveStep2(user.id, {
        heightCm: values.heightCm,
        heightUnit: unit,
        complexion: values.complexion,
        bodyType: values.bodyType,
        diet: values.diet,
        smoker: values.smoker,
        drinker: values.drinker,
        maritalStatus: values.maritalStatus,
      })

      if (result.success) {
        toast.success("Step 2 saved successfully!")
        onNext()
      } else {
        throw new Error(result.error || "Failed to save")
      }
    } catch (error: any) {
      console.error("Error saving step 2:", error)
      toast.error(error.message || "Failed to save. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#111]">About You</h1>
            <p className="text-base text-black/60">Tell us more about your personal details.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FormLabel className="text-black">Height unit</FormLabel>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant={unit === "cm" ? "default" : "outline"} 
                  onClick={() => setUnit("cm")}
                  className={unit === "cm" ? "bg-[#97011A] hover:bg-[#7A010E] text-white" : "border-black/20 text-black hover:border-[#97011A]"}
                >
                  cm
                </Button>
                <Button 
                  type="button" 
                  variant={unit === "ftin" ? "default" : "outline"} 
                  onClick={() => setUnit("ftin")}
                  className={unit === "ftin" ? "bg-[#97011A] hover:bg-[#7A010E] text-white" : "border-black/20 text-black hover:border-[#97011A]"}
                >
                  ft/in
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="heightCm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Height</FormLabel>
                  <FormControl>
                    {unit === "cm" ? (
                      <Input 
                        type="number" 
                        min={90} 
                        max={250} 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="h-12 text-base text-[#111] border-black/20 focus:border-[#97011A] focus:ring-2 focus:ring-[#97011A]/20 rounded-xl"
                      />
                    ) : (
                      <div className="flex gap-2">
                        <Input 
                          type="number" 
                          placeholder="ft" 
                          onChange={(e) => {
                            const cm = toCm({ ft: Number(e.target.value), inch: 0 })
                            field.onChange(cm)
                          }}
                          className="h-12 text-base text-[#111] border-black/20 focus:border-[#97011A] focus:ring-2 focus:ring-[#97011A]/20 rounded-xl"
                        />
                        <Input 
                          type="number" 
                          placeholder="in" 
                          onChange={(e) => {
                            const cm = toCm({ inch: Number(e.target.value) })
                            field.onChange((field.value || 0) + cm)
                          }}
                          className="h-12 text-base text-[#111] border-black/20 focus:border-[#97011A] focus:ring-2 focus:ring-[#97011A]/20 rounded-xl"
                        />
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="complexion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Complexion / Skin tone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base text-[#111] border-black/20 focus:border-[#97011A] focus:ring-2 focus:ring-[#97011A]/20 rounded-xl bg-white">
                        <SelectValue placeholder="Select complexion" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white text-black border border-black/20">
                      {["Fair", "Wheatish", "Dusky", "Dark"].map((option) => (
                        <SelectItem key={option} value={option} className="text-black">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bodyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Body Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base text-[#111] border-black/20 focus:border-[#97011A] focus:ring-2 focus:ring-[#97011A]/20 rounded-xl bg-white">
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white text-black border border-black/20">
                      {["Slim", "Athletic", "Average", "Plus-size"].map((option) => (
                        <SelectItem key={option} value={option} className="text-black">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="diet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Dietary Habits</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base text-[#111] border-black/20 focus:border-[#97011A] focus:ring-2 focus:ring-[#97011A]/20 rounded-xl bg-white">
                        <SelectValue placeholder="Select dietary preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white text-black border border-black/20">
                      {[
                        "Vegetarian",
                        "Eggetarian",
                        "Non-vegetarian",
                        "Pescatarian",
                        "Vegan",
                        "Jain",
                        "Other",
                      ].map((option) => (
                        <SelectItem key={option} value={option} className="text-black">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="smoker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Smoker</FormLabel>
                    <FormControl>
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`w-12 h-10 rounded-lg flex items-center justify-center transition-all ${
                          field.value
                            ? "bg-[#97011A] text-white border border-[#97011A]"
                            : "bg-white text-black border border-black/20"
                        }`}
                      >
                        {field.value && <Check className="w-5 h-5" />}
                      </button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="drinker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Drinker</FormLabel>
                    <FormControl>
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`w-12 h-10 rounded-lg flex items-center justify-center transition-all ${
                          field.value
                            ? "bg-[#97011A] text-white border border-[#97011A]"
                            : "bg-white text-black border border-black/20"
                        }`}
                      >
                        {field.value && <Check className="w-5 h-5" />}
                      </button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="maritalStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black">Marital Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base text-[#111] border-black/20 focus:border-[#97011A] focus:ring-2 focus:ring-[#97011A]/20 rounded-xl bg-white">
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white text-black border border-black/20">
                    {["Never Married", "Divorced", "Widowed", "Annulled", "Separated"].map(
                      (option) => (
                        <SelectItem key={option} value={option} className="text-black">
                          {option}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onBack} 
              disabled={isLoading}
              className="text-black hover:text-[#97011A]"
            >
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#97011A] hover:bg-[#7A010E] text-white rounded-full px-6"
            >
              {isLoading ? "Saving..." : "Next"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}


