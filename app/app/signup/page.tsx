"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Check, Camera, RefreshCw } from "lucide-react"

type Step = "phone" | "otp" | "selfie"

const STEPS: { key: Step; label: string }[] = [
  { key: "phone",  label: "Phone"    },
  { key: "otp",   label: "Verify"   },
  { key: "selfie", label: "Identity" },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (step === "selfie") {
      setCameraError(false)
      startCamera()
    }
    return () => {
      if (step !== "selfie") stopCamera()
    }
  }, [step])

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to send OTP")
      }
      const data = await res.json()
      toast.success(data.devMode ? "Dev mode: use code 000000" : "OTP sent!")
      setStep("otp")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) return
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Invalid OTP")
      }
      const data = await res.json()
      const id = data.userId ?? data.user_id ?? data.id ?? null
      if (id) {
        setUserId(id)
      }
      toast.success("Phone verified!")
      setStep("selfie")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      setStreaming(true)
      setCameraError(false)
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setCameraError(true)
      toast.error("Camera access denied — allow camera in your browser settings")
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setStreaming(false)
  }

  async function handleCaptureSelfie() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) { toast.error("Failed to capture photo"); return }
      setLoading(true)
      try {
        const form = new FormData()
        form.append("selfie", blob, "selfie.jpg")
        if (userId) form.append("user_id", userId)
        const res = await fetch("/api/auth/liveness", { method: "POST", body: form })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error ?? "Liveness check failed")
        }
        const data = await res.json()
        if (!data.isLive) throw new Error(data.reason ?? "Liveness check failed — please try again")
        if (userId) localStorage.setItem("user_id", userId)
        toast.success("Identity verified! Welcome to PeerRent.")
        stopCamera()
        router.push("/")
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Liveness check failed")
      } finally {
        setLoading(false)
      }
    }, "image/jpeg")
  }

  const stepIdx = STEPS.findIndex((s) => s.key === step)

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === "phone" ? "Get started" : step === "otp" ? "Verify your number" : "One last step"}
          </h1>
          <p className="text-white/40 text-sm">
            {step === "phone"
              ? "New here? We'll create your account automatically."
              : step === "otp"
              ? `We sent a 6-digit code to ${phone}`
              : "Take a quick selfie to confirm you're real."}
          </p>
        </div>

        {/* Step tracker */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={`flex flex-col items-center gap-1.5 transition-opacity duration-300 ${i <= stepIdx ? "opacity-100" : "opacity-30"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < stepIdx
                    ? "bg-gradient-to-br from-emerald-400 to-cyan-400 text-[#030712]"
                    : i === stepIdx
                    ? "bg-gradient-to-br from-emerald-400 to-cyan-400 text-[#030712] ring-4 ring-emerald-400/20"
                    : "glass text-white/40"
                }`}>
                  {i < stepIdx ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  ) : i + 1}
                </div>
                <span className="text-xs text-white/35 hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-16 h-px mx-2 mb-5 transition-colors duration-500 ${
                  i < stepIdx
                    ? "bg-gradient-to-r from-emerald-400 to-cyan-400"
                    : "bg-white/[0.08]"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card rounded-2xl p-6">

          {/* Phone step */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400/80 mb-5">
                Demo mode — any phone number works. OTP code is{" "}
                <span className="font-mono font-bold text-amber-400">000000</span>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider font-medium">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="field w-full rounded-xl px-4 py-3 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="w-full py-3 rounded-xl btn-gradient text-sm"
              >
                {loading ? "Sending…" : "Continue"}
              </button>
            </form>
          )}

          {/* OTP step */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5 uppercase tracking-wider font-medium">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  className="field w-full rounded-xl px-4 py-4 text-3xl tracking-[0.6em] text-center font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 rounded-xl btn-gradient text-sm"
              >
                {loading ? "Verifying…" : "Verify Code"}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-white/30 hover:text-white/60 text-xs transition-colors"
              >
                Change phone number
              </button>
            </form>
          )}

          {/* Selfie step */}
          {step === "selfie" && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={(e) => {
                    ;(e.target as HTMLVideoElement).play()
                  }}
                />
                {/* Face guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-28 h-36 rounded-full border-2 border-white/25 border-dashed" />
                </div>
                {!streaming && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
                    {cameraError ? (
                      <>
                        <p className="text-red-400 text-xs">Camera access denied</p>
                        <button
                          onClick={startCamera}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg glass text-white text-xs hover:bg-white/[0.08] transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Retry
                        </button>
                      </>
                    ) : (
                      <p className="text-white/35 text-xs">Starting camera…</p>
                    )}
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <button
                onClick={handleCaptureSelfie}
                disabled={loading || !streaming}
                className="w-full py-3 rounded-xl btn-gradient text-sm flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" strokeWidth={2} />
                {loading ? "Verifying…" : "Capture Selfie"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
