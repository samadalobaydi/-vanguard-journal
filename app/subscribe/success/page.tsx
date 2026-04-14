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
        <div className="font-bebas text-7xl text-gold tracking-wider mb-4">⚡</div>
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
