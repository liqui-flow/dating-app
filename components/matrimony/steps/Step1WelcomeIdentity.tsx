"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { welcomeIdentitySchema } from "@/lib/schemas/matrimony"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Upload, X } from "lucide-react"
import { useMatrimonySetupStore } from "@/components/matrimony/store"
import { uploadAsset, saveDraft } from "@/lib/matrimonyService"

type FormValues = z.infer<typeof welcomeIdentitySchema>

export function Step1WelcomeIdentity({ onNext }: { onNext: () => void }) {
  const { welcome, setPartial } = useMatrimonySetupStore()
  const [photos, setPhotos] = React.useState<string[]>(welcome.photoUrls || (welcome.photoUrl ? [welcome.photoUrl] : []))

  const form = useForm<FormValues>({
    resolver: zodResolver(welcomeIdentitySchema),
    defaultValues: {
      name: welcome.name || "",
      age: welcome.age ?? undefined,
      gender: (welcome.gender as any) ?? undefined,
      createdBy: (welcome.createdBy as any) ?? "Self",
      photo: undefined,
    },
    mode: "onChange",
  })

  useEffect(() => {
    const sub = form.watch(async (values) => {
      setPartial("welcome", {
        name: values.name,
        age: values.age,
        gender: values.gender,
        createdBy: values.createdBy,
      })
      await saveDraft({ profile: { name: values.name, age: values.age as any } })
    })
    return () => sub.unsubscribe()
  }, [form, setPartial])

  const onSubmit = async (values: FormValues) => {
    setPartial("welcome", {
      name: values.name,
      age: values.age,
      gender: values.gender,
      createdBy: values.createdBy,
      photoUrls: photos,
    })
    onNext()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Tell us who you are to get started.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {photos[0] ? (
                  <AvatarImage src={photos[0]} />
                ) : (
                  <AvatarFallback>{form.watch("name")?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                )}
              </Avatar>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = "image/*"
                  input.multiple = true
                  input.onchange = async () => {
                    const files = Array.from(input.files || [])
                    if (!files.length) return
                    const urls: string[] = []
                    for (const f of files.slice(0, 6 - photos.length)) {
                      const url = await uploadAsset(f)
                      urls.push(url)
                    }
                    const next = [...photos, ...urls].slice(0, 6)
                    setPhotos(next)
                    setPartial("welcome", { photoUrls: next })
                    await saveDraft({ profile: { photoUrls: next } as any })
                  }
                  input.click()
                }}
              >
                <Upload className="w-4 h-4 mr-2" /> Upload profile photo
              </Button>
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((p, idx) => (
                  <div key={idx} className="relative">
                    <img src={p} alt={"photo-"+idx} className="w-full h-24 object-cover rounded-md" />
                    <Button size="sm" variant="destructive" className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full" onClick={() => {
                      const next = photos.filter((_,i)=>i!==idx)
                      setPhotos(next)
                      setPartial("welcome", { photoUrls: next })
                    }}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-muted-foreground">Add minimum 3, maximum 6 photos.</div>


            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input type="number" min={18} max={80} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-2">
                      {(["Male", "Female", "Other"] as const).map((opt) => (
                        <div key={opt} className="flex items-center space-x-2 border rounded-md p-2">
                          <RadioGroupItem value={opt} id={`gender-${opt}`} />
                          <label htmlFor={`gender-${opt}`} className="text-sm">
                            {opt}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="createdBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile created by</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-2">
                      {(["Self", "Parent", "Sibling", "Other"] as const).map((opt) => (
                        <div key={opt} className="flex items-center space-x-2 border rounded-md p-2">
                          <RadioGroupItem value={opt} id={`created-${opt}`} />
                          <label htmlFor={`created-${opt}`} className="text-sm">
                            {opt}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit">Next</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}


