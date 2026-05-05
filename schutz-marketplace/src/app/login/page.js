import Link from 'next/link';

export default function Login() {
    return (
        <main>
            <div className="container" style={{ maxWidth: 400 }}>
                <div className="card">
                    <h1>Login</h1>
                    <form action="/dashboard">
                        <input type="email" placeholder="E-mail" style={{ width: '90%', padding: 10, marginBottom: 10 }} required />
                        <br />
                        <input type="password" placeholder="Senha" style={{ width: '90%', padding: 10, marginBottom: 10 }} required />
                        <br />
                        <button type="submit" className="btn" style={{ width: '100%', border: 'none' }}>Entrar</button>
                    </form>
                </div>
            </div>
        </main>
    );
}