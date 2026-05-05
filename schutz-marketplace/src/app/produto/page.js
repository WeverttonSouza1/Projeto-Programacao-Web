import Link from 'next/link';

export default function Product() {
    return (
        <main>
            <div className="container">
                <div className="card" style={{ textAlign: 'left' }}>
                    <h1>Script Auto-Farm Roblox</h1>
                    <p><strong>Descrição:</strong> Script indetectável para farm automático de moedas. Funciona em todos os mapas.</p>
                    <p><strong>Vendedor:</strong> Renato</p>
                    <p style={{ fontSize: 24}}>R$ 25,00</p>
                    <Link href="/carrinho" className="btn" target="_self" style={{ display: 'inline-block' }}>Adicionar ao Carrinho</Link>
                    <Link href="/" target="_self" rel="prev" style={{ marginLeft: 20 }}>Voltar ao catálogo</Link>
                </div>
            </div>
        </main>
    );
}