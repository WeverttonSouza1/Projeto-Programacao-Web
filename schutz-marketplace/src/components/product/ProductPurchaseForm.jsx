"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

function formatPrice(value) {
    return Number(value || 0).toFixed(2).replace(".", ",");
}

export default function ProductPurchaseForm({ variants }) {
    const router = useRouter();
    const { user } = useAuth();
    const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || "");
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            if (!user) {
                setMessage("Faça login para adicionar itens ao carrinho.");
                return;
            }

            const response = await fetch("/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    variantId: selectedVariantId,
                    quantity: Number(quantity),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Erro ao adicionar ao carrinho.");
                return;
            }

            router.push("/carrinho");
        } catch (error) {
            setMessage("Erro ao conectar com o servidor.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="product-purchase-form" onSubmit={handleSubmit}>
            <label htmlFor="item-select">Escolha o Item:</label>
            <select
                id="item-select"
                className="market-input"
                value={selectedVariantId}
                onChange={(event) => setSelectedVariantId(event.target.value)}
                disabled={variants.length === 0}
            >
                {variants.length === 0 ? (
                    <option>Nenhuma opção disponível</option>
                ) : (
                    variants.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                            {variant.name} - R$ {formatPrice(variant.price)}
                        </option>
                    ))
                )}
            </select>

            <label htmlFor="quantity">Quantidade:</label>
            <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="market-input qty-input"
            />

            <button
                type="submit"
                className="btn btn-buy-custom"
                disabled={loading || variants.length === 0}
            >
                <svg
                    width="25"
                    height="17"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 22 22"
                    className="btn-icon"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
                {loading ? "Adicionando..." : "Adicionar ao Carrinho"}
            </button>

            {message && (
                <p className="purchase-message">
                    {message}
                </p>
            )}
        </form>
    );
}
