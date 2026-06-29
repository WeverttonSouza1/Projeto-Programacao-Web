import Link from "next/link";
import { redirect } from "next/navigation";
import pool from "../../lib/db";
import { getSessionUser } from "../../lib/session";

// Reúne os totais e os pedidos recentes exibidos no dashboard do usuário.
async function getDashboardData(userId) {
    const productsResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM products
        WHERE seller_id = $1
        `,
        [userId]
    );

    const purchasesResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM orders
        WHERE buyer_id = $1
        `,
        [userId]
    );

    const salesResult = await pool.query(
        `
        SELECT COUNT(DISTINCT o.id)::int AS total
        FROM orders o
        INNER JOIN order_items oi ON o.id = oi.order_id
        INNER JOIN product_variants pv ON oi.variant_id = pv.id
        INNER JOIN products p ON pv.product_id = p.id
        WHERE p.seller_id = $1
        `,
        [userId]
    );

    const recentOrdersResult = await pool.query(
        `
        SELECT id, total_amount, payment_status, order_status, created_at
        FROM orders
        WHERE buyer_id = $1
        ORDER BY created_at DESC
        LIMIT 4
        `,
        [userId]
    );

    return {
        productsCount: productsResult.rows[0]?.total || 0,
        purchasesCount: purchasesResult.rows[0]?.total || 0,
        salesCount: salesResult.rows[0]?.total || 0,
        recentOrders: recentOrdersResult.rows,
    };
}

function formatPrice(value) {
    return Number(value || 0).toFixed(2).replace(".", ",");
}

// Protege a página no servidor antes de consultar ou mostrar dados particulares.
export default async function Dashboard() {
    const user = await getSessionUser();

    if (!user) {
        redirect("/");
    }

    const data = await getDashboardData(user.id);

    return (
        <main className="dashboard-page">
            <div className="container">
                <h1>Dashboard</h1>

                <section className="dashboard-grid">
                    <div className="dashboard-card dashboard-stat">
                        <strong>{data.productsCount}</strong>
                        <p>Anúncios cadastrados</p>
                    </div>

                    <div className="dashboard-card dashboard-stat">
                        <strong>{data.purchasesCount}</strong>
                        <p>Compras realizadas</p>
                    </div>

                    <div className="dashboard-card dashboard-stat">
                        <strong>{data.salesCount}</strong>
                        <p>Vendas recebidas</p>
                    </div>
                </section>

                <div className="dashboard-actions">
                    <Link href="/meus-anuncios" className="btn">
                        Meus anúncios
                    </Link>
                    <Link href="/pedidos" className="btn btn-buy-custom">
                        Pedidos e chat
                    </Link>
                    <Link href="/categorias" className="btn">
                        Ver catálogo
                    </Link>
                </div>

                <section className="dashboard-card">
                    <h2>Pedidos recentes</h2>

                    {data.recentOrders.length === 0 ? (
                        <p>Você ainda não possui pedidos.</p>
                    ) : (
                        <div className="dashboard-list">
                            {data.recentOrders.map((order) => (
                                <div className="dashboard-list-item" key={order.id}>
                                    <div>
                                        <span className="status-pill">{order.order_status}</span>
                                    </div>
                                    <div>
                                        <h3>Pedido {order.id}</h3>
                                        <p>R$ {formatPrice(order.total_amount)} - {order.payment_status}</p>
                                    </div>
                                    <Link href={`/pedidos/${order.id}`} className="btn">
                                        Abrir
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
