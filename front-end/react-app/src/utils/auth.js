// Shared auth/session helpers — reads the SAME localStorage keys the vanilla
// pages already use (nexus_user / role), so a converted page keeps working
// inside the existing login flow instead of starting its own parallel session
// model. Cross-cutting: every converted page should import from here rather
// than re-implement its own copy (see Final Integration Checklist).

const USER_KEY = 'nexus_user';

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getRole() {
  return getCurrentUser()?.role || 'user';
}

export function getUserInitials(user) {
  if (!user) return 'U';
  const name = user.username || user.email || '';
  const parts = String(name).trim().split(/[\s._-]+/).filter(Boolean);
  if (!parts.length) return 'U';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}
