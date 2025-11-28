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
import { saveStep6 } from "@/lib/matrimonyService"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"

type FormValues = z.infer<typeof bioSchema>

export function Step6Bio({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { bio, setPartial } = useMatrimonySetupStore()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(bioSchema),
    defaultValues: { bio: bio.bio || "" },
    mode: "onChange",
  })

  useEffect(() => {
    const sub = form.watch((values) => {
      setPartial("bio", values)
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

      setPartial("bio", values)

      const result = await saveStep6(user.id, values.bio)

      if (result.success) {
        onNext()
      } else {
        throw new Error(result.error || "Failed to save")
      }
    } catch (error: any) {
      console.error("Error saving step 6:", error)
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
            <h2 className="text-2xl font-semibold">A Few Words About You</h2>
            <p className="text-muted-foreground">Write a short bio to introduce yourself.</p>
          </div>
          
          <FormField control={form.control} name="bio" render={({ field }) => (
            <FormItem>
              <FormLabel>Bio (20–300 characters)</FormLabel>
              <FormControl>
                <Textarea rows={8} maxLength={300} placeholder="Describe your personality, passions, and what you're looking for in a life partner." {...field} />
              </FormControl>
              <div className="text-xs text-muted-foreground">{(field.value?.length || 0)}/300</div>
              <FormMessage />
            </FormItem>
          )} />

          <div className="flex justify-between pt-2">
            <Button type="button" variant="ghost" onClick={onBack} disabled={isLoading}>Back</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Complete"}</Button>
          </div>
        </div>
      </form>
    </Form>
  )
}


