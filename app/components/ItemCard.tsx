import Link from "next/link"
import { ImageIcon } from "lucide-react"
import UsdEstimate from "@/components/CsprPrice"

interface ItemCardProps {
  id: string
  title: string
  photos: string[]
  price_per_day: number
  deposit_amount: number
}

export default function ItemCard({
  id,
  title,
  photos,
  price_per_day,
  deposit_amount,
}: ItemCardProps) {
  const photo = photos?.[0] ?? null

  return (
    <Link href={`/item/${id}`} className="group block">
      <div className="card-log card-log-hover overflow-hidden">
        <div className="aspect-[4/3] bg-ink/[0.04] overflow-hidden relative border-b border-ink">
          {photo ? (
            <img
              src={photo}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-ink/25">
              <ImageIcon className="w-8 h-8" strokeWidth={1} />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]">No photo</span>
            </div>
          )}
          <span className="absolute top-2 left-2 bg-paper2 border border-ink font-mono text-[9px] font-semibold tracking-[0.12em] uppercase px-1.5 py-0.5">
            REF·{id.slice(0, 4).toUpperCase()}
          </span>
        </div>

        <div className="p-4">
          <h3 className="text-ink text-sm font-bold leading-tight line-clamp-2 mb-3">
            {title}
          </h3>
          <div className="flex items-end justify-between font-mono">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-accent text-base font-bold">{price_per_day}</span>
                <span className="text-ink/45 text-[10px] uppercase tracking-wide">CSPR/day</span>
              </div>
              <UsdEstimate cspr={price_per_day} per="day" className="text-[10px]" />
            </div>
            <div className="text-right">
              <span className="block text-ink/40 text-[10px] uppercase tracking-wide">
                dep {deposit_amount}
              </span>
              <UsdEstimate cspr={deposit_amount} className="text-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
