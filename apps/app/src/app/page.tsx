import Link from "next/link";

export default function Home() {
  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">SeaPay</p>
          <h1>Welcome</h1>
          <p className="lede">
            Receive payments with SeaPay
          </p>
        </div>
      </header>

      <section className="panel">
        <div className="actions">
          <Link href="/receive" style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 24px",
            backgroundColor: "var(--accent)",
            color: "white",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "16px",
          }}>
            Start Receiving Payments
          </Link>
        </div>
      </section>
    </main>
  );
}