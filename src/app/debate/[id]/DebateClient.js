"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";

export default function DebateClient({ debate: initialDebate, initialMessages, userId, userName }) {
    const [debate, setDebate] = useState(initialDebate);
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [analyzing, setAnalyzing] = useState({});
    const [showDefinitions, setShowDefinitions] = useState(true);
    const [showNewDef, setShowNewDef] = useState(false);
    const [newTerm, setNewTerm] = useState("");
    const [newDefText, setNewDefText] = useState("");
    const [definitions, setDefinitions] = useState(initialDebate.definitions || []);
    const [copied, setCopied] = useState(false);
    const [expandedAnalysis, setExpandedAnalysis] = useState({});
    const messagesEndRef = useRef(null);
    const chatRef = useRef(null);

    const isCreator = debate.creatorId === userId;
    const opponent = isCreator ? debate.opponent : debate.creator;
    const canSend = debate.status !== "finished" && debate.status !== "paused";

    // Polling para nuevos mensajes
    useEffect(() => {
        if (debate.status === "finished") return;

        const poll = setInterval(async () => {
            try {
                const lastMsg = messages[messages.length - 1];
                const after = lastMsg?.createdAt || "";
                const url = after
                    ? `/api/debates/${debate.id}/messages?after=${after}`
                    : `/api/debates/${debate.id}/messages`;

                const res = await fetch(url);
                if (!res.ok) return;
                const data = await res.json();

                if (data.messages && data.messages.length > 0) {
                    setMessages((prev) => {
                        const ids = new Set(prev.map((m) => m.id));
                        const newMsgs = data.messages.filter((m) => !ids.has(m.id));
                        return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
                    });
                }
            } catch (err) {
                // silently fail
            }
        }, 3000);

        return () => clearInterval(poll);
    }, [debate.id, debate.status, messages]);

    // Poll para estado del debate
    useEffect(() => {
        if (debate.status === "finished") return;

        const poll = setInterval(async () => {
            try {
                const res = await fetch(`/api/debates/${debate.id}`);
                if (!res.ok) return;
                const data = await res.json();
                setDebate(data.debate);
                setDefinitions(data.debate.definitions || []);
            } catch (err) { }
        }, 5000);

        return () => clearInterval(poll);
    }, [debate.id, debate.status]);

    // Scroll al final
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const content = newMessage.trim();
        setNewMessage("");

        try {
            const res = await fetch(`/api/debates/${debate.id}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Error al enviar");
                setNewMessage(content);
                return;
            }

            const data = await res.json();
            setMessages((prev) => [...prev, data.message]);

            // Trigger AI analysis asynchronously
            triggerAnalysis(data.message.id);
        } catch (err) {
            setNewMessage(content);
            alert("Error de conexión");
        } finally {
            setSending(false);
        }
    };

    const triggerAnalysis = async (messageId) => {
        setAnalyzing((prev) => ({ ...prev, [messageId]: true }));
        try {
            const res = await fetch("/api/ai/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messageId, debateId: debate.id }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === messageId ? { ...m, aiAnalysis: data.analysis } : m
                    )
                );
            }
        } catch (err) {
            console.error("Error en análisis:", err);
        } finally {
            setAnalyzing((prev) => ({ ...prev, [messageId]: false }));
        }
    };

    const changeStatus = async (newStatus) => {
        try {
            const res = await fetch(`/api/debates/${debate.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                const data = await res.json();
                setDebate((prev) => ({ ...prev, ...data.debate }));
            }
        } catch (err) {
            alert("Error al cambiar estado");
        }
    };

    const addDefinition = async (e) => {
        e.preventDefault();
        if (!newTerm.trim() || !newDefText.trim()) return;

        try {
            const res = await fetch(`/api/debates/${debate.id}/definitions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ term: newTerm, definition: newDefText }),
            });

            if (res.ok) {
                const data = await res.json();
                setDefinitions((prev) => [...prev, data.definition]);
                setNewTerm("");
                setNewDefText("");
                setShowNewDef(false);
            }
        } catch (err) {
            alert("Error al agregar definición");
        }
    };

    const updateDefStatus = async (defId, status) => {
        try {
            const res = await fetch(`/api/debates/${debate.id}/definitions`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ definitionId: defId, status }),
            });

            if (res.ok) {
                const data = await res.json();
                setDefinitions((prev) =>
                    prev.map((d) => (d.id === defId ? data.definition : d))
                );
            }
        } catch (err) { }
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(debate.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleAnalysis = (msgId) => {
        setExpandedAnalysis((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case "none": return "✅";
            case "low": return "💡";
            case "medium": return "⚠️";
            case "high": return "🔴";
            default: return "🔍";
        }
    };

    const getSeverityLabel = (severity) => {
        switch (severity) {
            case "none": return "Sin problemas";
            case "low": return "Observación menor";
            case "medium": return "Ambigüedad o error leve";
            case "high": return "Falacia o error importante";
            default: return "Análisis";
        }
    };

    const getIssueTypeIcon = (type) => {
        switch (type) {
            case "fallacy": return "⚡";
            case "ambiguity": return "🔤";
            case "logical_error": return "🧮";
            case "cognitive_bias": return "🧠";
            default: return "📌";
        }
    };

    const getIssueTypeLabel = (type) => {
        switch (type) {
            case "fallacy": return "Falacia";
            case "ambiguity": return "Ambigüedad";
            case "logical_error": return "Error Lógico";
            case "cognitive_bias": return "Sesgo Cognitivo";
            default: return "Observación";
        }
    };

    const statusLabels = {
        setup: "Configuración",
        active: "Activo",
        paused: "Pausado",
        finished: "Finalizado",
    };

    return (
        <div className="page debate-page">
            <Navbar />

            <div className="debate-layout">
                {/* Overlay para cerrar sidebar en mobile */}
                {showDefinitions && (
                    <div className="sidebar-overlay" onClick={() => setShowDefinitions(false)} />
                )}
                {/* Panel izquierdo - Info y Definiciones */}
                <aside className={`debate-sidebar ${showDefinitions ? "open" : ""}`}>
                    <div className="sidebar-close-header">
                        <span>📋 Panel del Debate</span>
                        <button onClick={() => setShowDefinitions(false)} className="sidebar-close-btn">✕ Cerrar</button>
                    </div>
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">📋 Debate</h3>
                        <h4 style={{ fontSize: "var(--font-size-base)", marginBottom: "var(--spacing-xs)" }}>
                            {debate.title}
                        </h4>
                        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginBottom: "var(--spacing-md)" }}>
                            {debate.topic}
                        </p>

                        <div className="debate-meta">
                            <div className="meta-item">
                                <span className="meta-label">Estado</span>
                                <span className={`badge badge-${debate.status}`}>
                                    {statusLabels[debate.status]}
                                </span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Creador</span>
                                <span>{debate.creator?.username}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Oponente</span>
                                <span>{opponent?.username || "Esperando..."}</span>
                            </div>
                        </div>

                        {!opponent && (
                            <div className="invite-box">
                                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginBottom: "var(--spacing-sm)" }}>
                                    Comparte este código para invitar:
                                </p>
                                <div className="invite-code-box" onClick={copyInviteCode}>
                                    <span className="invite-code">{debate.inviteCode}</span>
                                    <span className="copy-btn">{copied ? "✓ Copiado" : "📋 Copiar"}</span>
                                </div>
                            </div>
                        )}

                        <div className="debate-actions">
                            {debate.status === "active" && (
                                <>
                                    <button onClick={() => changeStatus("paused")} className="btn btn-secondary btn-sm btn-full">
                                        ⏸️ Pausar
                                    </button>
                                    <button onClick={() => changeStatus("finished")} className="btn btn-ghost btn-sm btn-full">
                                        🏁 Finalizar
                                    </button>
                                </>
                            )}
                            {debate.status === "paused" && (
                                <>
                                    <button onClick={() => changeStatus("active")} className="btn btn-primary btn-sm btn-full">
                                        ▶️ Reanudar
                                    </button>
                                    <button onClick={() => changeStatus("finished")} className="btn btn-ghost btn-sm btn-full">
                                        🏁 Finalizar
                                    </button>
                                </>
                            )}
                            {debate.status === "setup" && opponent && (
                                <button onClick={() => changeStatus("active")} className="btn btn-primary btn-sm btn-full">
                                    ▶️ Iniciar Debate
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-md)" }}>
                            <h3 className="sidebar-title" style={{ margin: 0 }}>📖 Definiciones</h3>
                            <button onClick={() => setShowNewDef(true)} className="btn btn-ghost btn-sm">
                                + Nueva
                            </button>
                        </div>

                        {showNewDef && (
                            <form onSubmit={addDefinition} className="new-def-form">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Término..."
                                    value={newTerm}
                                    onChange={(e) => setNewTerm(e.target.value)}
                                    style={{ fontSize: "var(--font-size-xs)", padding: "0.5rem" }}
                                />
                                <textarea
                                    className="form-input"
                                    placeholder="Definición..."
                                    value={newDefText}
                                    onChange={(e) => setNewDefText(e.target.value)}
                                    rows={2}
                                    style={{ fontSize: "var(--font-size-xs)", padding: "0.5rem", minHeight: "50px" }}
                                />
                                <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
                                    <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                                        Proponer
                                    </button>
                                    <button type="button" onClick={() => setShowNewDef(false)} className="btn btn-ghost btn-sm">
                                        ✕
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="definitions-list">
                            {definitions.length === 0 ? (
                                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", textAlign: "center", padding: "var(--spacing-md)" }}>
                                    No hay definiciones aún
                                </p>
                            ) : (
                                definitions.map((def) => (
                                    <div key={def.id} className="def-item">
                                        <div className="def-header">
                                            <strong className="def-term">{def.term}</strong>
                                            <span className={`badge badge-${def.status === "accepted" ? "active" : def.status === "disputed" ? "paused" : "setup"}`}>
                                                {def.status === "accepted" ? "✓" : def.status === "disputed" ? "⚡" : "?"}
                                            </span>
                                        </div>
                                        <p className="def-text">{def.definition}</p>
                                        <div className="def-meta">
                                            <span>por {def.proposedBy?.username}</span>
                                            {def.proposedById !== userId && def.status === "proposed" && (
                                                <div style={{ display: "flex", gap: "4px" }}>
                                                    <button onClick={() => updateDefStatus(def.id, "accepted")} className="btn btn-ghost btn-sm" style={{ padding: "2px 6px", fontSize: "10px" }}>
                                                        ✓ Aceptar
                                                    </button>
                                                    <button onClick={() => updateDefStatus(def.id, "disputed")} className="btn btn-ghost btn-sm" style={{ padding: "2px 6px", fontSize: "10px" }}>
                                                        ⚡ Disputar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                {/* Panel central - Chat */}
                <main className="debate-chat">
                    <div className="chat-messages" ref={chatRef}>
                        {messages.length === 0 && (
                            <div className="empty-state" style={{ padding: "var(--spacing-2xl)" }}>
                                <div className="empty-state-icon">💬</div>
                                <div className="empty-state-title">¡El debate está listo!</div>
                                <div className="empty-state-description">
                                    {opponent
                                        ? "Envía el primer mensaje para comenzar el debate."
                                        : "Espera a que tu oponente se una con el código de invitación."}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, index) => {
                            const isOwnMessage = msg.senderId === userId;
                            const issues = msg.aiAnalysis ? JSON.parse(msg.aiAnalysis.issues || "[]") : [];
                            const isExpanded = expandedAnalysis[msg.id];

                            return (
                                <div
                                    key={msg.id}
                                    className={`message-wrapper ${isOwnMessage ? "own" : "other"} fade-in`}
                                    style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
                                >
                                    <div className="message-bubble">
                                        <div className="message-header">
                                            <span className="message-sender">
                                                {isOwnMessage ? "Tú" : msg.sender?.username}
                                            </span>
                                            <span className="message-time">
                                                {new Date(msg.createdAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                        <p className="message-text">{msg.content}</p>
                                    </div>

                                    {/* AI Analysis */}
                                    {analyzing[msg.id] && (
                                        <div className="ai-analysis-card analyzing">
                                            <div className="ai-analysis-header">
                                                <span className="spinner" style={{ width: 14, height: 14 }}></span>
                                                <span>Analizando argumento...</span>
                                            </div>
                                        </div>
                                    )}

                                    {msg.aiAnalysis && !analyzing[msg.id] && (
                                        <div
                                            className={`ai-analysis-card severity-bg-${msg.aiAnalysis.severity}`}
                                            onClick={() => toggleAnalysis(msg.id)}
                                        >
                                            <div className="ai-analysis-header">
                                                <span>{getSeverityIcon(msg.aiAnalysis.severity)}</span>
                                                <span className={`severity-${msg.aiAnalysis.severity}`}>
                                                    {getSeverityLabel(msg.aiAnalysis.severity)}
                                                </span>
                                                <span className="ai-toggle">{isExpanded ? "▼" : "▶"}</span>
                                            </div>

                                            {!isExpanded && msg.aiAnalysis.summary && (
                                                <p className="ai-summary">{msg.aiAnalysis.summary}</p>
                                            )}

                                            {isExpanded && (
                                                <div className="ai-details">
                                                    <p className="ai-summary">{msg.aiAnalysis.summary}</p>

                                                    {issues.length > 0 && (
                                                        <div className="ai-issues">
                                                            {issues.map((issue, i) => (
                                                                <div key={i} className="ai-issue">
                                                                    <div className="issue-header">
                                                                        <span>{getIssueTypeIcon(issue.type)}</span>
                                                                        <span className="issue-type">{getIssueTypeLabel(issue.type)}</span>
                                                                        <span className="issue-name">{issue.name}</span>
                                                                    </div>
                                                                    <p className="issue-desc">{issue.description}</p>
                                                                    {issue.quote && (
                                                                        <blockquote className="issue-quote">"{issue.quote}"</blockquote>
                                                                    )}
                                                                    {issue.suggestion && (
                                                                        <p className="issue-suggestion">
                                                                            💡 <strong>Sugerencia:</strong> {issue.suggestion}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Botón para analizar si no tiene análisis */}
                                    {!msg.aiAnalysis && !analyzing[msg.id] && msg.senderType === "user" && (
                                        <button
                                            onClick={() => triggerAnalysis(msg.id)}
                                            className="btn btn-ghost btn-sm analyze-btn"
                                        >
                                            🔍 Analizar con IA
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input de mensaje */}
                    <div className="chat-input-area">
                        {debate.status === "paused" && (
                            <div className="chat-status-bar paused">
                                ⏸️ Debate pausado — {isCreator ? "Reanuda cuando estés listo" : "Esperando que se reanude"}
                            </div>
                        )}
                        {debate.status === "finished" && (
                            <div className="chat-status-bar finished">
                                🏁 Este debate ha finalizado
                            </div>
                        )}
                        {!opponent && debate.status === "setup" && (
                            <div className="chat-status-bar setup">
                                👥 Esperando que tu oponente se una con el código: <strong>{debate.inviteCode}</strong>
                            </div>
                        )}

                        {canSend && opponent && (
                            <form onSubmit={sendMessage} className="chat-form">
                                <textarea
                                    className="chat-textarea"
                                    placeholder="Escribe tu argumento..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage(e);
                                        }
                                    }}
                                    rows={1}
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary send-btn"
                                    disabled={sending || !newMessage.trim()}
                                >
                                    {sending ? <span className="spinner" style={{ width: 16, height: 16 }}></span> : "➤"}
                                </button>
                            </form>
                        )}
                    </div>
                </main>

                {/* Toggle sidebar en mobile */}
                {!showDefinitions && (
                    <button
                        className="sidebar-toggle"
                        onClick={() => setShowDefinitions(true)}
                    >
                        📋 Info & Definiciones
                    </button>
                )}
            </div>

            <style jsx>{`
        .debate-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .debate-layout {
          display: grid;
          grid-template-columns: 300px 1fr;
          flex: 1;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        /* Sidebar */
        .debate-sidebar {
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-subtle);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .sidebar-section {
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--border-subtle);
        }

        .sidebar-title {
          font-size: var(--font-size-sm);
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: var(--spacing-md);
        }

        .debate-meta {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .meta-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: var(--font-size-xs);
        }

        .meta-label {
          color: var(--text-muted);
        }

        .invite-box {
          background: var(--bg-tertiary);
          border: 1px dashed var(--border-accent);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .invite-code-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-primary);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .invite-code-box:hover {
          border-color: var(--accent-primary);
        }

        .invite-code {
          font-family: monospace;
          font-size: var(--font-size-lg);
          font-weight: 700;
          letter-spacing: 2px;
          color: var(--accent-primary);
        }

        .copy-btn {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        .debate-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .new-def-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          padding: var(--spacing-sm);
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }

        .definitions-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .def-item {
          padding: var(--spacing-sm);
          background: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
        }

        .def-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2px;
        }

        .def-term {
          font-size: var(--font-size-sm);
          color: var(--accent-primary);
        }

        .def-text {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .def-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
          font-size: 10px;
          color: var(--text-muted);
        }

        /* Chat Area */
        .debate-chat {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--bg-primary);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-lg);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .message-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 75%;
        }

        .message-wrapper.own {
          align-self: flex-end;
        }

        .message-wrapper.other {
          align-self: flex-start;
        }

        .message-bubble {
          padding: var(--spacing-md);
          border-radius: var(--radius-lg);
          position: relative;
        }

        .own .message-bubble {
          background: linear-gradient(135deg, rgba(108, 92, 231, 0.25), rgba(108, 92, 231, 0.15));
          border: 1px solid rgba(108, 92, 231, 0.35);
          border-bottom-right-radius: var(--radius-sm);
        }

        .other .message-bubble {
          background: linear-gradient(135deg, rgba(0, 184, 148, 0.12), rgba(0, 184, 148, 0.06));
          border: 1px solid rgba(0, 184, 148, 0.2);
          border-bottom-left-radius: var(--radius-sm);
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xs);
        }

        .message-sender {
          font-size: var(--font-size-xs);
          font-weight: 600;
          color: var(--text-accent);
        }

        .other .message-sender {
          color: var(--accent-secondary);
        }

        .message-time {
          font-size: 10px;
          color: var(--text-muted);
        }

        .message-text {
          font-size: var(--font-size-sm);
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }

        /* AI Analysis Cards */
        .ai-analysis-card {
          margin-top: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-size: var(--font-size-xs);
        }

        .ai-analysis-card:hover {
          transform: translateY(-1px);
        }

        .severity-bg-none {
          background: rgba(0, 184, 148, 0.06);
          border: 1px solid rgba(0, 184, 148, 0.15);
        }

        .severity-bg-low {
          background: rgba(116, 185, 255, 0.06);
          border: 1px solid rgba(116, 185, 255, 0.15);
        }

        .severity-bg-medium {
          background: rgba(253, 203, 110, 0.06);
          border: 1px solid rgba(253, 203, 110, 0.15);
        }

        .severity-bg-high {
          background: rgba(255, 107, 107, 0.06);
          border: 1px solid rgba(255, 107, 107, 0.15);
        }

        .analyzing {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
        }

        .ai-analysis-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-weight: 600;
        }

        .ai-toggle {
          margin-left: auto;
          font-size: 10px;
          color: var(--text-muted);
        }

        .ai-summary {
          margin-top: var(--spacing-xs);
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .ai-details {
          margin-top: var(--spacing-sm);
        }

        .ai-issues {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-sm);
        }

        .ai-issue {
          padding: var(--spacing-sm);
          background: rgba(0, 0, 0, 0.2);
          border-radius: var(--radius-sm);
        }

        .issue-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          margin-bottom: 4px;
          font-weight: 600;
        }

        .issue-type {
          color: var(--text-muted);
          font-size: 10px;
          text-transform: uppercase;
        }

        .issue-name {
          color: var(--text-primary);
        }

        .issue-desc {
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 4px;
        }

        .issue-quote {
          margin: 4px 0;
          padding: 4px 8px;
          border-left: 2px solid var(--accent-warning);
          color: var(--text-secondary);
          font-style: italic;
          font-size: 11px;
        }

        .issue-suggestion {
          margin-top: 4px;
          padding: 4px 8px;
          background: rgba(0, 184, 148, 0.05);
          border-radius: 4px;
          color: var(--accent-success);
          font-size: 11px;
          line-height: 1.4;
        }

        .analyze-btn {
          align-self: flex-start;
          margin-top: 2px;
          font-size: 11px;
          opacity: 0.6;
        }

        .analyze-btn:hover {
          opacity: 1;
        }

        /* Chat Input */
        .chat-input-area {
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
        }

        .chat-status-bar {
          padding: var(--spacing-sm) var(--spacing-md);
          text-align: center;
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
        }

        .chat-status-bar.paused {
          background: rgba(253, 203, 110, 0.08);
          color: var(--accent-warning);
        }

        .chat-status-bar.finished {
          background: rgba(149, 149, 176, 0.08);
        }

        .chat-status-bar.setup {
          background: rgba(116, 185, 255, 0.08);
          color: var(--accent-info);
        }

        .chat-form {
          display: flex;
          align-items: flex-end;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
        }

        .chat-textarea {
          flex: 1;
          padding: var(--spacing-md);
          background: var(--bg-input);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          color: var(--text-primary);
          font-family: var(--font-family);
          font-size: var(--font-size-sm);
          resize: none;
          outline: none;
          min-height: 44px;
          max-height: 120px;
          transition: border-color var(--transition-fast);
        }

        .chat-textarea:focus {
          border-color: var(--accent-primary);
        }

        .send-btn {
          width: 44px;
          height: 44px;
          padding: 0;
          border-radius: var(--radius-full);
          font-size: var(--font-size-lg);
          flex-shrink: 0;
        }

        /* Sidebar Close Header (mobile only) */
        .sidebar-close-header {
          display: none;
        }

        /* Sidebar Overlay (mobile only) */
        .sidebar-overlay {
          display: none;
        }

        /* Sidebar Toggle Mobile */
        .sidebar-toggle {
          display: none;
        }

        @media (max-width: 768px) {
          .debate-layout {
            grid-template-columns: 1fr;
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 200;
          }

          .debate-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            z-index: 210;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            background: var(--bg-primary);
          }

          .debate-sidebar.open {
            transform: translateX(0);
          }

          .sidebar-close-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--spacing-lg);
            border-bottom: 1px solid var(--border-medium);
            background: var(--bg-secondary);
          }

          .sidebar-close-header span {
            font-size: var(--font-size-lg);
            font-weight: 700;
          }

          .sidebar-close-btn {
            padding: 0.6rem 1.4rem;
            background: rgba(255, 107, 107, 0.15);
            border: 1px solid rgba(255, 107, 107, 0.4);
            color: var(--accent-danger);
            border-radius: var(--radius-md);
            font-size: var(--font-size-base);
            font-weight: 600;
            cursor: pointer;
          }

          .sidebar-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-sm);
            position: fixed;
            bottom: var(--spacing-xl);
            left: 50%;
            transform: translateX(-50%);
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius-full);
            background: var(--gradient-primary);
            border: none;
            color: white;
            font-size: var(--font-size-base);
            font-weight: 600;
            cursor: pointer;
            z-index: 50;
            box-shadow: 0 4px 20px rgba(108, 92, 231, 0.4);
            white-space: nowrap;
          }

          .message-wrapper {
            max-width: 90%;
          }
        }
      `}</style>
        </div>
    );
}
