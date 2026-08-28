// FilterChips.jsx
// Handles filtering events by modality: All Events, Online, In-Person, Hybrid

function FilterChips({ activeFilter = 'all', onFilterChange }) {
    const filters = [
        { key: 'all', label: '✦ All Events' },
        { key: 'online', label: '🌐 Online' },
        { key: 'in-person', label: '📍 In-Person' },
        { key: 'hybrid', label: '🔀 Hybrid' }
    ];

    return (
        <div className="filters-row">
            {filters.map(filter => {
                const isActive = activeFilter.toLowerCase() === filter.key.toLowerCase() ||
                    (filter.key === 'all' && (activeFilter.toLowerCase() === 'all' || activeFilter.toLowerCase() === 'all events'));
                return (
                    <div
                        key={filter.key}
                        id={`filter-chip-${filter.key}`}
                        className={`filter-chip ${isActive ? 'on' : ''}`}
                        onClick={() => onFilterChange(filter.key)}
                        role="button"
                        tabIndex={0}
                    >
                        {filter.label}
                    </div>
                );
            })}
        </div>
    );
}

window.FilterChips = FilterChips;
