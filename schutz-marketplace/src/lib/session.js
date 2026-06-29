import { cookies } from "next/headers";
import { verifyJwt } from "./jwt";

// Lê o cookie protegido e retorna somente os dados públicos do usuário autenticado.
export async function getSessionUser() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("schutz_session");

    if (!sessionCookie?.value) {
        return null;
    }

    // Nunca confiamos apenas na existência do cookie: sua assinatura é validada no servidor.
    const user = verifyJwt(sessionCookie.value);

    if (!user?.id || !user?.role || user.status !== "ATIVO") {
        return null;
    }

    // Senha, e-mail e outros dados sensíveis não fazem parte do retorno da sessão.
    return {
        id: user.id,
        name: user.name,
        role: user.role,
        status: user.status,
    };
}
