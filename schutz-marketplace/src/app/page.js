import Link from 'next/link';

export default function Home() {
    return (
        <main>
            <div className="container">
                <h1>Produtos em Destaque</h1>
                <div className="grid">
                    <div className="card">
                        <h3>Script Auto-Farm</h3>
                        <p>R$ 25,00</p>
                        <Link href="/produto" className="btn">Ver Detalhes</Link>
                    </div>
                    <div className="card">
                        <h3>Skin Rara AK-47</h3>
                        <p>R$ 150,00</p>
                        <Link href="/produto" className="btn">Ver Detalhes</Link>
                    </div>
                    <div className="card">
                        <h3>Aimbot Legit</h3>
                        <p>R$ 45,00</p>
                        <Link href="/produto" className="btn">Ver Detalhes</Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
