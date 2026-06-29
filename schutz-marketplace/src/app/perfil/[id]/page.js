import Link from "next/link";
import pool from "../../../lib/db";

async function getPublicProfile(id) {
    try {
        const userResult = await pool.query(
            `
            SELECT id, name, role, status, created_at
            FROM users
            WHERE id = $1
            `,
            [id]
        );

        if (userResult.rows.length === 0) {
            return null;
        }

        const productsResult = await pool.query(
            `
            SELECT
                p.id,
                p.title,
                p.created_at,
                pi.image_url,
                MIN(pv.price) AS min_price
            FROM products p
            LEFT JOIN product_images pi
                ON p.id = pi.product_id AND pi.is_main = TRUE
            LEFT JOIN product_variants pv
                ON p.id = pv.product_id
            WHERE p.seller_id = $1
              AND p.status = 'ATIVO'
            GROUP BY p.id, p.title, p.created_at, pi.image_url
            ORDER BY p.created_at DESC
            `,
            [id]
        );

        const salesResult = await pool.query(
            `
            SELECT COUNT(DISTINCT oi.order_id)::int AS sales_count
            FROM order_items oi
            INNER JOIN product_variants pv ON oi.variant_id = pv.id
            INNER JOIN products p ON pv.product_id = p.id
            WHERE p.seller_id = $1
            `,
            [id]
        );

        return {
            user: userResult.rows[0],
            products: productsResult.rows,
            salesCount: salesResult.rows[0]?.sales_count || 0,
        };
    } catch (error) {
        console.error("Erro ao buscar perfil público:", error);
        return null;
    }
}

function formatPrice(value) {
    if (!value) return "0,00";
    return Number(value).toFixed(2).replace(".", ",");
}

function formatDate(value) {
    return new Date(value).toLocaleDateString("pt-BR");
}

function getRoleLabel(role) {
    if (role === "ADMIN") return "Administrador";
    return "Usuário";
}

export default async function PerfilPage({ params }) {
    const { id } = await params;
    const profile = await getPublicProfile(id);

    if (!profile) {
        return (
            <main className="profile-page">
                <div className="profile-container">
                    <section className="profile-card profile-empty-card">
                        <h1>Perfil não encontrado</h1>
                        <p>Esse usuário não existe ou não está disponível.</p>

                        <Link href="/" className="btn profile-action">
                            Voltar para a home
                        </Link>
                    </section>
                </div>
            </main>
        );
    }

    const { user, products, salesCount } = profile;

    return (
        <main className="profile-page">
            <div className="profile-container">
                <section className="profile-header-card">
                    <div className="profile-avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="profile-main-info">
                        <h1>{user.name}</h1>
                        <p>Perfil público do vendedor no Schutz Marketplace.</p>
                    </div>
                </section>

                <div className="profile-layout">
                    <aside className="profile-sidebar">
                        <section className="profile-card">
                            <h2>Dados públicos</h2>

                            <dl className="profile-data-list">
                                <div>
                                    <dt>Membro desde</dt>
                                    <dd>{formatDate(user.created_at)}</dd>
                                </div>

                                <div>
                                    <dt>Tipo</dt>
                                    <dd>{getRoleLabel(user.role)}</dd>
                                </div>

                                <div>
                                    <dt>Status</dt>
                                    <dd>{user.status}</dd>
                                </div>
                            </dl>
                        </section>

                        <section className="profile-card">
                            <h2>Resumo</h2>

                            <div className="profile-stat-list">
                                <div>
                                    <strong>{products.length}</strong>
                                    <span>Anúncios ativos</span>
                                </div>

                                <div>
                                    <strong>{salesCount}</strong>
                                    <span>Vendas registradas</span>
                                </div>
                            </div>
                        </section>
                    </aside>

                    <section className="profile-content">
                        <section className="profile-card">
                            <div className="profile-section-title">
                                <h2>Anúncios ativos</h2>
                                <span>{products.length} encontrados</span>
                            </div>

                            {products.length === 0 ? (
                                <p className="profile-empty">
                                    Esse vendedor ainda não possui anúncios ativos.
                                </p>
                            ) : (
                                <div className="profile-products-grid">
                                    {products.map((product) => (
                                        <Link
                                            href={`/anuncio/${product.id}`}
                                            className="profile-product-card"
                                            key={product.id}
                                        >
                                            <div className="profile-product-image">
                                                <img
                                                    src={product.image_url || "/temporaria.webp"}
                                                    alt={product.title}
                                                />
                                            </div>

                                            <div className="profile-product-info">
                                                <span>{product.title}</span>
                                                <small>Criado em {formatDate(product.created_at)}</small>
                                                <strong>R$ {formatPrice(product.min_price)} +</strong>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    </section>
                </div>
            </div>
        </main>
    );
}
