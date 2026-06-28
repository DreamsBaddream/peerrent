"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

type Step = "phone" | "otp" | "selfie"

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

  // Step 1: Send OTP
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

  // Step 2: Verify OTP
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
        localStorage.setItem("user_id", id)
      }
      toast.success("Phone verified!")
      setStep("selfie")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  // Camera helpers
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      setStreaming(true)
      setCameraError(false)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setCameraError(true)
      toast.error("Camera access denied — click Retry or allow camera in your browser settings")
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
      if (!blob) {
        toast.error("Failed to capture photo")
        return
      }
      setLoading(true)
      try {
        const form = new FormData()
        form.append("selfie", blob, "selfie.jpg")
        if (userId) form.append("user_id", userId)

        const res = await fetch("/api/auth/liveness", {
          method: "POST",
          body: form,
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error ?? "Liveness check failed")
        }
        const data = await res.json()
        if (!data.isLive) {
          throw new Error(data.reason ?? "Liveness check failed — please try again")
        }
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

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Sign In</h1>
          <p className="mt-2 text-gray-400 text-sm">
            New here? We&apos;ll create your account automatically.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["phone", "otp", "selfie"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  step === s
                    ? "bg-emerald-500 text-white"
                    : s === "phone" ||
                        (s === "otp" && step !== "phone") ||
                        s === "selfie" && step === "selfie"
                      ? "bg-emerald-900 text-emerald-400"
                      : "bg-gray-800 text-gray-600"
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div className="w-8 h-px bg-gray-800" />
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          {/* Step 1: Phone */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg px-3 py-2 text-xs text-amber-400">
                Demo mode — any phone number works. OTP code is <span className="font-mono font-bold">000000</span>.
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Enter 6-digit code sent to {phone}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-600 text-sm tracking-widest text-center focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full text-gray-500 hover:text-gray-400 text-xs transition-colors"
              >
                Change phone number
              </button>
            </form>
          )}

          {/* Step 3: Selfie */}
          {step === "selfie" && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm text-center">
                Take a quick selfie for liveness verification
              </p>
              <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
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
                {!streaming && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm">
                    {cameraError ? (
                      <>
                        <p className="text-red-400">Camera access denied</p>
                        <button
                          onClick={startCamera}
                          className="px-4 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors"
                        >
                          Retry
                        </button>
                      </>
                    ) : (
                      <p className="text-gray-500">Loading camera...</p>
                    )}
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <button
                onClick={handleCaptureSelfie}
                disabled={loading || !streaming}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {loading ? "Checking..." : "Capture & Verify"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
