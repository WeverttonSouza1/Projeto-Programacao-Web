import Link from 'next/link';
import pool from '../../lib/db';

export const metadata = {
    title: 'Jogos - Schutz',
    description: 'Explore todos os jogos disponíveis no marketplace.',
};

async function getAllGames() {
    try {
        // Busca todas as categorias ordenadas por nome
        const result = await pool.query('SELECT id, name, slug, image_url FROM categories ORDER BY name ASC');
        return result.rows;
    } catch (error) {
        console.error("Erro ao buscar jogos:", error);
        return [];
    }
}

export default async function GamesListPage() {
    const games = await getAllGames();

    return (
        <main>
            <div className="container-page">
                <nav className="breadcrumb">
                    <Link href="/">Home</Link>
                    <span>&gt;</span>
                    <Link href="/categorias">Categorias</Link>
                </nav>

                <div className="search-header">
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="Filtre aqui..."
                            className="game-filter"
                        />
                        <span className="search-icon">&gt;</span>
                    </div>
                </div>

                {/* 3. Título da Seção */}
                <h1 className="conteiner-title">Jogos</h1>

                <div className="games-grid">
                    {games.length === 0 ? (
                        <p>Nenhum jogo cadastrado ainda.</p>
                    ) : (
                        games.map((game) => (
                            <Link href={`/categorias/jogos/${game.slug}`} className="game-card" key={game.id}>
                                <div className="game-image-wrapper category-card">
                                    <img
                                        src={game.image_url || '/temporaria.webp'}
                                        alt={game.name}
                                        loading="lazy"
                                    />
                                </div>
                                <span className="game-name">{game.name}</span>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}