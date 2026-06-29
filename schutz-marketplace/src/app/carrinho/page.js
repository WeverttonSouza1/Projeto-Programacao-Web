"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function formatPrice(value) {
    return Number(value || 0).toFixed(2).replace(".", ",");
}

// Controla a listagem, atualização e remoção dos itens do carrinho.
export default function Carrinho() {
    const { user, loading: authLoading } = useAuth();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loadingCart, setLoadingCart] = useState(true);
    const [message, setMessage] = useState("");

    // Busca novamente o carrinho depois de uma alteração.
    async function loadCart() {
        setLoadingCart(true);
        setMessage("");

        try {
            const response = await fetch("/api/cart");
            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Erro ao buscar carrinho.");
                setItems([]);
                setTotal(0);
                return;
            }

            setItems(data.items || []);
            setTotal(data.total || 0);
        } catch (error) {
            setMessage("Erro ao conectar com o servidor.");
        } finally {
            setLoadingCart(false);
        }
    }

    // Envia a nova quantidade para a API, que valida propriedade e estoque.
    async function updateQuantity(itemId, quantity) {
        setMessage("");

        try {
            const response = await fetch("/api/cart", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    itemId,
                    quantity: Number(quantity),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Erro ao atualizar carrinho.");
                return;
            }

            setItems(data.items || []);
            setTotal(data.total || 0);
        } catch (error) {
            setMessage("Erro ao conectar com o servidor.");
        }
    }

    // Solicita a remoção do item e atualiza a lista exibida.
    async function removeItem(itemId) {
        setMessage("");

        try {
            const response = await fetch("/api/cart", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ itemId }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Erro ao remover item.");
                return;
            }

            setItems(data.items || []);
            setTotal(data.total || 0);
        } catch (error) {
            setMessage("Erro ao conectar com o servidor.");
        }
    }

    useEffect(() => {
        if (!user) {
            return;
        }

        let cancelled = false;

        // Carrega o carrinho quando a página é aberta.
        async function loadInitialCart() {
            try {
                const response = await fetch("/api/cart");
                const data = await response.json();

                if (cancelled) {
                    return;
                }

                if (!response.ok) {
                    setMessage(data.message || "Erro ao buscar carrinho.");
                    setItems([]);
                    setTotal(0);
                    return;
                }

                setItems(data.items || []);
                setTotal(data.total || 0);
            } catch (error) {
                if (!cancelled) {
                    setMessage("Erro ao conectar com o servidor.");
                }
            } finally {
                if (!cancelled) {
                    setLoadingCart(false);
                }
            }
        }

        loadInitialCart();

        return () => {
            cancelled = true;
        };
    }, [user]);

    if (authLoading) {
        return (
            <main className="cart-page">
                <div className="container">
                    <h1>Seu Carrinho</h1>
                    <div className="cart-panel">
                        <p>Carregando...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="cart-page">
                <div className="container">
                    <h1>Seu Carrinho</h1>
                    <div className="cart-panel">
                        <p>Entre na sua conta para acessar o carrinho.</p>
                        <Link href="/" className="btn">
                            Voltar para a home
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <div className="container">
                <h1>Seu Carrinho</h1>

                <div className="cart-panel">
                    {loadingCart ? (
                        <p>Carregando carrinho...</p>
                    ) : items.length === 0 ? (
                        <p>Seu carrinho está vazio.</p>
                    ) : (
                        <>
                            <div className="cart-list">
                                {items.map((item) => (
                                    <div className="cart-item" key={item.cart_item_id}>
                                        <img
                                            className="cart-item-image"
                                            src={item.image_url || "/temporaria.webp"}
                                            alt={item.title}
                                        />

                                        <div className="cart-item-info">
                                            <h2>{item.title}</h2>
                                            <p>{item.variant_name}</p>
                                            <p>Vendedor: {item.seller_name}</p>
                                            <p>R$ {formatPrice(item.price)}</p>
                                        </div>

                                        <div className="cart-item-actions">
                                            <input
                                                type="number"
                                                className="market-input cart-quantity"
                                                min="1"
                                                max={item.stock}
                                                value={item.quantity}
                                                onChange={(event) =>
                                                    updateQuantity(item.cart_item_id, event.target.value)
                                                }
                                            />

                                            <button
                                                type="button"
                                                className="btn cart-remove"
                                                onClick={() => removeItem(item.cart_item_id)}
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-summary">
                                <h2>Total: R$ {formatPrice(total)}</h2>
                                <Link href="/checkout" className="btn">
                                    Finalizar Compra
                                </Link>
                            </div>
                        </>
                    )}

                    {message && (
                        <p className="cart-message">
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </main>
    );
}
