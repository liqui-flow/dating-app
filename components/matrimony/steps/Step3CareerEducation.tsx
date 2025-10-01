"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { careerEducationSchema } from "@/lib/schemas/matrimony"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMatrimonySetupStore } from "@/components/matrimony/store"
import { saveDraft } from "@/lib/matrimonyService"

type FormValues = z.infer<typeof careerEducationSchema>

export function Step3CareerEducation({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { career, setPartial } = useMatrimonySetupStore()

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
    setPartial("career", values)
    onNext()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Career & Education</CardTitle>
            <CardDescription>Share details about your professional and educational background.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
              <Button type="button" variant="ghost" onClick={onBack}>Back</Button>
              <Button type="submit">Next</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}


