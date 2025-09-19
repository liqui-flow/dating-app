"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Photo {
  id: string
  url: string
  isMain?: boolean
}

export function PhotoGrid() {
  const [photos, setPhotos] = useState<Photo[]>([
    { id: "1", url: "/professional-headshot.png", isMain: true },
    { id: "2", url: "/casual-outdoor-photo.jpg" },
  ])

  const maxPhotos = 6

  const handleAddPhoto = () => {
    if (photos.length < maxPhotos) {
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url: "/new-profile-photo.jpg",
      }
      setPhotos((prev) => [...prev, newPhoto])
    }
  }

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id))
  }

  const handleSetMainPhoto = (id: string) => {
    setPhotos((prev) =>
      prev.map((photo) => ({
        ...photo,
        isMain: photo.id === id,
      })),
    )
  }

  const handleReorderPhoto = (dragIndex: number, hoverIndex: number) => {
    const dragPhoto = photos[dragIndex]
    const newPhotos = [...photos]
    newPhotos.splice(dragIndex, 1)
    newPhotos.splice(hoverIndex, 0, dragPhoto)
    setPhotos(newPhotos)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div key={photo.id} className="relative group">
            <Card
              className={cn(
                "aspect-square overflow-hidden border-2 transition-colors",
                photo.isMain ? "border-primary" : "border-border",
              )}
            >
              <img
                src={photo.url || "/placeholder.svg"}
                alt={`Profile photo ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Main photo badge */}
              {photo.isMain && (
                <div className="absolute top-2 left-2">
                  <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                    Main
                  </div>
                </div>
              )}

              {/* Photo controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                {!photo.isMain && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetMainPhoto(photo.id)}
                    className="text-xs"
                  >
                    Set Main
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => handleRemovePhoto(photo.id)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          </div>
        ))}

        {/* Add photo button */}
        {photos.length < maxPhotos && (
          <Card
            className="aspect-square border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={handleAddPhoto}
          >
            <div className="w-full h-full flex flex-col items-center justify-center space-y-2 text-muted-foreground hover:text-primary transition-colors">
              <Plus className="w-8 h-8" />
              <span className="text-xs font-medium">Add Photo</span>
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Photos ({photos.length}/{maxPhotos})
          </span>
          <Button variant="outline" size="sm" className="text-xs bg-transparent">
            <Camera className="w-3 h-3 mr-1" />
            Take Photo
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Drag photos to reorder them</p>
          <p>• Your main photo will be shown first</p>
          <p>• Use high-quality, recent photos for best results</p>
        </div>
      </div>
    </div>
  )
}
