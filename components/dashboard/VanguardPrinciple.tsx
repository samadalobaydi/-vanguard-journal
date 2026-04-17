const QUOTES = [
  {
    text: "You don't rise to the level of your goals. You fall to the level of your systems.",
    author: 'James Clear',
  },
  {
    text: 'Discipline is the bridge between goals and accomplishment.',
    author: 'Jim Rohn',
  },
  {
    text: 'The quality of a person\'s life is in direct proportion to their commitment to excellence.',
    author: 'Vince Lombardi',
  },
  {
    text: 'Do not pray for an easy life. Pray for the strength to endure a difficult one.',
    author: 'Bruce Lee',
  },
  {
    text: 'It is not the mountain we conquer, but ourselves.',
    author: 'Edmund Hillary',
  },
  {
    text: 'Success is nothing more than a few simple disciplines practiced every day.',
    author: 'Jim Rohn',
  },
  {
    text: 'Pain is temporary. Quitting lasts forever.',
    author: 'Lance Armstrong',
  },
  {
    text: 'We are what we repeatedly do. Excellence, therefore, is not an act but a habit.',
    author: 'Aristotle',
  },
  {
    text: 'The man who moves a mountain begins by carrying away small stones.',
    author: 'Confucius',
  },
  {
    text: 'Hard choices, easy life. Easy choices, hard life.',
    author: 'Jerzy Gregorek',
  },
  {
    text: 'Don\'t count the days. Make the days count.',
    author: 'Muhammad Ali',
  },
  {
    text: 'Strength does not come from winning. Your struggles develop your strengths.',
    author: 'Arnold Schwarzenegger',
  },
  {
    text: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
  },
  {
    text: 'Do something today that your future self will thank you for.',
    author: 'Sean Patrick Flanery',
  },
]

export default function VanguardPrinciple() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000)
  const quote = QUOTES[dayOfYear % QUOTES.length]

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
          marginBottom: 16,
        }}
      >
        Vanguard Principle
      </p>
      <blockquote
        style={{
          color: '#A9A9A9',
          fontSize: 14,
          lineHeight: 1.75,
          fontStyle: 'italic',
          margin: 0,
        }}
      >
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <p
        style={{
          color: '#555555',
          fontSize: 10,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginTop: 14,
        }}
      >
        — {quote.author}
      </p>
    </div>
  )
}
