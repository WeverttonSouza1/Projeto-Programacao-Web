import Link from 'next/link';
import pool from '../../../../lib/db'; 

function formatPrice(value) {
    if (!value) return "0,00";
    return Number(value).toFixed(2).replace(".", ",");
}

async function getCategoryData(slug, search = "", sort = "recent") {
    try {
        const categoryResult = await pool.query(
            'SELECT id, name, image_url FROM categories WHERE slug = $1',
            [slug]
        );

        if (categoryResult.rows.length === 0) {
            return null;
        }

        const category = categoryResult.rows[0];
        const trimmedSearch = String(search || "").trim();
        const orderBy = {
            lowest_price: "min_price ASC NULLS LAST",
            highest_price: "min_price DESC NULLS LAST",
            recent: "p.created_at DESC",
        }[sort] || "p.created_at DESC";

        const productValues = [category.id];
        let searchSql = "";

        if (trimmedSearch) {
            productValues.push(`%${trimmedSearch}%`);
            searchSql = "AND (p.title ILIKE $2 OR p.description ILIKE $2)";
        }

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
            ${searchSql}
            GROUP BY p.id, p.title, pi.image_url
            ORDER BY ${orderBy}
        `, productValues);

        return {
            category,
            products: productsResult.rows,
            search: trimmedSearch,
            sort,
        };
    } catch (error) {
        console.error("Erro ao buscar a categoria:", error);
        return { category: null, products: [] };
    }
}

export default async function CategoryPage({ params, searchParams }) {
    const { slug } = await params;
    const filters = await searchParams;
    const data = await getCategoryData(slug, filters?.q, filters?.sort);

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
                <form className="filter-bar">
                    <input 
                        type="text" 
                        placeholder={`Buscar em ${category.name}...`} 
                        className="market-input search-input" 
                        name="q"
                        defaultValue={data.search}
                    />
                    <div className="sort-controls">
                        <label>Ordenar por:</label>
                        <select className="market-input sort-select" name="sort" defaultValue={data.sort}>
                            <option value="recent">Mais Recentes</option>
                            <option value="lowest_price">Menor Preço</option>
                            <option value="highest_price">Maior Preço</option>
                        </select>
                    </div>
                    <button type="submit" className="btn filter-submit">
                        Filtrar
                    </button>
                </form>

                <div className="category-products-grid">
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
                                <h3 className="product-title">{prod.title}</h3>
                                <Link href={`/anuncio/${prod.id}`} className="btn-detalhes category-product-button">
                                    R$ {formatPrice(prod.min_price)}+
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
