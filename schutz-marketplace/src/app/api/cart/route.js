import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import { getSessionUser } from "../../../lib/session";

// Busca os itens do carrinho e calcula o valor total para o usuário informado.
async function getCartData(userId) {
    const result = await pool.query(
        `
        SELECT
            ci.id AS cart_item_id,
            ci.quantity,
            pv.id AS variant_id,
            pv.name AS variant_name,
            pv.price,
            pv.stock,
            p.id AS product_id,
            p.title,
            p.status,
            u.name AS seller_name,
            pi.image_url
        FROM cart_items ci
        INNER JOIN product_variants pv ON ci.variant_id = pv.id
        INNER JOIN products p ON pv.product_id = p.id
        INNER JOIN users u ON p.seller_id = u.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = TRUE
        WHERE ci.user_id = $1
        ORDER BY ci.created_at DESC
        `,
        [userId]
    );

    const items = result.rows;
    const total = items.reduce((sum, item) => {
        return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    return {
        items,
        total,
    };
}

// Retorna o carrinho completo do usuário que está autenticado.
export async function GET() {
    try {
        const user = await getSessionUser();

        // A sessão é validada no servidor; não confiamos no estado de login do navegador.
        if (!user) {
            return NextResponse.json(
                { message: "Você precisa estar logado para acessar o carrinho." },
                { status: 401 }
            );
        }

        const cart = await getCartData(user.id);

        return NextResponse.json(cart, { status: 200 });
    } catch (error) {
        console.error("Erro ao buscar carrinho:", error);

        return NextResponse.json(
            { message: "Erro interno ao buscar carrinho." },
            { status: 500 }
        );
    }
}

// Adiciona uma variação ao carrinho depois de validar anúncio e estoque.
export async function POST(request) {
    try {
        const user = await getSessionUser();

        if (!user) {
            return NextResponse.json(
                { message: "Você precisa estar logado para adicionar itens." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const variantId = body.variantId;
        const quantity = Number(body.quantity || 1);

        if (!variantId || !Number.isInteger(quantity) || quantity <= 0) {
            return NextResponse.json(
                { message: "Informe o item e uma quantidade válida." },
                { status: 400 }
            );
        }

        const variantResult = await pool.query(
            `
            SELECT pv.id, pv.stock, p.status
            FROM product_variants pv
            INNER JOIN products p ON pv.product_id = p.id
            WHERE pv.id = $1
            `,
            [variantId]
        );

        if (variantResult.rows.length === 0) {
            return NextResponse.json(
                { message: "Item não encontrado." },
                { status: 404 }
            );
        }

        const variant = variantResult.rows[0];

        // Um anúncio pendente, pausado ou removido não pode ser comprado pela API.
        if (variant.status !== "ATIVO") {
            return NextResponse.json(
                { message: "Esse anúncio ainda não está disponível para compra." },
                { status: 403 }
            );
        }

        if (quantity > variant.stock) {
            return NextResponse.json(
                { message: "Quantidade maior que o estoque disponível." },
                { status: 400 }
            );
        }

        const existingItem = await pool.query(
            `
            SELECT id, quantity
            FROM cart_items
            WHERE user_id = $1 AND variant_id = $2
            LIMIT 1
            `,
            [user.id, variantId]
        );

        if (existingItem.rows.length > 0) {
            const newQuantity = Number(existingItem.rows[0].quantity) + quantity;

            if (newQuantity > variant.stock) {
                return NextResponse.json(
                    { message: "O carrinho ultrapassa o estoque disponível." },
                    { status: 400 }
                );
            }

            await pool.query(
                "UPDATE cart_items SET quantity = $1 WHERE id = $2",
                [newQuantity, existingItem.rows[0].id]
            );
        } else {
            await pool.query(
                `
                INSERT INTO cart_items (user_id, variant_id, quantity)
                VALUES ($1, $2, $3)
                `,
                [user.id, variantId, quantity]
            );
        }

        const cart = await getCartData(user.id);

        return NextResponse.json(
            {
                message: "Item adicionado ao carrinho.",
                ...cart,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Erro ao adicionar item ao carrinho:", error);

        return NextResponse.json(
            { message: "Erro interno ao adicionar item ao carrinho." },
            { status: 500 }
        );
    }
}

// Altera a quantidade de um item que pertence ao carrinho do usuário.
export async function PUT(request) {
    try {
        const user = await getSessionUser();

        if (!user) {
            return NextResponse.json(
                { message: "Você precisa estar logado para alterar o carrinho." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const itemId = body.itemId;
        const quantity = Number(body.quantity);

        if (!itemId || !Number.isInteger(quantity) || quantity <= 0) {
            return NextResponse.json(
                { message: "Informe o item e uma quantidade válida." },
                { status: 400 }
            );
        }

        const itemResult = await pool.query(
            `
            SELECT ci.id, pv.stock
            FROM cart_items ci
            INNER JOIN product_variants pv ON ci.variant_id = pv.id
            -- user_id impede que alguém altere um item pertencente a outro carrinho.
            WHERE ci.id = $1 AND ci.user_id = $2
            `,
            [itemId, user.id]
        );

        if (itemResult.rows.length === 0) {
            return NextResponse.json(
                { message: "Item do carrinho não encontrado." },
                { status: 404 }
            );
        }

        const item = itemResult.rows[0];

        if (quantity > item.stock) {
            return NextResponse.json(
                { message: "Quantidade maior que o estoque disponível." },
                { status: 400 }
            );
        }

        await pool.query(
            "UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3",
            [quantity, itemId, user.id]
        );

        const cart = await getCartData(user.id);

        return NextResponse.json(
            {
                message: "Carrinho atualizado.",
                ...cart,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao atualizar carrinho:", error);

        return NextResponse.json(
            { message: "Erro interno ao atualizar carrinho." },
            { status: 500 }
        );
    }
}

// Remove um item do carrinho sem permitir a exclusão de itens de outro usuário.
export async function DELETE(request) {
    try {
        const user = await getSessionUser();

        if (!user) {
            return NextResponse.json(
                { message: "Você precisa estar logado para remover itens." },
                { status: 401 }
            );
        }

        const body = await request.json();
        const itemId = body.itemId;

        if (!itemId) {
            return NextResponse.json(
                { message: "Informe o item do carrinho." },
                { status: 400 }
            );
        }

        const result = await pool.query(
            // A condição user_id protege contra exclusão de itens de outro usuário.
            "DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id",
            [itemId, user.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: "Item do carrinho não encontrado." },
                { status: 404 }
            );
        }

        const cart = await getCartData(user.id);

        return NextResponse.json(
            {
                message: "Item removido do carrinho.",
                ...cart,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao remover item do carrinho:", error);

        return NextResponse.json(
            { message: "Erro interno ao remover item do carrinho." },
            { status: 500 }
        );
    }
}
