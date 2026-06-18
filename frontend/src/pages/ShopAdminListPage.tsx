import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { listShopsInDatabase, type ShopListItem } from '../api/shopBuilderApi';
import { useSetupSession } from '../hooks/useSetupSession';
import './ShopCampaignSetupPage.css';
import './ShopAdminListPage.css';

export default function ShopAdminListPage() {
  const navigate = useNavigate();
  const { ready, sessionToken } = useSetupSession();
  const [shops, setShops] = useState<ShopListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!ready || !sessionToken) return;
    setLoading(true);
    setError(null);
    listShopsInDatabase(sessionToken)
      .then(setShops)
      .catch((err) => {
        if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
          navigate('/setup/shop-builder', { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : 'Could not load shops.');
      })
      .finally(() => setLoading(false));
  }, [ready, sessionToken, navigate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter(
      (s) =>
        s.shopId.toLowerCase().includes(q) ||
        (s.slug?.toLowerCase().includes(q) ?? false) ||
        (s.name?.toLowerCase().includes(q) ?? false) ||
        (s.brandName?.toLowerCase().includes(q) ?? false)
    );
  }, [shops, query]);

  if (!ready) {
    return (
      <div className="campaign-setup">
        <p className="campaign-setup-loading">Verifying session…</p>
      </div>
    );
  }

  return (
    <div className="shop-admin-list">
      <header className="shop-admin-list-header">
        <h1 className="shop-admin-list-title">All shops</h1>
        <p className="shop-admin-list-lead">
          Internal catalog in the database. Click a row to view and edit JSON config.
        </p>
        <LanguageSwitcher />
      </header>

      <div className="shop-admin-list-toolbar">
        <input
          className="shop-admin-list-search"
          type="search"
          placeholder="Search by name, slug, or shop ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Link className="campaign-setup-btn primary" to="/setup/shop-builder/form">
          + New shop
        </Link>
        <Link className="campaign-setup-btn link" to="/setup/shop-builder/form">
          Quick builder
        </Link>
      </div>

      {loading ? <p className="campaign-setup-loading">Loading shops…</p> : null}
      {error ? <p className="campaign-setup-msg err">{error}</p> : null}

      {!loading && !error ? (
        <div className="shop-admin-table-wrap">
          {filtered.length === 0 ? (
            <p className="shop-admin-empty">
              {shops.length === 0 ? 'No shops in the database yet.' : 'No shops match your search.'}
            </p>
          ) : (
            <table className="shop-admin-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Slug</th>
                  <th>Shop ID</th>
                  <th>Status</th>
                  <th>Games</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((shop) => (
                  <tr
                    key={shop.shopId}
                    onClick={() => navigate(`/setup/shops/${encodeURIComponent(shop.shopId)}`)}
                  >
                    <td>
                      <span
                        className="shop-admin-swatch"
                        style={{ background: shop.primaryColor || '#ccc' }}
                        aria-hidden
                      />
                      {shop.brandName || shop.name || '—'}
                    </td>
                    <td>{shop.slug || '—'}</td>
                    <td>
                      <code>{shop.shopId}</code>
                    </td>
                    <td>
                      <span
                        className={`shop-admin-badge ${shop.enabled ? 'shop-admin-badge--on' : 'shop-admin-badge--off'}`}
                      >
                        {shop.enabled ? 'On' : 'Off'}
                      </span>
                    </td>
                    <td>
                      <div className="shop-admin-games">
                        {shop.gameModes.length > 0 ? (
                          shop.gameModes.map((m) => (
                            <span key={m} className="shop-admin-game-chip">
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="shop-admin-game-chip">—</span>
                        )}
                      </div>
                    </td>
                    <td>{shop.updatedAt ? new Date(shop.updatedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </div>
  );
}
