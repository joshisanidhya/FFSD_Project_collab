import { useEffect, useState } from 'react';
import UserFilterBar from './UserFilterBar.jsx';
import UserTable from './UserTable.jsx';
import EditUserModal from './EditUserModal.jsx';
import ReportsFilterBar from './ReportsFilterBar.jsx';
import ReportsTable from './ReportsTable.jsx';
import { API } from '../../utils/api.js';
import { getCurrentUser } from '../../utils/auth.js';
import useToast from '../../utils/useToast.js';
import '../../styles/admin-dashboard.css';

/**
 * Person 5 subtree: Users panel + Moderation/Reports panel, converted from
 * admin-dashboard.html / admin-dashboard.js.
 *
 * Lifted state (owned here because the filter bar, table, and modal for each
 * panel all read/write the same list): users, currentUserFilter,
 * userSearchQuery, editingUser (drives EditUserModal), reports,
 * currentReportFilter.
 */
export default function AdminDashboardPage() {
  const [authorized, setAuthorized] = useState(null); // null = checking, true/false once resolved
  const [activeSection, setActiveSection] = useState('users'); // 'users' | 'moderation'
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [currentUserFilter, setCurrentUserFilter] = useState('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null); // null = modal closed

  const [reports, setReports] = useState([]);
  const [currentReportFilter, setCurrentReportFilter] = useState('all');

  const { toast, showToast } = useToast();

  // ── Auth check — same nexus_user/admin-only gate as the vanilla page ──────
  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      setAuthorized(false);
      // Points at the vanilla login page — this React page is meant to
      // eventually replace admin-dashboard.html at the same site root.
      window.location.href = '/html/login.html';
      return;
    }
    setAuthorized(true);
  }, []);

  // ── Load data once authorized ──────────────────────────────────────────────
  useEffect(() => {
    if (!authorized) return;
    (async () => {
      try {
        const [usersData, reportsData] = await Promise.all([API.users.getAll(), API.reports.getAll()]);
        setUsers(usersData);
        setReports(reportsData);
      } catch (err) {
        showToast('⚠️ ' + err.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  // ── Derived (filtered) lists — mirrors renderUsers()/renderReports() ──────
  const filteredUsers = users
    .filter((u) => currentUserFilter === 'all' || u.role === currentUserFilter)
    .filter((u) => {
      if (!userSearchQuery) return true;
      const q = userSearchQuery.toLowerCase();
      return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });

  const filteredReports = reports.filter((r) => currentReportFilter === 'all' || r.status === currentReportFilter);

  // ── User handlers ───────────────────────────────────────────────────────────
  function openAddUserModal() {
    setEditingUser({ id: null, username: '', email: '', role: 'user', bio: '' });
  }

  function openEditUserModal(user) {
    setEditingUser({ ...user });
  }

  async function handleSaveUser(updatedUser) {
    // CreateUserDto's bio is @IsOptional() @Length(5,160) — that decorator
    // only skips validation for null/undefined, NOT an empty string, so
    // sending bio: '' trips the min-length check and 400s. Omit it entirely
    // when blank instead (same class-validator gotcha fixed earlier for
    // RegisterDto.lastName).
    const payload = {
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      ...(updatedUser.bio ? { bio: updatedUser.bio } : {}),
    };
    try {
      if (updatedUser.id) {
        const saved = await API.users.update(updatedUser.id, payload);
        setUsers((prev) => prev.map((u) => (u.id === saved.id ? saved : u)));
        showToast('✅ User updated');
      } else {
        const created = await API.users.create(payload);
        setUsers((prev) => [...prev, created]);
        showToast('✅ User created');
      }
      setEditingUser(null);
    } catch (err) {
      showToast('⚠️ ' + err.message);
    }
  }

  // Callback contract: UserRow -> AdminDashboardPage. Clicking Delete bubbles
  // up a plain userId and removes it from the shared `users` list on success.
  async function onDeleteUser(userId) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    if (!window.confirm(`Delete user "${user.username}"? This cannot be undone.`)) return;
    try {
      await API.users.delete(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast('🗑️ User deleted');
    } catch (err) {
      showToast('⚠️ ' + err.message);
    }
  }

  // ── Report handlers ─────────────────────────────────────────────────────────
  async function onResolveReport(reportId) {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;
    try {
      // Backend enforces sequential transitions (pending -> reviewed -> resolved;
      // reviewed/escalated -> resolved directly) — see reports.service.ts.
      if (report.status === 'pending') {
        await API.reports.updateStatus(reportId, 'reviewed');
      }
      await API.reports.updateStatus(reportId, 'resolved');
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r)));
      showToast('✅ Report resolved');
    } catch (err) {
      showToast('⚠️ ' + err.message);
    }
  }

  async function onDeleteReport(reportId) {
    try {
      await API.reports.delete(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      showToast('🗑️ Report deleted');
    } catch (err) {
      showToast('⚠️ ' + err.message);
    }
  }

  if (authorized === null) return null; // brief flash while the auth check resolves
  if (authorized === false) return <div className="empty-state-text">Redirecting to login…</div>;

  return (
    <div className="page active" style={{ padding: 32 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          className={`filter-btn${activeSection === 'users' ? ' on' : ''}`}
          onClick={() => setActiveSection('users')}
        >
          👤 User Management
        </button>
        <button
          className={`filter-btn${activeSection === 'moderation' ? ' on' : ''}`}
          onClick={() => setActiveSection('moderation')}
        >
          🛡️ Moderation
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-state-text">Loading…</div>
        </div>
      ) : activeSection === 'users' ? (
        <>
          <div className="page-toolbar">
            <UserFilterBar
              activeFilter={currentUserFilter}
              searchQuery={userSearchQuery}
              onFilterChange={setCurrentUserFilter}
              onSearchChange={setUserSearchQuery}
            />
            <button className="btn-primary" onClick={openAddUserModal}>
              + Add User
            </button>
          </div>
          <UserTable users={filteredUsers} onEdit={openEditUserModal} onDelete={onDeleteUser} />
        </>
      ) : (
        <>
          <div className="page-toolbar">
            <ReportsFilterBar activeFilter={currentReportFilter} onFilterChange={setCurrentReportFilter} />
          </div>
          <ReportsTable reports={filteredReports} onResolve={onResolveReport} onDelete={onDeleteReport} />
        </>
      )}

      {editingUser && (
        <EditUserModal user={editingUser} onSave={handleSaveUser} onClose={() => setEditingUser(null)} />
      )}

      <div className={`toast${toast.visible ? ' show' : ''}`}>
        <span>{toast.icon}</span>
        <span>{toast.text}</span>
      </div>
    </div>
  );
}
