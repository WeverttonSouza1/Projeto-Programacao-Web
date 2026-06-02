"use client";

import { useState } from "react";

export default function RegisterModal({ isOpen, onClose, onOpenLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    if (!isOpen) return null;

    function handleOverlayClick(e) {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Erro ao cadastrar.");
                return;
            }

            setMessage("Conta criada com sucesso!");

            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                onClose();

                if (onOpenLogin) {
                    onOpenLogin();
                }
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
                <button className="auth-modal-close" onClick={onClose}>
                    ×
                </button>

                <h1 className="auth-modal-title">Criar nova conta</h1>

                <form className="auth-modal-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Usuário"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="auth-modal-row">
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirmar senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {message && (
                        <p className="auth-modal-message">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="auth-modal-button"
                        disabled={loading}
                    >
                        {loading ? "CADASTRANDO..." : "CADASTRAR"}
                    </button>
                </form>

                <div className="auth-modal-links">
                    <button
                        type="button"
                        onClick={onOpenLogin}
                        className="auth-modal-link-button"
                    >
                        Entrar em uma conta existente
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