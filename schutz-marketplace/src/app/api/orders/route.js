import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { getSessionUser } from "../../../lib/session";

// Cria um erro com status HTTP para cancelar a transação com uma resposta adequada.
function createApiError(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

// Finaliza o carrinho em uma transação, cria o pedido e atualiza o estoque.
export async function POST() {
    const user = await getSessionUser();

    if (!user) {
        return NextResponse.json(
            { message: "Você precisa estar logado para finalizar a compra." },
            { status: 401 }
        );
    }

    // Uma conexão exclusiva permite executar toda a compra na mesma transação.
    const client = await pool.connect();

    try {
        // BEGIN inicia a transação: ou todas as alterações acontecem, ou nenhuma acontece.
        await client.query("BEGIN");

        const cartResult = await client.query(
            `
            SELECT
                ci.id AS cart_item_id,
                ci.quantity,
                pv.id AS variant_id,
                pv.price,
                pv.stock,
                p.status,
                p.title
            FROM cart_items ci
            INNER JOIN product_variants pv ON ci.variant_id = pv.id
            INNER JOIN products p ON pv.product_id = p.id
            WHERE ci.user_id = $1
            -- Bloqueia temporariamente as variações para duas compras não usarem o mesmo estoque.
            FOR UPDATE OF pv
            `,
            [user.id]
        );

        const cartItems = cartResult.rows;

        if (cartItems.length === 0) {
            throw createApiError("Seu carrinho está vazio.", 400);
        }

        for (const item of cartItems) {
            if (item.status !== "ATIVO") {
                throw createApiError(`O anúncio "${item.title}" não está disponível.`, 400);
            }

            if (Number(item.quantity) > Number(item.stock)) {
                throw createApiError(`Estoque insuficiente para "${item.title}".`, 400);
            }
        }

        const total = cartItems.reduce((sum, item) => {
            return sum + Number(item.price) * Number(item.quantity);
        }, 0);

        const orderResult = await client.query(
            `
            INSERT INTO orders (buyer_id, total_amount, payment_status, order_status)
            VALUES ($1, $2, 'PENDENTE', 'ABERTO')
            RETURNING id, total_amount, payment_status, order_status, created_at
            `,
            [user.id, total]
        );

        const order = orderResult.rows[0];

        for (const item of cartItems) {
            await client.query(
                `
                INSERT INTO order_items (order_id, variant_id, unit_price, quantity)
                VALUES ($1, $2, $3, $4)
                `,
                [order.id, item.variant_id, item.price, item.quantity]
            );

            await client.query(
                `
                UPDATE product_variants
                SET stock = stock - $1
                WHERE id = $2
                `,
                [item.quantity, item.variant_id]
            );
        }

        await client.query(
            "DELETE FROM cart_items WHERE user_id = $1",
            [user.id]
        );

        // COMMIT confirma pedido, itens, estoque e limpeza do carrinho juntos.
        await client.query("COMMIT");

        return NextResponse.json(
            {
                message: "Pedido criado com sucesso.",
                order,
            },
            { status: 201 }
        );
    } catch (error) {
        // Em qualquer erro, ROLLBACK desfaz tudo e evita um pedido gravado pela metade.
        await client.query("ROLLBACK");

        if (error.status) {
            return NextResponse.json(
                { message: error.message },
                { status: error.status }
            );
        }

        console.error("Erro ao finalizar compra:", error);

        return NextResponse.json(
            { message: "Erro interno ao finalizar compra." },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
