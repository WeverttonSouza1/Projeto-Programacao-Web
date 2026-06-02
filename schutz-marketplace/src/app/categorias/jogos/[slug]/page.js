import Link from 'next/link';
import pool from '../../../../lib/db'; 

async function getCategoryData(slug) {
    try {
        const categoryResult = await pool.query(
            'SELECT id, name, image_url FROM categories WHERE slug = $1',
            [slug]
        );

        if (categoryResult.rows.length === 0) {
            return null;
        }

        const category = categoryResult.rows[0];

        const productsResult = await pool.query(`
            SELECT 
                p.id, 
                p.title, 
                pi.image_url, 
                MIN(pv.price) as min_price
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_main = TRUE
            LEFT JOIN product_variants pv ON p.id = pv.product_id
            WHERE p.category_id = $1 AND p.status = 'ATIVO'
            GROUP BY p.id, p.title, pi.image_url
            ORDER BY p.created_at DESC
        `, [category.id]);

        return {
            category,
            products: productsResult.rows
        };
    } catch (error) {
        console.error("Erro ao buscar a categoria:", error);
        return { category: null, products: [] };
    }
}

export default async function CategoryPage({ params }) {
    const { slug } = await params;
    const data = await getCategoryData(slug);

    if (!data || !data.category) {
        return (
            <main className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <h1 style={{ color: '#ff6700' }}>Categoria não encontrada</h1>
                <p>O jogo que você está procurando não existe ou foi removido.</p>
                <Link href="/" className="btn" style={{ display: 'inline-block', maxWidth: '200px', margin: '20px auto' }}>
                    Voltar para a Home
                </Link>
            </main>
        );
    }

    const { category, products } = data;

    return (
        <main className="category-page">
            <div className='container-page'>
                {/* 1. Breadcrumb (Caminho de Navegação) */}
                <nav className="breadcrumb">
                    <Link href="/">Home</Link>
                    <span>&gt;</span>
                    <Link href="/categorias">Categorias</Link>
                    <span>&gt;</span>
                    <Link href="/categorias/jogos">Jogos</Link>
                    <span>&gt;</span>
                    <span className="current">{category.name}</span>
                </nav>

                <div className="category-header-banner">
                    <img 
                        src={category.image_url || '/temporaria.webp'} 
                        alt={category.name} 
                        className="category-banner-img" 
                    />
                    <div className="category-banner-info">
                        <h1>{category.name}</h1>
                        <p>{products.length} anúncios disponíveis</p>
                    </div>
                </div>

                {/* 3. Barra de Filtros e Pesquisa */}
                <div className="filter-bar">
                    <input 
                        type="text" 
                        placeholder={`Buscar em ${category.name}...`} 
                        className="market-input search-input" 
                    />
                    <div className="sort-controls">
                        <label>Ordenar por:</label>
                        <select className="market-input sort-select">
                            <option value="recent">Mais Recentes</option>
                            <option value="lowest_price">Menor Preço</option>
                            <option value="highest_price">Maior Preço</option>
                        </select>
                    </div>
                </div>

                <div className="grid">
                    {products.length === 0 ? (
                        <p style={{ padding: '20px', color: '#666', fontWeight: 'bold' }}>
                            Nenhum anúncio disponível no momento.
                        </p>
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
            </div>
        </main>
    );
}