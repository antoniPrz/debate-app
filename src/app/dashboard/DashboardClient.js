"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function DashboardClient({ debates, userId, userName }) {
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState("");
    const [joinError, setJoinError] = useState("");
    const [joining, setJoining] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        setJoinError("");
        setJoining(true);

        try {
            const res = await fetch("/api/debates/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inviteCode: joinCode.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setJoinError(data.error);
                return;
            }

            window.location.href = `/debate/${data.debate.id}`;
        } catch (err) {
            setJoinError("Error al unirse al debate");
        } finally {
            setJoining(false);
        }
    };

    const getStatusBadge = (status) => {
        const labels = {
            setup: "Configuración",
            active: "Activo",
            paused: "Pausado",
            finished: "Finalizado",
        };
        return <span className={`badge badge-${status}`}>{labels[status] || status}</span>;
    };

    const getOpponentName = (debate) => {
        if (debate.creatorId === userId) {
            return debate.opponent?.username || "Esperando oponente...";
        }
        return debate.creator.username;
    };

    return (
        <div className="page">
            <Navbar />

            <div className="container" style={{ paddingTop: "var(--spacing-2xl)" }}>
                <div className="dashboard-header">
                    <div>
                        <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800 }}>
                            Hola, <span className="gradient-text">{userName}</span>
                        </h1>
                        <p style={{ color: "var(--text-secondary)", marginTop: "var(--spacing-xs)" }}>
                            Gestiona tus debates y descubre nuevas perspectivas
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="btn btn-secondary"
                        >
                            🔗 Unirse con Código
                        </button>
                        <Link href="/debate/new" className="btn btn-primary">
                            ➕ Nuevo Debate
                        </Link>
                    </div>
                </div>

                {debates.length === 0 ? (
                    <div className="empty-state" style={{ marginTop: "var(--spacing-3xl)" }}>
                        <div className="empty-state-icon">💬</div>
                        <div className="empty-state-title">No tienes debates aún</div>
                        <div className="empty-state-description">
                            Crea un nuevo debate y comparte el código de invitación con alguien para comenzar.
                        </div>
                        <Link href="/debate/new" className="btn btn-primary btn-lg">
                            Crear mi primer debate
                        </Link>
                    </div>
                ) : (
                    <div className="debates-grid">
                        {debates.map((debate) => (
                            <Link
                                key={debate.id}
                                href={`/debate/${debate.id}`}
                                className="debate-card card"
                            >
                                <div className="debate-card-header">
                                    <h3 className="card-title">{debate.title}</h3>
                                    {getStatusBadge(debate.status)}
                                </div>
                                <p className="card-subtitle" style={{ marginBottom: "var(--spacing-md)" }}>
                                    {debate.topic}
                                </p>
                                <div className="debate-card-meta">
                                    <span>vs {getOpponentName(debate)}</span>
                                    <span>{debate._count.messages} mensajes</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal para unirse */}
            {showJoinModal && (
                <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
                    <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: "var(--spacing-lg)", fontSize: "var(--font-size-xl)", fontWeight: 700 }}>
                            Unirse a un Debate
                        </h2>
                        {joinError && <div className="alert alert-error">{joinError}</div>}
                        <form onSubmit={handleJoin}>
                            <div className="form-group">
                                <label className="form-label">Código de invitación</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ingresa el código..."
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div style={{ display: "flex", gap: "var(--spacing-md)" }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowJoinModal(false)}
                                    style={{ flex: 1 }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={joining}
                                    style={{ flex: 1 }}
                                >
                                    {joining ? "Uniéndose..." : "Unirse"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        .dashboard-header {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-2xl);
        }
        .gradient-text {
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .debates-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--spacing-lg);
        }
        .debate-card {
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }
        .debate-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }
        .debate-card-meta {
          display: flex;
          justify-content: space-between;
          font-size: var(--font-size-xs);
          color: var(--text-muted);
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: var(--spacing-md);
        }
        .modal-content {
          width: 100%;
          max-width: 440px;
          padding: var(--spacing-lg);
        }
        @media (min-width: 769px) {
          .dashboard-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }
          .debates-grid {
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          }
          .modal-overlay {
            padding: var(--spacing-lg);
          }
          .modal-content {
            padding: var(--spacing-2xl);
          }
        }
      `}</style>
        </div>
    );
}
