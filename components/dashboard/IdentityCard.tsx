import Link from 'next/link'

interface Props {
  statement: string | null
}

export default function IdentityCard({ statement }: Props) {
  return (
    <div
      style={{
        background: '#111111',
        border: '1px solid #1e1e1e',
        borderRadius: 16,
        padding: '24px 28px',
      }}
    >
      <p
        style={{
          color: '#555555',
          letterSpacing: '3px',
          fontSize: 10,
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        Identity Contract
      </p>
      {statement ? (
        <p
          style={{
            color: '#ffffff',
            fontSize: 16,
            lineHeight: 1.65,
            fontStyle: 'italic',
          }}
        >
          &ldquo;{statement}&rdquo;
        </p>
      ) : (
        <p style={{ color: '#555555', fontSize: 13 }}>
          No identity statement set.{' '}
          <Link href="/profile" style={{ color: '#A855F7' }}>
            Add one in your profile →
          </Link>
        </p>
      )}
    </div>
  )
}
