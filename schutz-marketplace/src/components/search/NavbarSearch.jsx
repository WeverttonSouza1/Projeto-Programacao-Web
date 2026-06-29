"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Controla o campo de pesquisa da navbar e direciona para a página de resultados.
export default function NavbarSearch() {
    const router = useRouter();
    const [query, setQuery] = useState("");

    // Converte o texto digitado em um parâmetro seguro para a URL de busca.
    function handleSubmit(event) {
        event.preventDefault();
        const trimmedQuery = query.trim();

        if (!trimmedQuery) {
            router.push("/busca");
            return;
        }

        router.push(`/busca?q=${encodeURIComponent(trimmedQuery)}`);
    }

    return (
        <form className="schutz-search-box" onSubmit={handleSubmit}>
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
                type="search"
                placeholder="Anúncio, usuário ou categoria..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
            />

            <button type="submit" className="schutz-search-submit">
                Buscar
            </button>
        </form>
    );
}
