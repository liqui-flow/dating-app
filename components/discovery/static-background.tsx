"use client"

export function StaticBackground() {
  return (
    <div 
      className="fixed inset-0 -z-10"
      style={{
        backgroundImage: 'url("/image 52.png")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    />
  )
}

