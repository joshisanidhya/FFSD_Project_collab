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

    try {
        const revenue = await window.API.dashboard.revenue();
        set('ow-rev-total', `₹${revenue.totalRevenue.toLocaleString()}`);
        set('ow-rev-monthly', `₹${revenue.monthlyRevenue.toLocaleString()}`);
        set('ow-rev-subs', `₹${revenue.subscriptionRevenue.toLocaleString()}`);
        set('ow-rev-organiser', `₹${revenue.organiserRevenue.toLocaleString()}`);
        set('ow-rev-featured', `₹${revenue.featuredEventRevenue.toLocaleString()}`);
        set('ow-rev-premium-users', revenue.premiumUsers);
        set('ow-rev-verified-organisers', revenue.verifiedOrganisers);
        set('ow-rev-pending-organisers', revenue.pendingOrganiserApplications);
    } catch (err) {
        console.error('[OwnerDashboard] Could not load revenue stats:', err.message);
    }
});
