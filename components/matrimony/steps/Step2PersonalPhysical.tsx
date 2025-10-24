"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { personalPhysicalSchema } from "@/lib/schemas/matrimony"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMatrimonySetupStore } from "@/components/matrimony/store"
import { Check } from "lucide-react"

type FormValues = z.infer<typeof personalPhysicalSchema>

function toCm(value: { cm?: number; ft?: number; inch?: number }) {
  if (value.cm) return value.cm
  const totalInches = (value.ft || 0) * 12 + (value.inch || 0)
  return Math.round(totalInches * 2.54)
}

export function Step2PersonalPhysical({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { personal, setPartial } = useMatrimonySetupStore()
  const [unit, setUnit] = useState<"cm" | "ftin">(personal.heightUnit || "cm")

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

  const onSubmit = (values: FormValues) => {
    setPartial("personal", { ...values, heightUnit: unit })
    onNext()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">About You</h2>
            <p className="text-muted-foreground">Tell us more about your personal details.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FormLabel>Height unit</FormLabel>
              <div className="flex gap-2">
                <Button type="button" variant={unit === "cm" ? "default" : "outline"} onClick={() => setUnit("cm")}>cm</Button>
                <Button type="button" variant={unit === "ftin" ? "default" : "outline"} onClick={() => setUnit("ftin")}>ft/in</Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="heightCm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height</FormLabel>
                  <FormControl>
                    {unit === "cm" ? (
                      <Input type="number" min={90} max={250} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    ) : (
                      <div className="flex gap-2">
                        <Input type="number" placeholder="ft" onChange={(e) => {
                          const cm = toCm({ ft: Number(e.target.value), inch: 0 })
                          field.onChange(cm)
                        }} />
                        <Input type="number" placeholder="in" onChange={(e) => {
                          const cm = toCm({ inch: Number(e.target.value) })
                          field.onChange((field.value || 0) + cm)
                        }} />
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
                  <FormLabel>Complexion / Skin tone</FormLabel>
                  <FormControl>
                    <Input placeholder="Fair, Wheatish, Dark" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bodyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Slim, Athletic, Average, Heavy" {...field} />
                  </FormControl>
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
                  <FormLabel>Dietary Habits</FormLabel>
                  <FormControl>
                    <Input placeholder="Vegetarian, Non-vegetarian, Eggetarian, Vegan, Jain" {...field} />
                  </FormControl>
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
                    <FormLabel>Smoker</FormLabel>
                    <FormControl>
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`w-12 h-10 rounded-lg flex items-center justify-center transition-all ${
                          field.value
                            ? "bg-[#4A0E0E] text-white"
                            : "bg-white text-gray-700 border border-gray-300"
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
                    <FormLabel>Drinker</FormLabel>
                    <FormControl>
                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={`w-12 h-10 rounded-lg flex items-center justify-center transition-all ${
                          field.value
                            ? "bg-[#4A0E0E] text-white"
                            : "bg-white text-gray-700 border border-gray-300"
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
                <FormLabel>Marital Status</FormLabel>
                <FormControl>
                  <Input placeholder="Never Married, Divorced, Widowed, Annulled" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-2">
            <Button type="button" variant="ghost" onClick={onBack}>Back</Button>
            <Button type="submit">Next</Button>
          </div>
        </div>
      </form>
    </Form>
  )
}


