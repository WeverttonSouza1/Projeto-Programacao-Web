import Link from 'next/link';
import pool from '../lib/db';

async function getHomeData() {
    try {
        // Busca as categorias em destaque ordenadas por nome
        const categoriesResult = await pool.query(
            'SELECT id, name, slug, image_url FROM categories ORDER BY name ASC'
        );

        // Busca anúncios ativos trazendo a imagem principal e o menor preço das variações
        const productsResult = await pool.query(`
            SELECT 
                p.id, 
                p.title, 
                pi.image_url, 
                MIN(pv.price) as min_price
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = TRUE
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            WHERE p.status = 'ATIVO'
            GROUP BY p.id, p.title, pi.image_url
            ORDER BY p.created_at DESC
            LIMIT 8
        `);

        return {
            categories: categoriesResult.rows,
            products: productsResult.rows
        };
    } catch (error) {
        console.error("Erro ao buscar dados do banco no Schutz Market:", error);
        // Retorna arrays vazios para evitar que a página quebre se o banco falhar
        return { categories: [], products: [] }; 
    }
}

export default async function Home() {
    const { categories, products } = await getHomeData();

    return (
        <main>
            {/* section featured categories */}
            <div className="section-featured-categories">
                <div className="container-title">
                    <h1>Categorias em destaque</h1>
                </div>
                <div className="grid-test">
                    {categories.map((cat) => (
                        <div className="category-card" key={cat.id}>
                            <h3>
                                <Link href={`/categorias/jogos/${cat.slug}`}>
                                    <img 
                                        className="category-image" 
                                        src={cat.image_url || '/temporaria.webp'} 
                                        alt={cat.name} 
                                    />
                                </Link>
                            </h3>
                        </div>
                    ))}
                </div>
                <div className="categories-container">
                    <div className="separator-with-text">
                        <span><a className="view-more" href={"/categorias/jogos/"}>VER TODAS CATEGORIAS</a></span>
                    </div>
                </div>
            </div>

            {/* Seção de Anúncios Recentes */}
            <div className="section-user-relevant-announcement-list">
                <div className="container-title">
                    <h1>Anúncios em destaque</h1>
                </div>
                <div className="grid">
                    {products.length === 0 ? (
                        <p style={{ padding: '20px', color: '#666' }}>Nenhum anúncio disponível no momento.</p>
                    ) : (
                        products.map((prod) => (
                            <div className="card" key={prod.id}>
                                <img 
                                    className="category-image-featured" 
                                    src={prod.image_url || '/temporaria.webp'} 
                                    alt={prod.title} 
                                />
                                <h3>{prod.title}</h3>
                                <p>A partir de R$ {parseFloat(prod.min_price).toFixed(2).replace('.', ',')}</p>
                                <Link href={`/produto/${prod.id}`} className="btn">
                                    Ver Detalhes
                                </Link>
                            </div>
                        ))
                    )}
                </div>
                
                {/* adicionar mais cetegorias */}
                {/* aumetar barra e modificar div */}
                <div className="categories-container">
                    <div className="separator-with-text">
                        <span>
                            <Link className="view-more" href="/destaques">VER MAIS</Link>
                        </span>
                    </div>
                </div>
            </div>
        </main>
    );
}