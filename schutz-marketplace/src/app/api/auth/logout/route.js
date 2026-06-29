import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Encerra a sessão apagando o cookie JWT no navegador.
export async function POST() {
    const cookieStore = await cookies();

    cookieStore.set("schutz_session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });

    return NextResponse.json(
        { message: "Logout realizado com sucesso." },
        { status: 200 }
    );
}
