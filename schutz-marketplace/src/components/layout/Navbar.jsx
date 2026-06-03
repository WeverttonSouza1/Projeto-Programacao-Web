"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import LoginModal from "../auth/LoginModal";
import RegisterModal from "../auth/RegisterModal";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth(); // HOOK DE AUTENTICAÇÃO
    const [open, setOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);

    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        function onDocClick(e) {
            if (!open) return;

            if (triggerRef.current?.contains(e.target)) return;
            if (menuRef.current?.contains(e.target)) return;

            setOpen(false);
        }

        function onKey(e) {
            if (e.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("click", onDocClick);
        document.addEventListener("keydown", onKey);

        return () => {
            document.removeEventListener("click", onDocClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <header className="schutz-navbar">
            <div className="schutz-nav-left">
                <Link href="/" className="schutz-logo">
                    <span className="text-logo">SCHUTZ</span>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="schutz-nav-center">
                <div className="schutz-search-box">
                    <span className="schutz-search-icon">
                        <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </span>

                    <input
                        type="text"
                        placeholder="Anúncio, usuário ou categoria..."
                    />

                    <span className="schutz-search-hotkey">P</span>
                </div>
            </div>

            <div className="schutz-nav-right">
                <nav className="schutz-nav-links">
                    <Link href="/categorias" className="schutz-link">
                        Categorias <span className="arrow">▼</span>
                    </Link>
                </nav>

                <div className="schutz-nav-actions">

                        {user ? (
                            <Link
                                href="/anunciar"
                                className="schutz-btn-anunciar"
                            >
                                Anunciar
                            </Link>
                        ) : (
                            <>
                                <button
                                    onClick={() => setLoginOpen(true)}
                                    className="schutz-btn-anunciar"
                                >
                                    Anunciar
                                </button>
                            </>
                        )}

                    
                    {/* Carrinho Icon */}
                    <Link
                        href="/carrinho"
                        className="schutz-carrinho"
                    >
                        <button className="schutz-icon-btn">
                            <svg
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                        </button>
                    </Link>

                    <button
                        ref={triggerRef}
                        className="schutz-icon-btn"
                        onClick={() => setOpen(!open)}
                    >
                        <svg
                            width="18"
                            height="18"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    
                    {/* Menu Hamburguer Lateral/Flutuante */}
                    <div
                        ref={menuRef}
                        id="external-menu"
                        className={open ? "external-menu open" : "external-menu"}
                    >
                        {/* adicionar div com foto de perfil no menu*/}
                        {!user ? ( // se logado, mostrar nome e link para dashboard, se não, mostrar botão de login
                            <button
                                type="button"
                                onClick={() => setLoginOpen(true)}
                                className="menu-login-button"
                            >
                                Entrar
                            </button>
                        ) : (
                            <>
                                <span className="external-menu user-menu">
                                    Olá, {user.name}
                                </span>
                            </>
                        )}

                        <Link href="/">Home</Link>
                        <Link href="/carrinho">Carrinho</Link>
                        <Link href="/categorias">Categorias</Link>

                        {!user ? (
                            null
                        ) : (
                            <>
                                <Link href="/dashboard">Meus Anúncios</Link>
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="external-menu menu-login-button"
                                >
                                    Sair
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <LoginModal
                isOpen={loginOpen}
                onClose={() => setLoginOpen(false)}
                onOpenRegister={() => {
                    setLoginOpen(false);
                    setRegisterOpen(true);
                }}
            />

            <RegisterModal
                isOpen={registerOpen}
                onClose={() => setRegisterOpen(false)}
                onOpenLogin={() => {
                    setRegisterOpen(false);
                    setLoginOpen(true);
                }}
            />
        </header>
    );
}