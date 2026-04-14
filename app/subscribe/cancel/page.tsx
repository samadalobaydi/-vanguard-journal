import Link from 'next/link'

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-4 text-center">
      <div className="relative z-10 max-w-md">
        <h1 className="font-bebas text-5xl tracking-wider text-white mb-3">
          Checkout Cancelled
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          You cancelled the checkout. Your access is still waiting — whenever you&apos;re ready to
          commit.
        </p>
        <Link
          href="/subscribe"
          className="inline-block bg-gold text-black font-bold text-sm tracking-widest uppercase px-10 py-4 hover:bg-gold-light transition-colors"
        >
          Try Again
        </Link>
        <div className="mt-4">
          <Link
            href="/login"
            className="text-xs text-gray-700 hover:text-gray-500 tracking-widest uppercase transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
