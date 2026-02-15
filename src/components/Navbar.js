"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();

    return (
        <nav className="navbar">
            <Link href={session ? "/dashboard" : "/"} className="navbar-brand">
                <span className="logo-icon">⚡</span>
                <span>DebateFlow</span>
            </Link>

            <div className="navbar-actions">
                {session ? (
                    <>
                        <div className="navbar-user">
                            <div className="navbar-avatar">
                                {session.user.name?.charAt(0).toUpperCase()}
                            </div>
                            <span>{session.user.name}</span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="btn btn-ghost btn-sm"
                        >
                            Cerrar sesión
                        </button>
                    </>
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
    );
}
