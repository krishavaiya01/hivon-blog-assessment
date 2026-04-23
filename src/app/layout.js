import './globals.css';

export const metadata = {
  title: 'Hivon Automations - AI Blogging Platform',
  description: 'A rich blogging platform with AI summaries generated using Google AI APIs built with Next.js and Supabase.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="navbar">
          <div className="container navbar-inner">
            <a href="/" className="logo">Hivon Blog</a>
            <nav className="flex items-center gap-4">
              <a href="/" className="btn btn-secondary">Home</a>
              <a href="/login" className="btn btn-primary">Sign In</a>
            </nav>
          </div>
        </header>

        <main className="container py-8 animate-fade-in">
          {children}
        </main>

        <footer style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
          <p>&copy; {new Date().getFullYear()} Hivon Automations LLP. Basic Blogging Platform Assessment.</p>
        </footer>
      </body>
    </html>
  );
}
