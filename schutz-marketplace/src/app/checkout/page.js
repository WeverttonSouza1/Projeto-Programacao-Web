import Link from 'next/link';

export default function Checkout() {
    return (
        <main>
            <div className="container">
                <h1>Finalizar Pagamento</h1>
                <div className="card">
                    <p>Valor total: <strong>R$ 25,00</strong></p>
                    <p>Selecione o método:</p>
                    <label><input type="radio" name="p" /> Pix</label>
                    <br />
                    <label><input type="radio" name="p" /> Cartão</label>
                    <br />
                    <br />
                    <Link href="/" className="btn">Confirmar Pagamento</Link>
                </div>
            </div>
        </main>
    );
}