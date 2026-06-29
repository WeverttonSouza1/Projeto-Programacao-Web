import { NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { getSessionUser } from "../../../../lib/session";

// Confirma a sessão e devolve somente dados públicos do usuário ainda ativo no banco.
export async function GET() {
    try {
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json(
                { message: "Usuário não autenticado." },
                { status: 401 }
            );
        }

        // A nova consulta impede que um usuário desativado continue usando um token antigo.
        // Também seleciona campos específicos para nunca retornar password_hash.
        const result = await pool.query(
            `
            SELECT id, name, email, role, status, created_at
            FROM users
            WHERE id = $1 AND status = 'ATIVO'
            `,
            [sessionUser.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: "Usuário não autenticado." },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { user: result.rows[0] },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao buscar sessão:", error);

        return NextResponse.json(
            { message: "Erro interno ao buscar sessão." },
            { status: 500 }
        );
    }
}
