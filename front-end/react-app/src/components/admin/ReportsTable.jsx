import ReportRow from './ReportRow.jsx';

/**
 * Props: reports (already filtered by the parent), onResolve, onDelete.
 */
export default function ReportsTable({ reports, onResolve, onDelete }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Target</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-state-icon">🛡️</div>
                  <div className="empty-state-text">All clear</div>
                </div>
              </td>
            </tr>
          ) : (
            reports.map((report) => (
              <ReportRow key={report.id} report={report} onResolve={onResolve} onDelete={onDelete} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
