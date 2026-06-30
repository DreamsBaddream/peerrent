"use client"

import { useState, useRef } from "react"

interface PhotoUploadProps {
  onChange: (files: File[]) => void
}

export default function PhotoUpload({ onChange }: PhotoUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const allFilesRef = useRef<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const urls = files.map((f) => URL.createObjectURL(f))
    allFilesRef.current = [...allFilesRef.current, ...files]
    setPreviews((prev) => [...prev, ...urls])
    onChange(allFilesRef.current)
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/15 text-white/40 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors text-sm"
      >
        <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 4v12M4 10h12" />
        </svg>
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
              className="w-20 h-20 object-cover rounded-xl border border-white/[0.07]"
            />
          ))}
        </div>
      )}
    </div>
  )
}
