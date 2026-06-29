"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

function formatPrice(value) {
    return Number(value || 0).toFixed(2).replace(".", ",");
}

// Exibe o resumo da compra e controla a criação do pedido.
export default function Checkout() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("pix");
    const [loadingCart, setLoadingCart] = useState(true);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [message, setMessage] = useState("");
    const [order, setOrder] = useState(null);

    // Atualiza o resumo com os itens atuais do carrinho.
    async function loadCart() {
        setLoadingCart(true);
        setMessage("");

        try {
            const response = await fetch("/api/cart");
            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Erro ao buscar carrinho.");
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

    // Solicita à API a criação transacional do pedido e abre seu detalhe.
    async function handleCheckout(event) {
        event.preventDefault();
        setLoadingOrder(true);
        setMessage("");

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Erro ao finalizar compra.");
                return;
            }

            setOrder(data.order);
            setItems([]);
            setTotal(0);
            router.push(`/pedidos/${data.order.id}`);
        } catch (error) {
            setMessage("Erro ao conectar com o servidor.");
        } finally {
            setLoadingOrder(false);
        }
    }

    useEffect(() => {
        if (!user) {
            return;
        }

        let cancelled = false;

        // Carrega os dados necessários quando o checkout é aberto.
        async function loadInitialCart() {
            try {
                const response = await fetch("/api/cart");
                const data = await response.json();

                if (cancelled) {
                    return;
                }

                if (!response.ok) {
                    setMessage(data.message || "Erro ao buscar carrinho.");
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
                    <h1>Finalizar Pagamento</h1>
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
                    <h1>Finalizar Pagamento</h1>
                    <div className="cart-panel">
                        <p>Entre na sua conta para finalizar a compra.</p>
                        <Link href="/" className="btn">
                            Voltar para a home
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    if (order) {
        return (
            <main className="cart-page">
                <div className="container">
                    <h1>Pedido Criado</h1>
                    <div className="cart-panel checkout-success">
                        <p>Pedido: {order.id}</p>
                        <p>Total: R$ {formatPrice(order.total_amount)}</p>
                        <p>Status do pagamento: {order.payment_status}</p>

                        <div className="checkout-actions">
                            <Link href="/" className="btn">
                                Voltar para a home
                            </Link>
                            <Link href="/carrinho" className="btn btn-buy-custom">
                                Ver carrinho
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <div className="container">
                <h1>Finalizar Pagamento</h1>

                <div className="cart-panel">
                    {loadingCart ? (
                        <p>Carregando resumo da compra...</p>
                    ) : items.length === 0 ? (
                        <>
                            <p>Seu carrinho está vazio.</p>
                            <Link href="/carrinho" className="btn">
                                Voltar para o carrinho
                            </Link>
                        </>
                    ) : (
                        <form className="checkout-form" onSubmit={handleCheckout}>
                            <div className="checkout-summary">
                                <h2>Resumo</h2>
                                {items.map((item) => (
                                    <div className="checkout-line" key={item.cart_item_id}>
                                        <span>{item.quantity}x {item.title}</span>
                                        <strong>R$ {formatPrice(Number(item.price) * Number(item.quantity))}</strong>
                                    </div>
                                ))}
                                <div className="checkout-total">
                                    <span>Total</span>
                                    <strong>R$ {formatPrice(total)}</strong>
                                </div>
                            </div>

                            <div className="checkout-methods">
                                <label>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="pix"
                                        checked={paymentMethod === "pix"}
                                        onChange={(event) => setPaymentMethod(event.target.value)}
                                    />
                                    Pix
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={paymentMethod === "card"}
                                        onChange={(event) => setPaymentMethod(event.target.value)}
                                    />
                                    Cartão
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="btn checkout-submit"
                                disabled={loadingOrder}
                            >
                                {loadingOrder ? "Finalizando..." : "Confirmar Pagamento"}
                            </button>
                        </form>
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
