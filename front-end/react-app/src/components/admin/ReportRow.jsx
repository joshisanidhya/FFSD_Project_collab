/**
 * One row in the Reports table.
 * Props: report, onResolve(reportId), onDelete(reportId)
 * ReportRecord has no date field (see back-end in-memory-db.ts) — the "Date"
 * column shows '—' to match, not a placeholder bug.
 */
export default function ReportRow({ report, onResolve, onDelete }) {
  return (
    <tr>
      <td>
        <strong>#{report.id}</strong>
      </td>
      <td>
        {report.targetType} #{report.targetId}
      </td>
      <td>{report.reason}</td>
      <td>
        <span className={`badge badge-${report.status}`}>{report.status}</span>
      </td>
      <td>—</td>
      <td>
        <div className="btn-row">
          {report.status !== 'resolved' && (
            <button className="act-btn act-view" onClick={() => onResolve(report.id)}>
              Resolve
            </button>
          )}
          <button className="act-btn act-delete" onClick={() => onDelete(report.id)}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
