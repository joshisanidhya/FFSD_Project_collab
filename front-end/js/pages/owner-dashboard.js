/**
 * Gameunity — Owner Statistics View
 * Read-only. Pulls the single aggregate GET /api/dashboard/stats endpoint —
 * no user/community/report management lives here on purpose.
 */

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof enforcePageAccess === 'function' && !enforcePageAccess()) return;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    try {
        const stats = await window.API.dashboard.stats();
        set('ow-users', stats.totalUsers);
        set('ow-comms', stats.totalCommunities);
        set('ow-reports', stats.pendingReportsCount);
        set('ow-events', stats.totalEvents);
        set('ow-appeals', stats.pendingAppealsCount);
        set('ow-memberships', stats.totalMemberships);

        set('ow-health-backend', 'Reachable');
        set('ow-health-reports', stats.pendingReportsCount);
        set('ow-health-events', stats.pendingEventsCount);
        set('ow-health-appeals', stats.pendingAppealsCount);
    } catch (err) {
        console.error('[OwnerDashboard] Could not load stats:', err.message);
        set('ow-health-backend', '⚠️ Unreachable');
        if (window.toast) window.toast('⚠️ Could not reach the backend.');
    }
});
