import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // biblioteca para criptografar as senhas para o banco de dados, usar também para comparar a senha digitada com o hash salvo no banco de dados durante o login, garantindo que as senhas sejam armazenadas de forma segura e não em texto simples. fazer o mesmo com cpf, telefone e outras informações sensíveis dos usuários (quando essas funcionalidades forem implementadas)
import pool from "../../../../lib/db";

// RegisterModal.jsx > fetch("/api/auth/register") > src/app/api/auth/register/route.js > pool.query(...) > PostgreSQL

export async function POST(request) {
    try {
        const body = await request.json();

        const { name, email, password, confirmPassword } = body;

        if (!name || !email || !password || !confirmPassword) {
            return NextResponse.json(
                { message: "Preencha todos os campos." },
                { status: 400 }
            ); // verificar se os campos estão preenchidos
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { message: "As senhas não coincidem." },
                { status: 400 }
            ); // verificar se as senhas coincidem
        }

        if (name.length < 3 || name.length > 100) {
            return NextResponse.json(
                { message: "O nome deve ter entre 3 e 100 caracteres." },
                { status: 400 }
            ); // verificar se o nome tem entre 3 e 100 caracteres
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: "A senha deve ter pelo menos 6 caracteres." },
                { status: 400 }
            ); // verificar se a senha tem pelo menos 6 caracteres
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1", // Envia uma instrução SQL (como GET, SELECT, INSERT, UPDATE, DELETE) para o banco de dados.
            [email]
        ); // verificar se o email já está cadastrado

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { message: "Este e-mail já está cadastrado." },
                { status: 409 }
            ); // retornar erro se o email já estiver em uso
        } 

        const passwordHash = await bcrypt.hash(password, 10); // hash da senha usando bcrypt

        const result = await pool.query(
            `
            INSERT INTO users (name, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, role, status, created_at
            `,
            [name, email, passwordHash]
        ); // inserir o novo usuário no banco de dados e retornar os dados do usuário criado

        return NextResponse.json(
            {
                message: "Conta criada com sucesso.",
                user: result.rows[0],
            },
            { status: 201 }
        ); // retornar sucesso com os dados do usuário criado
    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);

        return NextResponse.json(
            { message: "Erro interno ao cadastrar usuário." },
            { status: 500 }
        ); // retornar erro interno em caso de falha no processo de cadastro
    }
}

