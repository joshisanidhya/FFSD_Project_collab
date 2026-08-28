import UserRow from './UserRow.jsx';

/**
 * Props: users (already filtered/searched by the parent), onEdit, onDelete.
 * Purely presentational — all filtering happens in AdminDashboardPage against
 * the lifted `users` list, this just renders whatever it's handed.
 */
export default function UserTable({ users, onEdit, onDelete }) {
  return (
    <>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">👤</div>
                    <div className="empty-state-text">No users found</div>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow key={user.id} user={user} onEdit={onEdit} onDelete={onDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Showing {users.length} users</span>
      </div>
    </>
  );
}
