import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { getSessionUser } from "../../../lib/session";

// Registra uma pergunta feita por um usuário em um anúncio ativo.
export async function POST(request) {
    try {
        const user = await getSessionUser();

        if (!user) {
            return NextResponse.json(
                { message: "Você precisa estar logado para fazer uma pergunta." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const productId = body.productId;
        const questionText = String(body.questionText || "").trim();

        if (!productId || !questionText) {
            return NextResponse.json(
                { message: "Informe o anúncio e a pergunta." },
                { status: 400 }
            );
        }

        if (questionText.length < 5 || questionText.length > 500) {
            return NextResponse.json(
                { message: "A pergunta deve ter entre 5 e 500 caracteres." },
                { status: 400 }
            );
        }

        const productResult = await pool.query(
            "SELECT id, seller_id, status FROM products WHERE id = $1",
            [productId]
        );

        if (productResult.rows.length === 0) {
            return NextResponse.json(
                { message: "Anúncio não encontrado." },
                { status: 404 }
            );
        }

        const product = productResult.rows[0];

        // A validação no servidor impede perguntas em anúncios não aprovados ou pausados.
        if (product.status !== "ATIVO") {
            return NextResponse.json(
                { message: "Só é possível perguntar em anúncios ativos." },
                { status: 403 }
            );
        }

        // A regra evita que o vendedor crie perguntas falsas no próprio anúncio.
        if (product.seller_id === user.id) {
            return NextResponse.json(
                { message: "O vendedor não pode perguntar no próprio anúncio." },
                { status: 403 }
            );
        }

        const result = await pool.query(
            `
            INSERT INTO product_questions (product_id, buyer_id, question_text)
            VALUES ($1, $2, $3)
            RETURNING id, product_id, buyer_id, question_text, answer_text, created_at
            `,
            [productId, user.id, questionText]
        );

        return NextResponse.json(
            {
                message: "Pergunta enviada com sucesso.",
                question: result.rows[0],
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Erro ao criar pergunta:", error);

        return NextResponse.json(
            { message: "Erro interno ao criar pergunta." },
            { status: 500 }
        );
    }
}

// Permite que o vendedor do anúncio ou um administrador responda à pergunta.
export async function PUT(request) {
    try {
        const user = await getSessionUser();

        if (!user) {
            return NextResponse.json(
                { message: "Você precisa estar logado para responder." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const questionId = body.questionId;
        const answerText = String(body.answerText || "").trim();

        if (!questionId || !answerText) {
            return NextResponse.json(
                { message: "Informe a pergunta e a resposta." },
                { status: 400 }
            );
        }

        if (answerText.length < 3 || answerText.length > 500) {
            return NextResponse.json(
                { message: "A resposta deve ter entre 3 e 500 caracteres." },
                { status: 400 }
            );
        }

        const questionResult = await pool.query(
            `
            SELECT pq.id, p.seller_id
            FROM product_questions pq
            INNER JOIN products p ON pq.product_id = p.id
            WHERE pq.id = $1
            `,
            [questionId]
        );

        if (questionResult.rows.length === 0) {
            return NextResponse.json(
                { message: "Pergunta não encontrada." },
                { status: 404 }
            );
        }

        const question = questionResult.rows[0];

        // O vendedor é identificado pela sessão, apenas ele ou um ADMIN pode responder.
        if (question.seller_id !== user.id && user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Apenas o vendedor do anúncio pode responder essa pergunta." },
                { status: 403 }
            );
        }

        const result = await pool.query(
            `
            UPDATE product_questions
            SET answer_text = $1, answered_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id, question_text, answer_text, created_at, answered_at
            `,
            [answerText, questionId]
        );

        return NextResponse.json(
            {
                message: "Resposta enviada com sucesso.",
                question: result.rows[0],
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao responder pergunta:", error);

        return NextResponse.json(
            { message: "Erro interno ao responder pergunta." },
            { status: 500 }
        );
    }
}
