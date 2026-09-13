import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      color: '#ffffff',
      background: '#000000',
      padding: '32px'
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'Space Grotesk', marginBottom: '8px' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
        Page Introuvable
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '400px', marginBottom: '24px' }}>
        La ressource demandée n'existe pas ou a été déplacée.
      </p>
      <Link href="/" className="btn btn-primary">
        Retour au Cockpit
      </Link>
    </div>
  );
}
