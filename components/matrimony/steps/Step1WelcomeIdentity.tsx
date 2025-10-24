"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { welcomeIdentitySchema } from "@/lib/schemas/matrimony"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Upload, X } from "lucide-react"
import { useMatrimonySetupStore } from "@/components/matrimony/store"
import { uploadAsset, saveDraft } from "@/lib/matrimonyService"
import { useRouter } from "next/navigation"

type FormValues = z.infer<typeof welcomeIdentitySchema>

export function Step1WelcomeIdentity({ onNext }: { onNext: () => void }) {
  const { welcome, setPartial } = useMatrimonySetupStore()
  const [photos, setPhotos] = React.useState<string[]>(welcome.photoUrls || (welcome.photoUrl ? [welcome.photoUrl] : []))
  const router = useRouter()

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
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Welcome</h2>
            <p className="text-muted-foreground">Tell us who you are to get started.</p>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
              {photos[0] ? (
                <AvatarImage src={photos[0]} />
              ) : (
                <AvatarFallback>{form.watch("name")?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              )}
            </Avatar>
            <Button
              type="button"
              variant="outline"
              className="text-xs sm:text-sm"
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
              <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Upload profile photo
            </Button>
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {photos.map((p, idx) => (
                <div key={idx} className="relative">
                  <img src={p} alt={"photo-"+idx} className="w-full h-20 sm:h-24 object-cover rounded-md" />
                  <Button size="sm" variant="destructive" className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 p-0 rounded-full" onClick={() => {
                    const next = photos.filter((_,i)=>i!==idx)
                    setPhotos(next)
                    setPartial("welcome", { photoUrls: next })
                  }}>
                    <X className="w-2 h-2 sm:w-3 sm:h-3" />
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
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(["Male", "Female", "Other"] as const).map((opt) => (
                      <div key={opt} className="flex items-center space-x-2 border rounded-md p-2">
                        <RadioGroupItem value={opt} id={`gender-${opt}`} />
                        <label htmlFor={`gender-${opt}`} className="text-xs sm:text-sm">
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
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(["Self", "Parent", "Sibling", "Other"] as const).map((opt) => (
                      <div key={opt} className="flex items-center space-x-2 border rounded-md p-2">
                        <RadioGroupItem value={opt} id={`created-${opt}`} />
                        <label htmlFor={`created-${opt}`} className="text-xs sm:text-sm">
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

          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={() => {
              // Navigate back to path selection by going to home and triggering path-select step
              try {
                localStorage.removeItem("onboardingCompleteMode")
                localStorage.removeItem("onboardingShowComplete")
                // Set a flag to show path selection immediately
                localStorage.setItem("showPathSelect", "true")
              } catch {}
              router.push("/")
            }}>Back</Button>
            <Button type="submit">Next</Button>
          </div>
        </div>
      </form>
    </Form>
  )
}


