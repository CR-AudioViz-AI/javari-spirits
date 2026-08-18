// components/brand/SiteFooter.tsx
//
// THE DISCLOSURE HAS TO MATCH REALITY. The old one named Awin only, and printed
// the publisher id — "Publisher ID: 2692370" — in the page body. That id is an
// account identifier, not a credential to display: publishing it invites link
// hijacking, where someone swaps their id for yours or appends yours to their
// own traffic. It appears nowhere on this site now.
//
// The company holds relationships across Awin, CJ and Rakuten. A disclosure that
// names one of three is not a disclosure, it is a decoration.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
export default function SiteFooter() {
  return (
    <footer
      style={{
        background: '#08090C', borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '26px 20px 32px', marginTop: 48,
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: 'rgba(242,237,228,0.34)', fontSize: 11.5, margin: '0 0 8px', lineHeight: 1.6 }}>
          Some links on this site are affiliate links. If you buy through one, CR AudioViz AI may
          earn a commission at no extra cost to you. We participate in the Awin, CJ and Rakuten
          affiliate networks. Commission never affects what we recommend or how a bottle is valued.
        </p>
        <p style={{ color: 'rgba(242,237,228,0.24)', fontSize: 11, margin: 0 }}>
          © 2026 CR AudioViz AI, LLC · EIN 39-3646201 · Fort Myers, Florida ·{' '}
          <a href="https://craudiovizai.com" style={{ color: 'rgba(245,197,66,0.6)', textDecoration: 'none' }}>
            craudiovizai.com
          </a>
        </p>
        <p style={{ color: 'rgba(242,237,228,0.2)', fontSize: 10.5, margin: '8px 0 0' }}>
          Please drink responsibly. You must be 21 or older to purchase alcohol in the United States.
        </p>
      </div>
    </footer>
  )
}
