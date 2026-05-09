// src/pages/Catalog.jsx

import { useState, useEffect, useCallback } from 'react';
import CatalogCard from '../components/CatalogCard';
import { fetchCatalog } from '../api';
import '../styles/catalog.css';

const TABS = [
  { key: '', label: 'All' },
  { key: 'product', label: 'Products' },
  { key: 'service', label: 'Services' },
  { key: 'package', label: 'Packages' },
  { key: 'membership', label: 'Memberships' },
];

function getIncludedServices(item) {
  if (!item || !['membership', 'package'].includes(item.type)) return [];

  const services = item.services
    || item.included_services
    || item.includedServices
    || item.services_included
    || item.servicesIncluded
    || item.package_services
    || item.packageServices
    || item.membership_services
    || item.membershipServices
    || item.service_inclusions
    || item.serviceInclusions
    || item.inclusions
    || [];

  if (!Array.isArray(services)) return [];

  return services
    .map(entry => {
      if (typeof entry === 'string') {
        return { name: entry };
      }

      const service = entry.service || entry.catalog_service || entry.catalogService || entry;

      return {
        name: service.name || service.service_name || service.title,
        description: service.description,
        duration: service.duration_minutes && `${service.duration_minutes} mins`,
        quantity: entry.quantity || entry.sessions || entry.session_count,
      };
    })
    .filter(service => service.name);
}

export default function Catalog() {
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCatalog({ type: activeTab, search, include: 'services' });
      setData(result);
    } catch (e) {
      setError('Could not load catalog. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  useEffect(() => {
    const delay = setTimeout(load, 400); // debounce search
    return () => clearTimeout(delay);
  }, [load]);

  const sections = [
    { key: 'products', label: 'Products' },
    { key: 'services', label: 'Services' },
    { key: 'packages', label: 'Packages' },
    { key: 'memberships', label: 'Memberships' },
  ];

  const hasResults = sections.some(s => (data[s.key] || []).length > 0);
  const selectedItemTags = selectedItem
    ? [
        selectedItem.duration_minutes && `${selectedItem.duration_minutes} mins`,
        selectedItem.validity_label,
        selectedItem.duration_label,
      ].filter(Boolean)
    : [];
  const includedServices = getIncludedServices(selectedItem);

  return (
    <div>
      {/* Hero */}
      <div className="catalog-hero">
        <h1> <span>Bio Global Solutions</span></h1>
        <p>Discover our products, services & wellness packages</p>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search products, services..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="catalog-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="catalog-section">
        {loading && (
          <div className="state-container">
            <div className="state-icon">✦</div>
            <p>Loading our beautiful catalog…</p>
          </div>
        )}

        {error && !loading && (
          <div className="state-container">
            <div className="state-icon">🌸</div>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && !hasResults && (
          <div className="state-container">
            <div className="state-icon">🔍</div>
            <p>No results found. Try a different search.</p>
          </div>
        )}

        {!loading && !error && sections.map(section => {
          const items = data[section.key] || [];
          if (items.length === 0) return null;
          return (
            <div key={section.key} style={{ marginBottom: '48px' }}>
              <h2 className="section-heading">{section.label}</h2>
              <div className="catalog-grid">
                {items.map(item => (
                  <CatalogCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    onSelect={setSelectedItem}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {selectedItem && (
        <div
          className="details-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="details-title"
          onClick={() => setSelectedItem(null)}
        >
          <div className="details-modal" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="details-close"
              aria-label="Close details"
              onClick={() => setSelectedItem(null)}
            >
              X
            </button>
            <div className="details-image">
              {selectedItem.image_url ? (
                <img src={selectedItem.image_url} alt={selectedItem.name} />
              ) : (
                <span>✦</span>
              )}
            </div>
            <div className="details-body">
              <h2 id="details-title">{selectedItem.name}</h2>
              {selectedItem.description && (
                <p>{selectedItem.description}</p>
              )}
              {selectedItemTags.length > 0 && (
                <div className="details-tags">
                  {selectedItemTags.map(tag => (
                    <span key={tag} className="card-tag">{tag}</span>
                  ))}
                </div>
              )}
              {['membership', 'package'].includes(selectedItem.type) && (
                <div className="included-services">
                  <h3>Services Included</h3>
                  {includedServices.length > 0 ? (
                    <ul>
                      {includedServices.map(service => (
                        <li key={service.name}>
                          <div className="included-service-name">{service.name}</div>
                          {service.description && (
                            <p>{service.description}</p>
                          )}
                          {(service.duration || service.quantity) && (
                            <div className="included-service-tags">
                              {service.duration && (
                                <span className="card-tag">{service.duration}</span>
                              )}
                              {service.quantity && (
                                <span className="card-tag">{service.quantity} included</span>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="included-services-empty">
                      No included services listed.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}