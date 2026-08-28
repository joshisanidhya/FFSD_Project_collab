import { useState } from 'react';

/**
 * Add/Edit user modal — one component handles both modes:
 *   - `user.id` is null/undefined  -> "Add New User" (create)
 *   - `user.id` is set              -> "Edit User — <username>" (update)
 * Props: user (the record being edited, or a blank draft for "add"),
 *        onSave(updatedUser), onClose()
 * Callback contract: EditUserModal -> AdminDashboardPage: onSave(updatedUser).
 */
export default function EditUserModal({ user, onSave, onClose }) {
  const isNew = !user.id;
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [role, setRole] = useState(user.role || 'user');
  const [bio, setBio] = useState(user.bio || '');

  function handleConfirm() {
    if (!username.trim() || !email.trim()) return; // mirrors the original's required-field guard
    onSave({ ...user, username: username.trim(), email: email.trim(), role, bio: bio.trim() });
  }

  return (
    <div
      className="modal-overlay"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-container">
        <div className="modal-header">
          <h3>{isNew ? 'Add New User' : `Edit User — ${user.username}`}</h3>
          <button className="modal-x" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              value={username}
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              placeholder="user@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="community_manager">Community Manager</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner (statistics only)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Bio{isNew ? ' (optional)' : ''}</label>
            <input
              className="form-input"
              value={bio}
              placeholder="Short bio"
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleConfirm}>
            {isNew ? 'Create User' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
