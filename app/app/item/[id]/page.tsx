import RentModal from "@/components/RentModal"
import { Listing } from "@/lib/types"

async function getListing(id: string): Promise<Listing | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/listings/${id}`,
      { cache: "no-store" }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.listing ?? data ?? null
  } catch {
    return null
  }
}

export default async function ItemPage(props: PageProps<"/item/[id]">) {
  const { id } = await props.params
  const listing = await getListing(id)

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <p className="text-gray-400 text-lg">Item not found.</p>
        <a
          href="/"
          className="mt-4 inline-block text-emerald-400 hover:text-emerald-300 text-sm"
        >
          Back to Browse
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Photos */}
        <div className="space-y-3">
          {listing.photos.length > 0 ? (
            <>
              <div className="aspect-[4/3] bg-gray-800 rounded-xl overflow-hidden">
                <img
                  src={listing.photos[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {listing.photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {listing.photos.slice(1).map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`${listing.title} photo ${i + 2}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-700 flex-shrink-0"
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-[4/3] bg-gray-800 rounded-xl flex items-center justify-center text-gray-600">
              No photos
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{listing.title}</h1>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-2xl font-semibold text-emerald-400">
                {listing.price_per_day} CSPR
              </span>
              <span className="text-gray-500 text-sm">/ day</span>
            </div>
          </div>

          {listing.description && (
            <div>
              <h2 className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">
                Description
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                {listing.description}
              </p>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Daily rate</span>
              <span className="text-white font-medium">
                {listing.price_per_day} CSPR
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Security deposit</span>
              <span className="text-white font-medium">
                {listing.deposit_amount} CSPR
              </span>
            </div>
            <div className="flex justify-between text-sm pt-1 border-t border-gray-800">
              <span className="text-gray-400">Status</span>
              <span
                className={
                  listing.is_available ? "text-emerald-400" : "text-red-400"
                }
              >
                {listing.is_available ? "Available" : "Not available"}
              </span>
            </div>
          </div>

          {listing.is_available && (
            <RentModal
              listingId={listing.id}
              pricePerDay={listing.price_per_day}
              depositAmount={listing.deposit_amount}
            />
          )}
        </div>
      </div>
    </div>
  )
}
