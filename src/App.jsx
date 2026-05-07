import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const INITIAL_QUERY = '192.212.174.101';
const FALLBACK_CENTER = { lat: 40.7128, lon: -74.006 };
const IPIFY_API_KEY = import.meta.env.VITE_IPIFY_API_KEY;

function toTimezoneLabel(timezone) {
  if (!timezone) {
    return 'UTC';
  }

  if (typeof timezone === 'object' && timezone.utc) {
    return timezone.utc;
  }

  try {
    const date = new Date();
    const localTime = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const offsetInMinutes = Math.round((localTime.getTime() - date.getTime()) / 60000);
    const sign = offsetInMinutes >= 0 ? '+' : '-';
    const absolute = Math.abs(offsetInMinutes);
    const hours = String(Math.floor(absolute / 60)).padStart(2, '0');
    const minutes = String(absolute % 60).padStart(2, '0');

    return `UTC ${sign}${hours}:${minutes}`;
  } catch {
    return timezone;
  }
}

function normalizeLocation(location) {
  const parts = [location?.city, location?.region, location?.postalCode].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Unknown';
}

function App() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState({
    ip: INITIAL_QUERY,
    location: 'Brooklyn, NY 10001',
    timezone: 'UTC -05:00',
    isp: 'SpaceX Starlink',
    lat: FALLBACK_CENTER.lat,
    lon: FALLBACK_CENTER.lon,
  });

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([
      FALLBACK_CENTER.lat,
      FALLBACK_CENTER.lon,
    ], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    markerRef.current = L.marker([FALLBACK_CENTER.lat, FALLBACK_CENTER.lon]).addTo(map);
    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const coords = [details.lat, details.lon];

    if (!markerRef.current || !markerRef.current._map) {
      markerRef.current = L.marker(coords).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng(coords);
    }

    mapRef.current.setView(coords, 13, { animate: true });
  }, [details.lat, details.lon]);

  useEffect(() => {
    lookup(INITIAL_QUERY);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  async function lookup(target) {
    setIsLoading(true);
    setError('');

    if (!IPIFY_API_KEY) {
      setError('Missing VITE_IPIFY_API_KEY in .env');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://geo.ipify.org/api/v2/country,city?apiKey=${encodeURIComponent(IPIFY_API_KEY)}&ipAddress=${encodeURIComponent(target)}`
      );
      const payload = await response.json();

      if (!response.ok || payload.code || payload.messages) {
        throw new Error(payload.messages?.[0] || 'Lookup failed.');
      }

      setDetails({
        ip: payload.ip || target,
        location: normalizeLocation(payload.location),
        timezone: toTimezoneLabel(payload.location?.timezone),
        isp: payload.isp || 'Unknown',
        lat: payload.location?.lat ?? FALLBACK_CENTER.lat,
        lon: payload.location?.lng ?? FALLBACK_CENTER.lon,
      });
    } catch (lookupError) {
      setError(lookupError.message || 'Unable to find that IP or domain. Please try another value.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      setError('Enter an IP address or domain first.');
      return;
    }

    lookup(trimmed);
  }

  return (
    <main className="tracker">
      <header className="tracker__hero">
        <h1 className="tracker__title">IP Address Tracker</h1>
        <form
          className="tracker__search"
          role="search"
          aria-label="IP address search"
          onSubmit={handleSubmit}
        >
          <label className="sr-only" htmlFor="ip-search">
            Search for any IP address or domain
          </label>
          <input
            id="ip-search"
            className="tracker__input"
            type="text"
            placeholder="Search for any IP address or domain"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="tracker__button" type="submit" aria-label="Search">
            <span aria-hidden="true">&rsaquo;</span>
          </button>
        </form>
        {error ? <p className="tracker__message tracker__message--error">{error}</p> : null}
        {isLoading ? <p className="tracker__message">Looking up location...</p> : null}
      </header>

      <section className="tracker__details" aria-label="IP details">
        <article className="detail-card">
          <h2 className="detail-card__label">IP Address</h2>
          <p className="detail-card__value">{details.ip}</p>
        </article>
        <article className="detail-card">
          <h2 className="detail-card__label">Location</h2>
          <p className="detail-card__value">{details.location}</p>
        </article>
        <article className="detail-card">
          <h2 className="detail-card__label">Timezone</h2>
          <p className="detail-card__value">{details.timezone}</p>
        </article>
        <article className="detail-card">
          <h2 className="detail-card__label">ISP</h2>
          <p className="detail-card__value">{details.isp}</p>
        </article>
      </section>

      <section className="tracker__map" aria-label="Map preview">
        <div ref={mapContainerRef} className="tracker__map-canvas" />
      </section>
    </main>
  );
}

export default App;
