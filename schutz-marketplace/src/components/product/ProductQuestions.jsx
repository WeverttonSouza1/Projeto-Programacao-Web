"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

// Controla perguntas dos compradores e respostas do vendedor no anúncio.
export default function ProductQuestions({ productId, sellerId, questions }) {
    const router = useRouter();
    const { user } = useAuth();
    const [questionText, setQuestionText] = useState("");
    const [answers, setAnswers] = useState({});
    const [loadingQuestion, setLoadingQuestion] = useState(false);
    const [loadingAnswerId, setLoadingAnswerId] = useState(null);
    const [message, setMessage] = useState("");

    const canAsk = user && user.id !== sellerId;
    const canAnswer = user && (user.id === sellerId || user.role === "ADMIN");

    // Valida pelo formulário e envia uma nova pergunta para a API.
    async function handleQuestionSubmit(event) {
        event.preventDefault();
        setLoadingQuestion(true);
        setMessage("");

        try {
            const response = await fetch("/api/questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId,
                    questionText,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Erro ao enviar pergunta.");
                return;
            }

            setQuestionText("");
            setMessage("Pergunta enviada com sucesso.");
            router.refresh();
        } catch (error) {
            setMessage("Erro ao conectar com o servidor.");
        } finally {
            setLoadingQuestion(false);
        }
    }

    // Envia a resposta; a API confirma se o usuário é vendedor ou administrador.
    async function handleAnswerSubmit(event, questionId) {
        event.preventDefault();
        setLoadingAnswerId(questionId);
        setMessage("");

        try {
            const response = await fetch("/api/questions", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    questionId,
                    answerText: answers[questionId],
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Erro ao enviar resposta.");
                return;
            }

            setAnswers((currentAnswers) => ({
                ...currentAnswers,
                [questionId]: "",
            }));
            setMessage("Resposta enviada com sucesso.");
            router.refresh();
        } catch (error) {
            setMessage("Erro ao conectar com o servidor.");
        } finally {
            setLoadingAnswerId(null);
        }
    }

    return (
        <div className="questions-box">
            {questions.length === 0 ? (
                <p className="empty-text">
                    Nenhuma pergunta feita ainda.
                </p>
            ) : (
                questions.map((question) => (
                    <div className="question-item" key={question.id}>
                        <strong>{question.buyer_name}</strong>
                        <p>{question.question_text}</p>

                        {question.answer_text ? (
                            <div className="answer-item">
                                <strong>Vendedor</strong>
                                <p>{question.answer_text}</p>
                            </div>
                        ) : (
                            canAnswer && (
                                <form
                                    className="question-form answer-form"
                                    onSubmit={(event) => handleAnswerSubmit(event, question.id)}
                                >
                                    <textarea
                                        className="market-input question-textarea"
                                        placeholder="Responder pergunta"
                                        value={answers[question.id] || ""}
                                        onChange={(event) =>
                                            setAnswers((currentAnswers) => ({
                                                ...currentAnswers,
                                                [question.id]: event.target.value,
                                            }))
                                        }
                                        minLength={3}
                                        maxLength={500}
                                        required
                                    />

                                    <button
                                        type="submit"
                                        className="btn question-submit"
                                        disabled={loadingAnswerId === question.id}
                                    >
                                        {loadingAnswerId === question.id ? "Enviando..." : "Responder"}
                                    </button>
                                </form>
                            )
                        )}
                    </div>
                ))
            )}

            {canAsk ? (
                <form className="question-form" onSubmit={handleQuestionSubmit}>
                    <textarea
                        className="market-input question-textarea"
                        placeholder="Escreva sua pergunta para o vendedor"
                        value={questionText}
                        onChange={(event) => setQuestionText(event.target.value)}
                        minLength={5}
                        maxLength={500}
                        required
                    />

                    <button
                        type="submit"
                        className="btn question-submit"
                        disabled={loadingQuestion}
                    >
                        {loadingQuestion ? "Enviando..." : "Enviar pergunta"}
                    </button>
                </form>
            ) : (
                <p className="login-warning">
                    {user
                        ? "Vendedores não podem perguntar no próprio anúncio."
                        : "Você precisa estar logado para fazer uma pergunta."}
                </p>
            )}

            {message && (
                <p className="question-message">
                    {message}
                </p>
            )}
        </div>
    );
}
