"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    // Show back button on inner pages (not landing or dashboard)
    const isInnerPage = pathname !== "/" && pathname !== "/dashboard";

    return (
        <nav className="navbar">
            <div className="navbar-left">
                {isInnerPage && session && (
                    <Link href="/dashboard" className="back-btn">
                        ← Volver
                    </Link>
                )}
                <Link href={session ? "/dashboard" : "/"} className="navbar-brand">
                    <span className="logo-icon">⚡</span>
                    <span>DebateFlow</span>
                </Link>
            </div>

            <div className="navbar-actions">
                {session ? (
                    <>
                        <div className="navbar-user">
                            <div className="navbar-avatar">
                                {session.user.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="navbar-username">{session.user.name}</span>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="btn btn-ghost btn-sm"
                        >
                            Salir
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
