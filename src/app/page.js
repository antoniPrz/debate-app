"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="page">
      <nav className="navbar">
        <Link href="/" className="navbar-brand">
          <span className="logo-icon">⚡</span>
          <span>DebateFlow</span>
        </Link>
        <div className="navbar-actions">
          {session ? (
            <Link href="/dashboard" className="btn btn-primary">
              Ir al Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Iniciar Sesión
              </Link>
              <Link href="/register" className="btn btn-primary">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="hero">
        <div className="hero-content">
          <div className="hero-badge">🧠 Moderado por Inteligencia Artificial</div>
          <h1 className="hero-title">
            Debates que <span className="gradient-text">iluminan</span>,<br />
            no que dividen
          </h1>
          <p className="hero-subtitle">
            Una plataforma donde dos personas debaten un tema con la asistencia de IA
            que detecta falacias, ambigüedades y sesgos en tiempo real.
            El objetivo no es ganar — es que ambos aprendan.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary btn-lg">
              Comenzar a Debatir
            </Link>
            <Link href="#features" className="btn btn-secondary btn-lg">
              ¿Cómo funciona?
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="demo-chat">
            <div className="demo-message demo-user1 slide-up">
              <div className="demo-msg-header">👤 Daniel</div>
              <p>La inteligencia artificial nunca podrá reemplazar completamente a los programadores porque carece de creatividad real.</p>
            </div>
            <div className="demo-analysis slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="demo-analysis-header">
                <span className="severity-medium">⚠️ Análisis IA</span>
              </div>
              <p><strong>Ambigüedad detectada:</strong> &quot;creatividad real&quot; necesita definición. ¿Se refiere a originalidad, capacidad de abstracción, o pensamiento lateral?</p>
            </div>
            <div className="demo-message demo-user2 slide-up" style={{ animationDelay: "0.4s" }}>
              <div className="demo-msg-header">🎓 Elena</div>
              <p>La creatividad en programación es en gran medida reconocimiento de patrones y combinación de soluciones existentes, algo en lo que la IA ya destaca.</p>
            </div>
            <div className="demo-analysis demo-pass slide-up" style={{ animationDelay: "0.6s" }}>
              <div className="demo-analysis-header">
                <span className="severity-none">✅ Análisis IA</span>
              </div>
              <p>Argumento válido. Presenta una distinción clara y responde directamente al punto planteado.</p>
            </div>
          </div>
        </div>
      </main>

      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">¿Por qué DebateFlow?</h2>
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">🔍</div>
              <h3>Detección de Falacias</h3>
              <p>La IA identifica ad hominem, hombre de paja, falsa dicotomía y más de 20 tipos de falacias lógicas.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">📖</div>
              <h3>Definiciones Compartidas</h3>
              <p>Acuerden el significado de los términos clave antes de debatir para evitar malentendidos.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🧠</div>
              <h3>Sesgos Cognitivos</h3>
              <p>Detecta sesgo de confirmación, anclaje, y otros patrones de pensamiento que distorsionan el razonamiento.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">⏸️</div>
              <h3>Debates Asíncronos</h3>
              <p>Pausa y retoma cuando quieras. Investiga, consulta fuentes, y regresa con mejores argumentos.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🤝</div>
              <h3>Aprendizaje, no Victoria</h3>
              <p>El objetivo es que ambos participantes mejoren su razonamiento, no declarar un ganador.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">📊</div>
              <h3>Análisis Transparente</h3>
              <p>Cada mensaje recibe feedback detallado con explicaciones y sugerencias de mejora.</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-xl);
          align-items: center;
          text-align: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--spacing-2xl) var(--spacing-md);
          min-height: calc(100vh - 70px);
          position: relative;
          z-index: 1;
        }

        .hero-badge {
          display: inline-block;
          padding: 0.4rem 1rem;
          background: rgba(108, 92, 231, 0.1);
          border: 1px solid rgba(108, 92, 231, 0.3);
          border-radius: var(--radius-full);
          font-size: var(--font-size-sm);
          color: var(--accent-primary);
          margin-bottom: var(--spacing-lg);
        }

        .hero-title {
          font-size: var(--font-size-3xl);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: var(--spacing-lg);
        }

        .gradient-text {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: var(--font-size-base);
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: var(--spacing-2xl);
          max-width: 100%;
        }

        .hero-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          justify-content: center;
        }

        .hero-visual {
          display: none;
        }

        .demo-chat {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          padding: var(--spacing-lg);
          background: var(--gradient-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          backdrop-filter: blur(10px);
        }

        .demo-message {
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
        }

        .demo-user1 {
          border-left: 3px solid var(--accent-primary);
        }

        .demo-user2 {
          border-left: 3px solid var(--accent-secondary);
        }

        .demo-msg-header {
          font-size: var(--font-size-xs);
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
        }

        .demo-message p {
          font-size: var(--font-size-sm);
          color: var(--text-primary);
        }

        .demo-analysis {
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-sm);
          background: rgba(253, 203, 110, 0.05);
          border: 1px solid rgba(253, 203, 110, 0.15);
          font-size: var(--font-size-xs);
        }

        .demo-analysis.demo-pass {
          background: rgba(0, 184, 148, 0.05);
          border-color: rgba(0, 184, 148, 0.15);
        }

        .demo-analysis-header {
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
          font-size: var(--font-size-xs);
        }

        .demo-analysis p {
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .features {
          padding: var(--spacing-2xl) 0;
          position: relative;
          z-index: 1;
        }

        .section-title {
          text-align: center;
          font-size: var(--font-size-2xl);
          font-weight: 800;
          margin-bottom: var(--spacing-2xl);
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-lg);
        }

        .feature-card {
          text-align: center;
          padding: var(--spacing-lg);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: var(--spacing-md);
        }

        .feature-card h3 {
          font-size: var(--font-size-lg);
          font-weight: 700;
          margin-bottom: var(--spacing-sm);
        }

        .feature-card p {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Desktop expansion */
        @media (min-width: 769px) {
          .hero {
            grid-template-columns: 1fr 1fr;
            text-align: left;
            gap: var(--spacing-3xl);
            padding: var(--spacing-3xl) var(--spacing-xl);
          }

          .hero-title {
            font-size: var(--font-size-5xl);
          }

          .hero-subtitle {
            font-size: var(--font-size-lg);
            max-width: 500px;
          }

          .hero-actions {
            flex-direction: row;
            justify-content: flex-start;
          }

          .hero-visual {
            display: block;
          }

          .features {
            padding: var(--spacing-3xl) 0;
          }

          .section-title {
            font-size: var(--font-size-3xl);
            margin-bottom: var(--spacing-3xl);
          }

          .features-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .feature-card {
            padding: var(--spacing-2xl);
          }
        }
      `}</style>
    </div>
  );
}
