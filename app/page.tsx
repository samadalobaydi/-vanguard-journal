'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const HEADING = '[ ENTRY PROTOCOL: SELECTION ]'

const LINES: { text: string; highlight?: string }[] = [
  { text: '"This terminal serves as a mirror, not a shield."' },
  {
    text: '"You are here because you have failed to hold the line on your own. Vanguard is the final intervention."',
  },
  { text: '"If you seek an ally in your weakness, look elsewhere."' },
  {
    text: '"If you are not prepared to face your habits with RADICAL HONESTY, exit now."',
    highlight: 'RADICAL HONESTY',
  },
]

const CHAR_DELAY = 28
const LINE_PAUSE = 450

function LineText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight || !text.includes(highlight)) {
    return <span style={{ color: '#A9A9A9' }}>{text}</span>
  }
  const [before, after] = text.split(highlight)
  return (
    <span style={{ color: '#A9A9A9' }}>
      {before}
      <span style={{ color: '#7F1D1D', fontWeight: 700 }}>{highlight}</span>
      {after}
    </span>
  )
}

export default function GatekeeperPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)
  const [headingText, setHeadingText] = useState('')
  const [headingDone, setHeadingDone] = useState(false)
  const [completedLines, setCompletedLines] = useState<number>(0)
  const [activeText, setActiveText] = useState('')
  const [typewriterDone, setTypewriterDone] = useState(false)
  const [buttonsVisible, setButtonsVisible] = useState(false)
  const [glitching, setGlitching] = useState(false)
  const [fadingOut, setFadingOut] = useState(false)

  // Skip if already accepted
  useEffect(() => {
    if (localStorage.getItem('selection_accepted') === 'true') {
      router.replace('/login')
    } else {
      setChecked(true)
    }
  }, [router])

  // Heading typewriter
  useEffect(() => {
    if (!checked) return
    let i = 0
    const id = setInterval(() => {
      i++
      setHeadingText(HEADING.slice(0, i))
      if (i >= HEADING.length) {
        clearInterval(id)
        setTimeout(() => setHeadingDone(true), LINE_PAUSE)
      }
    }, CHAR_DELAY)
    return () => clearInterval(id)
  }, [checked])

  // Body lines typewriter — starts after heading done
  useEffect(() => {
    if (!headingDone) return

    let lineIndex = 0
    let charIndex = 0
    let timeoutId: ReturnType<typeof setTimeout>

    function typeNextChar() {
      if (lineIndex >= LINES.length) {
        setTypewriterDone(true)
        setTimeout(() => setButtonsVisible(true), 400)
        return
      }

      const lineText = LINES[lineIndex].text

      if (charIndex <= lineText.length) {
        setActiveText(lineText.slice(0, charIndex))
        charIndex++
        timeoutId = setTimeout(typeNextChar, CHAR_DELAY)
      } else {
        // Line complete — commit it, move to next
        setCompletedLines(lineIndex + 1)
        setActiveText('')
        lineIndex++
        charIndex = 0
        timeoutId = setTimeout(typeNextChar, LINE_PAUSE)
      }
    }

    timeoutId = setTimeout(typeNextChar, LINE_PAUSE)
    return () => clearTimeout(timeoutId)
  }, [headingDone])

  function handleAccept() {
    localStorage.setItem('selection_accepted', 'true')
    setGlitching(true)
    setTimeout(() => router.push('/login'), 900)
  }

  function handleNotReady() {
    setFadingOut(true)
  }

  if (!checked) return null

  return (
    <div
      style={{
        background: '#000000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        fontFamily: "'JetBrains Mono', monospace",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');

        @keyframes breathe {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(168,85,247,0.25)); }
          50%       { filter: drop-shadow(0 0 32px rgba(168,85,247,0.85)); }
        }

        @keyframes glitchFrame {
          0%   { clip-path: inset(0 0 95% 0); transform: translate(-6px, 0); }
          10%  { clip-path: inset(20% 0 60% 0); transform: translate(6px, 0); }
          20%  { clip-path: inset(50% 0 30% 0); transform: translate(-4px, 0); }
          30%  { clip-path: inset(10% 0 80% 0); transform: translate(4px, 0); }
          40%  { clip-path: inset(70% 0 10% 0); transform: translate(-6px, 0); }
          50%  { clip-path: inset(30% 0 50% 0); transform: translate(6px, 0); }
          60%  { clip-path: inset(80% 0 5% 0);  transform: translate(-4px, 0); }
          70%  { clip-path: inset(5% 0 70% 0);  transform: translate(4px, 0); }
          80%  { clip-path: inset(40% 0 40% 0); transform: translate(0); }
          90%  { clip-path: inset(0 0 0 0);     transform: translate(0); opacity: 0.4; }
          100% { clip-path: inset(0 0 0 0);     transform: translate(0); opacity: 0; }
        }

        .glitch-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: repeating-linear-gradient(
            0deg,
            rgba(168,85,247,0.07) 0px,
            rgba(168,85,247,0.07) 1px,
            transparent 1px,
            transparent 4px
          );
          animation: glitchFrame 0.9s steps(1) forwards;
          pointer-events: none;
        }

        .accept-btn {
          border: 1px solid #A9A9A9;
          background: transparent;
          color: #A9A9A9;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 16px 36px;
          cursor: pointer;
          transition: border-color 0.3s, color 0.3s, box-shadow 0.3s;
        }
        .accept-btn:hover {
          border-color: #A855F7;
          color: #A855F7;
          box-shadow: 0 0 20px rgba(168,85,247,0.35);
        }

        .not-ready-btn {
          background: none;
          border: none;
          color: #A9A9A9;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          opacity: 0.3;
          padding: 8px;
          transition: opacity 0.2s;
        }
        .not-ready-btn:hover { opacity: 0.5; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .buttons-appear {
          animation: fadeInUp 0.5s ease forwards;
        }

        .cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #A9A9A9;
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 0.8s step-end infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>

      {/* Glitch transition */}
      {glitching && <div className="glitch-overlay" />}

      {/* Fade-to-black overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000000',
          opacity: fadingOut ? 1 : 0,
          transition: 'opacity 1.6s ease',
          pointerEvents: fadingOut ? 'all' : 'none',
          zIndex: 50,
        }}
      />

      {/* Logo with breathing glow */}
      <div style={{ marginBottom: 52, lineHeight: 0 }}>
        <img
          src="/vanguard-logo.png"
          alt="Vanguard"
          style={{
            height: 96,
            width: 'auto',
            display: 'block',
            mixBlendMode: 'screen',
            animation: 'breathe 4s ease-in-out infinite',
          }}
        />
      </div>

      <div style={{ width: '100%', maxWidth: 580 }}>

        {/* Heading */}
        <p style={{
          color: '#A9A9A9',
          fontSize: 11,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          margin: '0 0 36px',
          minHeight: '1.5em',
        }}>
          {headingText}
          {!headingDone && <span className="cursor" />}
        </p>

        {/* Completed lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {LINES.slice(0, completedLines).map((line, i) => (
            <p key={i} style={{ margin: 0, fontSize: 13, lineHeight: 1.85 }}>
              <LineText text={line.text} highlight={line.highlight} />
            </p>
          ))}

          {/* Actively typing line */}
          {!typewriterDone && activeText && (
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.85 }}>
              <LineText
                text={activeText}
                highlight={
                  LINES[completedLines]?.highlight &&
                  activeText.includes(LINES[completedLines].highlight!)
                    ? LINES[completedLines].highlight
                    : undefined
                }
              />
              <span className="cursor" />
            </p>
          )}
        </div>

        {/* Buttons */}
        {buttonsVisible && (
          <div
            className="buttons-appear"
            style={{
              marginTop: 52,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 22,
            }}
          >
            <button className="accept-btn" onClick={handleAccept}>
              [ I Accept the Burden ]
            </button>
            <button className="not-ready-btn" onClick={handleNotReady}>
              [ I am not ready ]
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
