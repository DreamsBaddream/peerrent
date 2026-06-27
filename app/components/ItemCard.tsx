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
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg group-hover:shadow-emerald-900/20 group-hover:border-gray-700 transition-all duration-200">
        <div className="aspect-[4/3] bg-gray-800 overflow-hidden">
          {photo ? (
            <img
              src={photo}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
              No photo
            </div>
          )}
        </div>
        <div className="p-4 space-y-1">
          <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
            {title}
          </h3>
          <p className="text-emerald-400 text-sm font-medium">
            ${price_per_day} / day
          </p>
          <p className="text-gray-500 text-xs">
            Deposit: {deposit_amount} CSPR
          </p>
        </div>
      </div>
    </Link>
  )
}
