"use client";

import Link from "next/link";

export default function LoginModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal">
                <button className="auth-modal-close" onClick={onClose}>
                    ×
                </button>

                <h1 className="auth-modal-title">Entrar</h1>

                <form className="auth-modal-form" action="/dashboard">
                    <input type="email" placeholder="Usuário ou e-mail" required />
                    <input type="password" placeholder="Senha" required />

                    <button type="submit" className="auth-modal-button">
                        ENTRAR
                    </button>
                </form>

                <div className="auth-modal-links">
                    <Link href="/cadastro">Criar uma conta</Link>
                    <a href="#">Esqueci minha senha</a>
                </div>
            </div>
        </div>
    );
}