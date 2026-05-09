// src/components/CatalogCard.jsx

const TYPE_ICONS = {
    product: '🧴',
    service: '✨',
    package: '🎁',
    membership: '💳',
  };
  
  export default function CatalogCard({ item, onSelect }) {
    const icon = TYPE_ICONS[item.type] || '✦';
    const hasTag = item.duration_minutes || item.validity_label || item.duration_label;
  
    return (
      <div className="catalog-card">
        <div className="card-image">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} />
          ) : (
            <span>{icon}</span>
          )}
        </div>
        <div className="card-body">
          <button type="button" className="card-name" onClick={() => onSelect(item)}>
            {item.name}
          </button>
          {item.description && (
            <div className="card-description">{item.description}</div>
          )}
          {hasTag && (
            <div className="card-meta">
              <span className="card-tag">
                {item.duration_minutes && `${item.duration_minutes} mins`}
                {item.validity_label}
                {item.duration_label}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }