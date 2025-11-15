/**
 * Utility functions for extracting dominant colors from images
 * and generating gradients for dynamic backgrounds
 */

export interface RGB {
  r: number
  g: number
  b: number
}

export interface ColorPalette {
  colors: RGB[]
  primary: RGB
  secondary: RGB
  tertiary?: RGB
}

/**
 * Extract dominant colors from an image
 * Returns 2-3 colors that represent the image's palette
 */
export async function extractDominantColors(
  imageUrl: string,
  colorCount: number = 3
): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }
        
        // Set canvas size (smaller for performance, but large enough for accuracy)
        canvas.width = 200
        canvas.height = 200
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data
        
        // Sample pixels (every 4th pixel for performance)
        const colorMap = new Map<string, number>()
        const colors: RGB[] = []
        
        for (let i = 0; i < pixels.length; i += 16) {
          const r = pixels[i]
          const g = pixels[i + 1]
          const b = pixels[i + 2]
          const a = pixels[i + 3]
          
          // Skip transparent pixels
          if (a < 128) continue
          
          // Quantize colors to reduce noise (group similar colors)
          const quantizedR = Math.round(r / 10) * 10
          const quantizedG = Math.round(g / 10) * 10
          const quantizedB = Math.round(b / 10) * 10
          
          const key = `${quantizedR},${quantizedG},${quantizedB}`
          colorMap.set(key, (colorMap.get(key) || 0) + 1)
        }
        
        // Convert to array and sort by frequency
        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, colorCount * 2) // Get more candidates
        
        // Filter out very dark and very light colors (they don't work well as backgrounds)
        const filteredColors = sortedColors
          .map(([key]) => {
            const [r, g, b] = key.split(",").map(Number)
            return { r, g, b }
          })
          .filter((color) => {
            const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000
            // Keep colors with medium brightness (50-200)
            return brightness > 50 && brightness < 200
          })
          .slice(0, colorCount)
        
        // If we don't have enough colors, add some from the original set
        if (filteredColors.length < 2) {
          const fallbackColors = sortedColors
            .map(([key]) => {
              const [r, g, b] = key.split(",").map(Number)
              return { r, g, b }
            })
            .slice(0, colorCount)
          
          filteredColors.push(...fallbackColors.slice(filteredColors.length))
        }
        
        // Ensure we have at least 2 colors
        while (filteredColors.length < 2) {
          filteredColors.push({ r: 100, g: 100, b: 120 }) // Default fallback
        }
        
        // Adjust colors to be more vibrant and suitable for backgrounds
        const adjustedColors = filteredColors.map((color) => {
          // Increase saturation slightly and adjust lightness for better visibility
          const hsl = rgbToHsl(color.r, color.g, color.b)
          const adjustedHsl = { 
            h: hsl.h, 
            s: Math.min(100, hsl.s * 1.3), // Increase saturation more
            l: Math.max(20, Math.min(60, hsl.l * 0.9)) // Slightly darker for better contrast
          }
          return hslToRgb(adjustedHsl.h, adjustedHsl.s, adjustedHsl.l)
        })
        
        const palette: ColorPalette = {
          colors: adjustedColors,
          primary: adjustedColors[0],
          secondary: adjustedColors[1],
          tertiary: adjustedColors[2],
        }
        
        resolve(palette)
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }
    
    img.src = imageUrl
  })
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }
  
  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  }
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360
  s /= 100
  l /= 100
  
  let r: number, g: number, b: number
  
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

/**
 * Generate a radial gradient CSS string from color palette
 */
export function generateRadialGradient(palette: ColorPalette): string {
  const { primary, secondary, tertiary } = palette
  
  // Create a soft, blurred radial gradient
  // Using multiple stops for smoother transitions
  if (tertiary) {
    return `radial-gradient(ellipse at center, 
      rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.4) 0%,
      rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.35) 40%,
      rgba(${tertiary.r}, ${tertiary.g}, ${tertiary.b}, 0.3) 70%,
      rgba(0, 0, 0, 0.2) 100%)`
  }
  
  return `radial-gradient(ellipse at center, 
    rgba(${primary.r}, ${primary.g}, ${primary.b}, 0.4) 0%,
    rgba(${secondary.r}, ${secondary.g}, ${secondary.b}, 0.35) 50%,
    rgba(0, 0, 0, 0.25) 100%)`
}

/**
 * Convert RGB to CSS color string
 */
export function rgbToCss(rgb: RGB, alpha: number = 1): string {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

