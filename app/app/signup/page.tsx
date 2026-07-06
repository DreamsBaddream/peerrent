"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Check, Camera, RefreshCw } from "lucide-react"

type Step = "phone" | "otp" | "selfie"

const STEPS: { key: Step; label: string }[] = [
  { key: "phone", label: "Phone" },
  { key: "otp", label: "Verify" },
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
    if (step !== "selfie") return
    setCameraError(false)
    startCamera()
    return () => stopCamera()
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
      if (data.verified && id) {
        localStorage.setItem("user_id", id)
        sessionStorage.removeItem("wallet_disconnected")
        toast.success("Welcome back!")
        router.push("/")
        return
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
        sessionStorage.removeItem("wallet_disconnected")
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

        <div className="text-center mb-10">
          <p className="mono-label mb-3">Operator Registration</p>
          <h1 className="font-display text-3xl uppercase tracking-tight text-ink mb-2">
            {step === "phone" ? "Get started" : step === "otp" ? "Verify number" : "One last step"}
          </h1>
          <p className="text-ink/55 text-sm">
            {step === "phone"
              ? "New here? We'll create your account automatically."
              : step === "otp"
              ? `We sent a 6-digit code to ${phone}`
              : "Take a quick selfie to confirm you're real."}
          </p>
        </div>

        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={`flex flex-col items-center gap-1.5 transition-opacity duration-300 ${i <= stepIdx ? "opacity-100" : "opacity-35"}`}>
                <div className={`w-8 h-8 flex items-center justify-center font-mono text-xs font-bold border transition-all duration-300 ${
                  i < stepIdx
                    ? "bg-ink border-ink text-paper2"
                    : i === stepIdx
                    ? "bg-accent border-ink text-paper2 shadow-[3px_3px_0_#1c1a13]"
                    : "border-ink/40 text-ink/45"
                }`}>
                  {i < stepIdx ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  ) : i + 1}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/50 hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-16 h-px mx-2 mb-5 transition-colors duration-500 ${
                  i < stepIdx ? "bg-ink" : "bg-ink/20"
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="card-log p-6">

          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="px-3 py-2.5 border border-warn/50 bg-warn/5 font-mono text-[11px] text-warn mb-5">
                Demo mode — any phone number works. OTP code is{" "}
                <span className="font-bold">000000</span>
              </div>
              <div>
                <label className="mono-label block mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="field w-full px-4 py-3 text-sm font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="btn-accent w-full py-3"
              >
                {loading ? "Sending…" : "Continue"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="mono-label block mb-1.5">6-Digit Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  className="field w-full px-4 py-4 text-3xl tracking-[0.6em] text-center font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-accent w-full py-3"
              >
                {loading ? "Verifying…" : "Verify Code"}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="link-u w-full font-mono text-[11px] uppercase tracking-[0.1em] text-ink/55"
              >
                Change phone number
              </button>
            </form>
          )}

          {step === "selfie" && (
            <div className="space-y-4">
              <div className="relative bg-ink overflow-hidden aspect-video border border-ink">
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
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-28 h-36 rounded-full border-2 border-paper2/40 border-dashed" />
                </div>
                {!streaming && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/80">
                    {cameraError ? (
                      <>
                        <p className="font-mono text-[11px] uppercase tracking-wide text-err">Camera access denied</p>
                        <button
                          onClick={startCamera}
                          className="flex items-center gap-1.5 px-4 py-1.5 border border-paper2/50 font-mono text-[11px] uppercase tracking-wide text-paper2 hover:bg-paper2/10 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Retry
                        </button>
                      </>
                    ) : (
                      <p className="font-mono text-[11px] uppercase tracking-wide text-paper2/50">Starting camera…</p>
                    )}
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <button
                onClick={handleCaptureSelfie}
                disabled={loading || !streaming}
                className="btn-accent w-full py-3 flex items-center justify-center gap-2"
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
