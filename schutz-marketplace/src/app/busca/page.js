import Link from "next/link";
import pool from "../../lib/db";

// Pesquisa anúncios ativos pelo título, descrição, categoria ou vendedor.
async function searchProducts(query) {
    const trimmedQuery = String(query || "").trim();

    if (!trimmedQuery) {
        const result = await pool.query(
            `
            SELECT
                p.id,
                p.title,
                pi.image_url,
                MIN(pv.price) AS min_price
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = TRUE
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            WHERE p.status = 'ATIVO'
            GROUP BY p.id, p.title, pi.image_url
            ORDER BY p.created_at DESC
            LIMIT 24
            `
        );

        return result.rows;
    }

    const result = await pool.query(
        `
        SELECT
            p.id,
            p.title,
            pi.image_url,
            MIN(pv.price) AS min_price
        FROM products p
        INNER JOIN categories c ON p.category_id = c.id
        INNER JOIN users u ON p.seller_id = u.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = TRUE
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        WHERE p.status = 'ATIVO'
          AND (
              p.title ILIKE $1
              OR p.description ILIKE $1
              OR c.name ILIKE $1
              OR u.name ILIKE $1
          )
        GROUP BY p.id, p.title, pi.image_url
        ORDER BY p.created_at DESC
        LIMIT 24
        `,
        [`%${trimmedQuery}%`]
    );

    return result.rows;
}

function formatPrice(value) {
    if (!value) return "0,00";
    return Number(value).toFixed(2).replace(".", ",");
}

// Lê o termo da URL e monta a página com os anúncios encontrados.
export default async function SearchPage({ searchParams }) {
    const params = await searchParams;
    const query = params?.q || "";
    const products = await searchProducts(query);

    return (
        <main className="catalog-page">
            <div className="container-page">
                <nav className="breadcrumb">
                    <Link href="/">Home</Link>
                    <span>&gt;</span>
                    <span className="current">Busca</span>
                </nav>

                <section className="catalog-header">
                    <h1>Resultados da busca</h1>
                    <p>
                        {query ? `Busca por "${query}"` : "Anúncios mais recentes"}
                    </p>
                </section>

                <div className="category-products-grid">
                    {products.length === 0 ? (
                        <p className="catalog-empty">Nenhum anúncio encontrado.</p>
                    ) : (
                        products.map((product) => (
                            <div className="card" key={product.id}>
                                <img
                                    className="category-image-featured"
                                    src={product.image_url || "/temporaria.webp"}
                                    alt={product.title}
                                />
                                <h3>{product.title}</h3>
                                <p>A partir de R$ {formatPrice(product.min_price)}</p>
                                <Link href={`/anuncio/${product.id}`} className="btn-detalhes">
                                    R$ {formatPrice(product.min_price)}+
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
