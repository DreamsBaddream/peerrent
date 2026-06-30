import Link from "next/link"

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
      <div className="card rounded-2xl overflow-hidden">
        {/* Image */}
        <div className="aspect-[4/3] bg-white/[0.03] overflow-hidden relative">
          {photo ? (
            <img
              src={photo}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/20">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15L16 10L5 21" />
              </svg>
              <span className="text-xs">No photo</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>

        {/* Info */}
        <div className="p-4 border-t border-white/[0.05]">
          <h3 className="text-white text-sm font-semibold leading-tight line-clamp-2 mb-3">
            {title}
          </h3>
          <div className="flex items-end justify-between">
            <div>
              <span className="gradient-text text-base font-bold">{price_per_day}</span>
              <span className="text-white/35 text-xs ml-1">CSPR / day</span>
            </div>
            <span className="text-white/25 text-xs">{deposit_amount} dep.</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
