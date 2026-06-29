import { NextResponse } from "next/server";
import pool from "../../../../../lib/db";
import { getSessionUser } from "../../../../../lib/session";

// Confere se o usuário é comprador, vendedor ou administrador do pedido.
async function canAccessOrder(orderId, userId, role) {
    const result = await pool.query(
        `
        SELECT o.id
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN product_variants pv ON oi.variant_id = pv.id
        LEFT JOIN products p ON pv.product_id = p.id
        WHERE o.id = $1
          AND (
              o.buyer_id = $2
              OR p.seller_id = $2
              OR $3 = 'ADMIN'
          )
        LIMIT 1
        `,
        // O ID e o papel vêm do JWT validado, não de valores enviados pelo front-end.
        [orderId, userId, role]
    );

    return result.rows.length > 0;
}

// Busca as mensagens do pedido em ordem cronológica.
async function getMessages(orderId) {
    const result = await pool.query(
        `
        SELECT
            oc.id,
            oc.message,
            oc.created_at,
            u.name AS sender_name
        FROM order_chats oc
        INNER JOIN users u ON oc.sender_id = u.id
        WHERE oc.order_id = $1
        ORDER BY oc.created_at ASC
        `,
        [orderId]
    );

    return result.rows;
}

// Retorna o histórico do chat somente para participantes autorizados.
export async function GET(request, { params }) {
    try {
        const user = await getSessionUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json(
                { message: "Você precisa estar logado." },
                { status: 401 }
            );
        }

        // A API verifica a permissão mesmo que alguém tente chamar a rota manualmente.
        if (!(await canAccessOrder(id, user.id, user.role))) {
            return NextResponse.json(
                { message: "Pedido não encontrado ou sem permissão." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { messages: await getMessages(id) },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao buscar chat:", error);

        return NextResponse.json(
            { message: "Erro interno ao buscar chat." },
            { status: 500 }
        );
    }
}

// Valida e salva uma nova mensagem no chat pós-compra.
export async function POST(request, { params }) {
    try {
        const user = await getSessionUser();
        const { id } = await params;

        if (!user) {
            return NextResponse.json(
                { message: "Você precisa estar logado." },
                { status: 401 }
            );
        }

        // Repeti a autorização no POST para impedir mensagens em pedidos de terceiros.
        if (!(await canAccessOrder(id, user.id, user.role))) {
            return NextResponse.json(
                { message: "Pedido não encontrado ou sem permissão." },
                { status: 404 }
            );
        }

        const body = await request.json();
        // O limite evita mensagens vazias e cargas excessivamente grandes no banco.
        const message = String(body.message || "").trim();

        if (message.length < 2 || message.length > 1000) {
            return NextResponse.json(
                { message: "A mensagem deve ter entre 2 e 1000 caracteres." },
                { status: 400 }
            );
        }

        await pool.query(
            `
            INSERT INTO order_chats (order_id, sender_id, message)
            VALUES ($1, $2, $3)
            `,
            [id, user.id, message]
        );

        return NextResponse.json(
            {
                message: "Mensagem enviada.",
                messages: await getMessages(id),
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Erro ao enviar mensagem:", error);

        return NextResponse.json(
            { message: "Erro interno ao enviar mensagem." },
            { status: 500 }
        );
    }
}
