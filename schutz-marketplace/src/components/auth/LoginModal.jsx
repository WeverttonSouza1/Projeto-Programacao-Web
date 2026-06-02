"use client";

import Link from "next/link";

export default function LoginModal({ isOpen, onClose, onOpenRegister }) {
    if (!isOpen) return null;

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    return (
        <div className="auth-modal-overlay" onClick={handleOverlayClick}>
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
                    <button
                        type="button"
                        className="auth-modal-link-button"
                        onClick={onOpenRegister}
                    >
                        Criar uma conta
                    </button>
                    <button
                        type="button"
                        className="auth-modal-link-button"
                    >
                        Esqueci minha senha
                    </button>
                </div>
            </div>
        </div>
    );
}