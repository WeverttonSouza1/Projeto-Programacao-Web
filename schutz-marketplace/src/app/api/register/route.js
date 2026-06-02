import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "../../../../lib/db";

export async function POST(request) {
    try {
        const body = await request.json();

        const { name, email, password, confirmPassword } = body;

        if (!name || !email || !password || !confirmPassword) {
            return NextResponse.json(
                { message: "Preencha todos os campos." },
                { status: 400 }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { message: "As senhas não coincidem." },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "A senha deve ter pelo menos 6 caracteres." },
                { status: 400 }
            );
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { message: "Este e-mail já está cadastrado." },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `
            INSERT INTO users (name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, role, status, created_at
            `,
            [name, email, passwordHash]
        );

        return NextResponse.json(
            {
                message: "Conta criada com sucesso.",
                user: result.rows[0],
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);

        return NextResponse.json(
            { message: "Erro interno ao cadastrar usuário." },
            { status: 500 }
        );
    }
}