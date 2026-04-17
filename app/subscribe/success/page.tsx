import Link from 'next/link'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-4 text-center">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 max-w-md">
        <div className="flex justify-center mb-4">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="27" stroke="#A855F7" strokeWidth="1.5" />
            <path d="M28 12C22 20 18 24 18 30C18 34.42 22.58 38 28 38C33.42 38 38 34.42 38 30C38 24 34 20 28 12ZM28 34C25.79 34 24 32.21 24 30C24 27 28 23 28 23C28 23 32 27 32 30C32 32.21 30.21 34 28 34Z" fill="#A855F7" />
          </svg>
        </div>
        <h1 className="font-bebas text-5xl tracking-wider text-white mb-3">
          You&apos;re In.
        </h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Your subscription is active. The journal is ready. There are no more excuses — only
          choices. Start your first entry now.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-gold text-black font-bold text-sm tracking-widest uppercase px-10 py-4 hover:bg-gold-light transition-colors"
        >
          Open My Journal
        </Link>
        <p className="mt-6 text-xs text-gray-700 tracking-wide">
          A receipt has been sent to your email. Manage your subscription anytime from the
          dashboard.
        </p>
      </div>
    </div>
  )
}
