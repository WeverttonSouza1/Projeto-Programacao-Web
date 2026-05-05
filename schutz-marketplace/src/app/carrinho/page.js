import Link from 'next/link';

export default function Carrinho() {
    return (
        <main>
            <div className="container">
                <h1>Seu Carrinho</h1>
                <div className="card">
                    <p>1x Script Auto-Farm - R$ 25,00</p>
                    <hr />
                    <h3>Total: R$ 25,00</h3>
                    <Link href="/checkout" className="btn">Finalizar Compra</Link>
                </div>
            </div>
        </main>
    );
}