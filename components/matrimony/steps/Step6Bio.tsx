"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { bioSchema } from "@/lib/schemas/matrimony"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMatrimonySetupStore } from "@/components/matrimony/store"
import { saveDraft } from "@/lib/matrimonyService"

type FormValues = z.infer<typeof bioSchema>

export function Step6Bio({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { bio, setPartial } = useMatrimonySetupStore()

  const form = useForm<FormValues>({
    resolver: zodResolver(bioSchema),
    defaultValues: { bio: bio.bio || "" },
    mode: "onChange",
  })

  useEffect(() => {
    const sub = form.watch(async (values) => {
      setPartial("bio", values)
      await saveDraft({ profile: { bio: values.bio } as any })
    })
    return () => sub.unsubscribe()
  }, [form, setPartial])

  const onSubmit = (values: FormValues) => {
    setPartial("bio", values)
    onNext()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">A Few Words About You</h2>
            <p className="text-muted-foreground">Write a short bio to introduce yourself.</p>
          </div>
          
          <FormField control={form.control} name="bio" render={({ field }) => (
            <FormItem>
              <FormLabel>Bio (500–1000 characters)</FormLabel>
              <FormControl>
                <Textarea rows={8} maxLength={1000} placeholder="Describe your personality, passions, and what you're looking for in a life partner." {...field} />
              </FormControl>
              <div className="text-xs text-muted-foreground">{(field.value?.length || 0)}/1000</div>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex justify-between pt-2">
            <Button type="button" variant="ghost" onClick={onBack}>Back</Button>
            <Button type="submit">Next</Button>
          </div>
        </div>
      </form>
    </Form>
  )
}


