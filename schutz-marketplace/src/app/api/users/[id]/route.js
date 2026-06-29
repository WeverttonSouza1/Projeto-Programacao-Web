import { NextResponse } from "next/server";
import pool from "../../../../lib/db";

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { message: "Informe o usuário." },
                { status: 400 }
            );
        }

        const userResult = await pool.query(
            `
            SELECT id, name, role, status, created_at
            FROM users
            WHERE id = $1
            `,
            [id]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { message: "Usuário não encontrado." },
                { status: 404 }
            );
        }

        const productsResult = await pool.query(
            `
            SELECT
                p.id,
                p.title,
                pi.image_url,
                MIN(pv.price) AS min_price
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = TRUE
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            WHERE p.seller_id = $1 AND p.status = 'ATIVO'
            GROUP BY p.id, p.title, pi.image_url
            ORDER BY p.created_at DESC
            `,
            [id]
        );

        return NextResponse.json(
            {
                user: userResult.rows[0],
                products: productsResult.rows,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao buscar perfil público:", error);

        return NextResponse.json(
            { message: "Erro interno ao buscar perfil." },
            { status: 500 }
        );
    }
}
