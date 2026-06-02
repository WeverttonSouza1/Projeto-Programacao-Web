import Link from 'next/link';

export default function Dashboard() {
    return (
        <main>
            <div className="container">
                <h1>Meus Anúncios</h1>
                <a className="btn" style={{background: 'green', width: 150, marginBottom: 20}}>+ Novo Produto</a>
                <div className="card">
                    <p>Você ainda não vendeu nada este mês. Comece agora!</p>
                </div>
            </div>
        </main>
    );
}