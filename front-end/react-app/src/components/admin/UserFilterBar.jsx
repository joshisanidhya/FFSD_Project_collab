// Role values that actually exist on a UserRecord (see back-end role.enum.ts).
// The original vanilla markup filtered by 'active'/'banned'/'warned', which
// don't match any real role value and always rendered zero results — fixed
// here to filter by real roles, matching what "role filter" is meant to do.
const ROLE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'community_manager', label: 'Community Manager' },
  { value: 'user', label: 'User' },
  { value: 'owner', label: 'Owner' },
];

/**
 * Props: activeFilter, searchQuery, onFilterChange, onSearchChange
 */
export default function UserFilterBar({ activeFilter, searchQuery, onFilterChange, onSearchChange }) {
  return (
    <>
      <div className="filter-bar">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`filter-btn${activeFilter === f.value ? ' on' : ''}`}
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="toolbar-right">
        <input
          type="text"
          className="search-input"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </>
  );
}
