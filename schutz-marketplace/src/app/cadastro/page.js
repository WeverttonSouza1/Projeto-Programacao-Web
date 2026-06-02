"use client";

import Link from "next/link";

export default function Cadastro() {
    return (
        <main className="auth-modal-overlay">
            <div className="auth-modal">

                <Link href="/" className="auth-modal-close">
                    ✕
                </Link>

                <h1 className="auth-modal-title">
                    Criar nova conta
                </h1>

                <form className="auth-modal-form">
                    <input
                        type="text"
                        placeholder="Usuário"
                        required
                    />

                    <input
                        type="email"
                        placeholder="E-mail"
                        required
                    />

                    <div className="auth-modal-row">
                        <input
                            type="password"
                            placeholder="Senha"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirmar senha"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-modal-button"
                    >
                        CADASTRAR
                    </button>
                </form>

                <div className="auth-modal-links">
                    <Link href="/login">
                        Entrar em uma conta existente
                    </Link>

                    <a href="#">
                        Esqueci minha senha
                    </a>
                </div>

            </div>
        </main>
    );
}