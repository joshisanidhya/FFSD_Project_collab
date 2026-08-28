import AdminDashboardPage from './components/admin/AdminDashboardPage.jsx';

// Shared app shell. Each teammate's converted page mounts here as its own
// route/section — for now this only wires up the Admin Dashboard subtree
// (Person 5: Users + Moderation panels). Whoever adds react-router / the
// next page should extend this file rather than restructure it, so the
// five subtrees don't collide on merge.
export default function App() {
  return <AdminDashboardPage />;
}
