export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Borrow smarter. Own less.</p>

          <h1>
            Rent what you need.
            <br />
            Share what you own.
          </h1>

          <p className="hero-text">
            Find useful things near you without buying them,
            or earn from items you already own.
          </p>

          <div className="hero-actions">
            <a href="/listings" className="primary-button">
              Browse listings
            </a>

            <a href="/listings/new" className="secondary-button">
              List an item
            </a>
          </div>
        </div>

        <div className="hero-card">
          <p>Popular nearby</p>
          <h2>Camera</h2>
          <span>$20 / day</span>
        </div>
      </section>
    </main>
  );
}