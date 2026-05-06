function App() {
  return (
    <main className="tracker">
      <header className="tracker__hero">
        <h1 className="tracker__title">IP Address Tracker</h1>
        <form className="tracker__search" role="search" aria-label="IP address search">
          <label className="sr-only" htmlFor="ip-search">
            Search for any IP address or domain
          </label>
          <input
            id="ip-search"
            className="tracker__input"
            type="text"
            placeholder="Search for any IP address or domain"
          />
          <button className="tracker__button" type="button" aria-label="Search">
            <span aria-hidden="true">›</span>
          </button>
        </form>
      </header>

      <section className="tracker__details" aria-label="IP details">
        <article className="detail-card">
          <h2 className="detail-card__label">IP Address</h2>
          <p className="detail-card__value">192.212.174.101</p>
        </article>
        <article className="detail-card">
          <h2 className="detail-card__label">Location</h2>
          <p className="detail-card__value">Brooklyn, NY 10001</p>
        </article>
        <article className="detail-card">
          <h2 className="detail-card__label">Timezone</h2>
          <p className="detail-card__value">UTC -05:00</p>
        </article>
        <article className="detail-card">
          <h2 className="detail-card__label">ISP</h2>
          <p className="detail-card__value">SpaceX Starlink</p>
        </article>
      </section>

      <section className="tracker__map" aria-label="Map preview">
        <div className="tracker__pin" />
      </section>
    </main>
  );
}

export default App;
