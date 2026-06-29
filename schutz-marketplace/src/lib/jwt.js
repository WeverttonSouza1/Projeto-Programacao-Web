import crypto from "crypto";

// Converte o conteúdo para o formato Base64 URL usado nas partes do JWT.
function base64UrlEncode(value) {
    return Buffer.from(value)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

// Recupera o texto original de uma parte codificada do token.
function base64UrlDecode(value) {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);

    return Buffer.from(normalized + padding, "base64").toString("utf8");
}

// Usa uma chave do servidor que nunca é enviada ao navegador.
function getJwtSecret() {
    return process.env.JWT_SECRET || process.env.DB_PASSWORD || "schutz-dev-secret";
}

// Gera a assinatura HMAC-SHA256 que revela qualquer alteração feita no token.
function sign(data) {
    return crypto
        .createHmac("sha256", getJwtSecret())
        .update(data)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

// Cria um token JWT assinado com os dados da sessão e uma data de expiração.
export function signJwt(payload, expiresInSeconds = 60 * 60 * 24 * 7) {
    const header = {
        alg: "HS256",
        typ: "JWT",
    };

    const now = Math.floor(Date.now() / 1000);
    const body = {
        ...payload,
        iat: now,
        exp: now + expiresInSeconds,
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedBody = base64UrlEncode(JSON.stringify(body));
    const signature = sign(`${encodedHeader}.${encodedBody}`);

    return `${encodedHeader}.${encodedBody}.${signature}`;
}

// Valida a assinatura e a expiração do JWT antes de liberar seus dados.
export function verifyJwt(token) {
    if (!token) {
        return null;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
        return null;
    }

    const [encodedHeader, encodedBody, signature] = parts;
    const expectedSignature = sign(`${encodedHeader}.${encodedBody}`);
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedSignatureBuffer.length) {
        return null;
    }

    // A comparação em tempo constante dificulta ataques que analisam o tempo da resposta.
    if (!crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
        return null;
    }

    try {
        const payload = JSON.parse(base64UrlDecode(encodedBody));
        const now = Math.floor(Date.now() / 1000);

        if (!payload.exp || payload.exp < now) {
            return null;
        }

        return payload;
    } catch (error) {
        return null;
    }
}
