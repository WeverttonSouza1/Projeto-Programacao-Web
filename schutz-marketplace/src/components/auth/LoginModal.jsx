"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function LoginModal({ isOpen, onClose, onOpenRegister }) {
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    if (!isOpen) return null;

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    async function handleLoginSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Erro ao fazer login.");
                return;
            }

            // Salva o usuário no contexto global
            login(data.user);
            
            setMessage("Login realizado com sucesso!");
            
            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (error) {
            setMessage("Erro ao conectar com o servidor.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-modal-overlay" onClick={handleOverlayClick}>
            <div className="auth-modal">
                <button className="auth-modal-close" onClick={onClose}>×</button>

                <h1 className="auth-modal-title">Entrar</h1>

                <form className="auth-modal-form" onSubmit={handleLoginSubmit}>
                    <input 
                        type="text" 
                        placeholder="Usuário ou e-mail" 
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Senha" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />

                    {message && <p className="auth-modal-message">{message}</p>}

                    <button type="submit" className="auth-modal-button" disabled={loading}>
                        {loading ? "ENTRANDO..." : "ENTRAR"}
                    </button>
                </form>

                <div className="auth-modal-links">
                    <button type="button" className="auth-modal-link-button" onClick={onOpenRegister}>
                        Criar uma conta
                    </button>
                    <button type="button" className="auth-modal-link-button">
                        Esqueci minha senha
                    </button>
                </div>
            </div>
        </div>
    );
}