"use client";

import { useEffect, useState } from "react";

// Exibe o histórico e controla o envio de mensagens do pedido.
export default function OrderChat({ orderId }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [feedback, setFeedback] = useState("");

    // Recarrega o histórico de mensagens após uma ação do usuário.
    async function loadMessages() {
        try {
            const response = await fetch(`/api/orders/${orderId}/chat`);
            const data = await response.json();

            if (!response.ok) {
                setFeedback(data.message || "Erro ao buscar mensagens.");
                return;
            }

            setMessages(data.messages || []);
        } catch (error) {
            setFeedback("Erro ao conectar com o servidor.");
        } finally {
            setLoading(false);
        }
    }

    // Envia a mensagem para a API e atualiza o chat com o histórico retornado.
    async function handleSubmit(event) {
        event.preventDefault();
        setSending(true);
        setFeedback("");

        try {
            const response = await fetch(`/api/orders/${orderId}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();

            if (!response.ok) {
                setFeedback(data.message || "Erro ao enviar mensagem.");
                return;
            }

            setMessage("");
            setMessages(data.messages || []);
        } catch (error) {
            setFeedback("Erro ao conectar com o servidor.");
        } finally {
            setSending(false);
        }
    }

    useEffect(() => {
        let cancelled = false;

        // Carrega o histórico quando o componente abre ou o pedido muda.
        async function loadInitialMessages() {
            try {
                const response = await fetch(`/api/orders/${orderId}/chat`);
                const data = await response.json();

                if (cancelled) {
                    return;
                }

                if (!response.ok) {
                    setFeedback(data.message || "Erro ao buscar mensagens.");
                    return;
                }

                setMessages(data.messages || []);
            } catch (error) {
                if (!cancelled) {
                    setFeedback("Erro ao conectar com o servidor.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadInitialMessages();

        return () => {
            cancelled = true;
        };
    }, [orderId]);

    return (
        <section className="dashboard-card order-chat">
            <h2>Chat pós-compra</h2>

            <div className="chat-messages">
                {loading ? (
                    <p>Carregando mensagens...</p>
                ) : messages.length === 0 ? (
                    <p>Nenhuma mensagem enviada ainda.</p>
                ) : (
                    messages.map((chatMessage) => (
                        <div className="chat-message" key={chatMessage.id}>
                            <strong>{chatMessage.sender_name}</strong>
                            <p>{chatMessage.message}</p>
                            <small>
                                {new Date(chatMessage.created_at).toLocaleString("pt-BR")}
                            </small>
                        </div>
                    ))
                )}
            </div>

            <form className="chat-form" onSubmit={handleSubmit}>
                <textarea
                    className="market-input"
                    placeholder="Digite sua mensagem"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    minLength={2}
                    maxLength={1000}
                    required
                />

                <button type="submit" className="btn" disabled={sending}>
                    {sending ? "Enviando..." : "Enviar mensagem"}
                </button>
            </form>

            {feedback && <p className="dashboard-feedback">{feedback}</p>}
        </section>
    );
}
