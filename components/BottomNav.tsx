'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
  {
    href: '/vault',
    label: 'Vault',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="5" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10.5" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 3.5L10 2L12 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/brothers',
    label: 'Brothers',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="13" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 17c0-3 2.5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18 17c0-3-2.5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        background: '#111111',
        borderTop: '1px solid #1e1e1e',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 16,
      }}
      className="sm:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              color: active ? '#A855F7' : '#555555',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
          >
            {item.icon}
            <span
              style={{
                fontSize: 8,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontWeight: active ? 700 : 400,
              }}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
