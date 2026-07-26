"use client"

import { useState } from "react"

interface ItemGalleryProps {
  photos: string[]
  title: string
  refId: string
}

export default function ItemGallery({ photos, title, refId }: ItemGalleryProps) {
  const [active, setActive] = useState(0)

  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] bg-ink/[0.04] overflow-hidden card-log relative">
        {photos.length > 0 ? (
          <img
            src={photos[active]}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-xs uppercase tracking-wide text-ink/30">
            No photos
          </div>
        )}
        <span className="absolute top-2 left-2 bg-paper2 border border-ink font-mono text-[9px] font-semibold tracking-[0.12em] uppercase px-1.5 py-0.5">
          REF·{refId}
        </span>
        {photos.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-ink/85 text-paper2 font-mono text-[9px] font-semibold tracking-[0.12em] uppercase px-1.5 py-0.5">
            {active + 1} / {photos.length}
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              className={`w-20 h-20 shrink-0 border overflow-hidden transition-all ${
                i === active
                  ? "border-accent shadow-[2px_2px_0_#1c1a13]"
                  : "border-ink/40 hover:border-ink opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={photo}
                alt={`${title} ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
