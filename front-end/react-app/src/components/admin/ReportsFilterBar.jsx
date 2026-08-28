// Matches the real ReportStatus union from the backend (pending | reviewed |
// resolved | escalated). The original vanilla markup had an 'In Review'
// button wired to filter value 'review', which never matched the actual
// 'reviewed' status and always showed zero results — fixed here.
const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'escalated', label: 'Escalated' },
];

/**
 * Props: activeFilter, onFilterChange
 */
export default function ReportsFilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="filter-bar">
      {STATUS_FILTERS.map((f) => (
        <button
          key={f.value}
          className={`filter-btn${activeFilter === f.value ? ' on' : ''}`}
          onClick={() => onFilterChange(f.value)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
