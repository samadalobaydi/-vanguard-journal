import Link from 'next/link'

interface Props {
  statement: string | null
}

export default function IdentityCard({ statement }: Props) {
  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #120028, #080015)',
        border: '1px solid rgba(168,85,247,0.15)',
        borderRadius: 16,
        padding: '16px 18px',
        overflow: 'hidden',
      }}
    >
      <p
        style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: 9,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: 8,
          fontFamily: 'var(--font-mono), monospace',
        }}
      >
        identity contract
      </p>
      {statement ? (
        <p
          style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 12,
            lineHeight: 1.6,
            fontStyle: 'italic',
            fontFamily: 'var(--font-mono), monospace',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          &ldquo;{statement}&rdquo;
        </p>
      ) : (
        <Link
          href="/contract"
          style={{
            color: '#A855F7',
            fontSize: 11,
            letterSpacing: '1px',
            fontFamily: 'var(--font-mono), monospace',
            textDecoration: 'none',
          }}
        >
          CONTRACT UNSIGNED — SIGN NOW →
        </Link>
      )}
    </div>
  )
}
