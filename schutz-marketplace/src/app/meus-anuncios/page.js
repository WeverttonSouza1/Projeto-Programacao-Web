import Link from "next/link";
import { redirect } from "next/navigation";
import pool from "../../lib/db";
import { getSessionUser } from "../../lib/session";

// Busca somente os anúncios pertencentes ao vendedor autenticado.
async function getSellerProducts(userId) {
    const result = await pool.query(
        `
        SELECT
            p.id,
            p.title,
            p.status,
            p.created_at,
            c.name AS category_name,
            pi.image_url,
            MIN(pv.price) AS min_price,
            COALESCE(SUM(pv.stock), 0) AS total_stock
        FROM products p
        INNER JOIN categories c ON p.category_id = c.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = TRUE
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        WHERE p.seller_id = $1
        GROUP BY p.id, p.title, p.status, p.created_at, c.name, pi.image_url
        ORDER BY p.created_at DESC
        `,
        [userId]
    );

    return result.rows;
}

function formatPrice(value) {
    if (!value) return "0,00";
    return Number(value).toFixed(2).replace(".", ",");
}

// Impede visitantes sem sessão de acessar a área de gerenciamento de anúncios.
export default async function MeusAnuncios() {
    const user = await getSessionUser();

    if (!user) {
        redirect("/");
    }

    const products = await getSellerProducts(user.id);

    return (
        <main className="dashboard-page">
            <div className="container">
                <h1>Meus Anúncios</h1>

                <div className="dashboard-actions">
                    <Link href="/dashboard" className="btn">
                        Voltar ao dashboard
                    </Link>
                    <Link href="/categorias" className="btn btn-buy-custom">
                        Ver catálogo
                    </Link>
                </div>

                <section className="dashboard-card">
                    <h2>Anúncios cadastrados</h2>

                    {products.length === 0 ? (
                        <p>Você ainda não possui anúncios cadastrados.</p>
                    ) : (
                        <div className="dashboard-list">
                            {products.map((product) => (
                                <div className="dashboard-list-item" key={product.id}>
                                    <img
                                        src={product.image_url || "/temporaria.webp"}
                                        alt={product.title}
                                    />
                                    <div>
                                        <h3>{product.title}</h3>
                                        <p>{product.category_name}</p>
                                        <p>
                                            R$ {formatPrice(product.min_price)} - Estoque {product.total_stock}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="status-pill">{product.status}</span>
                                        <Link href={`/anuncio/${product.id}`} className="btn">
                                            Ver anúncio
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
