import Link from "next/link";
import pool from "../../../lib/db";
import ProductGallery from "../../../components/product/ProductGallery";
import ProductQuestions from "../../../components/product/ProductQuestions";
import ProductPurchaseForm from "../../../components/product/ProductPurchaseForm";

async function getAnnouncementById(id) {
    try {
        const productResult = await pool.query(
            `
            SELECT 
                p.id,
                p.title,
                p.description,
                p.status,
                p.created_at,

                c.name AS category_name,
                c.slug AS category_slug,

                u.id AS seller_id,
                u.name AS seller_name,
                u.created_at AS seller_created_at,

                MIN(pv.price) AS min_price,
                COALESCE(SUM(pv.stock), 0) AS total_stock
            FROM products p
            INNER JOIN categories c ON p.category_id = c.id
            INNER JOIN users u ON p.seller_id = u.id
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            WHERE p.id = $1
            GROUP BY 
                p.id,
                c.name,
                c.slug,
                u.id,
                u.name,
                u.created_at
            `,
            [id]
        );

        if (productResult.rows.length === 0) {
            return null;
        }

        const product = productResult.rows[0];

        const imagesResult = await pool.query(
            `
            SELECT id, image_url, is_main, display_order
            FROM product_images
            WHERE product_id = $1
            ORDER BY is_main DESC, display_order ASC
            `,
            [id]
        );

        const variantsResult = await pool.query(
            `
            SELECT id, name, price, stock
            FROM product_variants
            WHERE product_id = $1
            ORDER BY price ASC
            `,
            [id]
        );

        const questionsResult = await pool.query(
            `
            SELECT 
                pq.id,
                pq.question_text,
                pq.answer_text,
                pq.created_at,
                u.name AS buyer_name
            FROM product_questions pq
            INNER JOIN users u ON pq.buyer_id = u.id
            WHERE pq.product_id = $1
            ORDER BY pq.created_at DESC
            LIMIT 5
            `,
            [id]
        );

        return {
            product,
            images: imagesResult.rows,
            variants: variantsResult.rows,
            questions: questionsResult.rows,
        };
    } catch (error) {
        console.error("Erro ao buscar anúncio:", error);
        return null;
    }
}

function formatPrice(value) {
    if (!value) return "0,00";

    return Number(value).toFixed(2).replace(".", ",");
}

function getStatusLabel(status) {
    switch (status) {
        case "ATIVO":
            return "Ativo";
        case "AGUARDANDO_VALIDACAO":
            return "Aguardando validação";
        case "PAUSADO":
            return "Pausado";
        case "REMOVIDO":
            return "Removido";
        default:
            return status || "Desconhecido";
    }
}

function getStatusClass(status) {
    return `status-${String(status || "desconhecido").toLowerCase().replace(/_/g, "-")}`;
}

export default async function AnnouncementPage({ params }) {
    const { id } = await params;
    const data = await getAnnouncementById(id);

    if (!data) {
        return (
            <main className="product-page">
                <div className="product-not-found">
                    <h1>Anúncio não encontrado</h1>
                    <p>Esse anúncio não existe ou foi removido.</p>

                    <Link href="/" className="btn">
                        Voltar para a home
                    </Link>
                </div>
            </main>
        );
    }

    const { product, images, variants, questions } = data;

    const mainImage =
        images.find((img) => img.is_main)?.image_url ||
        images[0]?.image_url ||
        "/temporaria.webp";

    return (
        <main className="product-page">
            <div className="container-page-anuncio">

                <nav className="breadcrumb">
                    <Link href="/">Home</Link>
                    <span>&gt;</span>
                    <Link href="/categorias">Jogos</Link>
                    <span>&gt;</span>
                    <Link href={`/categorias/jogos/${product.category_slug}`}>
                        {product.category_name}
                    </Link>
                    <span>&gt;</span>
                    <span className="current name-game-breadcrumb">{product.title}</span> {/* falta criar a entidade para jogos dentro do roblox*/}
                </nav>

                <div className="product-main-layout">

                    <section className="product-left">
                        <div className="product-top-card">
                            <ProductGallery images={images} title={product.title} />

                            <div className="product-info-area">
                                <h1 className="product-title">
                                    {product.title}
                                </h1>

                                <div className="product-tags">
                                    <span className="category-badge">
                                        {product.category_name}
                                    </span>
                                    <span className={`stock-status ${getStatusClass(product.status)}`}>
                                        ● {getStatusLabel(product.status)}
                                    </span>
                                </div>

                                <div className="product-stats">
                                    <div>
                                        <span>DISPONÍVEIS</span>
                                        <strong>{product.total_stock}</strong>
                                    </div>
                                    <div className="sales-info">
                                        <hr className="vertical-divider" />
                                    </div>
                                    <div>
                                        <span>VENDAS</span>
                                        <strong>0</strong> {/* ainda falta adicionar no banco de dados*/}
                                    </div>
                                </div>

                                {/* <form className="product-purchase-form-inline">
                                    <select className="market-input">
                                        {variants.length === 0 ? (
                                            <option>Nenhuma opção disponível</option>
                                        ) : (
                                            variants.map((variant) => (
                                                <option key={variant.id}>
                                                    {variant.name} — R$ {formatPrice(variant.price)}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                <Link href="/carrinho" className="buy-button">
                                    Comprar
                                </Link>
                            </form>
                                        */}
                            </div>
                        </div>

                        <section className="product-section">
                            <h2>Características</h2>

                            <table className="features-table">
                                <tbody>
                                    <tr>
                                        <td className="label-td">
                                            Tipo do Anúncio
                                        </td>
                                        <td>{product.category_name}</td>
                                    </tr>

                                    <tr>
                                        <td className="label-td">
                                            Estoque
                                        </td>
                                        <td>{product.total_stock}</td>
                                    </tr>

                                    <tr>
                                        <td className="label-td">
                                            Status
                                        </td>
                                        <td>{product.status}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        <section className="product-section">
                            <h2>Descrição do Anúncio</h2>

                            <div className="description-box">
                                <p>{product.description}</p>
                                <span className="description-date">
                                    Criado em {new Date(product.created_at).toLocaleDateString("pt-BR")}
                                </span>
                            </div>
                        </section>

                        <section className="product-section">
                            <h2>Perguntas</h2>

                            <ProductQuestions
                                productId={product.id}
                                sellerId={product.seller_id}
                                questions={questions}
                            />
                        </section>
                    </section>

                    <aside className="seller-column">
                        <div className="purchase-column">
                            <div className="fixed-checkout-card item-card-base">

                                <div className="price-container">
                                    <span className="price-label">A partir de</span>
                                    <h2 className="price-value">R$ {formatPrice(product.min_price)}</h2>
                                </div>

                                <ProductPurchaseForm variants={variants} />
                            </div>
                        </div>
                        <div className="seller-card">
                            <h2>Vendedor</h2>

                            <div className="seller-avatar">
                                {product.seller_name.charAt(0).toUpperCase()}
                            </div>

                            <h3>
                                <Link href={`/perfil/${product.seller_id}`}>
                                    {product.seller_name}
                                </Link>
                            </h3>

                            <p>Membro desde: {new Date(product.seller_created_at).toLocaleDateString("pt-BR")}</p>
                            <p>Avaliações positivas: 100%</p>
                            <p>Último acesso: há 2 horas</p>
                        </div>

                        <div className="seller-card">
                            <h2>Verificações</h2>

                            <p>E-mail: <strong>Verificado</strong></p>
                            <p>Telefone: <strong>Verificado</strong></p>
                            <p>Documento: <strong>Verificado</strong></p>
                        </div>

                        <div className="seller-card">
                            <p>✓ Entrega garantida u o seu dinheiro de volta.</p>
                            <p>✓ Suporte do vendedor via chat privado</p>
                        </div>
                    </aside>
                </div>
            </div >
        </main >
    );
}
