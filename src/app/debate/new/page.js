"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function NewDebatePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/debates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, topic, description }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error);
                return;
            }

            router.push(`/debate/${data.debate.id}`);
        } catch (err) {
            setError("Error al crear el debate");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <Navbar />

            <div className="container" style={{ paddingTop: "var(--spacing-2xl)", maxWidth: "640px" }}>
                <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800, marginBottom: "var(--spacing-sm)" }}>
                    Nuevo Debate
                </h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "var(--spacing-2xl)" }}>
                    Define el tema y crea un espacio para debatir con rigor
                </p>

                <div className="auth-card">
                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="title">
                                Título del Debate
                            </label>
                            <input
                                id="title"
                                type="text"
                                className="form-input"
                                placeholder='Ej: "Metodología en Ciencias Sociales"'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="topic">
                                Tema o Pregunta Central
                            </label>
                            <input
                                id="topic"
                                type="text"
                                className="form-input"
                                placeholder='Ej: "¿Deberían las ciencias sociales adoptar métodos más empíricos?"'
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="description">
                                Descripción (opcional)
                            </label>
                            <textarea
                                id="description"
                                className="form-input"
                                placeholder="Contexto adicional, reglas especiales, expectativas..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Creando...
                                </>
                            ) : (
                                "🚀 Crear Debate"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
