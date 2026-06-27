"use client"

import { useState, useRef } from "react"

interface PhotoUploadProps {
  onChange: (files: File[]) => void
}

export default function PhotoUpload({ onChange }: PhotoUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...urls])
    onChange(files)
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 rounded-lg border border-dashed border-gray-600 text-gray-400 hover:border-emerald-500 hover:text-emerald-400 transition-colors text-sm"
      >
        Add Photos
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Preview ${i + 1}`}
              className="w-20 h-20 object-cover rounded-lg border border-gray-700"
            />
          ))}
        </div>
      )}
    </div>
  )
}
