import { getUserInitials } from '../../utils/auth.js';

/**
 * One row in the Users table.
 * Props: user, onEdit(user), onDelete(userId)
 * Delete bubbles a plain userId up to AdminDashboardPage (see callback
 * contract in the task doc) rather than the whole row/user object, since the
 * parent only needs the id to remove it from the shared `users` list.
 */
export default function UserRow({ user, onEdit, onDelete }) {
  return (
    <tr>
      <td>
        <div className="row-cell">
          <div className="row-avatar" style={{ background: 'linear-gradient(135deg,#5B6EF5,#8B5CF6)' }}>
            {getUserInitials(user)}
          </div>
          <div>
            <div className="row-name">{user.username}</div>
            <div className="row-sub">{user.email}</div>
          </div>
        </div>
      </td>
      <td>{user.email}</td>
      <td>
        <span className={`badge badge-${user.role}`}>{user.role}</span>
      </td>
      <td>—</td>
      <td>
        <span className="badge badge-active">active</span>
      </td>
      <td>
        <div className="btn-row">
          <button className="act-btn act-edit" onClick={() => onEdit(user)}>
            Edit
          </button>
          <button className="act-btn act-delete" onClick={() => onDelete(user.id)}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
