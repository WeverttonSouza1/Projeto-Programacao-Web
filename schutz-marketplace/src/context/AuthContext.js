"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({});

// Mantém os dados públicos da sessão disponíveis para os componentes do front-end.
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        // Confirma a sessão pela API; o front-end não lê nem valida o JWT diretamente.
        async function loadSession() {
            try {
                const response = await fetch("/api/auth/me");
                const data = await response.json();

                if (cancelled) {
                    return;
                }

                if (response.ok) {
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadSession();

        return () => {
            cancelled = true;
        };
    }, []);

    // Atualiza a interface depois que a API de login cria o cookie protegido.
    const login = (userData) => {
        if (!userData?.id) {
            return;
        }

        setUser(userData);
    };

    // Solicita à API que apague o cookie e limpa os dados locais da interface.
    const logout = async () => {
        await fetch("/api/auth/logout", {
            method: "POST",
        });

        setUser(null);
        window.location.href = "/";
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
