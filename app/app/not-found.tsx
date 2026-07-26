import Link from "next/link"
import { FileQuestion, ArrowRight } from "lucide-react"

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center">
      <div className="card-log p-10">
        <div className="w-14 h-14 border border-ink/30 flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-6 h-6 text-ink/35" strokeWidth={1.5} />
        </div>
        <p className="mono-label mb-3">Error · 404</p>
        <h1 className="font-display text-3xl uppercase tracking-tight text-ink mb-2">
          Off the ledger
        </h1>
        <p className="text-ink/55 text-sm mb-7">
          This entry doesn&apos;t exist — it may have been unlisted or the link is wrong.
        </p>
        <Link href="/" className="btn-accent inline-flex items-center gap-2 px-6 py-3">
          Back to Browse
          <ArrowRight className="w-4 h-4" strokeWidth={2.25} />
        </Link>
      </div>
    </div>
  )
}
